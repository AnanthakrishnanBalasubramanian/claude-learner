// Claude Learner — Firebase data layer
// All articles kept forever, archive by date, YouTube + Podcast support

const { initializeApp }   = window.firebaseApp;
const { getFirestore, collection, query, where, orderBy,
        getDocs, doc, getDoc, setDoc, updateDoc,
        increment, limit, serverTimestamp } = window.firebaseFirestore;

const firebaseConfig = {
  apiKey:            "AIzaSyAxI0tE4ZrXUG--vpOAJklgKw2L9xzf930",
  authDomain:        "claude-learner.firebaseapp.com",
  projectId:         "claude-learner",
  storageBucket:     "claude-learner.firebasestorage.app",
  messagingSenderId: "284158820000",
  appId:             "1:284158820000:web:99316b62be74b53dc013c5",
};

const app = initializeApp(firebaseConfig);
const db  = getFirestore(app);

// ─── FALLBACK data ────────────────────────────────────────
const FALLBACK_ARTICLES = [{
  id: 'fallback1', sourceType: 'Official', source: 'LearnClaude',
  title: 'Fetching your daily articles...', readTime: '1',
  excerpt: 'Your daily Claude AI news is being loaded from Firebase. Articles arrive every morning at 9:02 AM IST.',
  why: 'Check back after 9:02 AM IST or tap "Fetch Now" below.',
  topic: 'Updates', url: '#', quiz: null, analogy: '', type: 'article', day: new Date().toISOString().split('T')[0],
}];

const FALLBACK_BRIEF = {
  greeting: 'Good morning, Ak',
  date: new Date().toLocaleDateString('en-IN', { weekday:'long', month:'short', day:'numeric' }),
  blurb: "Loading today's brief...",
  stories: [],
};

const FALLBACK_QUIZ = [
  {
    q: 'What does the Feynman technique focus on?',
    options: ['Memorising facts','Explaining concepts simply','Writing detailed notes','Watching lectures'],
    correct: 1,
    explain: 'Feynman believed: if you cannot explain it simply, you do not understand it yet.',
  },
  {
    q: 'What is Claude\'s "context window"?',
    options: ['The app screen size','The amount of text Claude can read and remember in one conversation','The number of users online','Claude\'s training dataset size'],
    correct: 1,
    explain: 'Think of the context window like a whiteboard — Claude can only see what is written on it. Once the board is full, earlier content gets erased.',
  },
  {
    q: 'What makes a prompt more effective when talking to Claude?',
    options: ['Using complex technical jargon','Being vague so Claude can be creative','Being specific and giving context and examples','Keeping it as short as possible'],
    correct: 2,
    explain: 'Claude performs best with clear role, context, and examples — like briefing a smart colleague before asking them to do a task.',
  },
  {
    q: 'What is "hallucination" in the context of AI like Claude?',
    options: ['When Claude makes the app crash','When Claude generates confident but incorrect information','When Claude refuses to answer','When the AI runs slowly'],
    correct: 1,
    explain: 'Hallucination means the AI states something false with confidence. Always verify critical facts Claude gives you, especially dates, numbers, and citations.',
  },
  {
    q: 'Which of these is Claude best suited for at work?',
    options: ['Making final business decisions autonomously','Drafting, summarising, explaining, and brainstorming — with your review','Replacing all human judgment','Browsing the internet in real-time'],
    correct: 1,
    explain: 'Claude excels as a thinking partner — it speeds up your work and surfaces ideas, but you bring the judgment, context, and final call.',
  },
];

const FALLBACK_PROGRESS = {
  streak: 0, days: Array(14).fill(false),
  stats: { read:0, accuracy:0, streakBest:0, topics:0 },
  topics: [
    { name:'Agents', pct:0 }, { name:'Performance', pct:0 },
    { name:'Alignment', pct:0 }, { name:'Tooling', pct:0 },
    { name:'Evals', pct:0 }, { name:'Safety', pct:0 },
  ],
};

