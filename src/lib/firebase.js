// src/lib/firebase.js

import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Replace with YOUR Firebase config from console.firebase.google.com
const firebaseConfig = {
    apiKey: "AIzaSyBXx3VQAuOwUUogSgEZvC-mw2Td8-v6yPI",
    authDomain: "kiddos-intellect.firebaseapp.com",
    projectId: "kiddos-intellect",
    storageBucket: "kiddos-intellect.firebasestorage.app",
    messagingSenderId: "328198449550",
    appId: "1:328198449550:web:d3b4749b949c8c0c219cdf",
    measurementId: "G-ST1KYT0N4K"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
