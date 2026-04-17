// firebase/config.js
// 🔥 Replace these values with your own Firebase project credentials
// Go to: https://console.firebase.google.com → Your Project → Project Settings → Web App

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCS7oQfS3o_weJjC7qWAPXCFOt3pxQB2Pc",
  authDomain: "habit-bird.firebaseapp.com",
  projectId: "habit-bird",
  storageBucket: "habit-bird.firebasestorage.app",
  messagingSenderId: "115701942875",
  appId: "1:115701942875:web:4a2763b16a219776ac4d7e"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
