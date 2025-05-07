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

export async function POST(request: Request) {
  try {
    const { code } = await request.json();
    console.log('Received code:', code);

    if (!code) {
      console.log('No code provided');
      return NextResponse.json({ error: 'No code provided' }, { status: 400 });
    }

    console.log('Config:', {
      clientId: msalConfig.auth.clientId,
      redirectUri: msalConfig.auth.redirectUri,
      scopes: loginRequest.scopes
    });

    const tokenResponse = await cca.acquireTokenByCode({
      code,
      scopes: loginRequest.scopes,
      redirectUri: msalConfig.auth.redirectUri
    });

    console.log('Token response received');
    return NextResponse.json({ accessToken: tokenResponse.accessToken });
  } catch (error) {
    console.error('Token error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return NextResponse.json({ 
      error: 'Failed to get token',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 