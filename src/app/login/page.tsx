'use client';

import { useAuth } from '@/lib/auth/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LoginPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/photos');
    }
  }, [isAuthenticated, router]);

  const handleLogin = async () => {
    // TODO: Реализовать логику авторизации через MSAL
    console.log('Login clicked');
  };

  return (
    <div style={{
      maxWidth: '600px',
      margin: '2rem auto',
      padding: '0 1rem',
      textAlign: 'center'
    }}>
      <h1 style={{ marginBottom: '1rem' }}>
        Добро пожаловать в onePhoto
      </h1>
      <p style={{ marginBottom: '2rem', color: '#666' }}>
        Войдите через Microsoft, чтобы просмотреть свои последние фотографии
      </p>
      <button
        onClick={handleLogin}
        style={{
          padding: '0.75rem 1.5rem',
          fontSize: '1rem',
          backgroundColor: '#0078d4',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Войти через Microsoft
      </button>
    </div>
  );
} 