// ─── CHALLENGES pool ──────────────────────────────────────
const CHALLENGES = [
  {
    type: 'prompt',
    icon: '✍️',
    title: 'Try this prompt',
    instruction: 'Open Claude and paste this prompt. See what happens!',
    content: 'Explain how Claude\'s context window works using only a real-life analogy from Indian daily life. No technical jargon.',
    cta: 'Open Claude',
    url: 'https://claude.ai',
  },
  {
    type: 'code',
    icon: '⚡',
    title: 'Vibe coding challenge',
    instruction: 'Ask Claude Code to build this for you. Just describe it in plain English!',
    content: 'Build me a simple Python script that reads today\'s date and tells me how many days until the next Indian public holiday.',
    cta: 'Open Claude Code',
    url: 'https://claude.ai/code',
  },
  {
    type: 'openquestion',
    icon: '🧠',
    title: 'Think out loud',
    instruction: 'Answer this in your own words — no looking it up!',
    content: 'You are explaining Claude agents to your colleague at Dexian who has never heard of AI. What do you say in 3 sentences?',
    cta: 'Discuss with Claude',
    url: 'https://claude.ai',
  },
  {
    type: 'prompt',
    icon: '🎯',
    title: 'Feynman test',
    instruction: 'Paste this in Claude and rate your own answer!',
    content: 'I\'m going to explain prompt engineering to you. Tell me if my explanation is correct and what I missed: "Prompt engineering is like giving very clear instructions to a new employee — the more specific you are, the better the result."',
    cta: 'Test with Claude',
    url: 'https://claude.ai',
  },
  {
    type: 'code',
    icon: '🔨',
    title: 'Build something real',
    instruction: 'Try this in Claude Code — takes under 5 minutes!',
    content: 'Create a simple web page that shows today\'s date, a motivational quote fetched from an API, and a button that copies the quote to clipboard.',
    cta: 'Open Claude Code',
    url: 'https://claude.ai/code',
  },
  {
    type: 'openquestion',
    icon: '💡',
    title: 'Apply it to your work',
    instruction: 'Think about this for 2 minutes before answering.',
    content: 'Name one process at Dexian that could be improved using Claude AI. What would you ask Claude to do? What would the output look like?',
    cta: 'Brainstorm with Claude',
    url: 'https://claude.ai',
  },
];

function getTodaysChallenge() {
  const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  return CHALLENGES[dayOfYear % CHALLENGES.length];
}

// ─── Fetch ALL articles (today + all past days) ───────────
async function fetchAllArticles() {
  try {
    // Fetch all articles, ordered by date descending — no day filter
    const q    = query(collection(db, 'articles'), orderBy('fetchedAt', 'desc'), limit(200));
    const snap = await getDocs(q);
    if (snap.empty) return FALLBACK_ARTICLES;

    return snap.docs.map(d => {
      const data = d.data();
      return {
        id:         d.id,
        sourceType: data.tag          || 'Official',
        source:     data.source       || 'Anthropic',
        title:      data.title        || 'Untitled',
        readTime:   data.readTime     || '5',
        excerpt:    data.summary      || '',
        why:        data.whyItMatters || '',
        topic:      data.difficulty   || 'Intermediate',
        url:        data.url          || '#',
        analogy:    data.analogy      || '',
        quiz:       data.quiz         || null,
        thumbnail:  data.thumbnail    || null,
        type:       data.type         || 'article',
        day:        data.day          || new Date().toISOString().split('T')[0],
        upvotes:    data.upvotes      || null,
      };
    });
  } catch (err) {
    console.error('fetchAllArticles error:', err);
    return FALLBACK_ARTICLES;
  }
}

// ─── Fetch today's brief ──────────────────────────────────
async function fetchTodaysBrief() {
  try {
    const today = new Date().toISOString().split('T')[0];
    const snap  = await getDoc(doc(db, 'dailyBriefs', today));
    if (!snap.exists()) return FALLBACK_BRIEF;
    const data  = snap.data();
    return {
      greeting: 'Good morning, Ak',
      date:     new Date().toLocaleDateString('en-IN', { weekday:'long', month:'short', day:'numeric' }),
      blurb:    data.greeting || FALLBACK_BRIEF.blurb,
      stories:  (data.topArticles || []).map(a => ({
        tag:   a.source === 'Anthropic Blog' ? 'Official'
             : a.source === 'Reddit r/ClaudeAI' ? 'Community'
             : a.source === 'YouTube' ? 'Video'
             : a.source?.includes('Podcast') ? 'Podcast'
             : 'Substack',
        title: a.title,
      })),
    };
  } catch (err) {
    console.error('fetchTodaysBrief error:', err);
    return FALLBACK_BRIEF;
  }
}

// ─── User progress ────────────────────────────────────────
async function fetchUserProgress(userId = 'ak_default') {
  try {
    const ref  = doc(db, 'userProgress', userId);
    const snap = await getDoc(ref);
    if (snap.exists()) return snap.data();
    const defaults = {
      userId, readArticles:[], streak:0, lastReadDate:null,
      totalRead:0, quizScore:0, quizTotal:0, topicCounts:{}, createdAt: new Date().toISOString(),
    };
    await setDoc(ref, defaults);
    return defaults;
  } catch (err) {
    console.error('fetchUserProgress error:', err);
    return { readArticles:[], streak:0, totalRead:0, quizScore:0, quizTotal:0, topicCounts:{} };
  }
}

