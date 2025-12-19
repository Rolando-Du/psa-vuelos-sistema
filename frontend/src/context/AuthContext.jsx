import React, { createContext, useState } from 'react';
import api from '../api/axios';


const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            const parsedUser = JSON.parse(savedUser);
            api.defaults.headers.common['Authorization'] = `Bearer ${parsedUser.token}`;
            return parsedUser;
        }
        return null;
    });

    const login = async (username, password) => {
        const res = await api.post('/auth/login', { username, password });
        const userData = res.data;
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        api.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
        return userData;
    };

    const register = async (userData) => {
        const res = await api.post('/auth/register', userData);
        return res.data;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
        delete api.defaults.headers.common['Authorization'];
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, register, loading: false }}>
            {children}
        </AuthContext.Provider>
    );
};

// Exportamos el contexto de forma predeterminada para que el hook lo use internamente
export default AuthContext;