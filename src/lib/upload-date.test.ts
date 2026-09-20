import assert from "node:assert/strict";
import test from "node:test";
import { workUploadDate } from "./upload-date.ts";

test("keeps a saved upload timestamp and emits an explicit UTC timezone", () => {
  assert.equal(
    workUploadDate({ uploadDate: "2026-09-21T10:30:00+09:00", year: 2026 }),
    "2026-09-21T01:30:00.000Z",
  );
});

test("uses a timezone-safe legacy fallback for date-only or missing upload dates", () => {
  assert.equal(workUploadDate({ uploadDate: "2026-09-21", year: 2026 }), "2026-01-01T00:00:00Z");
  assert.equal(workUploadDate({ year: 2025 }), "2025-01-01T00:00:00Z");
});
