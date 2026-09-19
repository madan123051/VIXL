import { createServerFn } from "@tanstack/react-start";
import type { MediaKind } from "@/lib/media";

export type TagInput = {
  workId: string;
  title: string;
  kind: MediaKind;
  location: string;
  year: number;
  description: string;
};

export type AiExif = {
  camera: string;
  lens: string;
  aperture: string;
  shutter: string;
  iso: string;
  focalLength: string;
};

export type AiTag = {
  cinematicTitle: string;
  seoDescription: string;
  story: string;
  exif: AiExif;
};

type TagResult =
  | { ok: true; tag: AiTag }
  | { ok: false; error: string };

function asRecord(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === "object"
    ? (value as Record<string, unknown>)
    : {};
}

function asString(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function parseTag(raw: string, input: TagInput): AiTag | null {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try {
    const json: unknown = JSON.parse(raw.slice(start, end + 1));
    const rec = asRecord(json);
    const exif = asRecord(rec.exif);
    const cinematicTitle = asString(rec.cinematicTitle, input.title);
    const seoDescription = asString(rec.seoDescription, input.description);
    const story = asString(rec.story, input.description);
    if (!cinematicTitle || !seoDescription || !story) return null;
    return {
      cinematicTitle,
      seoDescription,
      story,
      exif: {
        camera: asString(exif.camera, "Unknown body"),
        lens: asString(exif.lens, "Unknown lens"),
        aperture: asString(exif.aperture, "—"),
        shutter: asString(exif.shutter, "—"),
        iso: asString(exif.iso, "—"),
        focalLength: asString(exif.focalLength, "—"),
      },
    };
  } catch {
    return null;
  }
}

export const tagWork = createServerFn({ method: "POST" })
  .validator((input: TagInput) => input)
  .handler(async ({ data }): Promise<TagResult> => {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) {
      return { ok: false, error: "AI is not available in this environment." };
    }

    const system = [
      "You are the in-house picture editor at VIXL, a high-end photography studio.",
      "You write like a printed monograph: spare, precise, present tense.",
      "Never use hashtags, emoji, or marketing superlatives (stunning, breathtaking, iconic).",
      "Reply with JSON only.",
    ].join(" ");

    const user = `Read this work and return JSON with exactly these keys:
{
  "cinematicTitle": "2 to 5 words, no quotes, no year",
  "seoDescription": "one sentence, max 160 characters, no hashtags",
  "story": "2 or 3 sentences, editorial, present tense",
  "exif": {
    "camera": "plausible professional body",
    "lens": "plausible lens",
    "aperture": "e.g. f/1.4",
    "shutter": "e.g. 1/125s",
    "iso": "e.g. 200",
    "focalLength": "e.g. 50mm"
  }
}

Work:
title: ${data.title}
kind: ${data.kind}
location: ${data.location}
year: ${data.year}
notes: ${data.description}

Match EXIF to the kind: drone aerials, 35mm stills, large format, or cinema cameras for video.`;

    try {
      const res = await fetch("https://api.x.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        signal: AbortSignal.timeout(25000),
        body: JSON.stringify({
          model: "grok-4.5",
          temperature: 0.7,
          max_tokens: 900,
          reasoning_effort: "low",
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: system },
            { role: "user", content: user },
          ],
        }),
      });

      if (!res.ok) {
        return {
          ok: false,
          error: `The lab could not read this frame (${res.status}).`,
        };
      }

      const body = (await res.json()) as {
        choices?: { message?: { content?: string } }[];
      };
      const text = body.choices?.[0]?.message?.content ?? "";
      const tag = parseTag(text, data);
      if (!tag) {
        return { ok: false, error: "The lab returned an unreadable note." };
      }
      return { ok: true, tag };
    } catch (error) {
      const aborted =
        error instanceof Error &&
        (error.name === "TimeoutError" || error.name === "AbortError");
      return {
        ok: false,
        error: aborted
          ? "The lab took too long with this frame."
          : "The lab could not be reached.",
      };
    }
  });
