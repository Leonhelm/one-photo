import { ConfidentialClientApplication } from '@azure/msal-node';
import { msalConfig, loginRequest } from '@/config/auth';
import { NextResponse } from 'next/server';

const cca = new ConfidentialClientApplication({
  auth: {
    clientId: msalConfig.auth.clientId,
    clientSecret: msalConfig.auth.clientSecret,
    authority: msalConfig.auth.authority
  }
});

export async function POST() {
  try {
    console.log('Starting authentication process...');
    
    // Создаем URL для авторизации
    const authUrl = await cca.getAuthCodeUrl({
      scopes: loginRequest.scopes,
      redirectUri: msalConfig.auth.redirectUri
    });

    return NextResponse.json({ 
      authUrl
    });
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json({ 
      error: 'Authentication failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 