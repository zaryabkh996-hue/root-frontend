'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/app/lib/authService';
import ReturnedTravellerStories from '@/app/components/ReturnedTravellerStories';

export default function StoriesPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAccess = () => {
      const currentUser = AuthService.getUser();
      setUser(currentUser);
      setLoading(false);
    };
    checkAccess();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-cream/50">Loading workspace...</div>
      </div>
    );
  }

  // Access check: Returned Traveller OR Preparation Tier OR Admin
  const isReturnedTraveller = user?.is_returned_traveller === true;
  const isPrepTier = user?.subscription_tier === 'preparation';
  const isAdmin = user?.role === 'admin';
  const hasAccess = isReturnedTraveller || isPrepTier || isAdmin;

  if (!hasAccess) {
    return (
      <div className="p-8 text-center max-w-md mx-auto mt-20 scard-dark">
        <h2 className="text-2xl font-light text-rose-400 mb-4">Access Restricted</h2>
        <p className="text-cream/70 mb-6">
          The Story Contributor Workspace is only available to registered **Returned Travellers** or users in the **Preparation Tier**.
        </p>
        <button
          className="btn-primary inline-flex items-center gap-2"
          onClick={() => router.push('/#pricing')}
        >
          Upgrade to Preparation Tier
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <ReturnedTravellerStories />
    </div>
  );
}
