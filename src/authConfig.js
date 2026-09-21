export const msalConfig = {
    auth: {
        clientId: import.meta.env.VITE_AZURE_CLIENT_ID,
        authority: `https://login.microsoftonline.com/${import.meta.env.VITE_AZURE_TENANT_ID}`,
        redirectUri: window.location.origin,
        postLogoutRedirectUri: window.location.origin,
    },
    cache: {
        cacheLocation: 'sessionStorage',
    },
};

export const loginRequest = {
    scopes: ['openid', 'profile'],
};

export const protectedResources = {
    api: {
        endpoint: import.meta.env.VITE_API_BASE_URL,
        scopes: [import.meta.env.VITE_API_SCOPE],
    },
}