export const msalConfig = {
  auth: {
    clientId: process.env.NEXT_PUBLIC_CLIENT_ID || '',
    clientSecret: process.env.CLIENT_SECRET || '',
    authority: 'https://login.microsoftonline.com/consumers',
    redirectUri: process.env.NEXT_PUBLIC_REDIRECT_URI || 'http://localhost:3000/auth/callback'
  }
};

export const loginRequest = {
  scopes: [
    'Files.Read',
    'Files.Read.All',
    'Files.ReadWrite',
    'Files.ReadWrite.All',
    'offline_access'
  ]
}; 