import { useState, type FormEvent } from "react";
import { ADMIN_EMAIL, signInAdmin } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";

function authMessage(error: unknown): string {
  const code =
    error && typeof error === "object" && "code" in error
      ? String((error as { code: string }).code)
      : "";
  if (code === "auth/invalid-credential" || code === "auth/wrong-password") {
    return "Password did not match.";
  }
  if (code === "auth/user-not-found") {
    return "Create this user in Firebase Authentication first.";
  }
  if (code === "auth/unauthorized-domain") {
    return "Add this domain under Authentication → Authorized domains.";
  }
  if (error instanceof Error && error.message) return error.message;
  return "Could not open the desk.";
}

export function AdminLogin() {
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      await signInAdmin(ADMIN_EMAIL, password);
    } catch (err) {
      setError(authMessage(err));
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-[100svh] max-w-md flex-col justify-center px-4">
      <p className="text-xs tracking-[0.22em] text-muted uppercase">Desk</p>
      <h1 className="font-display mt-3 text-4xl tracking-tight">Studio key</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        Password lives in Firebase Authentication. The desk only opens for this
        address.
      </p>
      <form className="mt-10 flex flex-col gap-5" onSubmit={(e) => void onSubmit(e)}>
        <Field label="Email">
          <Input
            type="email"
            value={ADMIN_EMAIL}
            readOnly
            autoComplete="username"
          />
        </Field>
        <Field label="Password">
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
            minLength={6}
          />
        </Field>
        {error ? (
          <p className="text-sm text-danger" role="alert">
            {error}
          </p>
        ) : null}
        <Button type="submit" disabled={pending || !password}>
          {pending ? "Opening…" : "Enter"}
        </Button>
      </form>
    </main>
  );
}
