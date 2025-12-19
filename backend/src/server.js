import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import flightRoutes from './routes/flightRoutes.js';
import authRoutes from './routes/authRoutes.js';

// Configuración
dotenv.config();
connectDB();

const app = express();

// Middlewares
// Al dejar cors() vacío, permites que Vercel se conecte sin restricciones
app.use(cors());
app.use(express.json());

// RUTAS ACTUALIZADAS
// Al usar '/api', las rutas de flightRoutes responderán en la raíz de la API.
app.use('/api/auth', authRoutes);
app.use('/api', flightRoutes);

app.get('/', (req, res) => {
    res.send('SkyLog API is running... 🚀');
});

// El puerto se toma de la variable de entorno de Render (PORT) o 5000 por defecto
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));