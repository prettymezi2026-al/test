/**
 * Firebase Config & Auth / Firestore Integration for 「10 만들기 탐험대」
 * Firebase Web SDK v10 (Modular via CDN ES imports)
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

// Firebase 프로젝트 설정 (사용자 Firebase 설정으로 교체 가능하도록 기본 플레이스홀더 제공)
const firebaseConfig = {
  apiKey: "AIzaSyDemoKey_ReplaceWithYourFirebaseApiKey",
  authDomain: "test-10-making.firebaseapp.com",
  projectId: "test-10-making",
  storageBucket: "test-10-making.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef123456"
};

// Initialize Firebase
let app, auth, db;
let isFirebaseConfigured = false;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  isFirebaseConfigured = true;
} catch (e) {
  console.warn("Firebase config is using demo mode. LocalStorage fallback active until Firebase setup is complete.", e);
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
