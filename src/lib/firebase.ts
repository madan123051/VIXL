import { getApp, getApps, initializeApp, type FirebaseApp, type FirebaseOptions } from "firebase/app";
import type { Analytics } from "firebase/analytics";
import type { User } from "firebase/auth";
import type { Database } from "firebase/database";
import type { FirebaseStorage } from "firebase/storage";
import { ADMIN_EMAIL, isAdminEmail } from "@/lib/admin";
import { CATALOG_SEED_PAYLOAD, catalogToPayload, type Catalog } from "@/lib/media";

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
let storagePromise: Promise<FirebaseStorage | null> | null = null;
let authPromise: Promise<User | null> | null = null;
let seeded = false;

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

/** Invisible anonymous session so RTDB rules `auth != null` can read/write. */
export function ensureFirebaseAuth(): Promise<User | null> {
  if (typeof window === "undefined") return Promise.resolve(null);
  authPromise ??= (async () => {
    const app = getFirebaseApp();
    if (!app) return null;
    const { getAuth, onAuthStateChanged, signInAnonymously } = await import("firebase/auth");
    const auth = getAuth(app);
    if (auth.currentUser) return auth.currentUser;
    const existing = await new Promise<User | null>((resolve) => {
      const stop = onAuthStateChanged(auth, (user) => {
        stop();
        resolve(user);
      });
    });
    if (existing) return existing;
    const cred = await signInAnonymously(auth);
    return cred.user;
  })().catch(() => null);
  return authPromise;
}

export async function seedCatalogIfEmpty(): Promise<boolean> {
  if (typeof window === "undefined" || seeded) return false;
  const db = await getFirebaseDatabase();
  if (!db) return false;
  try {
    const { get, ref, set } = await import("firebase/database");
    const snap = await get(ref(db, "catalog"));
    if (snap.exists() && snap.val()) {
      seeded = true;
      return false;
    }
    await set(ref(db, "catalog"), {
      ...CATALOG_SEED_PAYLOAD,
      seededAt: new Date().toISOString(),
    });
    seeded = true;
    return true;
  } catch {
    return false;
  }
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

export function getFirebaseStorage(): Promise<FirebaseStorage | null> {
  if (typeof window === "undefined") return Promise.resolve(null);
  storagePromise ??= (async () => {
    const app = getFirebaseApp();
    if (!app) return null;
    const { getStorage } = await import("firebase/storage");
    return getStorage(app);
  })().catch(() => null);
  return storagePromise;
}

export async function signInAdmin(email: string, password: string): Promise<User> {
  const app = getFirebaseApp();
  if (!app) throw new Error("Firebase is not configured.");
  const { getAuth, signInWithEmailAndPassword } = await import("firebase/auth");
  const auth = getAuth(app);
  const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
  if (!isAdminEmail(cred.user.email)) {
    await auth.signOut();
    authPromise = null;
    throw new Error("This account is not the studio desk.");
  }
  authPromise = Promise.resolve(cred.user);
  return cred.user;
}

export async function signOutAdmin(): Promise<void> {
  const app = getFirebaseApp();
  if (!app) return;
  const { getAuth } = await import("firebase/auth");
  await getAuth(app).signOut();
  authPromise = null;
  await ensureFirebaseAuth();
}

export async function saveCatalog(catalog: Catalog): Promise<void> {
  const db = await getFirebaseDatabase();
  if (!db) throw new Error("Database is not available.");
  const { ref, set } = await import("firebase/database");
  await set(ref(db, "catalog"), catalogToPayload(catalog));
}

export async function uploadGalleryFile(file: File, folder: string): Promise<string> {
  const storage = await getFirebaseStorage();
  if (!storage) throw new Error("Storage is not available. Enable it in Firebase Console.");
  const stamped = file.type.startsWith("image/")
    ? await (await import("@/lib/watermark")).stampStill(file)
    : file;
  const safe = stamped.name.replace(/[^\w.\-]+/g, "-").toLowerCase();
  const path = `${folder}/${Date.now()}-${safe}`;
  const { ref, uploadBytes, getDownloadURL } = await import("firebase/storage");
  const fileRef = ref(storage, path);
  await uploadBytes(fileRef, stamped, { contentType: stamped.type || undefined });
  return getDownloadURL(fileRef);
}

export async function logMarkFrame(workId: string, marked: boolean): Promise<void> {
  const analytics = await getFirebaseAnalytics();
  if (!analytics) return;
  const { logEvent } = await import("firebase/analytics");
  logEvent(analytics, marked ? "mark_frame" : "unmark_frame", { item_id: workId });
}

export { ADMIN_EMAIL, isAdminEmail };
