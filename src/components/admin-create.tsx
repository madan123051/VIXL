import { useState, type FormEvent } from "react";
import { Sparkles, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/input";
import { analyzeStill, generateMotion, generateStill } from "@/lib/ai-studio";
import { slugify } from "@/lib/admin";
import { uploadGalleryFile } from "@/lib/firebase";
import type { MediaKind, Work } from "@/lib/media";
import { cn } from "@/lib/utils";

type Props = {
  onCreated: (work: Work) => void;
};

function fileFromBase64(base64: string, mime: string, name: string): File {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return new File([bytes], name, { type: mime });
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.readAsDataURL(file);
  });
}

function captureVideoFrame(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    video.src = url;
    video.onloadeddata = () => {
      video.currentTime = Math.min(0.2, (video.duration || 1) * 0.05);
    };
    video.onseeked = () => {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error("No canvas"));
        return;
      }
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.82));
    };
    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read video"));
    };
  });
}

async function shrinkDataUrl(dataUrl: string): Promise<string> {
  if (!dataUrl.startsWith("data:image")) return dataUrl;
  const img = new Image();
  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
    img.src = dataUrl;
  });
  const max = 1280;
  const scale = Math.min(1, max / Math.max(img.width, img.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(img.width * scale));
  canvas.height = Math.max(1, Math.round(img.height * scale));
  const ctx = canvas.getContext("2d");
  if (!ctx) return dataUrl;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.82);
}

