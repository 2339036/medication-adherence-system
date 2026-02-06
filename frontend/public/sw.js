// sw.js
//this file is the service worker that handles push notifications for medication reminders

self.addEventListener("push", (event) => {
  const data = event.data?.json() || {};

  const title = data.title || "Medication Reminder";
  const options = {
    body: data.body || "Time to take your medication!",
    icon: "/favicon.ico",
    badge: "/favicon.ico",
    data: {
      url: "/adherence", // destination page
    },
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || "/adherence";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // If an open tab exists, navigate it
      for (const client of clientList) {
        if ("navigate" in client) {
          return client.navigate(targetUrl).then(() => client.focus());
        }
      }

      // Otherwise open a new tab
      return clients.openWindow(targetUrl);
    })
  );
});
