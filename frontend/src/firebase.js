import { initializeApp } from "firebase/app";
import { getFirestore, collection, query, where, orderBy, getDocs, doc, getDoc, setDoc, updateDoc, increment } from "firebase/firestore";

// Your Firebase config — already set up!
const firebaseConfig = {
  apiKey: "AIzaSyAxI0tE4ZrXUG--vpOAJklgKw2L9xzf930",
  authDomain: "claude-learner.firebaseapp.com",
  projectId: "claude-learner",
  storageBucket: "claude-learner.firebasestorage.app",
  messagingSenderId: "284158820000",
  appId: "1:284158820000:web:99316b62be74b53dc013c5"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// ─── Get today's articles from Firestore ─────────────────
export async function getTodaysArticles() {
  const today = new Date().toISOString().split("T")[0];
  const q = query(
    collection(db, "articles"),
    where("day", "==", today),
    orderBy("fetchedAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ─── Get today's morning brief ────────────────────────────
export async function getTodaysBrief() {
  const today = new Date().toISOString().split("T")[0];
  const ref = doc(db, "dailyBriefs", today);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
}

// ─── Get or create user progress ─────────────────────────
export async function getUserProgress(userId = "ak_default") {
  const ref = doc(db, "userProgress", userId);
  const snap = await getDoc(ref);
  if (snap.exists()) return snap.data();
  const defaultProgress = {
    userId,
    readArticles: [],
    streak: 0,
    lastReadDate: null,
    totalRead: 0,
    quizScore: 0,
    quizTotal: 0,
    createdAt: new Date().toISOString(),
  };
  await setDoc(ref, defaultProgress);
  return defaultProgress;
}

// ─── Mark article as read + update streak ─────────────────
export async function markArticleRead(articleId, userId = "ak_default") {
  const ref = doc(db, "userProgress", userId);
  const today = new Date().toDateString();
  const progress = await getUserProgress(userId);

  if (progress.readArticles.includes(articleId)) return progress;

  const isNewDay = progress.lastReadDate !== today;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const wasYesterday = progress.lastReadDate === yesterday.toDateString();
  const newStreak = isNewDay ? (wasYesterday ? progress.streak + 1 : 1) : progress.streak;

  await updateDoc(ref, {
    readArticles: [...progress.readArticles, articleId],
    totalRead: increment(1),
    lastReadDate: today,
    streak: newStreak,
  });

  return { ...progress, streak: newStreak, totalRead: progress.totalRead + 1 };
}

// ─── Save quiz result ─────────────────────────────────────
export async function saveQuizResult(correct, userId = "ak_default") {
  const ref = doc(db, "userProgress", userId);
  await updateDoc(ref, {
    quizTotal: increment(1),
    quizScore: correct ? increment(1) : increment(0),
  });
}