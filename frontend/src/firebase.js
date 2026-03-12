// Firebase Configuration
// Initialize Firebase App, Auth, Firestore, Storage, and Functions

import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

// Firebase configuration from environment variables
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Firestore Database
export const db = getFirestore(app);

// Initialize Firebase Storage
export const storage = getStorage(app);

// Initialize Firebase Functions
export const functions = getFunctions(app, 'us-central1');

// ============ EMULATOR SETUP FOR DEVELOPMENT (Optional) ============
// Uncomment these lines to use Firebase Emulator Suite locally
// Only runs in development mode

// const connectToEmulators = () => {
//   if (process.env.NODE_ENV === 'development' && !auth.emulatorConfig) {
//     try {
//       connectAuthEmulator(auth, 'http://localhost:9099', {
//         disableWarnings: true,
//       });
//       connectFirestoreEmulator(db, 'localhost', 8080);
//       connectStorageEmulator(storage, 'localhost', 9199);
//       connectFunctionsEmulator(functions, 'localhost', 5001);
//       console.log('Firebase Emulators connected successfully');
//     } catch (error) {
//       console.warn('Emulator already initialized or error:', error.message);
//     }
//   }
// };

// connectToEmulators();

export default app;
