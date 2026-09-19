import { createServerFn } from "@tanstack/react-start";
import type { MediaKind } from "@/lib/media";

const STYLE = [
  "VIXL Visual Excellence Lab house style.",
  "Cinematic photography, black-field cinema still, natural film grain,",
  "restrained color, precise light, photoreal, editorial, no text,",
  "no watermark, no logo, no caption.",
].join(" ");

export type StudioMeta = {
  title: string;
  kind: MediaKind;
  location: string;
  year: number;
  camera: string;
  lens: string;
  description: string;
  tags: string[];
  width: number;
  height: number;
};

type Fail = { ok: false; error: string };
type ImageOk = { ok: true; mime: string; base64: string; width: number; height: number };
type VideoOk = ImageOk & { posterBase64: string; posterMime: string };

function asRecord(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function requireKey(): string | Fail {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) return { ok: false, error: "AI is not available. Set XAI_API_KEY on Vercel." };
  return apiKey;
}

const RATIOS = new Set([
  "1:1",
  "16:9",
  "9:16",
  "4:3",
  "3:4",
  "3:2",
  "2:3",
  "2:1",
  "1:2",
  "21:9",
]);

function aspectFor(kind: MediaKind): string {
  if (kind === "drone" || kind === "video") return "16:9";
  return "3:2";
}

function sizeFromRatio(ratio: string, kind: MediaKind): { width: number; height: number } {
  const map: Record<string, [number, number]> = {
    "16:9": [1920, 1080],
    "9:16": [1080, 1920],
    "3:2": [1800, 1200],
    "2:3": [1200, 1800],
    "4:3": [1600, 1200],
    "3:4": [1200, 1600],
    "1:1": [1400, 1400],
    "2:1": [1920, 960],
    "1:2": [960, 1920],
    "21:9": [2048, 878],
  };
  const pair = map[ratio];
  if (pair) return { width: pair[0], height: pair[1] };
  return kind === "drone" || kind === "video"
    ? { width: 1920, height: 1080 }
    : { width: 1800, height: 1200 };
}

type ShotPlan = { brief: string; aspect_ratio: string };

async function planShot(prompt: string, kind: MediaKind): Promise<ShotPlan> {
  const fallback: ShotPlan = {
    brief: `${prompt.trim()}. ${STYLE} Fill the entire frame. No letterbox, no borders, no empty margins.`,
    aspect_ratio: aspectFor(kind),
  };
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) return fallback;
  try {
    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      signal: AbortSignal.timeout(20000),
      body: JSON.stringify({
        model: "grok-4.5",
        temperature: 0.6,
        max_tokens: 500,
        reasoning_effort: "low",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "You are director of photography at VIXL. Expand even a one-word note into a finished still. JSON only.",
          },
          {
            role: "user",
            content: `Kind: ${kind}
Note: ${prompt.trim()}

Return:
{
  "brief": "90-160 words. Subject, light, lens, color, composition. Photoreal. Fill the whole frame edge to edge. No text, watermark, border, or letterbox.",
  "aspect_ratio": "one of 3:2, 2:3, 16:9, 9:16, 4:3, 3:4, 1:1"
}

Pick the ratio for the picture, not the website. Portraits and window figures: 2:3 or 3:4. Land, sea, aerial: 16:9 or 3:2. Square objects: 1:1.`,
          },
        ],
      }),
    });
    if (!res.ok) return fallback;
    const body = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const raw = body.choices?.[0]?.message?.content ?? "";
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    if (start < 0 || end <= start) return fallback;
    const rec = asRecord(JSON.parse(raw.slice(start, end + 1)));
    const ratio = asString(rec.aspect_ratio, fallback.aspect_ratio);
    return {
      brief: asString(rec.brief, fallback.brief),
      aspect_ratio: RATIOS.has(ratio) ? ratio : fallback.aspect_ratio,
    };
  } catch {
    return fallback;
  }
}

async function readError(res: Response): Promise<string> {
  try {
    const body = (await res.json()) as {
      error?: { message?: string } | string;
      message?: string;
    };
    const msg =
      (typeof body.error === "string" ? body.error : body.error?.message) ||
      body.message;
    if (msg) return msg;
  } catch {
    /* ignore */
  }
  return `Image generation failed (${res.status}).`;
}

