# Smartback Inventory System

**SmartBack** is a modern inventory management system built with React, TypeScript, and Supabase, featuring automated release management and Copenhagen timezone support.

## Local Development

For the best local development experience (frontend + API routes + environment parity), always use:

```
vercel dev
```

- This runs both the Vite frontend and Vercel API endpoints together.
- All API routes are available at `/api/*` as in production.
- Environment variables and routing match your deployed Vercel environment.
- Hot reloading and HMR work out of the box **only with `npm run dev`** (frontend only).

**Note:**
- When using `vercel dev`, you may see Vite websocket/HMR errors in the browser console. This is expected—Vercel does not support Vite's native HMR websocket. Your app and API routes will still work; just refresh the page to see changes.
- Use `npm run dev` only for frontend-only rapid development (no API routes).

## Other scripts