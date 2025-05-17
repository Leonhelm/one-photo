import { ConfidentialClientApplication } from '@azure/msal-node';
import { NextRequest, NextResponse } from 'next/server';

const msalConfig = {
    auth: {
        clientId: process.env.AZURE_CLIENT_ID || '',
        clientSecret: process.env.AZURE_CLIENT_SECRET || '',
        authority: 'https://login.microsoftonline.com/consumers',
        redirectUri: process.env.REDIRECT_URI || 'http://localhost:3000/api/auth/callback'
    }
};

export async function GET(request: NextRequest) {
    try {
        console.log('Callback получен. Параметры:', Object.fromEntries(request.nextUrl.searchParams));
        
        const searchParams = request.nextUrl.searchParams;
        const code = searchParams.get('code');
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');
        
        if (error) {
            console.error('Ошибка от Microsoft:', { error, errorDescription });
            throw new Error(`Ошибка авторизации: ${error} - ${errorDescription}`);
        }
        
        if (!code) {
            console.error('Код авторизации отсутствует в параметрах');
            throw new Error('Код авторизации не получен');
        }

        console.log('Конфигурация MSAL:', {
            clientId: msalConfig.auth.clientId ? 'установлен' : 'отсутствует',
            clientSecret: msalConfig.auth.clientSecret ? 'установлен' : 'отсутствует',
            redirectUri: msalConfig.auth.redirectUri
        });

        const msalInstance = new ConfidentialClientApplication(msalConfig);
        console.log('Попытка получения токена...');
        
        const response = await msalInstance.acquireTokenByCode({
            code,
            scopes: ['User.Read', 'Files.Read.All'],
            redirectUri: msalConfig.auth.redirectUri
        });

        console.log('Ответ от MSAL:', {
            success: !!response,
            hasToken: !!response?.accessToken,
            tokenType: response?.tokenType,
            expiresOn: response?.expiresOn
        });

        if (!response || !response.accessToken) {
            throw new Error('Не удалось получить токен доступа');
        }

        // Перенаправляем на страницу фотографий с токеном
        const redirectUrl = new URL('/photos', request.url);
        redirectUrl.searchParams.set('token', response.accessToken);
        
        console.log('Перенаправление на:', redirectUrl.toString());
        return NextResponse.redirect(redirectUrl);
    } catch (error) {
        console.error('Детальная ошибка в callback:', {
            message: error instanceof Error ? error.message : 'Неизвестная ошибка',
            stack: error instanceof Error ? error.stack : undefined,
            error
        });
        return NextResponse.redirect(new URL('/login?error=auth_failed', request.url));
    }
} 