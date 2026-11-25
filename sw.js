// Service worker: menyimpan tampilan aplikasi agar tetap terbuka tanpa sinyal.
// Data ternak tidak disimpan di sini; data disimpan oleh aplikasi di HP dan dikirim ke Google Sheets.
const VERSI = "rekording-v2";
const BERKAS = ["./", "index.html", "config.js", "manifest.webmanifest", "icons/icon-192.png", "icons/icon-512.png", "privacy.html"];
self.addEventListener("install", e => { e.waitUntil(caches.open(VERSI).then(c => c.addAll(BERKAS)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== VERSI).map(x => caches.delete(x)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET") return;
  if (url.origin === location.origin) {
    // Berkas aplikasi: ambil versi terbaru bila ada sinyal, pakai simpanan bila offline.
    e.respondWith(fetch(e.request).then(r => { const c = r.clone(); caches.open(VERSI).then(x => x.put(e.request, c)); return r; })
      .catch(() => caches.match(e.request).then(r => r || caches.match("index.html"))));
  } else if (url.hostname.endsWith("fonts.googleapis.com") || url.hostname.endsWith("fonts.gstatic.com")) {
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(res => { const c = res.clone(); caches.open(VERSI).then(x => x.put(e.request, c)); return res; })));
  }
  // Permintaan ke script.google.com tidak disentuh.
});