async function xaiImage(
  prompt: string,
  kind: MediaKind,
  aspect = aspectFor(kind),
): Promise<ImageOk | Fail> {
  const apiKey = requireKey();
  if (typeof apiKey !== "string") return apiKey;
  const { width, height } = sizeFromRatio(aspect, kind);
  const models = ["grok-imagine-image-2.0", "grok-imagine-image-quality", "grok-imagine-image"];
  let lastError = "Image generation failed.";

  for (const model of models) {
    try {
      const res = await fetch("https://api.x.ai/v1/images/generations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        signal: AbortSignal.timeout(90000),
        body: JSON.stringify({
          model,
          prompt,
          n: 1,
          resolution: "2k",
          aspect_ratio: aspect,
        }),
      });
      if (!res.ok) {
        lastError = await readError(res);
        continue;
      }
      const body = (await res.json()) as {
        data?: { url?: string; b64_json?: string; base64?: string }[];
      };
      const item = body.data?.[0];
      if (!item) {
        lastError = "No image returned.";
        continue;
      }
      const raw = item.b64_json || item.base64;
      if (raw) {
        return { ok: true, mime: "image/jpeg", base64: raw, width, height };
      }
      if (!item.url) {
        lastError = "No image URL returned.";
        continue;
      }
      const bin = await fetch(item.url, { signal: AbortSignal.timeout(30000) });
      if (!bin.ok) {
        lastError = "Could not download the generated still.";
        continue;
      }
      const bytes = Buffer.from(await bin.arrayBuffer());
      return { ok: true, mime: "image/jpeg", base64: bytes.toString("base64"), width, height };
    } catch (error) {
      const aborted =
        error instanceof Error &&
        (error.name === "TimeoutError" || error.name === "AbortError");
      lastError = aborted ? "Generation took too long." : "Could not reach Imagine.";
    }
  }

  return { ok: false, error: lastError };
}

export const generateStill = createServerFn({ method: "POST" })
  .validator((input: { prompt: string; kind: MediaKind }) => input)
  .handler(async ({ data }): Promise<ImageOk | Fail> => {
    if (!data.prompt.trim()) return { ok: false, error: "Write what you want to see." };
    const kind = data.kind === "video" ? "drone" : data.kind;
    const plan = await planShot(data.prompt, kind);
    return xaiImage(plan.brief, kind, plan.aspect_ratio);
  });

export const generateMotion = createServerFn({ method: "POST" })
  .validator((input: { prompt: string }) => input)
  .handler(async ({ data }): Promise<VideoOk | Fail> => {
    const apiKey = requireKey();
    if (typeof apiKey !== "string") return apiKey;
    if (!data.prompt.trim()) return { ok: false, error: "Write the motion you want." };

    const plan = await planShot(data.prompt, "video");
    const still = await xaiImage(
      `${plan.brief} Establishing still, almost no motion. Widescreen 16:9, fill the frame.`,
      "video",
      "16:9",
    );
    if (!still.ok) return still;

    const stillUrl = `data:${still.mime};base64,${still.base64}`;
    try {
      const start = await fetch("https://api.x.ai/v1/videos/generations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        signal: AbortSignal.timeout(30000),
        body: JSON.stringify({
          model: "grok-imagine-video-1.5",
          prompt: `${plan.brief} Almost still cinematic loop, muted, slow. Fill the frame. No text.`,
          image: { url: stillUrl },
          duration: 6,
          resolution: "720p",
        }),
      });
      if (!start.ok) {
        return { ok: false, error: `Video start failed (${start.status}).` };
      }
      const started = (await start.json()) as { request_id?: string; id?: string };
      const requestId = started.request_id || started.id;
      if (!requestId) return { ok: false, error: "Video did not return a request id." };

      const deadline = Date.now() + 110_000;
      while (Date.now() < deadline) {
        await new Promise((r) => setTimeout(r, 3000));
        const poll = await fetch(`https://api.x.ai/v1/videos/${requestId}`, {
          headers: { Authorization: `Bearer ${apiKey}` },
          signal: AbortSignal.timeout(20000),
        });
        if (!poll.ok) continue;
        const status = (await poll.json()) as {
          status?: string;
          video?: { url?: string };
          url?: string;
        };
        if (status.status === "failed" || status.status === "expired") {
          return { ok: false, error: "Video generation failed." };
        }
        const url = status.video?.url || status.url;
        if (status.status === "done" && url) {
          const bin = await fetch(url, { signal: AbortSignal.timeout(30000) });
          if (!bin.ok) return { ok: false, error: "Could not download the clip." };
          const bytes = Buffer.from(await bin.arrayBuffer());
          return {
            ok: true,
            mime: "video/mp4",
            base64: bytes.toString("base64"),
            width: still.width,
            height: still.height,
            posterBase64: still.base64,
            posterMime: still.mime,
          };
        }
      }
      return { ok: false, error: "Video took too long. Try a shorter prompt." };
    } catch {
      return { ok: false, error: "Could not finish the motion clip." };
    }
  });

