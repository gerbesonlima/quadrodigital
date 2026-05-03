// 1. REGRA DE OURO: Toda vez que você alterar o index.html, 
// você DEVE mudar este número (ex: quadro-v8, quadro-v9...)
const CACHE_NAME = 'quadro-v9'; 

const urlsToCache = [
  '/quadrodigital/index.html',
  '/quadrodigital/manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return Promise.all(
        urlsToCache.map(url => {
          return cache.add(url).catch(error => console.warn('Falha no cache:', url));
        })
      );
    })
  );
  // Força o celular a instalar a atualização imediatamente
  self.skipWaiting(); 
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Apagando versão antiga:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 2. A MÁGICA DA ATUALIZAÇÃO (Network First)
self.addEventListener('fetch', event => {
  event.respondWith(
    // Tenta buscar a versão mais recente na internet primeiro
    fetch(event.request)
      .then(respostaInternet => {
        // Se deu certo (tem internet), salva essa versão fresquinha no cache escondido
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, respostaInternet.clone());
          return respostaInternet;
        });
      })
      .catch(() => {
        // Se falhou (celular está offline/sem internet), mostra o que está salvo
        return caches.match(event.request);
      })
  );
});