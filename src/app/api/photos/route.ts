import { Client } from '@microsoft/microsoft-graph-client';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  console.log('Photos API called with token:', token ? 'Token exists' : 'No token');

  if (!token) {
    console.log('No token provided');
    return NextResponse.json({ error: 'No token provided' }, { status: 401 });
  }

  try {
    console.log('Initializing Graph client');
    const client = Client.init({
      authProvider: (done) => {
        console.log('Auth provider called');
        done(null, token);
      }
    });

    console.log('Fetching photos from OneDrive');
    // Сначала получаем список файлов
    const response = await client.api('/me/drive/root/children')
      .top(100)
      .get();

    // Фильтруем только изображения
    const photos = response.value.filter((item: any) => {
      const mimeType = item.file?.mimeType || '';
      return mimeType.startsWith('image/');
    }).slice(0, 10); // Берем только первые 10

    // Для каждого изображения получаем URL для скачивания
    const photosWithUrls = await Promise.all(photos.map(async (photo: any) => {
      try {
        const downloadUrl = await client.api(`/me/drive/items/${photo.id}`)
          .select('@microsoft.graph.downloadUrl')
          .get();
        return {
          ...photo,
          '@microsoft.graph.downloadUrl': downloadUrl['@microsoft.graph.downloadUrl']
        };
      } catch (error) {
        console.error(`Error getting download URL for ${photo.name}:`, error);
        return photo;
      }
    }));

    console.log('Photos fetched successfully:', {
      count: photosWithUrls.length,
      firstItem: photosWithUrls[0] ? {
        id: photosWithUrls[0].id,
        name: photosWithUrls[0].name,
        hasDownloadUrl: !!photosWithUrls[0]['@microsoft.graph.downloadUrl']
      } : null
    });

    return NextResponse.json(photosWithUrls);
  } catch (error) {
    console.error('Error fetching photos:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json({ 
      error: 'Failed to fetch photos',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 