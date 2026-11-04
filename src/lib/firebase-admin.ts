import "server-only";
import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

function crearApp(): App {
  const existente = getApps()[0];
  if (existente) return existente;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const storageBucket = process.env.FIREBASE_STORAGE_BUCKET;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (process.env.FIRESTORE_EMULATOR_HOST || !clientEmail || !privateKey) {
    // Emuladores locales (o credenciales por defecto de Google)
    return initializeApp({ projectId, storageBucket });
  }

  return initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
    projectId,
    storageBucket,
  });
}

const app = crearApp();

export const db = getFirestore(app);
export const adminAuth = getAuth(app);
export const bucket = () => getStorage(app).bucket();
