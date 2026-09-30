/* KekBatikLab Firebase Cloud Messaging service worker */

// Register the click handler before Firebase Messaging imports so custom click
// behavior is not replaced by the SDK.
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const relativePath = event.notification?.data?.url || './?adminTab=orders';
  const targetUrl = new URL(relativePath, self.registration.scope).href;

  event.waitUntil((async () => {
    const windows = await clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of windows) {
      if ('focus' in client) {
        try {
          await client.navigate(targetUrl);
        } catch (_) {}
        return client.focus();
      }
    }
    if (clients.openWindow) return clients.openWindow(targetUrl);
  })());
});

importScripts('https://www.gstatic.com/firebasejs/11.6.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.6.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyApCM07s1Malsb2XACOR5qNXooaXLkW-dc',
  authDomain: 'salestracker-1b3e2.firebaseapp.com',
  databaseURL: 'https://salestracker-1b3e2-default-rtdb.firebaseio.com',
  projectId: 'salestracker-1b3e2',
  storageBucket: 'salestracker-1b3e2.firebasestorage.app',
  messagingSenderId: '637145526594',
  appId: '1:637145526594:web:5120d6fb0e74b4667998db',
  measurementId: 'G-XNSRZWZZXZ'
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const data = payload?.data || {};
  const title = data.title || 'New KekBatikLab Order';
  const body = data.body || 'A customer placed a new order.';

  self.registration.showNotification(title, {
    body,
    icon: './icon-192.png',
    badge: './icon-192.png',
    tag: data.orderId ? `order-${data.orderId}` : 'kbl-new-order',
    renotify: true,
    vibrate: [180, 80, 180],
    requireInteraction: true,
    data: {
      url: data.clickPath || './?adminTab=orders',
      orderId: data.orderId || '',
      orderNo: data.orderNo || ''
    }
  });
});
