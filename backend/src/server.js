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
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/flights', flightRoutes);

app.get('/', (req, res) => {
    res.send('SkyLog API is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
