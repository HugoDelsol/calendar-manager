import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [entreprise, setEntreprise] = useState(
        JSON.parse(localStorage.getItem('entreprise')) || null
    );

    function login(token, entreprise) {
        localStorage.setItem('token', token);
        localStorage.setItem('entreprise', JSON.stringify(entreprise));
        setToken(token);
        setEntreprise(entreprise);
    }

    function logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('entreprise');
        setToken(null);
        setEntreprise(null);
    }

    return (
        <AuthContext.Provider value={{ token, entreprise, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

// Hook personnalisé pour utiliser le contexte facilement
export function useAuth() {
    return useContext(AuthContext);
}