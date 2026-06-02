// Firebase configuration sourced exclusively from VITE_ environment variables.
// No credentials are hard-coded; provide values via a .env file (see
// .env.example). At build time Vite replaces import.meta.env.VITE_* with the
// configured values.

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: import.meta.env.VITE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_ID,
};

// True only when the essential Firebase values are present. When false the app
// falls back to localStorage instead of initializing Firebase.
export function hasFirebaseConfig() {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);
}

export default firebaseConfig;
