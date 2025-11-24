import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { enableNotifications } from "./notifications";
import { startBinListener } from "./binListener";

enableNotifications();
startBinListener();

createRoot(document.getElementById("root")!).render(<App />);

// register service worker for background notifications
if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/firebase-messaging-sw.js")
    .then(() => console.log("Service Worker registered!"))
    .catch((err) => console.log("Service Worker registration failed:", err));
}

