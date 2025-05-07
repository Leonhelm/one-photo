'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from "./page.module.css";

interface Photo {
  id: string;
  name: string;
  webUrl: string;
  '@microsoft.graph.downloadUrl': string;
}

export default function Home() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError(null);

      const authResponse = await fetch('/api/auth', {
        method: 'POST',
      });

      const data = await authResponse.json();

      if (!authResponse.ok) {
        throw new Error(data.details || 'Authentication failed');
      }

      if (data.error) {
        throw new Error(data.error);
      }

      // Перенаправляем на страницу авторизации Microsoft
      window.location.href = data.authUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadPhotos = async () => {
      const token = localStorage.getItem('access_token');
      console.log('Checking for token:', token ? 'Token exists' : 'No token');
      
      if (token) {
        try {
          setLoading(true);
          // Получаем фотографии
          const photosResponse = await fetch(`/api/photos?token=${token}`);
          const photosData = await photosResponse.json();

          if (!photosResponse.ok) {
            throw new Error(photosData.details || 'Failed to fetch photos');
          }

          console.log('Photos loaded:', {
            count: photosData.length,
            firstItem: photosData[0] ? {
              id: photosData[0].id,
              name: photosData[0].name,
              hasDownloadUrl: !!photosData[0]['@microsoft.graph.downloadUrl']
            } : null
          });

          setPhotos(photosData);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'An error occurred');
          console.error('Load photos error:', err);
          // Если произошла ошибка, возможно токен истек
          localStorage.removeItem('access_token');
        } finally {
          setLoading(false);
        }
      }
    };

    loadPhotos();
  }, []);

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <Image
          className={styles.logo}
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />
        <ol>
          <li>
            Get started by editing <code>src/app/page.tsx</code>.
          </li>
          <li>Save and see your changes instantly.</li>
        </ol>

        <div className={styles.ctas}>
          <a
            className={styles.primary}
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className={styles.logo}
              src="/vercel.svg"
              alt="Vercel logomark"
              width={20}
              height={20}
            />
            Deploy now
          </a>
          <a
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.secondary}
          >
            Read our docs
          </a>
        </div>

        <button
          onClick={handleLogin}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Login with OneDrive'}
        </button>

        {error && (
          <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        {loading && (
          <div className="mt-4 p-4 bg-blue-100 text-blue-700 rounded">
            Загрузка фотографий...
          </div>
        )}

        {!loading && !error && photos.length === 0 && (
          <div className="mt-4 p-4 bg-yellow-100 text-yellow-700 rounded">
            Нет доступных фотографий
          </div>
        )}

        <div className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-4">
          {photos.map((photo) => (
            <div key={photo.id} className="relative aspect-square">
              <Image
                src={photo['@microsoft.graph.downloadUrl']}
                alt={photo.name}
                fill
                className="object-cover rounded"
              />
            </div>
          ))}
        </div>
      </main>
      <footer className={styles.footer}>
        <a
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Learn
        </a>
        <a
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to nextjs.org →
        </a>
      </footer>
    </div>
  );
}
