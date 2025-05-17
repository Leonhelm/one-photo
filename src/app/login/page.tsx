'use client';

import { useAuth } from '@/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LoginPage() {
    const { login, isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (isAuthenticated) {
            router.push('/photos');
        }
    }, [isAuthenticated, router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Вход в onePhoto
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Войдите через Microsoft, чтобы просмотреть свои фотографии
                    </p>
                </div>
                <div className="mt-8">
                    <button
                        onClick={login}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#2F2F2F] hover:bg-[#1F1F1F] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2F2F2F]"
                    >
                        <svg className="w-5 h-5 mr-2" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M11.5 0H0V11.5H11.5V0Z" fill="#F25022"/>
                            <path d="M23 0H11.5V11.5H23V0Z" fill="#7FBA00"/>
                            <path d="M11.5 11.5H0V23H11.5V11.5Z" fill="#00A4EF"/>
                            <path d="M23 11.5H11.5V23H23V11.5Z" fill="#FFB900"/>
                        </svg>
                        Войти через Microsoft
                    </button>
                </div>
            </div>
        </div>
    );
} 