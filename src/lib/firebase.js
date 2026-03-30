// src/lib/firebase.js
// Lazy initialization to reduce initial bundle size

const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID,
    measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

let authInstance = null;
let providerInstance = null;

// Lazy initialize Firebase only when auth is needed
export async function getAuthInstance() {
    if (authInstance) return authInstance;

    // Dynamic import reduces initial bundle size
    const { initializeApp } = await import("firebase/app");
    const { getAuth } = await import("firebase/auth");

    const app = initializeApp(firebaseConfig);
    authInstance = getAuth(app);
    return authInstance;
}

export async function getGoogleProvider() {
    if (providerInstance) return providerInstance;

    const { GoogleAuthProvider } = await import("firebase/auth");
    providerInstance = new GoogleAuthProvider();
    return providerInstance;
}
