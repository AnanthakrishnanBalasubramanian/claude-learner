// LearnClaude Service Worker — offline support
const CACHE = 'learnclaude-v1';
const STATIC = [
  '/',
  '/Claude_Learner.html',
  '/styles.css',
  '/app.jsx',
  '/data.jsx',
  '/screens-feed.jsx',
  '/screens-quiz-progress.jsx',
  '/android-frame.jsx',
  '/manifest.json',
];

// Install — cache static assets
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(STATIC))
  );
  self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch — serve from cache, fall back to network
self.addEventListener('fetch', e => {
  // Skip Firebase and CDN requests — always go to network for these
  if (e.request.url.includes('firestore') ||
      e.request.url.includes('googleapis') ||
      e.request.url.includes('unpkg') ||
      e.request.url.includes('fonts')) {
    return;
  }
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
