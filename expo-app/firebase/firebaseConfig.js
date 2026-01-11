// Firebase config helpers.
// NOTE: The service account JSON (server/admin credentials) is present at repository root
// as `medcalc-71fb2-firebase-adminsdk-fbsvc-14a7ed45c0.json` and can be used on server-side.
// For client usage in the Expo app you need the Firebase Web config (apiKey, authDomain, etc.).
// Put the web config here (or use environment variables) before running the app.

// Example placeholder - replace with your project's web config
export const firebaseWebConfig = {
  apiKey: "AIzaSyAGUW3la2giOJn_sG2Nz4HRAfqP1QuY0KA",
  authDomain: "medcalc-71fb2.firebaseapp.com",
  projectId: "medcalc-71fb2",
  storageBucket: "medcalc-71fb2.firebasestorage.app",
  messagingSenderId: "889371502520",
  appId: "1:889371502520:web:9d5d0e6e3f04d17054914d",
  measurementId: "G-L5RJ3MXR9D"
};

// Server-side admin credential path (do NOT embed in client builds)
export const adminServiceAccountPath = '../../medcalc-71fb2-firebase-adminsdk-fbsvc-14a7ed45c0.json';
