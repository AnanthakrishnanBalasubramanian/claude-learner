require("dotenv").config();
const { onSchedule } = require("firebase-functions/v2/scheduler");
const { onRequest } = require("firebase-functions/v2/https");
const { setGlobalOptions } = require("firebase-functions/v2");
const admin = require("firebase-admin");
const axios = require("axios");
const Parser = require("rss-parser");

admin.initializeApp();
const db = admin.firestore();
const parser = new Parser();

setGlobalOptions({ timeoutSeconds: 300, memory: "512MiB" });

// ─── CONFIG ───────────────────────────────────────────────
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_SECRET  = process.env.GEMINI_SECRET;
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

const SOURCES = {
  rss: [
    { name: "Anthropic Blog",      url: "https://www.anthropic.com/rss.xml",                         tag: "Official",    limit: 4 },
    { name: "The Batch",           url: "https://www.deeplearning.ai/the-batch/feed/",                tag: "Newsletter",  limit: 3 },
    { name: "Import AI",           url: "https://importai.substack.com/feed",                         tag: "Substack",    limit: 3 },
    { name: "Simon Willison",      url: "https://simonwillison.net/atom/everything/",                  tag: "Substack",    limit: 3 },
    { name: "The Neuron Daily",    url: "https://www.theneurondaily.com/feed",                         tag: "Newsletter",  limit: 2 },
    { name: "Latent Space",        url: "https://www.latent.space/feed",                               tag: "Substack",    limit: 2 },
    { name: "Interconnects",       url: "https://www.interconnects.ai/feed",                           tag: "Substack",    limit: 2 },
    { name: "MIT Tech Review AI",  url: "https://www.technologyreview.com/feed/",                      tag: "Newsletter",  limit: 2 },
    { name: "VentureBeat AI",      url: "https://venturebeat.com/category/ai/feed/",                   tag: "Newsletter",  limit: 2 },
    { name: "AI Supremacy",        url: "https://aisupremacy.substack.com/feed",                       tag: "Substack",    limit: 2 },
  ],
  reddit: {
    url:  "https://www.reddit.com/r/ClaudeAI/top.json?limit=8&t=day",
    name: "Reddit r/ClaudeAI",
    tag:  "Community",
  },
  youtube: {
    apiKey: process.env.GEMINI_API_KEY, // reusing same Google key — works for YouTube too
    query:  "Claude AI Anthropic tutorial",
    name:   "YouTube",
    tag:    "Video",
    limit:  4,
  },
  // X (Twitter) via nitter — tries each instance in order, stops on first success
  xAccounts: [
    { account: "AnthropicAI", name: "Anthropic on X", limit: 3 },
    { account: "DarioAmodei", name: "Dario Amodei on X", limit: 2 },
  ],
  nitterInstances: [
    "https://nitter.poast.org",
    "https://nitter.privacydev.net",
    "https://nitter.net",
  ],
};

