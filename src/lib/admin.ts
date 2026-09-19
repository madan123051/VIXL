export const ADMIN_EMAIL = (
  import.meta.env.VITE_ADMIN_EMAIL ?? "help@wildsaura.com"
)
  .trim()
  .toLowerCase();

export function isAdminEmail(email: string | null | undefined): boolean {
  return (email ?? "").trim().toLowerCase() === ADMIN_EMAIL;
}

export function slugify(title: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || `frame-${Date.now()}`;
}