export function AdminCreate({ onCreated }: Props) {
  const [prompt, setPrompt] = useState("");
  const [kind, setKind] = useState<MediaKind>("image");
  const [busy, setBusy] = useState<string | null>(null);

  async function finish(work: Work) {
    onCreated(work);
    toast.success("Saved as draft. Publish when it looks right.");
  }

  async function fromPrompt(event: FormEvent) {
    event.preventDefault();
    setBusy(kind === "video" ? "Generating motion…" : "Generating still…");
    try {
      if (kind === "video") {
        const motion = await generateMotion({ data: { prompt } });
        if (!motion.ok) throw new Error(motion.error);
        setBusy("Reading the frame…");
        const posterFile = fileFromBase64(motion.posterBase64, motion.posterMime, "poster.jpg");
        const videoFile = fileFromBase64(motion.base64, motion.mime, "clip.mp4");
        const preview = await shrinkDataUrl(
          `data:${motion.posterMime};base64,${motion.posterBase64}`,
        );
        const analysis = await analyzeStill({ data: { dataUrl: preview, kindHint: "video" } });
        if (!analysis.ok) throw new Error(analysis.error);
        const id = slugify(analysis.meta.title);
        setBusy("Uploading…");
        const poster = await uploadGalleryFile(posterFile, `gallery/${id}`);
        const src = await uploadGalleryFile(videoFile, `gallery/${id}`);
        await finish({
          id: `${id}-${Date.now().toString(36)}`,
          title: analysis.meta.title,
          kind: "video",
          src,
          poster,
          width: analysis.meta.width || motion.width,
          height: analysis.meta.height || motion.height,
          year: analysis.meta.year,
          location: analysis.meta.location,
          camera: analysis.meta.camera,
          lens: analysis.meta.lens,
          description: analysis.meta.description,
          tags: analysis.meta.tags,
          published: false,
        });
        setPrompt("");
        return;
      }

      const still = await generateStill({ data: { prompt, kind } });
      if (!still.ok) throw new Error(still.error);
      setBusy("Reading the frame…");
      const file = fileFromBase64(still.base64, still.mime, "frame.jpg");
      const preview = await shrinkDataUrl(`data:${still.mime};base64,${still.base64}`);
      const analysis = await analyzeStill({ data: { dataUrl: preview, kindHint: kind } });
      if (!analysis.ok) throw new Error(analysis.error);
      const id = slugify(analysis.meta.title);
      setBusy("Uploading…");
      const src = await uploadGalleryFile(file, `gallery/${id}`);
      await finish({
        id: `${id}-${Date.now().toString(36)}`,
        title: analysis.meta.title,
        kind: analysis.meta.kind === "video" ? kind : analysis.meta.kind,
        src,
        width: analysis.meta.width || still.width,
        height: analysis.meta.height || still.height,
        year: analysis.meta.year,
        location: analysis.meta.location,
        camera: analysis.meta.camera,
        lens: analysis.meta.lens,
        description: analysis.meta.description,
        tags: analysis.meta.tags,
        published: false,
      });
      setPrompt("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Generation failed.");
    } finally {
      setBusy(null);
    }
  }

  async function fromFile(file: File | undefined) {
    if (!file) return;
    const isVideo = file.type.startsWith("video/");
    setBusy("Uploading…");
    try {
      const hint: MediaKind = isVideo ? "video" : "image";
      const preview = isVideo
        ? await captureVideoFrame(file)
        : await shrinkDataUrl(await readAsDataUrl(file));
      setBusy("Reading the frame…");
      const analysis = await analyzeStill({ data: { dataUrl: preview, kindHint: hint } });
      if (!analysis.ok) throw new Error(analysis.error);
      const id = slugify(analysis.meta.title);
      const src = await uploadGalleryFile(file, `gallery/${id}`);
      let poster: string | undefined;
      if (isVideo) {
        const posterFile = fileFromBase64(
          preview.split(",")[1] ?? "",
          "image/jpeg",
          "poster.jpg",
        );
        poster = await uploadGalleryFile(posterFile, `gallery/${id}`);
      }
      await finish({
        id: `${id}-${Date.now().toString(36)}`,
        title: analysis.meta.title,
        kind: isVideo ? "video" : analysis.meta.kind === "video" ? "image" : analysis.meta.kind,
        src,
        poster,
        width: analysis.meta.width,
        height: analysis.meta.height,
        year: analysis.meta.year,
        location: analysis.meta.location,
        camera: analysis.meta.camera,
        lens: analysis.meta.lens,
        description: analysis.meta.description,
        tags: analysis.meta.tags,
        published: false,
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-2">
      <section className="rounded-xl bg-surface p-5 md:p-6">
        <p className="text-xs tracking-[0.18em] text-ai uppercase">Step 1</p>
        <h2 className="font-display mt-2 text-2xl tracking-tight">Make with AI</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Describe the picture. The lab generates it in the VIXL look, then writes
          title, tags, and camera notes. It stays a draft until you publish.
        </p>
        <form className="mt-6 flex flex-col gap-4" onSubmit={(e) => void fromPrompt(e)}>
          <Field label="What should we see">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Basalt cliffs, last usable hour, Faroe, cold green water"
              required
            />
          </Field>
          <div className="flex flex-wrap gap-2">
            {(
              [
                ["image", "Still"],
                ["drone", "Aerial"],
                ["video", "Motion"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setKind(id)}
                className={cn(
                  "h-11 rounded-full px-4 text-sm tracking-tight",
                  kind === id ? "bg-fg text-bg" : "text-muted shadow-border",
                )}
              >
                {label}
              </button>
            ))}
          </div>
          <Button type="submit" variant="ai" disabled={Boolean(busy) || !prompt.trim()}>
            <Sparkles className="size-4" strokeWidth={1.5} />
            {busy ?? (kind === "video" ? "Generate clip" : "Generate frame")}
          </Button>
        </form>
      </section>

      <section className="rounded-xl bg-surface p-5 md:p-6">
        <p className="text-xs tracking-[0.18em] text-muted uppercase">Step 1</p>
        <h2 className="font-display mt-2 text-2xl tracking-tight">Upload a frame</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Drop a photo or video. The lab looks at it and fills the catalog line.
          You only publish when you are sure.
        </p>
        <label className="mt-6 flex min-h-40 cursor-pointer flex-col items-center justify-center gap-3 rounded-lg bg-bg px-4 text-center shadow-border">
          <Upload className="size-5 text-muted" strokeWidth={1.5} />
          <span className="text-sm text-muted">
            {busy ?? "Tap to choose a still or mp4"}
          </span>
          <Input
            type="file"
            accept="image/*,video/mp4,video/quicktime"
            className="sr-only"
            disabled={Boolean(busy)}
            onChange={(e) => void fromFile(e.target.files?.[0])}
          />
        </label>
      </section>
    </div>
  );
}
