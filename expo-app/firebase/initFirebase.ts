import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { firebaseWebConfig } from './firebaseConfig';

const app = initializeApp(firebaseWebConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
