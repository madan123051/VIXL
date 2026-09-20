const FIREBASE_PROJECT_ID = "vixl-1c88f";
export const DEFAULT_FIREBASE_DATABASE_URL =
  "https://vixl-1c88f-default-rtdb.firebaseio.com";

function readPublicEnv(key: keyof ImportMetaEnv): string {
  const value = import.meta.env[key];
  return typeof value === "string" ? value.trim() : "";
}

export function normalizeFirebaseDatabaseUrl(value: unknown): string {
  if (typeof value !== "string" || !value.trim()) {
    return DEFAULT_FIREBASE_DATABASE_URL;
  }

  try {
    const url = new URL(value.trim());
    if (
      url.protocol !== "https:" ||
      url.hostname !== `${FIREBASE_PROJECT_ID}-default-rtdb.firebaseio.com`
    ) {
      return DEFAULT_FIREBASE_DATABASE_URL;
    }
    return url.origin;
  } catch {
    return DEFAULT_FIREBASE_DATABASE_URL;
  }
}

export function getFirebaseDatabaseUrl(): string {
  return normalizeFirebaseDatabaseUrl(readPublicEnv("VITE_FIREBASE_DATABASE_URL"));
}
