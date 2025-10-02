// Service Worker for 排球輪轉計分系統
const CACHE_NAME = 'volleyball-scorer-v1.0.4';
const urlsToCache = [
  './',
  './index.html',
  './styles.css',
  './script.js',
  './manifest.json',
  // 可以添加圖標文件路徑
  // './icons/icon-192x192.png',
  // './icons/icon-512x512.png'
];

// 安裝Service Worker
self.addEventListener('install', event => {
  console.log('[SW] 安裝中...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] 快取檔案中...');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('[SW] 所有檔案已快取');
        // 強制啟動新的Service Worker
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('[SW] 快取檔案時發生錯誤:', error);
      })
  );
});

// 啟動Service Worker
self.addEventListener('activate', event => {
  console.log('[SW] 啟動中...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // 清除舊版本的快取
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] 刪除舊快取:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[SW] 已啟動並控制所有頁面');
      // 立即控制所有頁面
      return self.clients.claim();
    })
  );
});

// 攔截網路請求
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // 如果快取中有該資源，直接返回
        if (response) {
          console.log('[SW] 從快取提供:', event.request.url);
          return response;
        }

        // 如果快取中沒有，嘗試從網路獲取
        console.log('[SW] 從網路獲取:', event.request.url);
        return fetch(event.request).then(response => {
          // 檢查是否為有效的響應
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // 複製響應（因為響應是流，只能使用一次）
          const responseToCache = response.clone();

          // 將新資源添加到快取
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });

          return response;
        }).catch(error => {
          console.log('[SW] 網路請求失敗:', error);
          
          // 如果是HTML請求且網路不可用，返回離線頁面
          if (event.request.destination === 'document') {
            return caches.match('./index.html');
          }
          
          // 對於其他資源，可以返回一個預設的離線響應
          return new Response('離線模式 - 資源無法載入', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({
              'Content-Type': 'text/plain'
            })
          });
        });
      })
  );
});

// 處理背景同步（可選）
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    console.log('[SW] 背景同步觸發');
    event.waitUntil(
      // 這裡可以添加背景同步邏輯
      // 例如：同步比賽數據到服務器
      Promise.resolve()
    );
  }
});

// 處理推送通知（可選）
self.addEventListener('push', event => {
  console.log('[SW] 收到推送通知');
  
  const options = {
    body: event.data ? event.data.text() : '排球計分系統通知',
    icon: './icons/icon-192x192.png',
    badge: './icons/icon-96x96.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: '查看詳情',
        icon: './icons/icon-96x96.png'
      },
      {
        action: 'close',
        title: '關閉',
        icon: './icons/icon-96x96.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('排球計分系統', options)
  );
});

// 處理通知點擊
self.addEventListener('notificationclick', event => {
  console.log('[SW] 通知被點擊');
  event.notification.close();

  if (event.action === 'explore') {
    // 打開應用
    event.waitUntil(
      clients.openWindow('./')
    );
  } else if (event.action === 'close') {
    // 什麼都不做，通知已經關閉
  } else {
    // 預設行為：打開應用
    event.waitUntil(
      clients.openWindow('./')
    );
  }
});

// 版本更新檢查
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('[SW] Service Worker 已載入');
