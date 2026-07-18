import { auth0 } from "@/lib/auth0";
import { NextRequest } from "next/server";

export const TRACK_TO_STAGE_ID: Record<string, number> = {
  'Emotional Preparation': 1,
  'Cultural Intelligence': 2,
  'Practical Preparation': 3,
  'Arrival Orientation': 4,
  'Heritage Journey Experience': 5,
  'Post Journey Experience': 6,
};

/**
 * Validate if the user tier can access the given stage ID.
 * - Stage 1 requires 'free' tier (accessible to all).
 * - Stage 2 requires 'community' tier (community or preparation).
 * - Stage 3+ requires 'preparation' tier.
 */
export function isStageAccessible(userTier: string, stageId: number): boolean {
  const tiers = {
    'free': 0,
    'community': 1,
    'preparation': 2
  };
  
  const requiredTier = stageId === 1 ? 'free' : stageId === 2 ? 'community' : 'preparation';
  
  const userVal = tiers[userTier.toLowerCase() as keyof typeof tiers] ?? 0;
  const reqVal = tiers[requiredTier] ?? 0;
  
  return userVal >= reqVal;
}

/**
 * Resolves the user's subscription tier server-side by checking the live user data.
 */
export async function getUserTier(request: NextRequest): Promise<string> {
  try {
    let token: string | null = null;

    // 1. Check Auth0 Session
    const session = await auth0.getSession();
    if (session) {
      token = (session as Record<string, unknown>).backendToken as string | null;
    }

    // 2. Check Authorization header (for Magic Link users)
    if (!token) {
      const authHeader = request.headers.get('Authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }
    }

    // 3. Check Cookie (BFF Auth HttpOnly Cookie)
    if (!token) {
      token = request.cookies.get('authToken')?.value || null;
    }

    if (token) {
      const apiUrl = process.env.INTERNAL_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "";
      const res = await fetch(`${apiUrl}/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        cache: 'no-store'
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          const user = data.data;
          if (user.role === 'admin' || user.role === 'custodian') {
            return 'preparation';
          }
          return user.subscription_tier || 'free';
        }
      }
    }
  } catch (error) {
    console.error("[getUserTier] Failed to fetch user tier:", error);
  }

  return 'free';
}

/**
 * Checks if the current user is a Returned Traveller or an Admin by validating on the backend.
 * Returns authorization status along with user object and auth token.
 */
export async function checkIsReturnedTraveller(request: NextRequest): Promise<{ authorized: boolean; user?: any; token?: string }> {
  try {
    let token: string | null = null;

    // 1. Check Auth0 Session
    const session = await auth0.getSession();
    if (session) {
      token = (session as Record<string, unknown>).backendToken as string | null;
    }

    // 2. Check Authorization header
    if (!token) {
      const authHeader = request.headers.get('Authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }
    }

    // 3. Check Cookie (BFF Auth HttpOnly Cookie)
    if (!token) {
      token = request.cookies.get('authToken')?.value || null;
    }

    if (token) {
      const apiUrl = process.env.INTERNAL_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "";
      const res = await fetch(`${apiUrl}/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        cache: 'no-store'
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          const user = data.data;
          if (user.is_returned_traveller || user.role === 'admin') {
            return { authorized: true, user, token };
          }
        }
      }
    }
  } catch (error) {
    console.error("Error in checkIsReturnedTraveller:", error);
  }

  return { authorized: false };
}

/**
 * Checks if the current user is authenticated.
 * Returns user object and auth token.
 */
export async function checkIsAuthenticated(request: NextRequest): Promise<{ authenticated: boolean; user?: any; token?: string }> {
  try {
    let token: string | null = null;

    // 1. Check Auth0 Session
    const session = await auth0.getSession();
    if (session) {
      token = (session as Record<string, unknown>).backendToken as string | null;
    }

    // 2. Check Authorization header
    if (!token) {
      const authHeader = request.headers.get('Authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }
    }

    // 3. Check Cookie (BFF Auth HttpOnly Cookie)
    if (!token) {
      token = request.cookies.get('authToken')?.value || null;
    }

    if (token) {
      const apiUrl = process.env.INTERNAL_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "";
      const res = await fetch(`${apiUrl}/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        cache: 'no-store'
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          return { authenticated: true, user: data.data, token };
        }
      }
    }
  } catch (error) {
    console.error("Error in checkIsAuthenticated:", error);
  }

  return { authenticated: false };
}
