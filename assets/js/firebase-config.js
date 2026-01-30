// Firebase Configuration
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyAMG0udpRspwWhjYnelXFRujAKTfKHsU0g",
  authDomain: "r-v-online-store.firebaseapp.com",
  projectId: "r-v-online-store",
  storageBucket: "r-v-online-store.firebasestorage.app",
  messagingSenderId: "949459989826",
  appId: "1:949459989826:web:c7cf8a1e67ea1671af84db",
  measurementId: "G-J8QPS6QGHX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
