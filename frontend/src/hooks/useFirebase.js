// Firebase initialization helper extracted from the former monolithic
// src/App.jsx. Keeps the SDK wiring (app + auth + firestore) in one place so the
// root component only deals with app state, not Firebase bootstrapping.
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, setLogLevel } from 'firebase/firestore';

// Initialize the Firebase app for the given config and return the auth and
// firestore service handles. Pass { debug: true } to raise the Firestore log
// level (useful in development).
export function initFirebase(firebaseConfig, { debug = false } = {}) {
  if (debug) setLogLevel('debug');
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);
  return { app, auth, db };
}

export default initFirebase;
