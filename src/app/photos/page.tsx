'use client';

import { useAuth } from '@/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface UserData {
    displayName: string;
    userPrincipalName: string;
}

export default function PhotosPage() {
    const { isAuthenticated, accessToken, logout } = useAuth();
    const router = useRouter();
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isAuthenticated || !accessToken) {
            router.push('/login');
            return;
        }

        async function fetchUserData() {
            try {
                const response = await fetch('/api/user', {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                });

                if (!response.ok) {
                    if (response.status === 401) {
                        logout();
                        return;
                    }
                    throw new Error('Ошибка при получении данных пользователя');
                }

                const data = await response.json();
                setUserData(data);
            } catch (error) {
                console.error('Ошибка:', error);
                setError(error instanceof Error ? error.message : 'Произошла ошибка');
                if (error instanceof Error && error.message.includes('401')) {
                    logout();
                }
            } finally {
                setLoading(false);
            }
        }

        fetchUserData();
    }, [isAuthenticated, accessToken, router, logout]);

    if (!isAuthenticated) {
        return null;
    }

    if (loading) {
        return <div>Загрузка...</div>;
    }

    if (error) {
        return <div>Ошибка: {error}</div>;
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
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '2rem'
                }}>
                    <h1 style={{ 
                        fontSize: '1.875rem',
                        fontWeight: 'bold',
                        color: '#111827',
                        margin: 0
                    }}>
                        Ваши последние фотографии
                    </h1>
                    <button
                        onClick={logout}
                        style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.375rem',
                            cursor: 'pointer',
                            fontSize: '0.875rem'
                        }}
                    >
                        Выйти
                    </button>
                </div>
                <div style={{ 
                    backgroundColor: 'white',
                    borderRadius: '0.5rem',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    padding: '1.5rem'
                }}>
                    {userData ? (
                        <div>
                            <p style={{ 
                                color: '#4b5563',
                                marginBottom: '1rem'
                            }}>
                                Добро пожаловать, <strong>{userData.displayName}</strong>!
                            </p>
                            <p style={{ 
                                color: '#6b7280',
                                fontSize: '0.875rem'
                            }}>
                                {userData.userPrincipalName}
                            </p>
                        </div>
                    ) : (
                        <p style={{ color: '#4b5563' }}>
                            Не удалось загрузить данные пользователя
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
} 