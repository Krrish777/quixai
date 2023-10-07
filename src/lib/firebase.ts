// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAHRIcOJ-rQ2x6jsUQvT8OkjjycAwpBZtk",
  authDomain: "quixai-dev.firebaseapp.com",
  projectId: "quixai-dev",
  storageBucket: "quixai-dev.appspot.com",
  messagingSenderId: "981376006729",
  appId: "1:981376006729:web:43c390c14d2ba9467cdd98",
  measurementId: "G-T743R1JN9E"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
// export const analytics = getAnalytics(app);