# VIXL

Visual Excellence Lab — a black-field photography and motion studio. Still, aerial, and looping cinematic work, with an optional AI lab that writes a cinematic title, search line, and inferred camera data for a frame.

## Stack

- TanStack Start (Vite) + React 19
- Tailwind CSS v4
- Motion
- Nitro (Vercel output)
- xAI Grok for Lab tagging (`XAI_API_KEY`)
- Firebase (Analytics + Realtime Database catalog and marks)

## Local

```bash
npm install
npm run dev
```

Open the printed local URL. `npm run build` then `npm run preview` checks the production bundle.

## Deploy on Vercel

1. Import [madan123051/VIXL](https://github.com/madan123051/VIXL) in Vercel.
2. Framework preset: **Other** (Nitro writes `.vercel/output`; do not set a Vite `dist` directory).
3. Build command: `npm run build` (already in `vercel.json`).
4. Node.js **22**.
5. Add env var **`XAI_API_KEY`** (Production + Preview) so Lab can read a frame. Without it, the rest of the site still works.
6. Firebase `VITE_FIREBASE_*` vars are already on the Vercel project.

## Firebase

The catalog (13 frames, studio copy, hero) lives at Realtime Database path `catalog`. The app reads it live and, if the node is empty, writes the seed from `src/lib/catalog-data.json`. Frames still load from `/gallery` in this repo (Storage is not enabled on the project yet). **Mark** stores a count at `marks/{id}/count`.

Publish these rules (Console → Realtime Database → Rules) so the seed can land and marks persist:

```json
{
  "rules": {
    "catalog": {
      ".read": true,
      ".write": "auth != null"
    },
    "marks": {
      "$workId": {
        "count": {
          ".read": true,
          ".write": true,
          ".validate": "newData.isNumber() && newData.val() >= 0 && newData.val() <= 100000000"
        }
      }
    }
  }
}
```

Then add your Vercel domain under Authentication → Settings → Authorized domains, reload the site once, and the catalog writes itself. Copy also in `database.rules.json`.

## Admin desk

URL: `/admin`. Email is `VITE_ADMIN_EMAIL` (`help@wildsaura.com` on Vercel). Create that user in Firebase Authentication → Users and set the password there.

Desk controls: upload media, edit frames, reorder, hero, studio/about copy, site copy, and mark counts.

Publish `database.rules.json` so only that email can write `catalog`. If uploads fail, enable Storage and publish `storage.rules`. Add the live domain under Authorized domains.

## Lab

Open **Lab**, pick a frame, tap **Read this frame**. Results cache in the browser. Calls are user-initiated and not run on page load.

## License

Private studio catalog. All rights reserved.
