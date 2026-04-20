import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCOXFBJwHTVpvzeM2MhzTyHkdnXNLtCX0I",
  authDomain: "dhombe-travel.firebaseapp.com",
  projectId: "dhombe-travel",
  storageBucket: "dhombe-travel.firebasestorage.app",
  messagingSenderId: "301253621820",
  appId: "1:301253621820:web:ce1e69398f178b1ebe2b39",
  measurementId: "G-SRRJ4SKS10",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
