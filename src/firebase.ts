import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyB6HNgnhYVHUCc7dYZDQkOJr764yt8GPlo",
  authDomain: "blt-dd.firebaseapp.com",
  projectId: "blt-dd",
  storageBucket: "blt-dd.firebasestorage.app",
  messagingSenderId: "140975076564",
  appId: "1:140975076564:web:4c06edae069d6f8ccf7741",
  measurementId: "G-0G9TEEJGDD"
};

export const isFirebaseConfigured = !!firebaseConfig.apiKey;
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);