import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const token = request.headers.get('authorization')?.split(' ')[1];
        
        if (!token) {
            return NextResponse.json(
                { error: 'Токен не предоставлен' },
                { status: 401 }
            );
        }

        const response = await fetch('https://graph.microsoft.com/v1.0/me', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Ошибка при получении данных пользователя');
        }

        const userData = await response.json();
        return NextResponse.json(userData);
    } catch (error) {
        console.error('Ошибка при получении данных пользователя:', error);
        return NextResponse.json(
            { error: 'Ошибка при получении данных пользователя' },
            { status: 500 }
        );
    }
} 