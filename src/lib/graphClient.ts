import { Client } from '@microsoft/microsoft-graph-client';
import 'isomorphic-fetch';

export function getGraphClient(accessToken: string): Client {
    return Client.init({
        authProvider: (done) => {
            done(null, accessToken);
        }
    });
}

export async function getRecentPhotos(accessToken: string) {
    const client = getGraphClient(accessToken);
    
    try {
        const response = await client
            .api('/me/drive/root/search(q=\'.jpg\')')
            .orderby('lastModifiedDateTime desc')
            .top(10)
            .get();
            
        return response.value;
    } catch (error) {
        console.error('Ошибка при получении фотографий:', error);
        throw error;
    }
} 