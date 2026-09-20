import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowDown,
  ArrowUp,
  Plus,
  Star,
  Trash2,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { AdminCreate } from "@/components/admin-create";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, Input, Textarea } from "@/components/ui/input";
import { VixlWordmark } from "@/components/vixl-mark";
import {
  KIND_LABEL,
  SEED_CATALOG,
  type Catalog,
  type MediaKind,
  type Work,
} from "@/lib/media";
import {
  getFirebaseDatabase,
  saveCatalog,
  signOutAdmin,
  uploadGalleryFile,
} from "@/lib/firebase";
import { useCatalog } from "@/lib/use-catalog";
import { cn } from "@/lib/utils";

const TABS = ["Create", "Frames", "Studio", "Site", "Marks"] as const;
type Tab = (typeof TABS)[number];

function blankWork(): Work {
  return {
    id: `frame-${Date.now()}`,
    title: "Untitled",
    kind: "image",
    src: "",
    width: 1600,
    height: 1067,
    year: new Date().getFullYear(),
    uploadDate: new Date().toISOString(),
    location: "",
    camera: "",
    lens: "",
    description: "",
    tags: [],
    published: false,
  };
}

function firebaseError(error: unknown): string {
  const code =
    error && typeof error === "object" && "code" in error
      ? String((error as { code: string }).code)
      : "";
  if (code.includes("permission") || code === "PERMISSION_DENIED") {
    return "Database denied the write. Publish the admin rules, then retry.";
  }
  if (code.includes("storage") || code === "storage/unauthorized") {
    return "Storage is closed. Enable Storage and allow this admin email to write.";
  }
  if (error instanceof Error) return error.message;
  return "Save did not land.";
}

