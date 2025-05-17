'use client';

import { useAuth } from '@/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/photos');
    } else {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  return null; // Страница не будет отображаться, так как происходит редирект
} 