import { ConfidentialClientApplication } from '@azure/msal-node';
import { NextResponse } from 'next/server';

const msalConfig = {
    auth: {
        clientId: process.env.AZURE_CLIENT_ID || '',
        clientSecret: process.env.AZURE_CLIENT_SECRET || '',
        authority: 'https://login.microsoftonline.com/consumers',
        redirectUri: process.env.REDIRECT_URI || 'http://localhost:3000/api/auth/callback'
    }
};

const loginRequest = {
    scopes: ['User.Read', 'Files.Read.All']
};

export async function POST() {
    try {
        console.log('Начало процесса авторизации');
        console.log('Конфигурация MSAL:', {
            clientId: msalConfig.auth.clientId ? 'установлен' : 'отсутствует',
            clientSecret: msalConfig.auth.clientSecret ? 'установлен' : 'отсутствует',
            redirectUri: msalConfig.auth.redirectUri
        });

        // Проверяем наличие необходимых переменных окружения
        if (!process.env.AZURE_CLIENT_ID || !process.env.AZURE_CLIENT_SECRET) {
            console.error('Отсутствуют переменные окружения:', {
                hasClientId: !!process.env.AZURE_CLIENT_ID,
                hasClientSecret: !!process.env.AZURE_CLIENT_SECRET
            });
            throw new Error('Отсутствуют необходимые переменные окружения для авторизации');
        }

        const msalInstance = new ConfidentialClientApplication(msalConfig);
        console.log('MSAL instance создан, получение URL авторизации...');
        
        // Получаем URL для авторизации
        const authUrl = await msalInstance.getAuthCodeUrl({
            scopes: loginRequest.scopes,
            redirectUri: msalConfig.auth.redirectUri
        });

        console.log('URL авторизации получен:', authUrl);
        return NextResponse.json({ authUrl });
    } catch (error) {
        console.error('Детальная ошибка авторизации:', {
            message: error instanceof Error ? error.message : 'Неизвестная ошибка',
            stack: error instanceof Error ? error.stack : undefined,
            error
        });
        return NextResponse.json(
            { 
                error: 'Ошибка авторизации',
                details: error instanceof Error ? error.message : 'Неизвестная ошибка'
            },
            { status: 500 }
        );
    }
} 