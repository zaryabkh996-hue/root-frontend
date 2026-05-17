import { redirect } from "next/navigation";

/**
 * Fallback only - the Auth0 proxy (proxy.ts) intercepts /auth/callback,
 * handles the token exchange, runs onCallback in lib/auth0.ts, and
 * redirects to /dashboard. This page is unreachable under normal operation.
 */
export default function CallbackPage() {
  redirect("/dashboard");
}
