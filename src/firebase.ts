import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyCxv41Ap9n5iayrvcacJlRkwb3V0m_w3Tc",
  authDomain: "waste-management-a230b.firebaseapp.com",
  databaseURL: "https://waste-management-a230b-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "waste-management-a230b",
  storageBucket: "waste-management-a230b.firebasestorage.app",
  messagingSenderId: "319527260898",
  appId: "1:319527260898:web:7f8cbb2a0a4d2de983c4bb",
  measurementId: "G-9K7YHH6BDQ"
};

const app = initializeApp(firebaseConfig);

export const db = getDatabase(app);
export const messaging = getMessaging(app);


