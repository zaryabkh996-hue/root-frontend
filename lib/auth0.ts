import { Auth0Client } from "@auth0/nextjs-auth0/server";
import { NextResponse } from "next/server";

export const auth0 = new Auth0Client({
  async onCallback(error, ctx, session) {
    const baseUrl =
      ctx.appBaseUrl ?? process.env.APP_BASE_URL ?? "http://localhost:3000";

    if (error) {
      console.error("[auth0] OAuth callback error:", error.message);
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(error.message)}`, baseUrl)
      );
    }

    let backendToken: string | null = null;
    let backendUser: Record<string, unknown> | null = null;

    if (session?.user?.sub && session.user.email) {
      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_BACKEND_URL ?? " ";

        const res = await fetch(`${apiUrl}/auth/register-oauth`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: session.user.email,
            name: session.user.name ?? "User",
            auth0_id: session.user.sub,
            picture: session.user.picture ?? null,
            provider: session.user.sub?.split("|")[0] ?? "auth0",
          }),
        });

        const data = await res.json();
        if (data.success && data.data?.token) {
          backendToken = data.data.token;
          backendUser = data.data.user ?? null;
        }
      } catch (e) {
        console.error("[auth0] onCallback — backend sync failed:", e);
      }
    }

    const isSecure = baseUrl.startsWith("https");
    const cookieOpts = {
      httpOnly: false, // must be readable by client JS
      maxAge: 60,      // 60-second handoff window
      path: "/",
      sameSite: "lax" as const,
      secure: isSecure,
    };

    const response = NextResponse.redirect(
      new URL("/auth/oauth-success", baseUrl)
    );

    if (backendToken) {
      response.cookies.set("_oauth_bt", backendToken, cookieOpts);
      response.cookies.set(
        "_oauth_bu",
        JSON.stringify(backendUser ?? {}),
        cookieOpts
      );
    }

    return response;
  },
});
