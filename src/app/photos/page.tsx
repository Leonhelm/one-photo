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
    ImageList,
    ImageListItem,
    ImageListItemBar,
    TextField,
    Grid,
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ru } from 'date-fns/locale';
import type { GridProps } from '@mui/material/Grid';

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

interface FilterState {
    date: Date | null;
    directoryPath: string;
}

export default function PhotosPage() {
    const { isAuthenticated, accessToken, logout } = useAuth();
    const router = useRouter();
    const [userData, setUserData] = useState<UserData | null>(null);
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState<FilterState>({
        date: new Date(),
        directoryPath: process.env.NEXT_PUBLIC_ONEDRIVE_PHOTOS_DIR || '',
    });

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
                console.log('Полученные фотографии:', photosData);
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

    const handleFilterChange = (field: keyof FilterState, value: any) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleFilterSubmit = async () => {
        setLoading(true);
        try {
            const photosResponse = await fetch('/api/photos', {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                method: 'POST',
                body: JSON.stringify(filters)
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
        } finally {
            setLoading(false);
        }
    };

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

            <Paper sx={{ p: 3, mt: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                    Фильтры
                </Typography>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={4} component="div">
                        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
                            <DatePicker
                                label="Дата"
                                value={filters.date}
                                onChange={(newValue: Date | null) => handleFilterChange('date', newValue)}
                                slotProps={{
                                    textField: {
                                        fullWidth: true,
                                        variant: 'outlined'
                                    }
                                }}
                            />
                        </LocalizationProvider>
                    </Grid>
                    <Grid item xs={12} md={6} component="div">
                        <TextField
                            fullWidth
                            label="Путь к директории"
                            value={filters.directoryPath}
                            onChange={(e) => handleFilterChange('directoryPath', e.target.value)}
                            variant="outlined"
                        />
                    </Grid>
                    <Grid item xs={12} md={2} component="div">
                        <Button
                            fullWidth
                            variant="contained"
                            onClick={handleFilterSubmit}
                            disabled={loading}
                        >
                            Применить
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            <Box sx={{ mt: 4 }}>
                {photos.length === 0 ? (
                    <Paper sx={{ p: 3, textAlign: 'center' }}>
                        <Typography variant="body1" color="text.secondary">
                            У вас пока нет фотографий в OneDrive
                        </Typography>
                    </Paper>
                ) : (
                    <ImageList
                        sx={{ width: '100%', height: 'auto' }}
                        cols={3}
                        rowHeight={300}
                        gap={16}
                    >
                        {photos.map((photo) => (
                            <ImageListItem key={photo.id}>
                                <img
                                    src={photo.thumbnailUrl}
                                    alt={photo.name}
                                    loading="lazy"
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                        borderRadius: '8px',
                                    }}
                                    onError={(e) => {
                                        console.error('Ошибка загрузки изображения:', photo.name);
                                        e.currentTarget.src = '/placeholder-image.png';
                                    }}
                                />
                                <ImageListItemBar
                                    title={photo.name}
                                    subtitle={new Date(photo.lastModifiedDateTime).toLocaleDateString('ru-RU')}
                                    sx={{
                                        borderBottomLeftRadius: '8px',
                                        borderBottomRightRadius: '8px',
                                    }}
                                />
                            </ImageListItem>
                        ))}
                    </ImageList>
                )}
            </Box>
        </Container>
    );
} 