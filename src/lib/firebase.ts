import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, OAuthProvider, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";

let _app: FirebaseApp | null = null;
let _auth: Auth | null = null;
let _db: Firestore | null = null;
let _storage: FirebaseStorage | null = null;
let _googleProvider: GoogleAuthProvider | null = null;
let _appleProvider: OAuthProvider | null = null;

/**
 * Checks if running in the browser and Firebase API key environment variable is configured.
 * Always returns false on the server to prevent initialization during SSR/build time.
 */
export const isFirebaseConfigured = (): boolean => {
  if (typeof window === "undefined") return false;
  const key = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  return !!key && key !== "PASTE_YOUR_FIREBASE_API_KEY" && !key.startsWith("PASTE_");
};

/**
 * Lazily initialize and return the FirebaseApp instance only in browser context.
 * Returns null during server-side rendering/prerendering.
 */
export function getFirebaseApp(): FirebaseApp | null {
  if (typeof window === "undefined") return null;
  if (!_app) {
    if (!isFirebaseConfigured()) return null;
    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "auth.smartcaremobile.in",
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    };
    _app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  }
  return _app;
}

/**
 * Lazily initialize and return the FirebaseAuth instance only in browser context.
 */
export function getFirebaseAuth(): Auth | null {
  if (typeof window === "undefined") return null;
  if (!_auth) {
    const app = getFirebaseApp();
    if (!app) return null;
    _auth = getAuth(app);
  }
  return _auth;
}

/**
 * Lazily initialize and return the Firestore instance only in browser context.
 */
export function getFirebaseDb(): Firestore | null {
  if (typeof window === "undefined") return null;
  if (!_db) {
    const app = getFirebaseApp();
    if (!app) return null;
    _db = getFirestore(app);
  }
  return _db;
}

/**
 * Lazily initialize and return the FirebaseStorage instance only in browser context.
 */
export function getFirebaseStorage(): FirebaseStorage | null {
  if (typeof window === "undefined") return null;
  if (!_storage) {
    const app = getFirebaseApp();
    if (!app) return null;
    _storage = getStorage(app);
  }
  return _storage;
}

// Client-only Transparent Proxies for backward compatibility with existing imports:
// import { auth, db, storage, googleProvider, appleProvider } from "@/lib/firebase";

export const auth = new Proxy({} as Auth, {
  get(_, prop) {
    const instance = getFirebaseAuth();
    if (!instance) return undefined;
    const val = Reflect.get(instance, prop, instance);
    return typeof val === "function" ? val.bind(instance) : val;
  },
});

export const db = new Proxy({} as Firestore, {
  get(_, prop) {
    const instance = getFirebaseDb();
    if (!instance) return undefined;
    const val = Reflect.get(instance, prop, instance);
    return typeof val === "function" ? val.bind(instance) : val;
  },
});

export const storage = new Proxy({} as FirebaseStorage, {
  get(_, prop) {
    const instance = getFirebaseStorage();
    if (!instance) return undefined;
    const val = Reflect.get(instance, prop, instance);
    return typeof val === "function" ? val.bind(instance) : val;
  },
});

export const googleProvider = new Proxy({} as GoogleAuthProvider, {
  get(_, prop) {
    if (typeof window === "undefined") return undefined;
    if (!_googleProvider) {
      _googleProvider = new GoogleAuthProvider();
    }
    const val = Reflect.get(_googleProvider, prop, _googleProvider);
    return typeof val === "function" ? val.bind(_googleProvider) : val;
  },
});

export const appleProvider = new Proxy({} as OAuthProvider, {
  get(_, prop) {
    if (typeof window === "undefined") return undefined;
    if (!_appleProvider) {
      _appleProvider = new OAuthProvider("apple.com");
    }
    const val = Reflect.get(_appleProvider, prop, _appleProvider);
    return typeof val === "function" ? val.bind(_appleProvider) : val;
  },
});
