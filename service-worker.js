// Nama cache yang digunakan untuk menyimpan aset
const cache_name = 'v1';

// Aset yang akan di-cache saat service worker dipasang
const cache_assets = [
  '/index.html',
  '/about.html',
  '/contact.html',
  '/offline.html',  // Halaman offline fallback
  '/styles.css',
  '/app.js',
];

// Event saat service worker diinstall
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installed');
  
  // Men-cache aset statis
  event.waitUntil(
    caches.open(cache_name)
      .then((cache) => {
        console.log('Service Worker: Caching Files');
        return cache.addAll(cache_assets);
      })
      .catch((error) => {
        console.error('Service Worker: Cache failed:', error);
      })
  );
});

// Event saat service worker diaktifkan (untuk membersihkan cache lama)
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activated');

  // Menghapus cache yang lama
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== cache_name) {
            console.log('Service Worker: Clearing Old Cache');
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Event fetch untuk menangani permintaan dari aplikasi
self.addEventListener('fetch', (event) => {
  console.log('Service Worker: Fetching', event.request.url);

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Jika ditemukan di cache, return cache
        if (response) {
          return response;
        }

        // Jika tidak ada di cache, fetch dari jaringan
        return fetch(event.request).then((fetchResponse) => {
          // Jika respon dari jaringan valid, simpan di cache
          return caches.open(cache_name).then((cache) => {
            if (fetchResponse.status === 200) {
              cache.put(event.request, fetchResponse.clone());
            }
            return fetchResponse;
          });
        });
      })
      .catch(() => {
        // Jika fetch gagal (misalnya karena offline), tampilkan halaman offline
        return caches.match('/offline.html');
      })
  );
});
