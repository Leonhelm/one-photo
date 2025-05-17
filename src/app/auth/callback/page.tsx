'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './styles.module.css';
import { useAuth } from '@/providers/AuthProvider';

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const { setAccessToken } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      
      if (code) {
        try {
          const tokenResponse = await fetch('/api/token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code }),
          });

          const tokenData = await tokenResponse.json();

          if (!tokenResponse.ok) {
            throw new Error(tokenData.details || 'Failed to get token');
          }

          setAccessToken(tokenData.accessToken);
          router.push('/photos');
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to exchange code for token');
        }
      } else {
        setError('No authorization code received');
      }
    };

    handleCallback();
  }, [searchParams, router, setAccessToken]);

  if (error) {
    return (
      <div className={styles.authContainer}>
        <div className={styles.authContent}>
          <h1 className={styles.authTitle}>Ошибка авторизации</h1>
          <p className={styles.authError}>{error}</p>
          <button
            onClick={() => router.push('/')}
            className={styles.authButton}
          >
            Вернуться на главную
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.authContainer}>
      <div className={styles.authContent}>
        <h1 className={styles.authTitle}>Авторизация...</h1>
        <p>Пожалуйста, подождите, пока мы завершим процесс авторизации.</p>
      </div>
    </div>
  );
} 