// Service Worker amélioré pour ByGagoos Ink
const CACHE_NAME = 'bygagoos-ink-v1.0';
const OFFLINE_URL = '/offline.html';

// URLs à mettre en cache immédiatement
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-72x72.png',
  '/icons/icon-144x144.png',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Ignorer ces URLs (ne pas les mettre en cache)
const urlsToIgnore = [
  '/api/',
  '/health',
  '/socket.io/',
  '/ws'
];

// Installation
self.addEventListener('install', event => {
  console.log('🔧 Service Worker: Installation');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('📦 Cache ouvert, ajout des URLs:', urlsToCache);
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('✅ Cache pré-rempli');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('❌ Erreur installation cache:', error);
      })
  );
});

// Activation
self.addEventListener('activate', event => {
  console.log('🔧 Service Worker: Activation');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Suppression ancien cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
    .then(() => {
      console.log('✅ Service Worker prêt à gérer les requêtes');
      return self.clients.claim();
    })
  );
});

// Gestion des requêtes
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // Ignorer les requêtes API
  if (urlsToIgnore.some(ignoreUrl => url.pathname.startsWith(ignoreUrl))) {
    console.log('⏭️ Requête API ignorée:', url.pathname);
    return;
  }
  
  // Ignorer les requêtes non-GET
  if (event.request.method !== 'GET') {
    return;
  }
  
  // Ignorer les extensions de fichiers spécifiques
  if (url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/)) {
    return;
  }
  
  // Pour les pages HTML, stratégie réseau d'abord, puis cache
  if (event.request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Mettre à jour le cache avec la nouvelle réponse
          const responseClone = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => cache.put(event.request, responseClone));
          return response;
        })
        .catch(() => {
          // En cas d'erreur réseau, essayer le cache
          return caches.match(event.request)
            .then(cachedResponse => {
              if (cachedResponse) {
                return cachedResponse;
              }
              // Si pas dans le cache, retourner la page offline
              return caches.match(OFFLINE_URL);
            });
        })
    );
    return;
  }
  
  // Pour les autres ressources, stratégie cache d'abord
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }
        
        return fetch(event.request)
          .then(response => {
            // Vérifier si la réponse est valide
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Ajouter la réponse au cache
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            
            return response;
          });
      })
  );
});

// Gestion des messages
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Gestion des notifications push (pour plus tard)
self.addEventListener('push', event => {
  console.log('📢 Notification push reçue:', event);

  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = {
      body: event.data?.text()
    };
  }
  
  const options = {
    body: payload.body || 'Nouvelle notification de ByGagoos Prod',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    tag: payload.tag || 'bygagoos-notification',
    data: {
      dateOfArrival: Date.now(),
      url: payload.url || '/',
      primaryKey: payload.tag || '1'
    },
    actions: [
      {
        action: 'explore',
        title: 'Voir',
        icon: '/icons/icon-72x72.png'
      },
      {
        action: 'close',
        title: 'Fermer',
        icon: '/icons/icon-72x72.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(payload.title || 'ByGagoos Prod', options)
  );
});

// Gestion des clics sur notifications
self.addEventListener('notificationclick', event => {
  console.log('🔔 Notification cliquée:', event.notification.tag);
  
  event.notification.close();
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(clientList => {
        const targetUrl = new URL(event.notification.data?.url || '/', self.location.origin).href;
        for (const client of clientList) {
          if (client.url === targetUrl && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      })
  );
});
