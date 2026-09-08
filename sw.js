self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// 서버에서 보낸 push 메시지 수신 → 알림 표시 + 배지 갱신
self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = { title: '새 알림', body: event.data ? event.data.text() : '' };
  }

  const title = data.title || 'Badge Test';
  const options = {
    body: data.body || '새 메시지가 도착했습니다.',
    icon: 'icon-192.png'
  };

  event.waitUntil(
    (async () => {
      await self.registration.showNotification(title, options);

      if ('setAppBadge' in self.navigator) {
        try {
          await self.navigator.setAppBadge(data.badgeCount || 1);
        } catch (err) {
          console.error('setAppBadge 실패:', err);
        }
      }
    })()
  );
});

// 알림 클릭 시 배지 초기화 + 앱 포커스
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    (async () => {
      if ('clearAppBadge' in self.navigator) {
        await self.navigator.clearAppBadge();
      }
      const allClients = await self.clients.matchAll({ type: 'window' });
      if (allClients.length > 0) {
        allClients[0].focus();
      } else {
        self.clients.openWindow('/');
      }
    })()
  );
});
