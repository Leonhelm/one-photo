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
    useTheme,
    alpha,
    CircularProgress,
} from '@mui/material';
import ImageIcon from '@mui/icons-material/Image';

const MicrosoftIcon = () => (
    <svg width="24" height="24" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M11.5 0H0V11.5H11.5V0Z" fill="#F25022"/>
        <path d="M23 0H11.5V11.5H23V0Z" fill="#7FBA00"/>
        <path d="M11.5 11.5H0V23H11.5V11.5Z" fill="#00A4EF"/>
        <path d="M23 11.5H11.5V23H23V11.5Z" fill="#FFB900"/>
    </svg>
);

export default function LoginPage() {
    const { login, isAuthenticated } = useAuth();
    const router = useRouter();
    const theme = useTheme();
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthorizing, setIsAuthorizing] = useState(false);

    useEffect(() => {
        if (isAuthenticated) {
            router.push('/photos');
        } else {
            setIsLoading(false);
        }
    }, [isAuthenticated, router]);

    const handleLogin = () => {
        setIsAuthorizing(true);
        login();
    };

    if (isLoading) {
        return (
            <Box
                sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
                }}
            >
                <CircularProgress size={40} />
            </Box>
        );
    }

    return (
        <Box
            sx={{
                minHeight: '100vh',
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                py: 4,
            }}
        >
            <Container maxWidth="sm">
                <Paper
                    elevation={3}
                    sx={{
                        p: { xs: 3, sm: 4 },
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        borderRadius: 2,
                        background: 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(10px)',
                    }}
                >
                    <Box
                        sx={{
                            width: 80,
                            height: 80,
                            borderRadius: '50%',
                            bgcolor: theme.palette.primary.main,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mb: 3,
                            boxShadow: `0 0 20px ${alpha(theme.palette.primary.main, 0.3)}`,
                        }}
                    >
                        <ImageIcon sx={{ fontSize: 40, color: 'white' }} />
                    </Box>

                    <Typography
                        variant="h4"
                        component="h1"
                        gutterBottom
                        sx={{
                            fontWeight: 600,
                            textAlign: 'center',
                            color: theme.palette.text.primary,
                        }}
                    >
                        Добро пожаловать в onePhoto
                    </Typography>

                    <Typography
                        variant="body1"
                        color="text.secondary"
                        sx={{
                            textAlign: 'center',
                            mb: 4,
                            maxWidth: '80%',
                        }}
                    >
                        Войдите через Microsoft, чтобы просмотреть свои последние фотографии из OneDrive
                    </Typography>

                    <Button
                        variant="contained"
                        size="large"
                        startIcon={isAuthorizing ? <CircularProgress size={20} color="inherit" /> : <MicrosoftIcon />}
                        onClick={handleLogin}
                        disabled={isAuthorizing}
                        sx={{
                            py: 1.5,
                            px: 4,
                            backgroundColor: '#2F2F2F',
                            '&:hover': {
                                backgroundColor: '#1F1F1F',
                                transform: 'translateY(-2px)',
                                boxShadow: `0 4px 12px ${alpha('#000', 0.2)}`,
                            },
                            transition: 'all 0.2s ease-in-out',
                            borderRadius: 2,
                            minWidth: 280,
                            '&.Mui-disabled': {
                                backgroundColor: alpha('#2F2F2F', 0.7),
                                color: 'white',
                            },
                        }}
                    >
                        {isAuthorizing ? 'Авторизация...' : 'Войти через Microsoft'}
                    </Button>

                    <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                            mt: 4,
                            textAlign: 'center',
                            opacity: 0.7,
                        }}
                    >
                        Безопасный вход через Microsoft Account
                    </Typography>
                </Paper>
            </Container>
        </Box>
    );
} 