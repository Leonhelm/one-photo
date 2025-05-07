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

    if (!code) {
      return NextResponse.json({ error: 'No code provided' }, { status: 400 });
    }

    const tokenResponse = await cca.acquireTokenByCode({
      code,
      scopes: loginRequest.scopes,
      redirectUri: msalConfig.auth.redirectUri
    });

    return NextResponse.json({ accessToken: tokenResponse.accessToken });
  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to get token',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 