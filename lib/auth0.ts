import { Auth0Client } from "@auth0/nextjs-auth0/server";
import { NextResponse } from "next/server";

export const auth0 = new Auth0Client({
  async beforeSessionSaved(session, idToken) {
    const sessionObj = {
      ...session,
      idToken: idToken || ((session as Record<string, unknown>).idToken as string | null) || null,
    } as Record<string, any>;

    const resolvedIdToken = sessionObj.idToken;
    if (sessionObj.user?.sub && sessionObj.user?.email && resolvedIdToken) {
      const apiUrl =
        process.env.INTERNAL_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || " ";
      const provider = sessionObj.user.sub.split("|")[0] ?? "auth0";

      console.log(`[auth0] beforeSessionSaved — Attempting backend sync to URL: ${apiUrl}/auth/register-oauth`, {
        provider,
        email: sessionObj.user.email,
        hasIdToken: !!resolvedIdToken,
      });

      try {
        const res = await fetch(`${apiUrl}/auth/register-oauth`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            provider,
            id_token: resolvedIdToken,
          }),
        });

        console.log(`[auth0] beforeSessionSaved — Backend response status: ${res.status} ${res.statusText}`);

        if (!res.ok) {
          const errText = await res.text();
          console.error(`[auth0] beforeSessionSaved — Backend sync returned error status. Body: ${errText}`);
        } else {
          const data = await res.json();
          if (data.success && data.data?.token) {
            sessionObj.backendToken = data.data.token;
            sessionObj.backendUser = data.data.user ?? null;
            console.log(`[auth0] beforeSessionSaved — Backend sync successful! Token acquired for user ID: ${data.data.user?.id}`);
          } else {
            console.error("[auth0] beforeSessionSaved — Backend sync returned success:false or missing token", data);
          }
        }
      } catch (e: any) {
        console.error("[auth0] beforeSessionSaved — backend sync failed with connection or fetch error:", {
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
    return sessionObj as any;
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

    const backendToken = (session as any)?.backendToken ?? null;
    const backendUser = (session as any)?.backendUser ?? null;

    console.log(`[auth0] onCallback — Retreived from session:`, {
      hasBackendToken: !!backendToken,
      userId: backendUser?.id,
    });

    const isSecure = baseUrl.startsWith("https");
    const cookieOpts = {
      httpOnly: false, // Must be readable by client JS to complete login
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
