// firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCRk9AQTmV8HXy2FQsd16TsU9Vl5tH_qrY",
  authDomain: "cedarstechprices.firebaseapp.com",
  projectId: "cedarstechprices",
  storageBucket: "cedarstechprices.firebasestorage.app",
  messagingSenderId: "943038497243",
  appId: "1:943038497243:web:b52fffe95a3d11b6dde7fe",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app); 
