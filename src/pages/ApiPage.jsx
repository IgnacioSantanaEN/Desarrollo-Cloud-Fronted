import { useState } from 'react';
import { useMsal } from '@azure/msal-react';
import { InteractionRequiredAuthError } from '@azure/msal-browser';
import { protectedResources } from '../authConfig.js';

export default function ApiPage() {
    const { instance, accounts } = useMsal();
    const [resultado, setResultado] = useState('');
    
    const llamarApi = async () => {
        if (accounts.length === 0) {
        setResultado('Debe iniciar sesión primero.');
        return;
    }

    const tokenRequest = {
        scopes: protectedResources.api.scopes,
        account: accounts[0],
    };

    try {
        const tokenResponse = await instance.acquireTokenSilent(tokenRequest);
        const response = await fetch(
            `${protectedResources.api.endpoint}/datos`,
        {
            headers: {
            Authorization: `Bearer ${tokenResponse.accessToken}`,
            },
        }  
    );

    const data = await response.json();
    setResultado(JSON.stringify(data, null, 2));
        } catch (error) {
            if (error instanceof InteractionRequiredAuthError) {
                await instance.acquireTokenRedirect(tokenRequest);
                return;
            }

            console.error(error);
            setResultado('Error al llamar a la API.');
        }
    };

    return (
        <section>
            <button onClick={llamarApi}>Llamar a la API</button>
            <pre>{resultado}</pre>
        </section>
    );
}
 