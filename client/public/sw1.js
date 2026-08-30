// self.addEventListener("install", (event) => {
//   self.skipWaiting();
// });

// self.addEventListener("activate", (event) => {
//   event.waitUntil(self.clients.claim());
// });

self.addEventListener("push", (event) => {
  let data = {
    title: "Notification",
    body: "You have a new message",
    icon: "/icon.png",
    badge: "/badge.png",
    url: "/",
  };

  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch {
      data.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon,
      badge: data.badge,
      data: { url: data.url },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const url = event.notification.data?.url || "/";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if (client.url.includes(url) && "focus" in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(url);
      }
    })
  );
});


self.addEventListener('pushsubscriptionchange', async (event) => {
  const newSub = await self.registration.pushManager.subscribe(event.oldSubscription.options)
  // send newSub to your backend to replace the old one
})