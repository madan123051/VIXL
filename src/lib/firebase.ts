import { getApp, getApps, initializeApp, type FirebaseApp, type FirebaseOptions } from "firebase/app";
import type { Analytics } from "firebase/analytics";
import type { Database } from "firebase/database";

function readEnv(key: keyof ImportMetaEnv, fallback: string): string {
  const value = import.meta.env[key];
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

/** Public web config. Vercel `VITE_FIREBASE_*` wins; fallback keeps the Grok preview live. */
export const firebaseOptions: FirebaseOptions = {
  apiKey: readEnv("VITE_FIREBASE_API_KEY", "AIzaSyA17I52wyRf42If0BicyfnkHy8kHnSEFCY"),
  authDomain: readEnv("VITE_FIREBASE_AUTH_DOMAIN", "vixl-1c88f.firebaseapp.com"),
  databaseURL: readEnv(
    "VITE_FIREBASE_DATABASE_URL",
    "https://vixl-1c88f-default-rtdb.firebaseio.com",
  ),
  projectId: readEnv("VITE_FIREBASE_PROJECT_ID", "vixl-1c88f"),
  storageBucket: readEnv("VITE_FIREBASE_STORAGE_BUCKET", "vixl-1c88f.firebasestorage.app"),
  messagingSenderId: readEnv("VITE_FIREBASE_MESSAGING_SENDER_ID", "1019016832673"),
  appId: readEnv("VITE_FIREBASE_APP_ID", "1:1019016832673:web:d59a739d94a55bdaa0b2e0"),
  measurementId: readEnv("VITE_FIREBASE_MEASUREMENT_ID", "G-CN412HGZ28"),
};

export function getFirebaseApp(): FirebaseApp | null {
  if (!firebaseOptions.apiKey || !firebaseOptions.projectId || !firebaseOptions.appId) {
    return null;
  }
  return getApps().length ? getApp() : initializeApp(firebaseOptions);
}

let analyticsPromise: Promise<Analytics | null> | null = null;
let databasePromise: Promise<Database | null> | null = null;

export function getFirebaseAnalytics(): Promise<Analytics | null> {
  if (typeof window === "undefined") return Promise.resolve(null);
  analyticsPromise ??= (async () => {
    const app = getFirebaseApp();
    if (!app) return null;
    const { getAnalytics, isSupported } = await import("firebase/analytics");
    if (!(await isSupported())) return null;
    return getAnalytics(app);
  })().catch(() => null);
  return analyticsPromise;
}

export function getFirebaseDatabase(): Promise<Database | null> {
  if (typeof window === "undefined") return Promise.resolve(null);
  databasePromise ??= (async () => {
    const app = getFirebaseApp();
    if (!app || !firebaseOptions.databaseURL) return null;
    const { getDatabase } = await import("firebase/database");
    return getDatabase(app);
  })().catch(() => null);
  return databasePromise;
}

export async function logPageView(path: string): Promise<void> {
  const analytics = await getFirebaseAnalytics();
  if (!analytics) return;
  const { logEvent } = await import("firebase/analytics");
  logEvent(analytics, "page_view", {
    page_path: path,
    page_title: document.title,
  });
}

export async function logMarkFrame(workId: string, marked: boolean): Promise<void> {
  const analytics = await getFirebaseAnalytics();
  if (!analytics) return;
  const { logEvent } = await import("firebase/analytics");
  logEvent(analytics, marked ? "mark_frame" : "unmark_frame", { item_id: workId });
}
