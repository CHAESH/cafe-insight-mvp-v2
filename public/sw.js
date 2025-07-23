// 카페인사이트 Service Worker - 간단한 버전
const CACHE_NAME = 'cafe-insight-v1';

self.addEventListener('install', (event) => {
  console.log('Service Worker installing.');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating.');
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // 기본적인 fetch 이벤트 처리
  event.respondWith(fetch(event.request));
});