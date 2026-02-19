import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyD7-ToHbhtihbGtoGfhkgIr10VNw_LbPM8",
  authDomain: "khatma-3a339.firebaseapp.com",
  databaseURL: "https://khatma-3a339-default-rtdb.firebaseio.com",
  projectId: "khatma-3a339",
  storageBucket: "khatma-3a339.firebasestorage.app",
  messagingSenderId: "347213650069",
  appId: "1:347213650069:web:e49a16876d66392cb8639c",
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
