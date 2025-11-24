import { messaging } from "./firebase";
import { getToken } from "firebase/messaging";

export async function enableNotifications() {
  try {
    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
      console.log("Notification permission denied.");
      return;
    }

    const token = await getToken(messaging, {
      vapidKey: "BBtsDNUp-sfndcMIl6tvip7GoqsdGw-Hz1VHkty4g68GvZTPBybtuPpUNzcVDF9q9l6aSjCmb_ScbinAE7Pugck"
    });

    console.log("FCM Token:", token);
    localStorage.setItem("collector_token", token);
  } catch (error) {
    console.error("Error getting notification token:", error);
  }
}
