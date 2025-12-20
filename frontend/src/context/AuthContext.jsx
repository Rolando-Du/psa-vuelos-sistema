import React, { createContext, useState } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // 1. Al iniciar, buscamos en sessionStorage (se borra al cerrar la pestaña)
    const [user, setUser] = useState(() => {
        const savedUser = sessionStorage.getItem('user'); 
        if (savedUser) {
            try {
                const parsedUser = JSON.parse(savedUser);
                // Restauramos el token para axios
                api.defaults.headers.common['Authorization'] = `Bearer ${parsedUser.token}`;
                return parsedUser;
            // eslint-disable-next-line no-unused-vars
            } catch (error) {
                return null;
            }
        }
        return null;
    });

    const login = async (username, password) => {
        const res = await api.post('/auth/login', { username, password });
        const userData = res.data;
        
        setUser(userData);
        // 2. Guardamos en sessionStorage
        sessionStorage.setItem('user', JSON.stringify(userData)); 
        
        // Configuramos el token en axios para futuras peticiones
        api.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
        return userData;
    };

    const register = async (userData) => {
        const res = await api.post('/auth/register', userData);
        return res.data;
    };

    const logout = () => {
        setUser(null);
        // 3. Limpiamos sessionStorage
        sessionStorage.removeItem('user'); 
        delete api.defaults.headers.common['Authorization'];
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, register, loading: false }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;