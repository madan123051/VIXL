#!/usr/bin/env node
/**
 * Write src/lib/catalog-data.json to RTDB /catalog.
 * Needs Realtime Database rules that allow auth writes (see database.rules.json).
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

const API_KEY = process.env.VITE_FIREBASE_API_KEY ?? "AIzaSyA17I52wyRf42If0BicyfnkHy8kHnSEFCY";
const DATABASE_URL =
  process.env.VITE_FIREBASE_DATABASE_URL ?? "https://vixl-1c88f-default-rtdb.firebaseio.com";
const ROOT = join(import.meta.dirname, "..");

const catalog = JSON.parse(readFileSync(join(ROOT, "src/lib/catalog-data.json"), "utf8"));
catalog.seededAt = new Date().toISOString();

const authRes = await fetch(
  `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}`,
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ returnSecureToken: true }),
  },
);
const auth = await authRes.json();
if (!auth.idToken) {
  console.error("anonymous auth failed", auth);
  process.exit(1);
}

const url = `${DATABASE_URL}/catalog.json?auth=${encodeURIComponent(auth.idToken)}`;
const res = await fetch(url, {
  method: "PUT",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(catalog),
});
const text = await res.text();
if (!res.ok) {
  console.error(`catalog PUT ${res.status}: ${text}`);
  console.error("Publish database.rules.json in Firebase Console, then rerun.");
  process.exit(1);
}
const written = JSON.parse(text);
console.log(`catalog wrote ${written.order?.length ?? catalog.order.length} works`);
