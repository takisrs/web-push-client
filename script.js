const API_ENDPOINT = "http://localhost:3000/subscriptions",
	VAPID_PUBLIC_KEY = "BF-yfKEFXSs6Fp7CTsufzqbWZTaEXlEGJSwSTiZQN5ZXifu7sa8MQe2BPVTDz4Ngnqmbn334usmvefRAqwxLRbY",
	USER_ID = "5f725538290ed1996e438513";

/**
 * Converts a base64 string to a Uint8Array
 * @param {string} base64String a public vapid key
 * @returns {Uint8Array}
 */
function urlBase64ToUint8Array(base64String) {
	const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
	const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

	const rawData = window.atob(base64);
	const outputArray = new Uint8Array(rawData.length);

	for (let i = 0; i < rawData.length; ++i) {
		outputArray[i] = rawData.charCodeAt(i);
	}
	return outputArray;
}

const showNotification = () => {
	if ("serviceWorker" in navigator) {
		navigator.serviceWorker.getRegistration().then((registration) => {
			console.log(registration);
		});

		navigator.serviceWorker.ready.then((swReg) => {
			swReg.showNotification("Notification from Service Worker", {
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
						icon: "/images/icon.png",
					},
					{
						action: "cancel",
						title: "cancel",
						icon: "/images/icon.png",
					},
				],
			});
		});
	} else {
		new Notification("Notification", {
			body: "Welcome to our Notification Service",
		});
	}
};

const storeSubscription = (subscription, cb) => {
	fetch(API_ENDPOINT, {
		method: "post",
		headers: {
			"Content-type": "application/json",
		},
		body: JSON.stringify({
			subscription,
			userId: USER_ID,
		}),
	})
		.then((response) => {
			if (response.ok) cb();
		})
		.catch((error) => {
			console.log(error);
		});
};

const makeSubscription = async () => {
	if ("serviceWorker" in navigator) {
		const swRegistration = await navigator.serviceWorker.ready;
		const subscription = await swRegistration.pushManager.getSubscription();

		if (subscription == null) {
			const convertedVapidKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);

			const newSubscription = await swRegistration.pushManager.subscribe({
				userVisibleOnly: true,
				applicationServerKey: convertedVapidKey,
			});

			if (newSubscription) {
				console.log(newSubscription);
				storeSubscription(newSubscription, showNotification);
			}
		}
	}
};

if ("serviceWorker" in navigator) {
	navigator.serviceWorker
		.register("/sw.js")
		.then((registration) => {
			console.log("ServiceWorker registration successful with scope: ", registration.scope);
		})
		.catch((err) => {
			console.log("ServiceWorker registration failed: ", err);
		});
}

const enableNotificationsBtn = document.getElementById("enable-notifications");
if ("Notification" in window) {
	enableNotificationsBtn.addEventListener("click", (event) => {
		event.preventDefault();
		Notification.requestPermission((result) => {
			console.log("Notification request result: ", result);
			if (result !== "granted") {
				console.log("No Notification Permission granted");
			} else {
				makeSubscription();
			}
		});
	});
} else {
	enableNotificationsBtn.style.display = "none";
}
