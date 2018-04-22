self.addEventListener('push', function(event) {
    if (!(self.Notification && self.Notification.permission === 'granted')) {
        return;
    }
    const sendNotification = body => {
        return self.registration.showNotification(body.title, {
            body: body.body,
            badge: body.badge,
            icon: body.icon,
            image: body.image,
            data: {
                url: body.actlink
            }
        });
    };
    if (event.data) {
        const message = JSON.parse(event.data.text());
        event.waitUntil(sendNotification(message));
    }
});
self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    event.waitUntil(clients.openWindow(event.notification.data.url));
});
