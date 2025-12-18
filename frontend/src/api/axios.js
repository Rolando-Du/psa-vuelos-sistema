import axios from 'axios';

// Usamos la variable de entorno de Vite. 
// Si no existe (en local), usará el puerto 5000 por defecto.
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

export default api;