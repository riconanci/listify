// Shared by lib/auth.ts (Node runtime) and middleware.ts (Edge runtime), so this
// file must stay free of Node-only imports.

const DEV_ONLY_SECRET = "listify-dev-secret-not-for-production";

let warned = false;

/**
 * The key used to sign and verify session cookies.
 *
 * In production SESSION_SECRET must be set: this repository is public, so a
 * built-in default would let anyone forge a session for any account. Local
 * development falls back to a fixed value so `npm run dev` works without setup.
 *
 * Read lazily (never at module load) so `next build` does not need the variable.
 */
export function getSessionSecret(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (secret) return new TextEncoder().encode(secret);

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "SESSION_SECRET is not set. Add it to the environment before starting the app."
    );
  }

  if (!warned) {
    warned = true;
    console.warn(
      "[auth] SESSION_SECRET is not set; using the development-only secret. Add SESSION_SECRET to .env."
    );
  }
  return new TextEncoder().encode(DEV_ONLY_SECRET);
}
