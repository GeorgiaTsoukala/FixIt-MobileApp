import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCnBc9JaMmsgKLYPSmOZCfikEQV2R-vPsw",
  authDomain: "fixit-1dbe2.firebaseapp.com",
  projectId: "fixit-1dbe2",
  storageBucket: "fixit-1dbe2.appspot.com",
  messagingSenderId: "235437558685",
  appId: "1:235437558685:web:5966e6e78b803e0c47fd74",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export authentication, database, storage
export const auth = getAuth(app);
export const datab = getFirestore(app);
export const storage = getStorage(app);
