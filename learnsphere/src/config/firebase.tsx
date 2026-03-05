// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDS5NqwjTMfzT5QUnLyf52iIGCH8E-Lw0g",
  authDomain: "quiz-maker-904c3.firebaseapp.com",
  projectId: "quiz-maker-904c3",
  storageBucket: "quiz-maker-904c3.firebasestorage.app",
  messagingSenderId: "175553018169",
  appId: "1:175553018169:web:1c1ca27377a4c496a250e8",
  measurementId: "G-9WSXFJFYSN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const Auth = getAuth(app);