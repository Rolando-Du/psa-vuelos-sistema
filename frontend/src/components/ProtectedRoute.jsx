import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const ProtectedRoute = ({ children, adminOnly = false }) => {
    const { user, loading } = useAuth();

    // Mientras el sistema verifica la sesión en localStorage
    if (loading) {
        return (
            <div className="min-h-screen bg-[#020617] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-blue-900 border-t-blue-500 rounded-full animate-spin"></div>
                    <span className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
                        Verificando Credenciales...
                    </span>
                </div>
            </div>
        );
    }

    // Si no hay usuario autenticado, redirigir al login
    if (!user) {
        return <Navigate to="/login" />;
    }

    // Si la ruta requiere ser Admin y el usuario es Oficial, redirigir al dashboard
    if (adminOnly && user.role !== 'admin') {
        return <Navigate to="/" />;
    }

    // Si pasa todas las validaciones, renderiza el contenido
    return children;
};

export default ProtectedRoute;