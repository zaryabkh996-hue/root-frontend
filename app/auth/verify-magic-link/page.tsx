import React, { Suspense } from 'react';
import VerifyClient from './VerifyClient';

export default function VerifyMagicLinkPage() {
  return (
    <Suspense fallback={<div className="bg-forest-deepest min-h-screen flex items-center justify-center"><div className="text-cream/60">Loading verification...</div></div>}>
      <VerifyClient />
    </Suspense>
  );
}
