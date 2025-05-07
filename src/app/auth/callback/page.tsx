'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      console.log('Callback received with params:', {
        code,
        allParams: Object.fromEntries(searchParams.entries())
      });
      
      if (code) {
        try {
          // Сразу обмениваем код на токен
          const tokenResponse = await fetch('/api/token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code }),
          });

          const tokenData = await tokenResponse.json();
          console.log('Token response:', tokenData);

          if (!tokenResponse.ok) {
            throw new Error(tokenData.details || 'Failed to get token');
          }

          // Сохраняем токен в localStorage
          localStorage.setItem('access_token', tokenData.accessToken);
          
          // Перенаправляем на главную страницу
          router.push('/');
        } catch (err) {
          console.error('Token exchange error:', err);
          setError(err instanceof Error ? err.message : 'Failed to exchange code for token');
        }
      } else {
        setError('No authorization code received');
      }
    };

    handleCallback();
  }, [searchParams, router]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-red-600">Ошибка авторизации</h1>
          <p className="text-red-500">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Вернуться на главную
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Авторизация...</h1>
        <p>Пожалуйста, подождите, пока мы завершим процесс авторизации.</p>
      </div>
    </div>
  );
} 