async function markArticleRead(articleId, topic, userId = 'ak_default') {
  try {
    const ref      = doc(db, 'userProgress', userId);
    const progress = await fetchUserProgress(userId);
    if (progress.readArticles?.includes(articleId)) return progress;
    const today     = new Date().toDateString();
    const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
    const wasYday   = progress.lastReadDate === yesterday.toDateString();
    const isNewDay  = progress.lastReadDate !== today;
    const newStreak = isNewDay ? (wasYday ? (progress.streak||0) + 1 : 1) : (progress.streak||0);
    const topicKey  = `topicCounts.${topic || 'General'}`;
    await updateDoc(ref, {
      readArticles: [...(progress.readArticles||[]), articleId],
      totalRead:    increment(1),
      lastReadDate: today,
      streak:       newStreak,
      [topicKey]:   increment(1),
    });
    return { ...progress, streak: newStreak, totalRead: (progress.totalRead||0) + 1 };
  } catch (err) {
    console.error('markArticleRead error:', err);
  }
}

// ─── Bookmarks ────────────────────────────────────────────
async function fetchBookmarks(userId = 'ak_default') {
  try {
    const snap = await getDoc(doc(db, 'bookmarks', userId));
    return snap.exists() ? (snap.data().articleIds || []) : [];
  } catch (err) {
    console.error('fetchBookmarks error:', err);
    return [];
  }
}

async function toggleBookmark(articleId, userId = 'ak_default') {
  try {
    const ref  = doc(db, 'bookmarks', userId);
    const snap = await getDoc(ref);
    const ids  = snap.exists() ? (snap.data().articleIds || []) : [];
    const next = ids.includes(articleId)
      ? ids.filter(id => id !== articleId)
      : [...ids, articleId];
    await setDoc(ref, { articleIds: next, updatedAt: serverTimestamp() });
    return next;
  } catch (err) {
    console.error('toggleBookmark error:', err);
    return null;
  }
}

async function saveQuizResult(correct, userId = 'ak_default') {
  try {
    await updateDoc(doc(db, 'userProgress', userId), {
      quizTotal: increment(1),
      quizScore: increment(correct ? 1 : 0),
    });
  } catch (err) {
    console.error('saveQuizResult error:', err);
  }
}

function buildProgressData(p) {
  const topics = [
    { name:'Agents',      pct: Math.min(100, ((p.topicCounts?.Agents      ||0)*12)) },
    { name:'Performance', pct: Math.min(100, ((p.topicCounts?.Performance ||0)*12)) },
    { name:'Alignment',   pct: Math.min(100, ((p.topicCounts?.Alignment   ||0)*12)) },
    { name:'Tooling',     pct: Math.min(100, ((p.topicCounts?.Tooling     ||0)*12)) },
    { name:'Evals',       pct: Math.min(100, ((p.topicCounts?.Evals       ||0)*12)) },
    { name:'Safety',      pct: Math.min(100, ((p.topicCounts?.Safety      ||0)*12)) },
  ];
  const accuracy = p.quizTotal > 0 ? Math.round((p.quizScore / p.quizTotal) * 100) : 0;
  const days = Array(14).fill(false);
  for (let i = 0; i < (p.streak||0) && i < 14; i++) days[13 - i] = true;
  return {
    streak: p.streak||0, days,
    stats: { read: p.totalRead||0, accuracy, streakBest: p.streak||0, topics: topics.filter(t=>t.pct>0).length },
    topics,
  };
}

// ─── Shared data loader (used by both bootstrap and refresh) ─
async function loadAndPublish() {
  const [articles, brief, progress, bookmarkIds] = await Promise.all([
    fetchAllArticles(), fetchTodaysBrief(), fetchUserProgress(), fetchBookmarks(),
  ]);

  const quizzes = articles.filter(a => a.quiz).map(a => ({
    q: a.quiz.question, options: a.quiz.options,
    correct: a.quiz.answer, explain: a.quiz.explanation,
  }));

  window.CL_DATA = {
    ARTICLES:       articles,
    BRIEF:          brief,
    QUIZ:           quizzes.length > 0 ? quizzes : FALLBACK_QUIZ,
    PROGRESS:       buildProgressData(progress),
    CHALLENGE:      getTodaysChallenge(),
    BOOKMARK_IDS:   bookmarkIds,
    markRead:       markArticleRead,
    saveQuiz:       saveQuizResult,
    toggleBookmark: toggleBookmark,
    refreshData:    refreshData,
    loading:        false,
  };
  window.dispatchEvent(new Event('cl-data-ready'));
}

// Called by "Refresh" button in the feed
async function refreshData() {
  window.CL_DATA = { ...window.CL_DATA, loading: true };
  window.dispatchEvent(new Event('cl-data-loading'));
  await loadAndPublish();
}

// ─── Bootstrap ────────────────────────────────────────────
async function bootstrapApp() {
  window.CL_DATA = {
    ARTICLES: FALLBACK_ARTICLES, BRIEF: FALLBACK_BRIEF,
    QUIZ: FALLBACK_QUIZ, PROGRESS: FALLBACK_PROGRESS,
    CHALLENGE: getTodaysChallenge(),
    BOOKMARK_IDS: [],
    markRead: markArticleRead, saveQuiz: saveQuizResult,
    toggleBookmark: toggleBookmark, refreshData: refreshData,
    loading: true,
  };
  await loadAndPublish();
}

bootstrapApp();
