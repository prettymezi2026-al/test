/**
 * Firebase Config & Auth / Firestore Integration for 「10 만들기 탐험대」
 * Firebase Web SDK v10 (Modular via CDN ES imports)
 * Connected to Firebase Project: literacy-85dee
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

// 환경변수 안전 로더 (Vercel 배포 시 환경변수가 우선 적용되며, 없을 경우 연동 키로 기본 작동)
const env = (window.__ENV__) || {};

const firebaseConfig = {
  apiKey: env.FIREBASE_API_KEY || "AIzaSyC94qvaSPPrWe9pTXvU2gbsLsBXYzBvAOM",
  authDomain: env.FIREBASE_AUTH_DOMAIN || "literacy-85dee.firebaseapp.com",
  projectId: env.FIREBASE_PROJECT_ID || "literacy-85dee",
  storageBucket: env.FIREBASE_STORAGE_BUCKET || "literacy-85dee.firebasestorage.app",
  messagingSenderId: env.FIREBASE_MESSAGING_SENDER_ID || "846434091220",
  appId: env.FIREBASE_APP_ID || "1:846434091220:web:03819cb25ae89836017b41"
};

// Initialize Firebase
let app, auth, db;
let isFirebaseConfigured = false;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  isFirebaseConfigured = true;
  console.log("Firebase 'literacy-85dee' initialized successfully!");
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
