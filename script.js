const API_ENDPOINT = 'http://localhost:3000/subscriptions';
const VAPID_PUBLIC_KEY = 'BMdweadVIDiDe_3m9VdnI6nqG8bmnBNso2zHgip-LF4f_oMDPGJ27uBl8-YQW2QlIUz5GoTYedsD-68V4cE2AkI';
const USER_ID = "5f5cb7341724594c70a7b4b2";


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
                      'Content-type': 'application/json'
                    },
                    body: JSON.stringify({
                      subscription: subscription,
                      userId: USER_ID
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


/**
 * Converts a base64 string to a Uint8Array
 * @param {string} base64String a public vapid key
 * @returns {Uint8Array}
 */
function urlBase64ToUint8Array(base64String) {
    var padding = '='.repeat((4 - base64String.length % 4) % 4);
    var base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    var rawData = window.atob(base64);
    var outputArray = new Uint8Array(rawData.length);

    for (var i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}