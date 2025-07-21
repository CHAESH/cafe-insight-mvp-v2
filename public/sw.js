// 카페인사이트 Service Worker - PWA 캐싱 및 오프라인 지원

const CACHE_NAME = 'cafeinsight-v1';
const STATIC_CACHE_NAME = 'cafeinsight-static-v1';
const DYNAMIC_CACHE_NAME = 'cafeinsight-dynamic-v1';

// 캐시할 정적 리소스
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/calculations/new',
  '/manifest.json',
  '/favicon.ico',
  // CSS와 JS는 빌드 시 자동으로 추가됨
];

// 오프라인에서도 작동해야 하는 계산 기능
const OFFLINE_FALLBACK_PAGE = '/offline.html';

// Service Worker 설치
self.addEventListener('install', (event) => {
  console.log('카페인사이트 SW 설치 중...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('정적 리소스 캐시 중...');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        return self.skipWaiting(); // 즉시 활성화
      })
  );
});

// Service Worker 활성화
self.addEventListener('activate', (event) => {
  console.log('카페인사이트 SW 활성화 중...');
  
  event.waitUntil(
    Promise.all([
      // 오래된 캐시 정리
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return cacheName !== STATIC_CACHE_NAME && 
                     cacheName !== DYNAMIC_CACHE_NAME;
            })
            .map((cacheName) => {
              console.log('오래된 캐시 삭제:', cacheName);
              return caches.delete(cacheName);
            })
        );
      }),
      // 모든 클라이언트에 즉시 적용
      self.clients.claim()
    ])
  );
});

// 네트워크 요청 가로채기
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // API 요청은 네트워크 우선 (AI 기능 등)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request));
    return;
  }

  // 계산 관련 페이지는 캐시 우선 (오프라인 지원)
  if (url.pathname.startsWith('/calculations')) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // 정적 리소스는 캐시 우선
  if (isStaticAsset(request)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // 나머지는 네트워크 우선, 실패시 캐시
  event.respondWith(networkFirst(request));
});

// 네트워크 우선 전략 (API 호출용)
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    
    // 성공하면 캐시에 저장 (GET 요청만)
    if (request.method === 'GET' && networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('네트워크 실패, 캐시에서 조회:', request.url);
    
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // AI API 실패 시 폴백 응답
    if (request.url.includes('/api/calculations/ai-tips')) {
      return new Response(
        JSON.stringify({
          error: true,
          message: '현재 AI 서비스를 이용할 수 없습니다. 네트워크 연결을 확인해주세요.',
          offline: true
        }),
        {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    throw error;
  }
}

// 캐시 우선 전략 (정적 리소스용)
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    // 백그라운드에서 업데이트 (stale-while-revalidate)
    fetch(request).then((networkResponse) => {
      if (networkResponse.ok) {
        const cache = caches.open(DYNAMIC_CACHE_NAME);
        cache.then(c => c.put(request, networkResponse));
      }
    }).catch(() => {
      // 네트워크 실패는 무시
    });
    
    return cachedResponse;
  }
  
  // 캐시에 없으면 네트워크에서 가져와서 캐시
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // 완전 오프라인 상태일 때 폴백
    if (request.destination === 'document') {
      return caches.match(OFFLINE_FALLBACK_PAGE);
    }
    
    throw error;
  }
}

// 정적 리소스 판별
function isStaticAsset(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  return pathname.endsWith('.js') ||
         pathname.endsWith('.css') ||
         pathname.endsWith('.png') ||
         pathname.endsWith('.jpg') ||
         pathname.endsWith('.svg') ||
         pathname.endsWith('.ico') ||
         pathname.endsWith('.woff') ||
         pathname.endsWith('.woff2');
}

// 백그라운드 동기화 (향후 확장용)
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-calculation-sync') {
    event.waitUntil(syncCalculations());
  }
});

// 계산 데이터 동기화 (오프라인에서 생성된 데이터)
async function syncCalculations() {
  // IndexedDB에서 오프라인 계산 데이터 가져와서 서버에 동기화
  console.log('백그라운드 계산 데이터 동기화 시작');
  
  try {
    // TODO: IndexedDB 연동 구현
    console.log('계산 데이터 동기화 완료');
  } catch (error) {
    console.error('동기화 실패:', error);
  }
}

// 푸시 알림 (향후 확장용)
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : '새로운 절약 팁이 있습니다!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    data: {
      url: '/dashboard'
    }
  };

  event.waitUntil(
    self.registration.showNotification('카페인사이트', options)
  );
});

// 알림 클릭 처리
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/dashboard')
  );
});