export function AdminDesk({ email }: { email: string }) {
  const live = useCatalog({ includeDrafts: true });
  const [catalog, setCatalog] = useState<Catalog>(live);
  const [tab, setTab] = useState<Tab>("Create");
  const [selectedId, setSelectedId] = useState<string | null>(live.works[0]?.id ?? null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<"src" | "poster" | null>(null);
  const [marks, setMarks] = useState<Record<string, number>>({});
  const [dirty, setDirty] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (dirty) return;
    setCatalog({
      heroId: live.heroId,
      site: live.site,
      studio: live.studio,
      works: live.works,
    });
  }, [live.heroId, live.site, live.studio, live.works, dirty]);

  useEffect(() => {
    if (!selectedId && live.works[0]) setSelectedId(live.works[0].id);
  }, [live.works, selectedId]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const db = await getFirebaseDatabase();
      if (!db || cancelled) return;
      const { get, ref } = await import("firebase/database");
      const snap = await get(ref(db, "marks"));
      const raw = snap.val() as Record<string, { count?: number }> | null;
      if (!raw || cancelled) return;
      const next: Record<string, number> = {};
      for (const [id, node] of Object.entries(raw)) {
        if (typeof node?.count === "number") next[id] = node.count;
      }
      setMarks(next);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const selected = catalog.works.find((w) => w.id === selectedId) ?? null;

  function updateLocal(next: Catalog) {
    setCatalog(next);
    setDirty(true);
  }

  async function persistNow(next: Catalog, message: string) {
    setSaving(true);
    try {
      await saveCatalog(next);
      setCatalog(next);
      setDirty(false);
      toast.success(message);
    } catch (error) {
      toast.error(firebaseError(error));
    } finally {
      setSaving(false);
    }
  }

  function patchWork(id: string, patch: Partial<Work>) {
    const works = catalog.works.map((work) =>
      work.id === id ? { ...work, ...patch } : work,
    );
    updateLocal({ ...catalog, works });
  }

  function addFrame() {
    const work = blankWork();
    updateLocal({ ...catalog, works: [work, ...catalog.works] });
    setSelectedId(work.id);
    setTab("Frames");
  }

  function removeFrame(id: string) {
    const works = catalog.works.filter((work) => work.id !== id);
    const published = works.filter((work) => work.published);
    const heroId =
      catalog.heroId === id ? (published[0]?.id ?? works[0]?.id ?? "") : catalog.heroId;
    if (selectedId === id) setSelectedId(works[0]?.id ?? null);
    setDeleteId(null);
    void persistNow({ ...catalog, works, heroId }, "Frame removed");
  }

  function moveFrame(id: string, dir: -1 | 1) {
    const index = catalog.works.findIndex((work) => work.id === id);
    const nextIndex = index + dir;
    if (index < 0 || nextIndex < 0 || nextIndex >= catalog.works.length) return;
    const works = [...catalog.works];
    const [row] = works.splice(index, 1);
    if (!row) return;
    works.splice(nextIndex, 0, row);
    updateLocal({ ...catalog, works });
  }

  async function onUpload(kind: "src" | "poster", file: File | undefined) {
    if (!file || !selected) return;
    setUploading(kind);
    try {
      const url = await uploadGalleryFile(file, `gallery/${selected.id}`);
      const patch: Partial<Work> = kind === "src" ? { src: url } : { poster: url };
      if (kind === "src" && !selected.uploadDate) patch.uploadDate = new Date().toISOString();
      if (kind === "src" && file.type.startsWith("video/")) patch.kind = "video";
      patchWork(selected.id, patch);
      toast.success(kind === "src" ? "File attached" : "Poster attached");
    } catch (error) {
      toast.error(firebaseError(error));
    } finally {
      setUploading(null);
    }
  }

  function setPublished(id: string, published: boolean) {
    const works = catalog.works.map((work) =>
      work.id === id ? { ...work, published } : work,
    );
    void persistNow(
      { ...catalog, works },
      published ? "Published to the site" : "Moved back to draft",
    );
  }

  async function publishSeed() {
    const seeded: Catalog = {
      ...SEED_CATALOG,
      works: SEED_CATALOG.works.map((work) => ({ ...work, published: true })),
    };
    await persistNow(seeded, "Seed catalog pushed as live");
  }

  const markRows = useMemo(
    () =>
      catalog.works.map((work) => ({
        id: work.id,
        title: work.title,
        count: marks[work.id] ?? 0,
      })),
    [catalog.works, marks],
  );

  return (
    <div className="min-h-[100svh] bg-bg">
      <header className="sticky top-0 z-40 border-b border-fg/8 bg-bg/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-3 px-4 py-3 md:px-6">
          <div>
            <VixlWordmark compact />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="max-w-[14rem] truncate text-xs text-muted">{email}</span>
            <span className="font-mono text-xs text-subtle">
              {saving ? "Saving" : dirty ? "Unsaved" : "Saved"}
            </span>
            <Button
              size="sm"
              disabled={saving || !dirty}
              onClick={() => void persistNow(catalog, "Saved")}
            >
              Save
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to="/">Site</Link>
            </Button>
            <Button variant="ghost" size="sm" onClick={() => void signOutAdmin()}>
              Sign out
            </Button>
          </div>
        </div>
        <div className="mx-auto flex max-w-[1400px] gap-1 overflow-x-auto px-4 pb-3 md:px-6">
          {TABS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setTab(item)}
              className={cn(
                "h-11 shrink-0 rounded-full px-4 text-sm tracking-tight transition-[background-color,color] duration-150",
                tab === item ? "bg-fg text-bg" : "text-muted hover:text-fg",
              )}
            >
              {item}
            </button>
          ))}
        </div>
      </header>

      <div className="mx-auto max-w-[1400px] px-4 py-8 md:px-6">
        {tab === "Create" ? (
          <AdminCreate
            onCreated={(work) => {
              const next = { ...catalog, works: [work, ...catalog.works] };
              setSelectedId(work.id);
              setTab("Frames");
              void persistNow(next, "Draft ready. Publish when you want it on the site.");
            }}
          />
        ) : null}

        {tab === "Frames" ? (
          <div className="grid gap-8 lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)]">
            <aside>
              <div className="mb-3 flex gap-2">
                <Button size="sm" onClick={addFrame}>
                  <Plus className="size-4" strokeWidth={1.5} />
                  New frame
                </Button>
                {live.source !== "firebase" ? (
                  <Button variant="outline" size="sm" onClick={() => void publishSeed()}>
                    Push seed
                  </Button>
                ) : null}
              </div>
              <ul className="flex flex-col gap-1">
                {catalog.works.map((work) => (
                  <li key={work.id}>
                    <div
                      className={cn(
                        "flex w-full items-center gap-3 rounded-md px-2 py-2 transition-[background-color] duration-150",
                        work.id === selectedId ? "bg-surface" : "hover:bg-fg/6",
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => setSelectedId(work.id)}
                        className="flex min-w-0 flex-1 items-center gap-3 text-left"
                      >
                        <span className="bg-bg-elevated size-11 shrink-0 overflow-hidden rounded-sm">
                          {work.src ? (
                            <img
                              src={work.poster ?? work.src}
                              alt=""
                              className="size-full object-cover"
                            />
                          ) : null}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm text-fg">{work.title}</span>
                          <span className="text-xs tracking-[0.12em] text-muted uppercase">
                            {KIND_LABEL[work.kind]}
                            {work.published ? " · Live" : " · Draft"}
                            {work.id === catalog.heroId ? " · Hero" : ""}
                          </span>
                        </span>
                      </button>
                      <span className="flex flex-col">
                        <button
                          type="button"
                          className="inline-flex size-8 items-center justify-center text-muted hover:text-fg"
                          onClick={() => moveFrame(work.id, -1)}
                          aria-label="Move up"
                        >
                          <ArrowUp className="size-3.5" strokeWidth={1.5} />
                        </button>
                        <button
                          type="button"
                          className="inline-flex size-8 items-center justify-center text-muted hover:text-fg"
                          onClick={() => moveFrame(work.id, 1)}
                          aria-label="Move down"
                        >
                          <ArrowDown className="size-3.5" strokeWidth={1.5} />
                        </button>
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </aside>

            {selected ? (
              <section className="flex flex-col gap-5">
                <p className="text-sm text-muted">
                  {selected.published
                    ? "Live on the site. Save edits, or unpublish to hide it."
                    : "Draft — visitors cannot see this until you publish."}
                </p>
                <div className="flex justify-center overflow-hidden rounded-lg bg-surface">
                  {selected.src ? (
                    selected.kind === "video" ? (
                      <video
                        src={selected.src}
                        poster={selected.poster}
                        className="h-auto max-h-[42svh] w-auto max-w-full"
                        controls
                        muted
                        playsInline
                      />
                    ) : (
                      <img
                        src={selected.src}
                        alt={selected.title}
                        className="h-auto max-h-[42svh] w-auto max-w-full"
                      />
                    )
                  ) : (
                    <p className="px-4 py-16 text-center text-sm text-muted">
                      Upload a still or motion file.
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <label className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-md px-4 text-sm shadow-border">
                    <Upload className="size-4" strokeWidth={1.5} />
                    {uploading === "src" ? "Uploading…" : "Upload media"}
                    <input
                      type="file"
                      accept="image/*,video/mp4,video/quicktime"
                      className="sr-only"
                      disabled={Boolean(uploading)}
                      onChange={(e) => void onUpload("src", e.target.files?.[0])}
                    />
                  </label>
                  <label className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-md px-4 text-sm shadow-border">
                    {uploading === "poster" ? "Uploading…" : "Upload poster"}
                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      disabled={Boolean(uploading)}
                      onChange={(e) => void onUpload("poster", e.target.files?.[0])}
                    />
                  </label>
                  <Button
                    variant={selected.published ? "default" : "ai"}
                    size="sm"
                    disabled={saving || !selected.src}
                    onClick={() => setPublished(selected.id, !selected.published)}
                  >
                    {selected.published ? "Unpublish" : "Publish to site"}
                  </Button>
                  <Button
                    variant={selected.id === catalog.heroId ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateLocal({ ...catalog, heroId: selected.id })}
                  >
                    <Star className="size-4" strokeWidth={1.5} />
                    Hero
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteId(selected.id)}
                  >
                    <Trash2 className="size-4" strokeWidth={1.5} />
                    Remove
                  </Button>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Title">
                    <Input
                      value={selected.title}
                      onChange={(e) => patchWork(selected.id, { title: e.target.value })}
                    />
                  </Field>
                  <Field label="Id">
                    <Input value={selected.id} readOnly />
                  </Field>
                  <Field label="Kind">
                    <select
                      className="h-11 w-full rounded-md bg-surface px-3 text-sm text-fg shadow-border outline-none"
                      value={selected.kind}
                      onChange={(e) =>
                        patchWork(selected.id, { kind: e.target.value as MediaKind })
                      }
                    >
                      <option value="image">Still</option>
                      <option value="drone">Drone</option>
                      <option value="video">Motion</option>
                    </select>
                  </Field>
                  <Field label="Year">
                    <Input
                      type="number"
                      value={selected.year}
                      onChange={(e) =>
                        patchWork(selected.id, { year: Number(e.target.value) || 0 })
                      }
                    />
                  </Field>
                  <Field label="Location">
                    <Input
                      value={selected.location}
                      onChange={(e) =>
                        patchWork(selected.id, { location: e.target.value })
                      }
                    />
                  </Field>
                  <Field label="Camera">
                    <Input
                      value={selected.camera}
                      onChange={(e) => patchWork(selected.id, { camera: e.target.value })}
                    />
                  </Field>
                  <Field label="Lens">
                    <Input
                      value={selected.lens}
                      onChange={(e) => patchWork(selected.id, { lens: e.target.value })}
                    />
                  </Field>
                  <Field label="Width">
                    <Input
                      type="number"
                      value={selected.width}
                      onChange={(e) =>
                        patchWork(selected.id, { width: Number(e.target.value) || 1 })
                      }
                    />
                  </Field>
                  <Field label="Height">
                    <Input
                      type="number"
                      value={selected.height}
                      onChange={(e) =>
                        patchWork(selected.id, { height: Number(e.target.value) || 1 })
                      }
                    />
                  </Field>
                  <div className="sm:col-span-2">
                    <Field label="Media URL">
                      <Input
                        value={selected.src}
                        onChange={(e) => patchWork(selected.id, { src: e.target.value })}
                      />
                    </Field>
                  </div>
                  <div className="sm:col-span-2">
                    <Field label="Poster URL">
                      <Input
                        value={selected.poster ?? ""}
                        onChange={(e) =>
                          patchWork(selected.id, { poster: e.target.value || undefined })
                        }
                      />
                    </Field>
                  </div>
                  <div className="sm:col-span-2">
                    <Field label="Description">
                      <Textarea
                        value={selected.description}
                        onChange={(e) =>
                          patchWork(selected.id, { description: e.target.value })
                        }
                      />
                    </Field>
                  </div>
                  <div className="sm:col-span-2">
                    <Field label="Tags (comma separated)">
                      <Input
                        value={selected.tags.join(", ")}
                        onChange={(e) =>
                          patchWork(selected.id, {
                            tags: e.target.value
                              .split(",")
                              .map((tag) => tag.trim())
                              .filter(Boolean),
                          })
                        }
                      />
                    </Field>
                  </div>
                </div>
              </section>
            ) : (
              <p className="text-sm text-muted">Add a frame to begin.</p>
            )}
          </div>
        ) : null}

        {tab === "Studio" ? (
          <section className="mx-auto flex max-w-2xl flex-col gap-5">
            <Field label="Kicker">
              <Input
                value={catalog.studio.kicker}
                onChange={(e) =>
                  updateLocal({
                    ...catalog,
                    studio: { ...catalog.studio, kicker: e.target.value },
                  })
                }
              />
            </Field>
            <Field label="Headline">
              <Textarea
                value={catalog.studio.headline}
                onChange={(e) =>
                  updateLocal({
                    ...catalog,
                    studio: { ...catalog.studio, headline: e.target.value },
                  })
                }
              />
            </Field>
            <Field label="Paragraphs (one per block, blank line to split)">
              <Textarea
                className="min-h-40"
                value={catalog.studio.paragraphs.join("\n\n")}
                onChange={(e) =>
                  updateLocal({
                    ...catalog,
                    studio: {
                      ...catalog.studio,
                      paragraphs: e.target.value
                        .split(/\n\s*\n/)
                        .map((p) => p.trim())
                        .filter(Boolean),
                    },
                  })
                }
              />
            </Field>
            {catalog.studio.pillars.map((pillar, index) => (
              <div key={pillar.k} className="grid gap-3 sm:grid-cols-3">
                <Field label={`Pillar ${pillar.k} title`}>
                  <Input
                    value={pillar.t}
                    onChange={(e) => {
                      const pillars = catalog.studio.pillars.map((item, i) =>
                        i === index ? { ...item, t: e.target.value } : item,
                      );
                      updateLocal({
                        ...catalog,
                        studio: { ...catalog.studio, pillars },
                      });
                    }}
                  />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Copy">
                    <Input
                      value={pillar.d}
                      onChange={(e) => {
                        const pillars = catalog.studio.pillars.map((item, i) =>
                          i === index ? { ...item, d: e.target.value } : item,
                        );
                        updateLocal({
                          ...catalog,
                          studio: { ...catalog.studio, pillars },
                        });
                      }}
                    />
                  </Field>
                </div>
              </div>
            ))}
            <Field label="Colophon">
              <Input
                value={catalog.studio.colophon}
                onChange={(e) =>
                  updateLocal({
                    ...catalog,
                    studio: { ...catalog.studio, colophon: e.target.value },
                  })
                }
              />
            </Field>
          </section>
        ) : null}

        {tab === "Site" ? (
          <section className="mx-auto flex max-w-2xl flex-col gap-5">
            <Field label="Kicker">
              <Input
                value={catalog.site.kicker}
                onChange={(e) =>
                  updateLocal({
                    ...catalog,
                    site: { ...catalog.site, kicker: e.target.value },
                  })
                }
              />
            </Field>
            <Field label="Subtitle">
              <Input
                value={catalog.site.subtitle}
                onChange={(e) =>
                  updateLocal({
                    ...catalog,
                    site: { ...catalog.site, subtitle: e.target.value },
                  })
                }
              />
            </Field>
            <Field label="Headline">
              <Textarea
                value={catalog.site.headline}
                onChange={(e) =>
                  updateLocal({
                    ...catalog,
                    site: { ...catalog.site, headline: e.target.value },
                  })
                }
              />
            </Field>
            <Field label="Lede">
              <Textarea
                value={catalog.site.lede}
                onChange={(e) =>
                  updateLocal({
                    ...catalog,
                    site: { ...catalog.site, lede: e.target.value },
                  })
                }
              />
            </Field>
            <Field label="Title">
              <Input
                value={catalog.site.title}
                onChange={(e) =>
                  updateLocal({
                    ...catalog,
                    site: { ...catalog.site, title: e.target.value },
                  })
                }
              />
            </Field>
            <Field label="Description">
              <Textarea
                value={catalog.site.description}
                onChange={(e) =>
                  updateLocal({
                    ...catalog,
                    site: { ...catalog.site, description: e.target.value },
                  })
                }
              />
            </Field>
          </section>
        ) : null}

        {tab === "Marks" ? (
          <section className="mx-auto max-w-xl">
            <p className="text-sm text-muted">
              Public marks, counted in Realtime Database. No names attached.
            </p>
            <ul className="mt-6 divide-y divide-fg/8">
              {markRows.map((row) => (
                <li
                  key={row.id}
                  className="flex items-center justify-between gap-4 py-3 text-sm"
                >
                  <span className="text-fg">{row.title}</span>
                  <span className="font-mono text-muted">{row.count}</span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>

      <Dialog open={Boolean(deleteId)} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent className="w-[min(96vw,28rem)] p-6" showClose>
          <DialogTitle>Remove this frame?</DialogTitle>
          <DialogDescription className="mt-3">
            {catalog.works.find((work) => work.id === deleteId)?.published
              ? "It is live on the site. Removing it cannot be undone."
              : "This draft will be deleted. This cannot be undone."}
          </DialogDescription>
          <div className="mt-6 flex gap-2">
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Keep
            </Button>
            <Button
              onClick={() => deleteId && removeFrame(deleteId)}
            >
              Remove
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
