🗑️ Smart Waste Navigator

A smart, IoT-powered waste monitoring and collection system that helps cities prevent overflowing dustbins by notifying garbage collectors when bins are full and guiding them to the fastest route.

__________________________________________________________________________________________________________________________________________________________________________________________________________________

📌 Overview

Smart Waste Navigator is an intelligent waste management solution integrating IoT sensors, web interface, Firebase backend, and real-time alerts to optimize garbage collection in urban areas.
This system detects when a dustbin is full, automatically notifies the nearest garbage vehicle, and generates the shortest route using integrated map services. It improves hygiene, reduces manual monitoring, and increases collection efficiency.

__________________________________________________________________________________________________________________________________________________________________________________________________________________

🎯 Features

🛢️ Waste Monitoring

Real-time dustbin fill-level detection using IoT sensors
Automatic synchronization with Firebase Cloud Firestore

🔔 Real-Time Alerts

Notifies garbage collectors when a bin reaches the threshold
Push notifications & in-app alerts

🗺️ Smart Navigation

Google Maps integration
Shows shortest route to the dustbin when a collector taps “Accept”

💻 Frontend (React + Vite + ShadCN)

Clean, responsive UI
Active alert panel
Firebase integration
Real-time status updates
☁️ Backend (Firebase Functions)
Handles sensor data updates
Trigger notifications
API for bin updates & collector status

🧱 Tech Stack

Frontend
React
Vite
TypeScript
ShadCN UI
TailwindCSS
Firebase Web SDK
Backend
Firebase Cloud Functions (Node.js)
Firestore Database
Firebase Authentication
Firebase Cloud Messaging
Hardware (IoT Prototype)
Ultrasonic sensor (HC-SR04)
ESP8266 / ESP32
Wi-Fi module
Power module

__________________________________________________________________________________________________________________________________________________________________________________________________________________

📂 Project Structure
smart-waste-navigator/
│
├── public/
│   └── firebase-messaging-sw.js
│
├── src/
│   ├── main.tsx
│   ├── app.tsx
│   ├── firebase.ts
│   ├── notifications.ts
│   ├── binListener.ts
│   └── components/
│
├── functions/
│   ├── index.js
│   ├── package.json
│   └── package-lock.json
│
├── .firebaserc
├── firebase.json
├── package.json
└── README.md

__________________________________________________________________________________________________________________________________________________________________________________________________________________

🚀 How It Works

1️⃣ Data Collection

IoT sensor measures dustbin fill-level and sends data to Firebase.

2️⃣ Cloud Processing

Cloud Functions read the data → checks fill percentage → triggers notifications.

3️⃣ Garbage Collector App

Collector receives real-time alert → clicks “Accept” → app opens Google Maps with the shortest path.

4️⃣ Completion Update

Collector marks bin as emptied → system resets fill-level.

__________________________________________________________________________________________________________________________________________________________________________________________________________________

⚙️ Getting Started (Local Setup)

1. Clone the repo
git clone https://github.com/Samarth229/smart-waste-navigator.git
cd smart-waste-navigator

2. Install dependencies
npm install

3. Start the frontend
npm run dev

4. Deploy Cloud Functions (optional)
firebase deploy --only functions

5. 🔌 IoT Device Data Format

Your ESP device should send JSON like:

{
  "binId": "bin_01",
  "fillLevel": 85
}

__________________________________________________________________________________________________________________________________________________________________________________________________________________

🎯 Future Enhancements

Live truck tracking
Route optimization for multiple bins
AI-based waste prediction
Admin dashboard with analytics
Support for multiple collection fleets

__________________________________________________________________________________________________________________________________________________________________________________________________________________

🤝 Contributing

Pull requests are welcome!
Open issues for bugs, suggestions, or improvements.

📜 License

MIT License © 2025 Samarth Kadam

🧑‍💻 Author

Samarth Kadam
3rd Year CSE – VIT Bhopal
GitHub: Samarth229
