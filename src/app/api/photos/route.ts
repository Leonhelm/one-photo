import { Client } from '@microsoft/microsoft-graph-client';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json({ error: 'No token provided' }, { status: 401 });
  }

  try {
    const client = Client.init({
      authProvider: (done) => {
        done(null, token);
      }
    });

    const response = await client.api('/me/drive/root/children')
      .top(100)
      .get();

    const photos = response.value.filter((item: any) => {
      const mimeType = item.file?.mimeType || '';
      return mimeType.startsWith('image/');
    }).slice(0, 10);

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
        return photo;
      }
    }));

    return NextResponse.json(photosWithUrls);
  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to fetch photos',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 