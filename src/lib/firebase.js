// src/lib/firebase.js
// Lazy initialization to reduce initial bundle size

const firebaseConfig = {
    apiKey: "AIzaSyBXx3VQAuOwUUogSgEZvC-mw2Td8-v6yPI",
    authDomain: "kiddos-intellect.firebaseapp.com",
    projectId: "kiddos-intellect",
    storageBucket: "kiddos-intellect.firebasestorage.app",
    messagingSenderId: "328198449550",
    appId: "1:328198449550:web:d3b4749b949c8c0c219cdf",
    measurementId: "G-ST1KYT0N4K"
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

// Backward compatibility exports (but these will still eagerly load)
export let auth, googleProvider;

// Initialize synchronously if accessed directly (fallback)
(async () => {
    auth = await getAuthInstance();
    googleProvider = await getGoogleProvider();
})();