export const analyzeStill = createServerFn({ method: "POST" })
  .validator((input: { dataUrl: string; kindHint?: MediaKind }) => input)
  .handler(async ({ data }): Promise<{ ok: true; meta: StudioMeta } | Fail> => {
    const apiKey = requireKey();
    if (typeof apiKey !== "string") return apiKey;
    if (!data.dataUrl.startsWith("data:")) {
      return { ok: false, error: "Frame data is missing." };
    }

    const kindHint = data.kindHint ?? "image";
    const user = `You are the in-house picture editor at VIXL.
Read the frame. Write catalog metadata as if this already belongs in a printed monograph.
Never use hashtags, emoji, or words like stunning/breathtaking/iconic.
Return JSON only:
{
  "title": "2 to 5 words, no quotes",
  "kind": "image" | "drone" | "video",
  "location": "city or landscape, one place",
  "year": ${new Date().getFullYear()},
  "camera": "plausible professional body",
  "lens": "plausible lens",
  "description": "2 sentences, present tense, spare",
  "tags": ["5 to 8 unique SEO tags"],
  "width": 1728,
  "height": 1152
}
Prefer kind "${kindHint}" unless the picture clearly disagrees.`;

    try {
      const res = await fetch("https://api.x.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        signal: AbortSignal.timeout(40000),
        body: JSON.stringify({
          model: "grok-4.5",
          temperature: 0.5,
          max_tokens: 900,
          reasoning_effort: "low",
          response_format: { type: "json_object" },
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: user },
                { type: "image_url", image_url: { url: data.dataUrl } },
              ],
            },
          ],
        }),
      });
      if (!res.ok) {
        return { ok: false, error: `Analysis failed (${res.status}).` };
      }
      const body = (await res.json()) as {
        choices?: { message?: { content?: string } }[];
      };
      const raw = body.choices?.[0]?.message?.content ?? "";
      const start = raw.indexOf("{");
      const end = raw.lastIndexOf("}");
      if (start < 0 || end <= start) return { ok: false, error: "Unreadable analysis." };
      const rec = asRecord(JSON.parse(raw.slice(start, end + 1)));
      const kindRaw = asString(rec.kind, kindHint);
      const kind: MediaKind =
        kindRaw === "drone" || kindRaw === "video" || kindRaw === "image"
          ? kindRaw
          : kindHint;
      const tags = Array.isArray(rec.tags)
        ? rec.tags.filter((t): t is string => typeof t === "string" && t.trim().length > 0)
        : [];
      const size = sizeFromRatio(aspectFor(kind), kind);
      return {
        ok: true,
        meta: {
          title: asString(rec.title, "Untitled frame"),
          kind,
          location: asString(rec.location, "Studio"),
          year: Number(rec.year) || new Date().getFullYear(),
          camera: asString(rec.camera, "Leica M11"),
          lens: asString(rec.lens, "Summilux 50mm"),
          description: asString(rec.description, "A held frame."),
          tags,
          width: Number(rec.width) || size.width,
          height: Number(rec.height) || size.height,
        },
      };
    } catch {
      return { ok: false, error: "The lab could not read this frame." };
    }
  });
