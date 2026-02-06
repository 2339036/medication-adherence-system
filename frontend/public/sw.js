// sw.js
//this file is the service worker that handles push notifications for medication reminders

self.addEventListener("push", (event) => {
  const data = event.data.json();
  const title = data.title || "Medication Reminder";
  const options = {
    body: data.body || "Time to take your medication!",
    icon: "/favicon.ico", // optional icon
    badge: "/favicon.ico", // optional badge
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Optional: handle notification click
self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  event.waitUntil(
    clients.openWindow("/") // go to home page when clicked
  );
});
