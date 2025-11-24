import { db } from "./firebase";
import { ref, onValue } from "firebase/database";

let lastStatus: Record<string, string> = {};

export function startBinListener() {
  const binsRef = ref(db, "dustbins");

  onValue(binsRef, (snapshot) => {
    const bins = snapshot.val();
    if (!bins) return;

    Object.keys(bins).forEach((id) => {
      const bin = bins[id];

      // Detect FULL state change
      if (bin.status === "FULL" && lastStatus[id] !== "FULL") {
        new Notification(`🚨 Dustbin ${id} is FULL`, {
          body: `Fill level: ${bin.fill_level}%`,
          icon: "/bin-full.png", // optional
        });

        // Optional alert sound
        const audio = new Audio("/alert.mp3");
        audio.play();
      }

      lastStatus[id] = bin.status;
    });
  });
}
