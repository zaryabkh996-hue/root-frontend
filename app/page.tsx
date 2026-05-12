'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen bg-[#0e2218]">
      <div className="text-center">
        <div className="animate-spin inline-block w-12 h-12 border-4 border-[#dfbe6c] border-t-transparent rounded-full mb-4"></div>
        <p className="text-[#dfbe6c] font-semibold">Redirecting...</p>
      </div>
    </div>
  );
}
