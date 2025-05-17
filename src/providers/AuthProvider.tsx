'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface AuthContextType {
    isAuthenticated: boolean;
    accessToken: string | null;
    login: () => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        // Проверяем наличие токена в URL после callback
        const token = searchParams.get('token');
        if (token) {
            setAccessToken(token);
            setIsAuthenticated(true);
            // Удаляем токен из URL без редиректа
            const url = new URL(window.location.href);
            url.searchParams.delete('token');
            window.history.replaceState({}, '', url.toString());
        }
    }, [searchParams]);

    const login = async () => {
        try {
            const response = await fetch('/api/auth', {
                method: 'POST',
            });
            
            if (!response.ok) {
                throw new Error('Ошибка авторизации');
            }

            const data = await response.json();
            if (data.authUrl) {
                window.location.href = data.authUrl;
            } else {
                throw new Error('URL авторизации не получен');
            }
        } catch (error) {
            console.error('Ошибка авторизации:', error);
            setIsAuthenticated(false);
            setAccessToken(null);
        }
    };

    const logout = () => {
        setIsAuthenticated(false);
        setAccessToken(null);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, accessToken, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth должен использоваться внутри AuthProvider');
    }
    return context;
} 