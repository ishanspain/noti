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