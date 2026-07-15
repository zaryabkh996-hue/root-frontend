import { Auth0Client } from "@auth0/nextjs-auth0/server";
import { NextResponse } from "next/server";

export const auth0 = new Auth0Client({
  async beforeSessionSaved(session, idToken) {
    return {
      ...session,
      idToken: idToken || ((session as Record<string, unknown>).idToken as string | null) || null,
    };
  },
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
      const apiUrl =
        process.env.INTERNAL_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || " ";
      const provider = session.user.sub?.split("|")[0] ?? "auth0";
      const idToken = session.tokenSet?.idToken || (session as Record<string, unknown>).idToken as string | null;

      console.log(`[auth0] onCallback — Attempting backend sync to URL: ${apiUrl}/auth/register-oauth`, {
        provider,
        email: session.user.email,
        hasIdToken: !!idToken,
      });

      try {
        const res = await fetch(`${apiUrl}/auth/register-oauth`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            provider,
            id_token: idToken || null,
          }),
        });

        console.log(`[auth0] onCallback — Backend response status: ${res.status} ${res.statusText}`);

        if (!res.ok) {
          const errText = await res.text();
          console.error(`[auth0] onCallback — Backend sync returned error status. Body: ${errText}`);
        } else {
          const data = await res.json();
          if (data.success && data.data?.token) {
            backendToken = data.data.token;
            backendUser = data.data.user ?? null;
            if (session) {
              (session as Record<string, unknown>).backendToken = backendToken;
              (session as Record<string, unknown>).backendUser = backendUser;
            }
            console.log(`[auth0] onCallback — Backend sync successful! Token acquired for user ID: ${backendUser?.id}`);
          } else {
            console.error("[auth0] onCallback — Backend sync returned success:false or missing token", data);
          }
        }
      } catch (e: any) {
        console.error("[auth0] onCallback — backend sync failed with connection or fetch error:", {
          message: e?.message,
          name: e?.name,
          code: e?.code,
          cause: e?.cause ? {
            message: e.cause?.message,
            name: e.cause?.name,
            code: e.cause?.code,
          } : undefined,
          stack: e?.stack,
        });
      }
    }

    const isSecure = baseUrl.startsWith("https");
    const cookieOpts = {
      httpOnly: true,  // Moved to HttpOnly for max security against XSS
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
