import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCJ90o3ZUZhLneg6HkroWO0fZN4npkaoKM",
  authDomain: "capstone-catalog.firebaseapp.com",
  projectId: "capstone-catalog",
  storageBucket: "capstone-catalog.firebasestorage.app",
  messagingSenderId: "310481655782",
  appId: "1:310481655782:web:b56bec6661cfa2afe6e827",
  measurementId: "G-ZDHT69XRE4",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
