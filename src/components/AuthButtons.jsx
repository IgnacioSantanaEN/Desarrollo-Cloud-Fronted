import { useMsal, useIsAuthenticated } from '@azure/msal-react';
import { loginRequest } from '../authConfig.js';

export default function AuthButtons() {
    const { instance } = useMsal();
    const isAuthenticated = useIsAuthenticated();

    const login = () => {
        instance.loginRedirect(loginRequest);
    };

    const logout = () => {
        instance.logoutRedirect();
    };
    
    return isAuthenticated ? (
        <button onClick={logout}>Cerrar sesión</button>

    ):(
        <button onClick={login}>Iniciar sesión</button>
    );
}
