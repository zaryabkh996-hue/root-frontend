import { auth0 } from "@/lib/auth0";
import { NextResponse } from "next/server";
import { headers } from "next/headers";

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
    const reqHeaders = await headers();
    const authHeader = reqHeaders.get('Authorization');
    
    // 1. Check Cookie first, then check Authorization header
    let token: string | null = null;
    const cookieStore = reqHeaders.get('Cookie');
    if (cookieStore) {
      const match = cookieStore.match(/authToken=([^;]+)/);
      if (match) {
        token = match[1];
      }
    }
    if (!token && authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    if (token) {
      const apiUrl = process.env.INTERNAL_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "";
      if (apiUrl) {
        let res = await fetch(`${apiUrl}/auth/admin/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
          cache: 'no-store'
        });
        if (!res.ok) {
          res = await fetch(`${apiUrl}/me`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json',
            },
            cache: 'no-store'
          });
        }
        if (res.ok) {
          const data = await res.json();
          const user = data.data || data.user;
          if (data.success && user) {
            if (user.role === 'admin') {
              return {
                authorized: true,
                backendUser: user,
                backendToken: token,
              };
            }
          }
        }
      }
    }

    // 2. Check Auth0 Session fallback
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
        const apiUrl = process.env.INTERNAL_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "";

        const idToken = (session as Record<string, unknown>).idToken as string | null ?? session.tokenSet?.idToken ?? null;

        const res = await fetch(`${apiUrl}/auth/register-oauth`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            provider: session.user.sub?.split("|")[0] ?? "auth0",
            id_token: idToken,
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
