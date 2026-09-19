import { useState, type FormEvent } from "react";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/input";
import { readCommentName, useComments } from "@/lib/comments";

export function Comments({ workId, title }: { workId: string; title: string }) {
  const { comments, pending, error, add } = useComments(workId);
  const [name, setName] = useState(readCommentName);
  const [body, setBody] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLocalError(null);
    try {
      await add(name, body);
      setBody("");
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Could not post.");
    }
  }

  return (
    <section id="comments" className="mt-12 border-t border-fg/8 pt-10">
      <p className="text-xs tracking-[0.18em] text-muted uppercase">
        <MessageSquare className="mr-2 inline size-3.5" strokeWidth={1.5} />
        Notes on this frame
      </p>
      <h2 className="font-display mt-2 text-2xl tracking-tight">
        {comments.length} {comments.length === 1 ? "comment" : "comments"}
      </h2>

      <ol className="mt-6 flex flex-col gap-5">
        {comments.map((item) => (
          <li key={item.id} className="border-b border-fg/8 pb-5 last:border-0">
            <p className="text-sm text-fg">{item.name}</p>
            <p className="mt-1 text-xs tracking-[0.12em] text-subtle uppercase">
              {new Date(item.createdAt).toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted">{item.body}</p>
          </li>
        ))}
      </ol>

      {comments.length === 0 ? (
        <p className="mt-2 text-sm text-muted">Be the first note on {title}.</p>
      ) : null}

      <form className="mt-8 flex max-w-lg flex-col gap-4" onSubmit={(e) => void onSubmit(e)}>
        <Field label="Name">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={40}
            autoComplete="nickname"
            required
          />
        </Field>
        <Field label="Comment">
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            maxLength={500}
            required
          />
        </Field>
        {localError || error ? (
          <p className="text-sm text-danger" role="alert">
            {localError ?? error}
          </p>
        ) : null}
        <Button type="submit" disabled={pending}>
          {pending ? "Sending…" : "Post comment"}
        </Button>
      </form>
    </section>
  );
}
