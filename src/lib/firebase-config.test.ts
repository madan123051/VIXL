import assert from "node:assert/strict";
import test from "node:test";
import {
  DEFAULT_FIREBASE_DATABASE_URL,
  normalizeFirebaseDatabaseUrl,
} from "./firebase-config.ts";

test("normalizes the configured VIXL Realtime Database URL", () => {
  assert.equal(
    normalizeFirebaseDatabaseUrl("https://vixl-1c88f-default-rtdb.firebaseio.com/"),
    DEFAULT_FIREBASE_DATABASE_URL,
  );
});

test("rejects invalid or cross-project Realtime Database URLs", () => {
  assert.equal(
    normalizeFirebaseDatabaseUrl("https://another-project-default-rtdb.firebaseio.com"),
    DEFAULT_FIREBASE_DATABASE_URL,
  );
  assert.equal(normalizeFirebaseDatabaseUrl("not a URL"), DEFAULT_FIREBASE_DATABASE_URL);
});
