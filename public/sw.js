// sw.js — simple PWA service worker for Van Tracker

const CACHE_NAME = "van-tracker-v1";
const FILES_TO_CACHE = [
  "/",
  "/index.html",
  "/driver.html",
  "/dashboard.html",
  "/manifest.json",
  "/style.css",
  "/icon-192.png",
  "/icon-512.png"
];

// Install: cache all core files
self.addEventListener("install", (event) => {
  console.log("🟢 Service Worker installing...");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Caching app shell...");
      return cache.addAll(FILES_TO_CACHE);
    })
  );
});

// Activate: clean old caches
self.addEventListener("activate", (event) => {
  console.log("⚙️ Service Worker activating...");
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("🧹 Removing old cache:", key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch: serve cached content when offline
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return (
        response ||
        fetch(event.request).catch(() => {
          // offline fallback (if you want a custom offline page)
          if (event.request.mode === "navigate") {
            return caches.match("/dashboard.html");
          }
        })
      );
    })
  );
});
