import { NextRequest, NextResponse } from 'next/server';
import { Client } from '@microsoft/microsoft-graph-client';
import { getTokenFromHeader } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        const token = getTokenFromHeader(request);
        if (!token) {
            return NextResponse.json(
                { error: 'Требуется авторизация' },
                { status: 401 }
            );
        }

        const client = Client.init({
            authProvider: (done) => {
                done(null, token);
            }
        });

        const response = await client
            .api('/me/drive/root/search(q=\'.jpg\')?orderby=lastModifiedDateTime desc&top=10')
            .get();

        const photos = response.value.map((item: any) => ({
            id: item.id,
            name: item.name,
            webUrl: item.webUrl,
            thumbnailUrl: item.thumbnails?.[0]?.small?.url || '',
            lastModifiedDateTime: item.lastModifiedDateTime
        }));

        return NextResponse.json(photos);
    } catch (error) {
        console.error('Ошибка при загрузке фотографий:', error);
        return NextResponse.json(
            { error: 'Ошибка при загрузке фотографий' },
            { status: 500 }
        );
    }
} 