import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeFirestore, getDocFromServer, doc, Firestore } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const db: Firestore = initializeFirestore(app, {}, firebaseConfig.firestoreDatabaseId);

// Validate connection per Firebase skill requirements
export async function validateFirebaseConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('✅ Firebase Firestore connected successfully to database:', firebaseConfig.firestoreDatabaseId);
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline or initializing.');
    } else {
      console.log('Firebase initialized:', firebaseConfig.projectId);
    }
    return false;
  }
}

validateFirebaseConnection();
