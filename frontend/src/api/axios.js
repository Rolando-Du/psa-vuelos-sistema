import axios from 'axios';

// Creamos una instancia personalizada
const api = axios.create({
    baseURL: 'http://localhost:5000/api', // La URL de tu servidor Node.js
});

export default api;