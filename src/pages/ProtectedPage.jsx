import { MsalAuthenticationTemplate } from '@azure/msal-react';
import { InteractionType } from '@azure/msal-browser';
import { loginRequest } from '../authConfig.js';

function ContenidoPrivado() {
  return <h2>Contenido visible solo para usuarios autenticados</h2>;
}

export default function ProtectedPage() {
  return (
    <MsalAuthenticationTemplate 
      interactionType={InteractionType.Redirect} 
      authenticationRequest={loginRequest}
    >
      <ContenidoPrivado />
    </MsalAuthenticationTemplate>
  );
}