// ─── CALL GEMINI ──────────────────────────────────────────
async function callGemini(prompt) {
  const res = await axios.post(
    `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
    {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 400 },
    },
    { headers: { "Content-Type": "application/json" } }
  );
  return res.data.candidates[0].content.parts[0].text;
}

// ─── FEYNMAN SUMMARY ─────────────────────────────────────
async function getFeynmanSummary(title, content, source) {
  try {
    const text = await callGemini(
      `You are a smart friend explaining AI news to Ak, an IT professional in Chennai, India.
Article: "${title}" | Source: ${source}
Content: "${content.slice(0, 800)}"
Return ONLY this JSON, no markdown, no backticks:
{"summary":"2-3 simple sentences","whyItMatters":"1-2 sentences on why this matters for IT work","analogy":"One Indian real-life analogy","difficulty":"Beginner or Intermediate or Advanced"}`
    );
    return JSON.parse(text.replace(/```json|```/g, "").trim());
  } catch (err) {
    console.error("Feynman summary error:", err.message);
    return {
      summary:      content.slice(0, 200) + "...",
      whyItMatters: "Stay updated with Claude AI developments.",
      analogy:      "",
      difficulty:   "Intermediate",
    };
  }
}

// ─── GENERATE QUIZ ────────────────────────────────────────
async function generateQuiz(title, summary) {
  try {
    const text = await callGemini(
      `Article: "${title}" | Summary: "${summary}"
Return ONLY this JSON, no markdown, no backticks:
{"question":"Simple question","options":["A","B","C","D"],"answer":0,"explanation":"One sentence."}`
    );
    return JSON.parse(text.replace(/```json|```/g, "").trim());
  } catch (err) {
    return null;
  }
}

// ─── FETCH RSS ────────────────────────────────────────────
async function fetchRSSArticles() {
  const articles = [];
  for (const source of SOURCES.rss) {
    try {
      const feed = await parser.parseURL(source.url);
      for (const item of feed.items.slice(0, source.limit || 3)) {
        const content = item.contentSnippet || item.content || item.summary || "";
        const feynman = await getFeynmanSummary(item.title, content, source.name);
        const quiz    = await generateQuiz(item.title, feynman.summary);
        articles.push({
          id:       Buffer.from(item.link || item.title).toString("base64").slice(0, 20),
          title:    item.title || "Untitled",
          url:      item.link  || "",
          source:   source.name,
          tag:      source.tag,
          date:     item.pubDate || new Date().toISOString(),
          readTime: Math.ceil((content.split(" ").length || 200) / 200) + " min",
          ...feynman,
          quiz,
          type:      "article",
          fetchedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }
    } catch (err) {
      console.error(`RSS error ${source.name}:`, err.message);
    }
  }
  return articles;
}

// ─── FETCH REDDIT ─────────────────────────────────────────
async function fetchRedditPosts() {
  const articles = [];
  try {
    const res = await axios.get(SOURCES.reddit.url, {
      headers: { "User-Agent": "LearnClaude/1.0" },
    });
    for (const post of res.data.data.children.slice(0, 5)) {
      const d = post.data;
      if (d.selftext && d.selftext.length > 50) {
        const feynman = await getFeynmanSummary(d.title, d.selftext, "Reddit");
        const quiz    = await generateQuiz(d.title, feynman.summary);
        articles.push({
          id:       "reddit_" + d.id,
          title:    d.title,
          url:      "https://reddit.com" + d.permalink,
          source:   SOURCES.reddit.name,
          tag:      SOURCES.reddit.tag,
          date:     new Date(d.created_utc * 1000).toISOString(),
          readTime: "3 min",
          ...feynman,
          quiz,
          upvotes:   d.score,
          type:      "community",
          fetchedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }
    }
  } catch (err) {
    console.error("Reddit error:", err.message);
  }
  return articles;
}

// ─── FETCH YOUTUBE ────────────────────────────────────────
async function fetchYouTubeVideos() {
  const articles = [];
  try {
    const res = await axios.get(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
        SOURCES.youtube.query
      )}&type=video&order=date&maxResults=${SOURCES.youtube.limit || 3}&key=${SOURCES.youtube.apiKey}`
    );
    for (const item of res.data.items) {
      const s       = item.snippet;
      const feynman = await getFeynmanSummary(s.title, s.description, "YouTube");
      articles.push({
        id:        "yt_" + item.id.videoId,
        title:     s.title,
        url:       "https://youtube.com/watch?v=" + item.id.videoId,
        source:    SOURCES.youtube.name,
        tag:       SOURCES.youtube.tag,
        date:      s.publishedAt,
        readTime:  "Video",
        thumbnail: s.thumbnails?.medium?.url || "",
        ...feynman,
        quiz:      null,
        type:      "video",
        fetchedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }
  } catch (err) {
    console.error("YouTube error:", err.message);
  }
  return articles;
}

// ─── FETCH X (TWITTER) via nitter RSS ────────────────────
async function fetchXPosts() {
  const articles = [];
  for (const account of SOURCES.xAccounts) {
    let fetched = false;
    for (const instance of SOURCES.nitterInstances) {
      if (fetched) break;
      try {
        const feed = await parser.parseURL(`${instance}/${account.account}/rss`);
        for (const item of feed.items.slice(0, account.limit || 2)) {
          const content = item.contentSnippet || item.content || item.title || "";
          const feynman = await getFeynmanSummary(item.title || content.slice(0, 120), content, account.name);
          const quiz    = await generateQuiz(item.title || content.slice(0, 120), feynman.summary);
          articles.push({
            id:       "x_" + Buffer.from(item.link || item.title || content).toString("base64").slice(0, 20),
            title:    item.title || content.slice(0, 100) + "…",
            url:      item.link  || `https://x.com/${account.account}`,
            source:   account.name,
            tag:      "X",
            date:     item.pubDate || new Date().toISOString(),
            readTime: "1 min",
            ...feynman,
            quiz,
            type:      "community",
            fetchedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        }
        fetched = true;
        console.log(`X: fetched ${account.account} via ${instance}`);
      } catch (err) {
        console.error(`X nitter error (${instance}/${account.account}):`, err.message);
      }
    }
    if (!fetched) console.warn(`X: all nitter instances failed for @${account.account}`);
  }
  return articles;
}

// ─── MORNING BRIEF ────────────────────────────────────────
async function buildMorningBrief(articles) {
  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long",
    year: "numeric", timeZone: "Asia/Kolkata",
  });
  const topTitles = articles
    .slice(0, 3)
    .map((a, i) => `${i + 1}. ${a.title}`)
    .join("\n");
  try {
    return await callGemini(
      `Write a warm 2-sentence morning greeting for Ak, an IT professional in Chennai learning Claude AI.
Today: ${today}. Top stories:\n${topTitles}
Sound like a smart friend. No emojis. Plain sentences only.`
    );
  } catch {
    return `Good morning Ak! Here are today's top Claude AI updates — ${today}.`;
  }
}

// ─── CORE FETCH LOGIC (shared by scheduled + manual) ─────
async function runDailyFetch() {
  const today = new Date().toISOString().split("T")[0];
  const batch = db.batch();

  const [rss, reddit, youtube, xposts] = await Promise.all([
    fetchRSSArticles(),
    fetchRedditPosts(),
    fetchYouTubeVideos(),
    fetchXPosts(),
  ]);

  const all = [...rss, ...reddit, ...youtube, ...xposts];
  console.log(`Total articles fetched: ${all.length}`);

  for (const a of all) {
    batch.set(db.collection("articles").doc(`${today}_${a.id}`), { ...a, day: today });
  }

  const brief = await buildMorningBrief(all);
  batch.set(db.collection("dailyBriefs").doc(today), {
    date:         today,
    greeting:     brief,
    articleCount: all.length,
    topArticles:  all.slice(0, 3).map(a => ({
      title: a.title, source: a.source, summary: a.summary,
    })),
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  await batch.commit();
  console.log(`LearnClaude: saved ${all.length} articles for ${today}`);
}

// ─── SCHEDULED: 9:02 AM IST daily (3:32 AM UTC) ──────────
exports.dailyNewsFetch = onSchedule(
  { schedule: "32 3 * * *", timeZone: "Asia/Kolkata" },
  async () => {
    console.log("LearnClaude scheduled fetch — 9:02 AM IST");
    await runDailyFetch();
  }
);

// ─── MANUAL TRIGGER for testing ──────────────────────────
exports.manualFetch = onRequest(async (req, res) => {
  if (req.query.secret !== GEMINI_SECRET) {
    return res.status(403).send("Forbidden");
  }
  console.log("Manual fetch triggered...");
  await runDailyFetch();
  res.send("Manual fetch complete! Check Firestore for today's articles.");
});

// ─── EVALUATE CHALLENGE ANSWER ────────────────────────────
exports.evaluateAnswer = onRequest(async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") { res.status(204).send(""); return; }

  const { question, answer } = req.body || {};
  if (!question || !answer) {
    return res.status(400).json({ error: "Missing question or answer" });
  }

  try {
    const text = await callGemini(
      `A learner answered this reflection question: "${question}"
Their answer: "${answer}"
You are a warm, encouraging tutor reviewing their answer for Ak, an IT professional in Chennai learning Claude AI.
Give specific feedback in 2-3 sentences. Mention one thing they got right. If there is a gap, explain it with a simple analogy from Indian daily life (auto, tiffin box, cricket, etc).
Return ONLY this JSON, no markdown, no backticks:
{"feedback":"..."}`
    );
    const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
    res.json(parsed);
  } catch (err) {
    console.error("evaluateAnswer error:", err.message);
    res.json({ feedback: "Great effort! Every reflection deepens your understanding. Try discussing this with Claude for richer feedback." });
  }
});