// ============================================================
// 🔐 FIREBASE CONFIG — REPLACE WITH YOUR OWN PROJECT'S KEYS
// ============================================================
// This file only holds configuration + Firebase init. It doesn't
// contain any secrets that need hiding — Firebase web config is
// meant to be public (security is enforced by Firebase itself,
// via "Authorized domains" + provider settings in the console).
//
// HOW TO GET YOUR OWN VALUES (one-time setup, ~5 minutes):
//   1. Go to https://console.firebase.google.com → "Add project"
//      (free "Spark" plan is enough for login-only, no billing needed).
//   2. Inside the project: Build → Authentication → Get Started
//      → Sign-in method tab → enable "Google" → Save.
//   3. Authentication → Settings → Authorized domains → Add domain
//      → add your GitHub Pages domain, e.g. yourusername.github.io
//      (localhost is already whitelisted by default for local testing).
//   4. Project Overview (gear icon) → Project settings → scroll to
//      "Your apps" → click the </> (Web) icon → register the app
//      (nickname can be anything, no need for Firebase Hosting).
//   5. Firebase will show a firebaseConfig object — copy those
//      exact values into the object below.
// ============================================================

const firebaseConfig = {
    apiKey: "AIzaSyB4zlNcah5pYFxh41k9L76FjA7VVZjmiZ8",
    authDomain: "login-187a7.firebaseapp.com",
    projectId: "login-187a7",
    storageBucket: "login-187a7.firebasestorage.app",
    messagingSenderId: "120981965875",
    appId: "1:120981965875:web:1adb9c7efa23061006a746"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
