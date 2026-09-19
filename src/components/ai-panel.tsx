import { useEffect, useState } from "react";
import { ScanLine } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { tagWork, type AiTag } from "@/lib/ai-tagging";
import { readCachedTag, writeCachedTag } from "@/lib/ai-cache";
import type { Work } from "@/lib/media";

type Props = {
  work: Work;
};

export function AiPanel({ work }: Props) {
  const [tag, setTag] = useState<AiTag | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setTag(readCachedTag(work.id));
  }, [work.id]);

  async function onRead() {
    if (loading) return;
    const cached = readCachedTag(work.id);
    if (cached) {
      setTag(cached);
      return;
    }
    setLoading(true);
    try {
      const result = await tagWork({
        data: {
          workId: work.id,
          title: work.title,
          kind: work.kind,
          location: work.location,
          year: work.year,
          description: work.description,
        },
      });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      writeCachedTag(work.id, result.tag);
      setTag(result.tag);
    } catch {
      toast.error("The lab could not be reached.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <aside className="rounded-lg bg-ai/8 p-5 shadow-ai">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs tracking-widest text-ai uppercase">Beta AI</p>
        {tag ? (
          <p className="text-xs tracking-widest text-subtle uppercase">Cached</p>
        ) : (
          <Button
            type="button"
            variant="ai"
            size="sm"
            onClick={() => void onRead()}
            disabled={loading}
          >
            <ScanLine className="size-3.5" strokeWidth={1.6} />
            {loading ? "Reading…" : "Read this frame"}
          </Button>
        )}
      </div>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        A second exposure. The model looks at the catalog note and writes a
        cinematic title, a search line, and inferred camera data.
      </p>

      {loading ? (
        <div className="mt-5 space-y-3" aria-live="polite" aria-busy="true">
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : tag ? (
        <div className="mt-5 space-y-4" aria-live="polite">
          <div>
            <p className="text-xs tracking-[0.16em] text-subtle uppercase">
              Cinematic title
            </p>
            <p className="font-display mt-1 text-xl tracking-tight text-fg">
              {tag.cinematicTitle}
            </p>
          </div>
          <div>
            <p className="text-xs tracking-[0.16em] text-subtle uppercase">
              SEO
            </p>
            <p className="mt-1 text-sm leading-relaxed text-fg/90">
              {tag.seoDescription}
            </p>
          </div>
          <div>
            <p className="text-xs tracking-[0.16em] text-subtle uppercase">
              Story
            </p>
            <p className="mt-1 text-sm leading-relaxed text-muted">
              {tag.story}
            </p>
          </div>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 pt-1 text-xs">
            {(
              [
                ["Camera", tag.exif.camera],
                ["Lens", tag.exif.lens],
                ["Aperture", tag.exif.aperture],
                ["Shutter", tag.exif.shutter],
                ["ISO", tag.exif.iso],
                ["Focal", tag.exif.focalLength],
              ] as const
            ).map(([label, value]) => (
              <div key={label}>
                <dt className="tracking-[0.14em] text-subtle uppercase">
                  {label}
                </dt>
                <dd className="mt-0.5 font-mono text-xs text-fg">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      ) : null}
    </aside>
  );
}
