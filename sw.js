self.addEventListener("install", function(event){
    console.log("Installation of service worker was successfull", event);
});

self.addEventListener("notificationclick", function(event){
    console.log("Notification Clicked!");
    const notification = event.notification;
    const action = event.action;

    if (action !== 'cancel'){
        const data = notification.data;
        if (data.url !== undefined){
            event.waitUntil(
                clients.matchAll().then(allClients => {
                    const client = allClients.find(cl => {
                        return cl.visibilityState = 'visible';
                    })
    
                    if (client){
                        client.navigate(notification.data.url);
                        client.focus();
                    } else {
                        clients.openWindow(notification.data.url)
                    }
                })
            )
        }
        notification.close();
    } else {
        notification.close();
    }
});

self.addEventListener("notificationclose", function(event){
    console.log('Notification close action');
});

self.addEventListener("push", function(event){
    console.log("push notification received", event);

    let data = {title: "Notification", message: "Hello!" };
    if (event.data){
        data = JSON.parse(event.data.text());
    }

    const notificationConfig = {
        body: data.message,
        icon: data.icon,
        image: data.image,
        dir: data.dir,
        lang: data.lang,
        vibrate: data.vibrate,
        silent: data.silent,
        badge: data.badge,
        tag: data.tag,
        renotify: data.renotify,
        actions: data.actions,
        data: {}
    };

    const extraData = data.data;
    if (extraData.url !== undefined){
        notificationConfig.data.url = extraData.url;
    }

    event.waitUntil(
        self.registration.showNotification(data.title, notificationConfig)
    );
});