import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { clientConfig } from "../config/client-config";

const firebaseClient = initializeApp({
  apiKey: clientConfig.apiKey,
  authDomain: clientConfig.authDomain,
  projectId: clientConfig.projectId,
  storageBucket: clientConfig.storageBucket,
  messagingSenderId: clientConfig.messagingSenderId,
  appId: clientConfig.appId,
});

export const auth = getAuth(firebaseClient);
export const firestore = getFirestore(firebaseClient);
