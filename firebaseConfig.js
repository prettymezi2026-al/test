/**
 * Firebase Config & Auth / Firestore Integration for 「10 만들기 탐험대」
 * Firebase Web SDK v10 (Modular via CDN ES imports)
 * Secure Environment Variable Loader
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInAnonymously, 
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  limit, 
  doc, 
  setDoc,
  getDoc,
  serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// 환경변수 안심 로더
const env = (window.__ENV__) || {};

const firebaseConfig = {
  apiKey: env.FIREBASE_API_KEY || "AIzaSyDemoKey_ReplaceWithYourFirebaseApiKey",
  authDomain: env.FIREBASE_AUTH_DOMAIN || "test-10-making.firebaseapp.com",
  projectId: env.FIREBASE_PROJECT_ID || "test-10-making",
  storageBucket: env.FIREBASE_STORAGE_BUCKET || "test-10-making.appspot.com",
  messagingSenderId: env.FIREBASE_MESSAGING_SENDER_ID || "1234567890",
  appId: env.FIREBASE_APP_ID || "1:1234567890:web:abcdef123456"
};

// Initialize Firebase
let app, auth, db;
let isFirebaseConfigured = false;

try {
  if (env.FIREBASE_API_KEY && env.FIREBASE_API_KEY !== "YOUR_FIREBASE_API_KEY") {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    isFirebaseConfigured = true;
  } else {
    console.log("Firebase config placeholder active. Running in secure LocalStorage mode.");
  }
} catch (e) {
  console.warn("Firebase initialization warning:", e);
}

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();

export {
  auth,
  db,
  isFirebaseConfigured,
  signInWithPopup,
  googleProvider,
  signInAnonymously,
  onAuthStateChanged,
  signOut,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
  doc,
  setDoc,
  getDoc,
  serverTimestamp
};
