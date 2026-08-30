const subscribeButton = document.getElementById("subscribe-btn");
const subscribeStatus = document.getElementById("subscribe-status");
const sendForm = document.getElementById("send-form");
const sendButton = document.getElementById("send-btn");
const sendStatus = document.getElementById("send-status");

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getMessaging, onRegistered, register } from "firebase/messaging";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDy05-gqEJjAOPTfLKaKNi7Of5ssDwlV8w",
  authDomain: "printcampus-15089.firebaseapp.com",
  projectId: "printcampus-15089",
  storageBucket: "printcampus-15089.firebasestorage.app",
  messagingSenderId: "562212642188",
  appId: "1:562212642188:web:a6bfb5545bab7ad750caa9",
  measurementId: "G-SVKD9EFKMZ",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

const registration = await navigator.serviceWorker.register(
  "/firebase-messaging-sw.js",
);

const messaging = getMessaging();
/* register(messaging, {
  vapidKey:
    "BHpqkKPFWzA1MLFlS5smpHdqx8vM03otoLiz_AD2NxW7sHb5zTaG2fbol4Xa0qWbeEY50zb1GBPyRKAmuvKGfjs",
}); */

/* async function requestPermission() {
  console.log("Requesting permission...");
  const permission = await Notification.requestPermission();
  if (permission === "granted") {
    console.log("Notification permission granted.");
  }
} */

onRegistered(messaging, async (installationId) => {
  console.log("Registered installation ID:", installationId);

  // Send the Firebase Installation ID to your app server and update the UI if needed.
  await sendRegistrationToServer(installationId);
});

async function sendRegistrationToServer(installationId) {
  const userIdInput = document.getElementById("user-id");
  const userId = userIdInput.value.trim();

  if (!userId) {
    throw new Error("User ID is required");
  }

  const response = await fetch("http://localhost:3000/subscriber", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: userId, subscription: installationId }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to subscribe");
  }

  try {
    if (subscribeStatus) {
      subscribeStatus.textContent = data.message || "Subscribed";
    }
  } catch (error) {
    console.error("Subscription failed", error);
    if (subscribeStatus) {
      subscribeStatus.textContent = error.message || "Subscription failed";
    }
  }
  return data;
}

// subscribe button
async function subscribeToPush() {
  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    throw new Error("Notification permission denied");
  }

  register(messaging, {
    vapidKey:
      "BHpqkKPFWzA1MLFlS5smpHdqx8vM03otoLiz_AD2NxW7sHb5zTaG2fbol4Xa0qWbeEY50zb1GBPyRKAmuvKGfjs",
  });

  /* if (!subscription) {
    subscription = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    });
  } */
}

if (subscribeButton) {
  subscribeButton.addEventListener("click", subscribeToPush);
}

if (sendForm && sendButton) {
  sendForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    try {
      sendButton.disabled = true;
      if (sendStatus) {
        sendStatus.textContent = "Sending...";
      }

      const formData = new FormData(sendForm);
      const response = await fetch("http://localhost:3000/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userid: formData.get("userid"),
          title: formData.get("title"),
          body: formData.get("body"),
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to send notification");
      }

      if (sendStatus) {
        sendStatus.textContent = data.message || "Notification sent";
      }
    } catch (error) {
      console.error("Sending notification failed", error);
      if (sendStatus) {
        sendStatus.textContent = error.message || "Failed to send notification";
      }
    } finally {
      sendButton.disabled = false;
    }
  });
}
