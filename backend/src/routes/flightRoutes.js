import express from 'express';
import { 
    getFlights, 
    createFlight, 
    updateFlight, 
    deleteFlight,
    searchByDni,
    searchByMatricula,
    searchOficialByName 
} from '../controllers/flightController.js';

const router = express.Router();

/**
 * MIDDLEWARE DE DIAGNÓSTICO
 * Este bloque imprimirá en la consola de tu BACKEND (la terminal negra)
 * qué ruta se está intentando acceder. Ayuda a identificar el Error 400.
 */
router.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    next();
});

// --- RUTAS BASE ---
// GET  /api/flights -> Obtiene la lista completa
// POST /api/flights -> Registra un nuevo vuelo
router.get('/', getFlights);
router.post('/', createFlight);

// --- RUTAS DE BÚSQUEDA ---
// IMPORTANTE: Deben estar definidas ANTES de las rutas con ':id' 
// para evitar que Express confunda "search" con un ID de MongoDB.
router.get('/search/dni/:dni', searchByDni);
router.get('/search/matricula/:matricula', searchByMatricula);
router.get('/search/oficial/:nombre', searchOficialByName);

// --- RUTAS DE ACCIÓN POR ID ---
// PUT    /api/flights/:id -> Actualiza o anula un vuelo
// DELETE /api/flights/:id -> Elimina físicamente de la BD
router.put('/:id', updateFlight);
router.delete('/:id', deleteFlight);

export default router;