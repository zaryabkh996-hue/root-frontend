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
 * Resolves the user's subscription tier server-side from:
 * 1. The Auth0 session cookie (if logged in via Auth0/OAuth)
 * 2. The Authorization header (if logged in via magic link / password flow)
 */
export async function getUserTier(request: NextRequest): Promise<string> {
  try {
    // 1. Check Auth0 Session
    const session = await auth0.getSession();
    if (session) {
      const backendUser = (session as Record<string, unknown>).backendUser as Record<string, any> | null;
      if (backendUser) {
        if (backendUser.role === 'admin' || backendUser.role === 'custodian') {
          return 'preparation';
        }
        if (backendUser.subscription_tier) {
          return backendUser.subscription_tier;
        }
      }
      
      const backendToken = (session as Record<string, unknown>).backendToken as string | null;
      if (backendToken) {
        const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "";
        if (apiUrl) {
          const res = await fetch(`${apiUrl}/me`, {
            headers: {
              'Authorization': `Bearer ${backendToken}`,
              'Accept': 'application/json',
            },
            cache: 'no-store'
          });
          if (res.ok) {
            const data = await res.json();
            if (data.success && data.data) {
              if (data.data.role === 'admin' || data.data.role === 'custodian') {
                return 'preparation';
              }
              return data.data.subscription_tier || 'free';
            }
          }
        }
      }
    }

    // 2. Check Authorization header
    const authHeader = request.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "";
      if (apiUrl) {
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
            if (data.data.role === 'admin' || data.data.role === 'custodian') {
              return 'preparation';
            }
            return data.data.subscription_tier || 'free';
          }
        }
      }
    }
  } catch (error) {
    console.error("[getUserTier] Failed to fetch user tier:", error);
  }

  return 'free';
}

/**
 * Checks if the current user is a Returned Traveller or an Admin.
 * Returns authorization status along with user object and auth token.
 */
export async function checkIsReturnedTraveller(request: NextRequest): Promise<{ authorized: boolean; user?: any; token?: string }> {
  try {
    // 1. Check Auth0 Session
    const session = await auth0.getSession();
    if (session) {
      const backendUser = (session as Record<string, unknown>).backendUser as Record<string, any> | null;
      if (backendUser && (backendUser.is_returned_traveller || backendUser.role === 'admin')) {
        return { authorized: true, user: backendUser, token: (session as Record<string, unknown>).backendToken as string };
      }
      
      const backendToken = (session as Record<string, unknown>).backendToken as string | null;
      if (backendToken) {
        const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "";
        const res = await fetch(`${apiUrl}/me`, {
          headers: {
            'Authorization': `Bearer ${backendToken}`,
            'Accept': 'application/json',
          },
          cache: 'no-store'
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data) {
            if (data.data.is_returned_traveller || data.data.role === 'admin') {
              return { authorized: true, user: data.data, token: backendToken };
            }
          }
        }
      }
    }

    // 2. Check Authorization header
    const authHeader = request.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "";
      if (apiUrl) {
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
            if (data.data.is_returned_traveller || data.data.role === 'admin') {
              return { authorized: true, user: data.data, token };
            }
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
    // 1. Check Auth0 Session
    const session = await auth0.getSession();
    if (session) {
      const backendUser = (session as Record<string, unknown>).backendUser as Record<string, any> | null;
      const backendToken = (session as Record<string, unknown>).backendToken as string | null;
      if (backendUser && backendToken) {
        return { authenticated: true, user: backendUser, token: backendToken };
      }
    }

    // 2. Check Authorization header
    const authHeader = request.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "";
      if (apiUrl) {
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
    }
  } catch (error) {
    console.error("Error in checkIsAuthenticated:", error);
  }

  return { authenticated: false };
}
