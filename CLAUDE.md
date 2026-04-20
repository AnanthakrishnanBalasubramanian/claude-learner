# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project snapshot

**LearnClaude** — daily Claude AI learning PWA. No build step — plain JSX served directly via Babel CDN. Firebase Firestore for storage, Cloud Functions for scheduled fetches, Firebase Hosting for deployment. Live at `claude-learner.web.app`.

- Stack: React 18 (UMD CDN), Babel Standalone CDN, Firebase 10 (CDN modules), Cloud Functions (Node.js 22)
- Firebase project: `claude-learner`
- Data source: RSS feeds, Reddit r/ClaudeAI, YouTube + Gemini API for Feynman summaries

---

## Commands

```bash
# Local dev — Firebase serves frontend/ directly (no Vite, no npm run dev)
firebase serve --only hosting

# Deploy frontend only
firebase deploy --only hosting

# Deploy Cloud Functions only
firebase deploy --only functions

# Deploy Firestore rules only
firebase deploy --only firestore:rules

# Deploy everything
firebase deploy

# Trigger manual news fetch (for testing)
# Open in browser: https://us-central1-claude-learner.cloudfunctions.net/manualFetch?secret=learnclaude123
```

Functions have no test suite. Test by triggering `manualFetch` and checking Firestore console.

---

## Architecture

### No-build frontend

`frontend/` is the Firebase Hosting public folder. Files are served as-is. There is NO Vite, webpack, or npm build step for the frontend.

`index.html` loads everything in this exact order (order matters — later files depend on earlier ones):
1. React + ReactDOM UMD from unpkg
2. Babel Standalone (transpiles JSX in the browser)
3. Firebase SDK as ES modules → exposed to `window.firebaseApp` and `window.firebaseFirestore`
4. After `firebase-ready` event fires: `android-frame.jsx` → `data.jsx` → `screens-feed.jsx` → `screens-quiz-progress.jsx` → `app.jsx`

All files use `type="text/babel"` — Babel transpiles them client-side.

**There is no module system.** Components share state via globals:
- `window.CL_DATA` — the central data object (set by `data.jsx`)
- `window.firebaseApp` / `window.firebaseFirestore` — Firebase SDK references
- Each screen file ends with `Object.assign(window, { ComponentA, ComponentB })` to expose components to `app.jsx`

### Data flow

`data.jsx` runs `bootstrapApp()` on load:
1. Immediately sets `window.CL_DATA` with fallback data and fires no event yet
2. Fetches from Firestore in parallel (articles, brief, progress)
3. Overwrites `window.CL_DATA` with real data
4. Dispatches `window.dispatchEvent(new Event('cl-data-ready'))` — screens listen for this to re-render

All Firestore reads/writes live in `data.jsx`. Never put Firebase calls inside screen components.

### Tab system

`app.jsx` defines `TABS` (4 entries) and renders a `TabBar` with `gridTemplateColumns: 'repeat(4, 1fr)'`. Adding a 5th tab requires updating both the `TABS` array and the grid column count.

### Firestore collections

| Collection | Written by | Read by |
|---|---|---|
| `articles` | Cloud Function only | Frontend (up to 200, ordered by `fetchedAt` desc) |
| `dailyBriefs` | Cloud Function only | Frontend (by date key) |
| `userProgress` | Frontend (`data.jsx`) | Frontend |
| `bookmarks` | *(planned)* | *(planned)* |

**Known issue:** `firestore.rules` requires `request.auth != null` for `userProgress`, but the app has no auth — all writes to `userProgress` silently fail (caught in try/catch). The app works because it reads from local state. Fix rules before adding new user-owned collections.

### Cloud Function

`functions/index.js` has three exports:
- `dailyNewsFetch` — scheduled cron at `32 3 * * *` UTC (= 9:02 AM IST), fetches RSS + Reddit + YouTube + X (nitter), generates Feynman summaries + quizzes via Gemini, batch-writes to Firestore
- `manualFetch` — HTTP endpoint protected by `?secret=` query param, runs same logic as above
- `evaluateAnswer` — CORS-enabled POST endpoint; receives `{question, answer}`, calls Gemini, returns `{feedback}` — used by ChallengeCard for AI-graded reflection

Gemini API key doubles as YouTube Data API key (same Google Cloud project key).

---

## Critical rules

1. **Never add `<script type="module">` tags to `index.html`** — mixing module scripts with Babel-transpiled globals breaks the app. Firebase SDK is the only exception and is already wired up.
2. **Script load order is load-order-dependent** — new `.jsx` files must be added to `index.html` before `app.jsx`, and after any files they depend on.
3. **Never use ES `import`/`export` in `.jsx` files** — use `window.*` globals instead.
4. **The `firebase.json` hosting rewrite sends all paths to `/Claude_Learner.html`** — if the main HTML file is renamed, update this rewrite.
5. **Always bump Firestore rules when adding a new collection** — redeploy rules with `firebase deploy --only firestore:rules`.
6. **Do not change the Gemini prompt in `getFeynmanSummary`** — it is tuned for Ak's context (Chennai, IT professional, Indian analogies).
