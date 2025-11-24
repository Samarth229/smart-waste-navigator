self.addEventListener("push", (event) => {
  const data = event.data?.json() || {};

  self.registration.showNotification(data.notification?.title || "Notification", {
    body: data.notification?.body || "",
    icon: "/bin-full.png" // optional icon
  });
});
