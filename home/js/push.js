(function(win, doc, nav) {

    win.PUSH_SERVER_TOOL = {
        init: function(options) {
            const applicationServerKey = options.applicationServerKey;
            const siteName = options.siteName;
            const subscribeUrl = options.subscribeUrl;
            const userLang = navigator.language || navigator.userLanguage;

            doc.addEventListener('DOMContentLoaded', () => {

                nav.serviceWorker.register("serviceWorker.js")
                    .then(() => {
                        console.log('[SW] Service worker has been registered');
                    }, e => {
                        console.error('[SW] Service worker registration failed', e);
                        console.log("unlock");
                    });

                if (!('serviceWorker' in nav)) {
                    console.warn("Service workers are not supported by this browser");
                    console.log("unlock");
                    return;
                }

                if (!('PushManager' in win)) {
                    console.warn('Push notifications are not supported by this browser');
                    console.log("unlock");
                    return;
                }

                if (!('showNotification' in ServiceWorkerRegistration.prototype)) {
                    console.warn('Notifications are not supported by this browser');
                    console.log("unlock");
                    return;
                }

                if (Notification.permission === 'denied') {
                    console.warn('Notifications are denied by the user');
                    win.opener.postMessage("user-denied", "*");
                    return;
                }
                
                nav.serviceWorker.ready
                    .then(serviceWorkerRegistration => serviceWorkerRegistration.pushManager.subscribe({
                        userVisibleOnly: true,
                        applicationServerKey: urlBase64ToUint8Array(applicationServerKey),
                    }))
                    .then(subscription => {
                        return push_sendSubscriptionToServer(subscription, 'POST');
                    })
                    .then(subscription => subscription)
                    .then(() => win.opener.postMessage("user-allowed", "*"))
                    .catch(e => {
                        if (Notification.permission === 'denied') {
                            console.warn('Notifications are denied by the user.');
                            win.opener.postMessage("user-denied", "*");
                        } else {
                            console.error('Impossible to subscribe to push notifications', e);
                            win.opener.postMessage("user-denied", "*");
                        }
                    });

                function urlBase64ToUint8Array(base64String) {
                    const padding = '='.repeat((4 - base64String.length % 4) % 4);
                    const base64 = (base64String + padding)
                        .replace(/\-/g, '+')
                        .replace(/_/g, '/');

                    const rawData = window.atob(base64);
                    const outputArray = new Uint8Array(rawData.length);

                    for (let i = 0; i < rawData.length; ++i) {
                        outputArray[i] = rawData.charCodeAt(i);
                    }
                    return outputArray;
                }

                function push_sendSubscriptionToServer(subscription, method) {
                    const key = subscription.getKey('p256dh');
                    const token = subscription.getKey('auth');

                    return fetch(subscribeUrl, {
                        method,
                        body: JSON.stringify({
                            endpoint: subscription.endpoint,
                            key: key ? btoa(String.fromCharCode.apply(null, new Uint8Array(key))) : null,
                            token: token ? btoa(String.fromCharCode.apply(null, new Uint8Array(token))) : null,
                            additionals: {
                                siteName: siteName,
                                lang: userLang
                            }
                        }),
                    }).then(() => subscription);
                }

            }); // dom loader

        } // init

    }


})(window, document, navigator);
