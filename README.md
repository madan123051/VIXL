# VIXL

Visual Excellence Lab — a black-field photography and motion studio. Still, aerial, and looping cinematic work, with an optional AI lab that writes a cinematic title, search line, and inferred camera data for a frame.

## Stack

- TanStack Start (Vite) + React 19
- Tailwind CSS v4
- Motion
- Nitro (Vercel output)
- xAI Grok for Lab tagging (`XAI_API_KEY`)
- Firebase (Analytics + Realtime Database marks)

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

Client SDK reads `VITE_FIREBASE_*` (see `.env.example`). Analytics logs page views. **Mark** on a frame writes a count to Realtime Database at `marks/{id}/count` — no sign-in. Same browser is remembered in `localStorage`.

Publish these Realtime Database rules (Console → Realtime Database → Rules), or the marks will not persist:

```json
{
  "rules": {
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

A copy lives in `database.rules.json`.

## Lab

Open **Lab**, pick a frame, tap **Read this frame**. Results cache in the browser. Calls are user-initiated and not run on page load.

## License

Private studio catalog. All rights reserved.
