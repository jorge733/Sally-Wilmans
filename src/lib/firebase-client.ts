"use client";
import { getApps, initializeApp } from "firebase/app";
import { connectAuthEmulator, getAuth, inMemoryPersistence, setPersistence } from "firebase/auth";

const app =
  getApps()[0] ??
  initializeApp({
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  });

export const auth = getAuth(app);
// La sesión real vive en una cookie del servidor; el navegador no guarda nada.
setPersistence(auth, inMemoryPersistence);

if (process.env.NEXT_PUBLIC_USE_EMULATORS === "1" && !(auth as { emulatorConfig?: unknown }).emulatorConfig) {
  connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
}
