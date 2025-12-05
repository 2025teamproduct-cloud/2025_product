// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDkUT53yC6pa_JlJZHD_miKxOkHU70loxs",
  authDomain: "teamproduct-29cf5.firebaseapp.com",
  projectId: "teamproduct-29cf5",
  storageBucket: "teamproduct-29cf5.appspot.com",
  messagingSenderId: "379391689704",
  appId: "1:379391689704:web:5f242219c4b25e41ff5a5d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// 認証機能を使えるようにエクスポート
export const auth = getAuth(app);

export const db = getFirestore(app);