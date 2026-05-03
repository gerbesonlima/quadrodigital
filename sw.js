// Altere a versão toda vez que fizer grandes mudanças no código para forçar a atualização
const CACHE_NAME = 'quadro-v3'; 

// Lista de arquivos que serão salvos no celular para funcionar offline
const urlsToCache = [
  '/quadrodigital/',
  '/quadrodigital/index.html',
  '/quadrodigital/manifest.json',
  '/quadrodigital/icone-192.png',
  '/quadrodigital/icone-512.png'
];

// EVENTO DE INSTALAÇÃO: Baixa e salva os arquivos no cache
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Cache aberto com sucesso');
      return cache.addAll(urlsToCache);
    })
  );
  // Força o Service Worker a se ativar imediatamente
  self.skipWaiting(); 
});

// EVENTO DE ATIVAÇÃO: Limpa os caches antigos se a versão mudar
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Limpando cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Assume o controle de todas as páginas abertas imediatamente
  self.clients.claim();
});

// EVENTO DE FETCH: Intercepta a internet para carregar rápido ou funcionar offline
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      // Se encontrou no cache, retorna o arquivo salvo. Senão, busca da internet.
      return response || fetch(event.request);
    })
  );
});