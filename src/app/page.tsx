'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from "./page.module.css";
import componentStyles from "./components.module.css";

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

      window.location.href = data.authUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadPhotos = async () => {
      const token = localStorage.getItem('access_token');
      
      if (token) {
        try {
          setLoading(true);
          const photosResponse = await fetch(`/api/photos?token=${token}`);
          const photosData = await photosResponse.json();

          if (!photosResponse.ok) {
            throw new Error(photosData.details || 'Failed to fetch photos');
          }

          setPhotos(photosData);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'An error occurred');
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
          className={componentStyles.button}
        >
          {loading ? 'Loading...' : 'Login with OneDrive'}
        </button>

        {error && (
          <div className={componentStyles.error}>
            {error}
          </div>
        )}

        {loading && (
          <div className={componentStyles.loading}>
            Загрузка фотографий...
          </div>
        )}

        {!loading && !error && photos.length === 0 && (
          <div className={componentStyles.warning}>
            Нет доступных фотографий
          </div>
        )}

        <div className={componentStyles.grid}>
          {photos.map((photo) => (
            <div key={photo.id} className={componentStyles.imageContainer}>
              <Image
                src={photo['@microsoft.graph.downloadUrl']}
                alt={photo.name}
                fill
                className={componentStyles.image}
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
