```typescript
const { PublicClientApplication } = require('@azure/msal-node');
const { Client } = require('@microsoft/microsoft-graph-client');
require('isomorphic-fetch');

const config = {
  auth: {
    clientId: 'ВАШ_CLIENT_ID',
    authority: 'https://login.microsoftonline.com/consumers',
  }
};

const pca = new PublicClientApplication(config);

async function main() {
  const tokenResponse = await pca.acquireTokenByDeviceCode({
    scopes: ['Files.Read', 'offline_access'],
    deviceCodeCallback: (response) => {
      console.log(response.message); // тут будет ссылка и код
    }
  });

  const client = Client.init({
    authProvider: (done) => done(null, tokenResponse.accessToken)
  });

  const res = await client.api('/me/drive/root/children').top(10).get();
  console.log(res.value);
}

main().catch(console.error);
```

Выше базовый скрипт по авторизации и получении 10 фотографий из one drive.

Твоя задача: адаптировать скрипт и написать вокруг этой логики приложение на последней версии next.js