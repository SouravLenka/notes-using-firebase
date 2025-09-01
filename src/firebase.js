import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBmxMWwwIYDM4cTJiHSapMaHYFAOWinZAI",
  authDomain: "notes-93b17.firebaseapp.com",
  projectId: "notes-93b17",
  storageBucket: "notes-93b17.firebasestorage.app",
  messagingSenderId: "502400754721",
  appId: "1:502400754721:web:5d92797c008b45db5daf60",
  measurementId: "G-0ELEND6Z9S"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
