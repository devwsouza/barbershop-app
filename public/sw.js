/*self.addEventListener("install", (event) => {
  console.log("Service Worker instalado");
});

self.addEventListener("fetch", (event) => {
  // pode melhorar depois com cache offline
});*/

self.addEventListener('install', function(event) {
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  return self.registration.unregister();
});
``