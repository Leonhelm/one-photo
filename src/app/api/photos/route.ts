import { NextRequest, NextResponse } from 'next/server';
import { Client } from '@microsoft/microsoft-graph-client';
import { getTokenFromHeader } from '@/lib/auth';

interface FilterParams {
    date: string;
    directoryPath: string;
}

async function getPhotosFromFolder(client: Client, folderId: string, filterDate?: Date): Promise<any[]> {
    console.log('Получаем содержимое папки:', folderId);
    
    try {
        const response = await client
            .api(`/me/drive/items/${folderId}/children`)
            .select('id,name,file,webUrl,lastModifiedDateTime,folder,thumbnails')
            .expand('thumbnails')
            .get();

        if (!response || !response.value) {
            console.error('Неожиданный формат ответа от Graph API:', response);
            return [];
        }

        const photos: any[] = [];
        const folders: any[] = [];

        // Разделяем файлы и папки
        for (const item of response.value) {
            if (item.folder) {
                folders.push(item);
            } else if (item.file) {
                // Если указана дата, фильтруем по ней
                if (filterDate) {
                    const itemDate = new Date(item.lastModifiedDateTime);
                    if (itemDate.getDate() === filterDate.getDate() && 
                        itemDate.getMonth() === filterDate.getMonth()) {
                        photos.push(item);
                    }
                } else {
                    photos.push(item);
                }
            }
        }

        // Рекурсивно обходим подпапки
        for (const folder of folders) {
            console.log('Обходим подпапку:', folder.name);
            try {
                const subPhotos = await getPhotosFromFolder(client, folder.id, filterDate);
                photos.push(...subPhotos);
            } catch (error) {
                console.error(`Ошибка при обходе подпапки ${folder.name}:`, error);
                // Продолжаем работу с другими папками
            }
        }

        return photos;
    } catch (error) {
        console.error('Ошибка при получении содержимого папки:', error);
        throw error;
    }
}

export async function GET(request: NextRequest) {
    try {
        const token = getTokenFromHeader(request);
        if (!token) {
            console.error('Токен не найден в заголовке запроса');
            return NextResponse.json(
                { error: 'Требуется авторизация' },
                { status: 401 }
            );
        }

        console.log('Токен получен, инициализация Graph клиента...');

        const client = Client.init({
            authProvider: (done) => {
                done(null, token);
            }
        });

        // Получаем все файлы из корневой директории
        console.log('Запрашиваем список файлов...');
        const rootResponse = await client
            .api('/me/drive/root')
            .select('id')
            .get();

        if (!rootResponse || !rootResponse.id) {
            console.error('Не удалось получить ID корневой папки');
            return NextResponse.json(
                { error: 'Не удалось получить доступ к корневой папке' },
                { status: 500 }
            );
        }

        // Рекурсивно получаем все файлы
        const allFiles = await getPhotosFromFolder(client, rootResponse.id);
        console.log('Всего найдено файлов:', allFiles.length);

        // Фильтруем только изображения
        const photos = allFiles
            .filter((item: any) => {
                const isImage = item.file.mimeType?.startsWith('image/');
                if (!isImage) {
                    console.log('Пропускаем не изображение:', {
                        name: item.name,
                        mimeType: item.file.mimeType
                    });
                    return false;
                }

                console.log('Найдено изображение:', {
                    name: item.name,
                    mimeType: item.file.mimeType
                });

                return true;
            })
            .map((item: any) => ({
                id: item.id,
                name: item.name,
                webUrl: item.webUrl,
                lastModifiedDateTime: item.lastModifiedDateTime,
                thumbnailUrl: item.thumbnails?.[0]?.small?.url || null
            }))
            .sort((a: any, b: any) => 
                new Date(b.lastModifiedDateTime).getTime() - new Date(a.lastModifiedDateTime).getTime()
            )
            .slice(0, 10);

        console.log('Отфильтрованные фотографии:', photos);

        return NextResponse.json(photos);
    } catch (error) {
        console.error('Ошибка при загрузке фотографий:', error);
        return NextResponse.json(
            { error: 'Ошибка при загрузке фотографий' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const token = getTokenFromHeader(request);
        if (!token) {
            return NextResponse.json(
                { error: 'Требуется авторизация' },
                { status: 401 }
            );
        }

        const body = await request.json() as FilterParams;
        const filterDate = body.date ? new Date(body.date) : undefined;
        const directoryPath = body.directoryPath || '';

        const client = Client.init({
            authProvider: (done) => {
                done(null, token);
            }
        });

        // Получаем ID папки по пути или корневую папку, если путь пустой
        const folderResponse = directoryPath 
            ? await client
                .api(`/me/drive/root:${directoryPath}:`)
                .select('id')
                .get()
            : await client
                .api('/me/drive/root')
                .select('id')
                .get();

        if (!folderResponse || !folderResponse.id) {
            return NextResponse.json(
                { error: 'Указанная директория не найдена' },
                { status: 404 }
            );
        }

        // Получаем фотографии из указанной папки с фильтрацией по дате
        const photos = await getPhotosFromFolder(client, folderResponse.id, filterDate);

        // Фильтруем только изображения
        const filteredPhotos = photos
            .filter((item: any) => item.file.mimeType?.startsWith('image/'))
            .map((item: any) => ({
                id: item.id,
                name: item.name,
                webUrl: item.webUrl,
                lastModifiedDateTime: item.lastModifiedDateTime,
                thumbnailUrl: item.thumbnails?.[0]?.small?.url || null
            }))
            .sort((a: any, b: any) => 
                new Date(b.lastModifiedDateTime).getTime() - new Date(a.lastModifiedDateTime).getTime()
            );

        return NextResponse.json(filteredPhotos);
    } catch (error) {
        console.error('Ошибка при загрузке фотографий:', error);
        return NextResponse.json(
            { error: 'Ошибка при загрузке фотографий' },
            { status: 500 }
        );
    }
} 