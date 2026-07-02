import { auth0 } from "@/lib/auth0";
import { NextResponse } from "next/server";

export interface AdminAuthResult {
  authorized: boolean;
  response?: NextResponse;
  session?: any;
  backendUser?: any;
  backendToken?: string | null;
}

/**
 * Validates the user session using Auth0 and verifies that they have the 'admin' role
 * by checking backendUser synced from the Laravel backend.
 */
export async function verifyAdminSession(): Promise<AdminAuthResult> {
  try {
    const session = await auth0.getSession();

    if (!session) {
      return {
        authorized: false,
        response: NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 }),
      };
    }

    let backendToken = (session as Record<string, unknown>).backendToken as string | null ?? null;
    let backendUser = (session as Record<string, unknown>).backendUser as Record<string, unknown> | null ?? null;

    if (!backendToken && session.user?.sub && session.user?.email) {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "";

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
        console.error("[verifyAdminSession] backend sync fallback failed:", e);
      }
    }

    if (!backendUser || backendUser.role !== "admin") {
      return {
        authorized: false,
        response: NextResponse.json({ success: false, error: "Forbidden: Admin role required" }, { status: 403 }),
      };
    }

    return {
      authorized: true,
      session,
      backendUser,
      backendToken,
    };
  } catch (error) {
    console.error("Error verifying admin session:", error);
    return {
      authorized: false,
      response: NextResponse.json(
        { success: false, error: "Internal server error during authentication" },
        { status: 500 }
      ),
    };
  }
}
