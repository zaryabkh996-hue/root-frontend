import { auth0 } from "@/lib/auth0";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth0.getSession();

    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // backendToken is stored by the beforeSessionSaved hook in lib/auth0.ts
    // on first login. If the Auth0 session was refreshed it may be absent,
    // so we fall back to a live backend call to ensure it is always returned.
    let backendToken = (session as Record<string, unknown>).backendToken as string | null ?? null;
    let backendUser = (session as Record<string, unknown>).backendUser as Record<string, unknown> | null ?? null;

    if (!backendToken && session.user?.sub && session.user?.email) {
      try {
        const apiUrl =
          process.env.INTERNAL_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || " ";

        const res = await fetch(`${apiUrl}/auth/register-oauth`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            provider: session.user.sub?.split("|")[0] ?? "auth0",
            id_token: session.idToken || null,
          }),
        });

        const data = await res.json();
        if (data.success && data.data?.token) {
          backendToken = data.data.token;
          backendUser = data.data.user;
        }
      } catch (e) {
        console.error("[api/auth/user] backend sync fallback failed:", e);
      }
    }

    const response = NextResponse.json({
      success: true,
      user: session.user,
      accessToken: session.accessToken,
      backendUser,
      backendToken,
    });

    if (backendToken) {
      response.cookies.set("authToken", backendToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      });
    }

    return response;
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
  }
}
