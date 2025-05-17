'use client';

import { useAuth } from '@/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function PhotosPage() {
    const { isAuthenticated, accessToken } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, router]);

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div style={{ 
            minHeight: '100vh',
            backgroundColor: '#f9fafb',
            padding: '2rem'
        }}>
            <div style={{ 
                maxWidth: '1200px',
                margin: '0 auto'
            }}>
                <h1 style={{ 
                    fontSize: '1.875rem',
                    fontWeight: 'bold',
                    color: '#111827',
                    marginBottom: '2rem'
                }}>
                    Ваши последние фотографии
                </h1>
                <div style={{ 
                    backgroundColor: 'white',
                    borderRadius: '0.5rem',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    padding: '1.5rem'
                }}>
                    <p style={{ 
                        color: '#4b5563'
                    }}>
                        Токен получен успешно! Здесь будет отображение фотографий.
                    </p>
                    <pre style={{ 
                        marginTop: '1rem',
                        padding: '1rem',
                        backgroundColor: '#f3f4f6',
                        borderRadius: '0.25rem',
                        overflowX: 'auto'
                    }}>
                        {accessToken ? `Токен: ${accessToken.substring(0, 20)}...` : 'Токен отсутствует'}
                    </pre>
                </div>
            </div>
        </div>
    );
} 