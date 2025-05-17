'use client';

import { useAuth } from '@/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
    Box,
    Button,
    Container,
    Paper,
    Typography,
    CircularProgress,
    Alert,
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';

interface UserData {
    displayName: string;
    userPrincipalName: string;
}

interface Photo {
    id: string;
    name: string;
    webUrl: string;
    thumbnailUrl: string;
    lastModifiedDateTime: string;
}

export default function PhotosPage() {
    const { isAuthenticated, accessToken, logout } = useAuth();
    const router = useRouter();
    const [userData, setUserData] = useState<UserData | null>(null);
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isAuthenticated || !accessToken) {
            router.push('/login');
            return;
        }

        async function fetchData() {
            try {
                // Загрузка данных пользователя
                const userResponse = await fetch('/api/user', {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                });

                if (!userResponse.ok) {
                    if (userResponse.status === 401) {
                        logout();
                        return;
                    }
                    throw new Error('Ошибка при получении данных пользователя');
                }

                const userData = await userResponse.json();
                setUserData(userData);

                // Загрузка фотографий
                const photosResponse = await fetch('/api/photos', {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                });

                if (!photosResponse.ok) {
                    if (photosResponse.status === 401) {
                        logout();
                        return;
                    }
                    throw new Error('Ошибка при загрузке фотографий');
                }

                const photosData = await photosResponse.json();
                setPhotos(photosData);
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

        fetchData();
    }, [isAuthenticated, accessToken, router, logout]);

    if (!isAuthenticated) {
        return null;
    }

    if (loading) {
        return (
            <Box
                sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Container maxWidth="md" sx={{ mt: 4 }}>
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
                <Button
                    variant="contained"
                    onClick={() => window.location.reload()}
                >
                    Попробовать снова
                </Button>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h4" component="h1">
                    Ваши последние фотографии
                </Typography>
                <Button
                    variant="outlined"
                    color="error"
                    startIcon={<LogoutIcon />}
                    onClick={logout}
                >
                    Выйти
                </Button>
            </Box>
            <Paper sx={{ p: 3 }}>
                {userData ? (
                    <Box>
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                            Добро пожаловать, <strong>{userData.displayName}</strong>!
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {userData.userPrincipalName}
                        </Typography>
                    </Box>
                ) : (
                    <Typography color="text.secondary">
                        Не удалось загрузить данные пользователя
                    </Typography>
                )}
            </Paper>
        </Container>
    );
} 