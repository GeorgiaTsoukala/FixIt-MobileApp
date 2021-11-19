import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAMPqPUN62Jl34uw8r8XNMSm6N-NR8t1Pw",
  authDomain: "sharetheride-3c62c.firebaseapp.com",
  projectId: "sharetheride-3c62c",
  storageBucket: "sharetheride-3c62c.appspot.com",
  messagingSenderId: "212067661188",
  appId: "1:212067661188:web:29de709ba6ac788a5c99d1",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export authentication, database, storage
export const auth = getAuth(app);
export const datab = getFirestore(app);
export const storage = getStorage(app);
