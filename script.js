//https://github.com/web-push-libs/web-push-php
const API_ENDPOINT = 'http://localhost:3000/subscriptions';
const VAPID_PUBLIC_KEY = "BFHNL4huwkB2w7GnobFm4-3XpQEIOBFicySNAJ-M-P3ij4xhbrM7BXMyqo27ebCel5Bk7vgRmSS0dHKuGdJiiQE";
const AUTHORIZATION_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InBhbm9zQGF0bmV0LmdyIiwidXNlcklkIjoiNWY1Y2I3MzQxNzI0NTk0YzcwYTdiNGIyIiwiaWF0IjoxNTk5OTEzNDIwLCJleHAiOjE1OTk5MTcwMjB9.m3WrloKXtr0INqZWMJjvFU7-0WxlmUawPnfAyNuO2wM";


if ('serviceWorker' in navigator){
    navigator.serviceWorker.register("/sw.js").then(function(registration){
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
    }).catch(function(err){
        console.log('ServiceWorker registration failed: ', err);
    });
}

const makeSubscription = function() {
    if ('serviceWorker' in navigator){
        let swRegistration;
        navigator.serviceWorker.ready.then(function(swReg){
            swRegistration = swReg;
            return swReg.pushManager.getSubscription();
        }).then(function(subscription){
            if (subscription == null){
                const convertedVapidKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);

                return swRegistration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: convertedVapidKey
                });
            } else {
                console.log(subscription);
                // already subscribed
            }
        }).then(function(subscription){
            if (subscription){
                console.log(subscription);
                fetch(API_ENDPOINT, {
                    method: 'post',
                    headers: {
                      'Content-type': 'application/json',
                      'Authorization': 'Bearer '+AUTHORIZATION_TOKEN
                    },
                    body: JSON.stringify({
                      subscription: subscription
                    }),
                }).then(function(response){
                    if (response.ok)
                        showNotification();
                }).catch(function(error){
                    console.log(error);
                });
            }

        });
    }
}

const showNotification = function (){
    if ('serviceWorker' in navigator){
        navigator.serviceWorker.getRegistration().then(function(registration){
            console.log(registration);
        });

        navigator.serviceWorker.ready.then(function(swReg){
            swReg.showNotification('Notification from Service Worker', {
                body: "Welcome to our Notification Service",
                icon: "/images/icon.png",
                image: "/images/image.jpg",
                dir: "ltr",
                lang: "el-GR",
                vibrate: [100, 20, 100],
                badge: "/images/icon.png",
                tag: "welcome-notification",
                renotify: true,
                actions: [
                    {
                        action: "confirm",
                        title: "ok",
                        icon: "/images/icon.png"
                    },
                    {
                        action: "cancel",
                        title: "cancel",
                        icon: "/images/icon.png"
                    },
                ]
            });
        });
    } else {
        new Notification("Notification", {
            body: "Welcome to our Notification Service"
        });
    }
}

if ('Notification' in window){
    const enableNotificationsBtn = document.getElementById('enable-notifications');
    enableNotificationsBtn.addEventListener('click', function(event){
        event.preventDefault();
        Notification.requestPermission(function(result){
            console.log("Notification request result: ", result);
            if (result !== 'granted'){
                console.log('No Notification Permission granted');
            } else {
                makeSubscription();
                //showNotification();
            }
        });

    });
} else {
    const enableNotificationsBtn = document.getElementById('enable-notifications');
    enableNotificationsBtn.style.display = 'none';
}