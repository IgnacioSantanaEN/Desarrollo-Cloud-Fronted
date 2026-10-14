import { useState } from 'react';
import { useMsal } from '@azure/msal-react';
import { InteractionRequiredAuthError } from '@azure/msal-browser';
import { protectedResources } from '../authConfig.js';

export default function ApiPage() {
    const { instance, accounts } = useMsal();
    const [resultado, setResultado] = useState('');
    
    const [logLevel, setLogLevel] = useState("INFO");
    const [logMessage, setLogMessage] = useState('');
    const [batchCount, setBatchCount] = useState(10);

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

    const enviarLogRabbit = async (e) => {
        e.preventDefault();
    
        if (!logMessage.trim()) {
            alert("Por favor, ingrese un mensaje de log.");
            return;
        }

        try {
            const response = await fetch('http://localhost:8080/log', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    level: logLevel,
                    message: logMessage,
                }),
            });

            const data = await response.text();
            setResultado(`[RabbitMQ response]: ${data}`);
            setLogMessage('');
        } catch (error) {
            console.error(error);
            setResultado('Error al enviar el log a RabbitMQ.');
        }
    };

    const enviarLogBatchRabbit = async () => {
        try {
            const response = await fetch(`http://localhost:8080/log/batch?count=${batchCount}&severity=${logLevel}`, {
                method: 'POST',
            });

            const data = await response.text();
            setResultado(`[RabbitMQ Batch response]: ${data}`);
        } catch (error) {
            console.error(error);
            setResultado('Error al enviar la ráfaga de logs a RabbitMQ.');
        }
    };

    const buttonStyle = {
        backgroundColor: '#0078d4',
        color: 'white',
        padding: '10px',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
    };

    return (
        <section style={{ padding: '20px', maxWidth: '600px' }}>
            <h2>Consulta de Servicios & Mensajería</h2>

            {/* Sección 1: Consumo API Gateway original */}
            <div style={{ marginBottom: '30px', padding: '15px', border: '1px solid #ccc', borderRadius: '8px' }}>
                <h3>1. API Gateway (AWS)</h3>
                <button onClick={llamarApi} style={buttonStyle}>
                    Llamar a API Gateway (/datos)
                </button>
            </div>

            {/* Sección 2: Integración con RabbitMQ */}
            <div style={{ padding: '15px', border: '1px solid #0078d4', borderRadius: '8px' }}>
                <h3>2. Emisor de Logs Asíncronos (RabbitMQ)</h3>
                <form onSubmit={enviarLogRabbit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <label>
                        <strong>Nivel de Severidad (Routing Key):</strong>
                        <select 
                            value={logLevel} 
                            onChange={(e) => setLogLevel(e.target.value)}
                            style={{ marginLeft: '10px', padding: '5px' }}
                        >
                            <option value="INFO">INFO (AllLogsQueue)</option>
                            <option value="WARNING">WARNING (AllLogsQueue)</option>
                            <option value="ERROR">ERROR (AllLogsQueue & ErrorLogsQueue)</option>
                        </select>
                    </label>

                    <label style={{ display: 'flex', flexDirection: 'column' }}>
                        <strong>Mensaje de Log:</strong>
                        <input
                            type="text"
                            value={logMessage}
                            onChange={(e) => setLogMessage(e.target.value)}
                            placeholder="Ej: Fallo en el proceso de autenticación"
                            style={{ padding: '8px', marginTop: '5px' }}
                        />
                    </label>

                    <label style={{ display: 'flex', flexDirection: 'column' }}>
                        <strong>Cantidad para envío masivo (Ráfaga):</strong>
                        <input
                            type="number"
                            min="1"
                            max="500"
                            value={batchCount}
                            onChange={(e) => setBatchCount(e.target.value)}
                            style={{ padding: '8px', marginTop: '5px' }}
                        />
                    </label>

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button type="submit" style={{ ...buttonStyle, flex: 1 }}>
                            Enviar Log a RabbitMQ
                        </button>

                        <button 
                            type="button" 
                            onClick={enviarLogBatchRabbit} 
                            style={{ ...buttonStyle, flex: 1 }}
                        >
                            Enviar Ráfaga de Logs (/log/batch)
                        </button>
                    </div>
                </form>
            </div>

            {/* Consola de Resultados Visuales */}
            <div style={{ marginTop: '20px' }}>
                <h4>Respuesta / Salida:</h4>
                <pre style={{ backgroundColor: '#f4f4f4', padding: '10px', borderRadius: '5px', overflowX: 'auto' }}>
                    {resultado || 'No hay acciones ejecutadas.'}
                </pre>
            </div>
        </section>
    );
}