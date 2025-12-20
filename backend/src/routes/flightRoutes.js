import express from 'express';
import {
    getFlights,
    getFlightsAnulados,
    createFlight,
    anularFlight,
    updateFlight, // Importamos la nueva función de edición
    searchByMatricula,
    exportToExcel,
    exportToPDF,
    exportSingleFlight
} from '../controllers/flightController.js';

import { protect } from '../middlewares/auth.js';

const router = express.Router();

/**
 * RUTAS DE EXPORTACIÓN (REPORTES)
 * Se colocan arriba para evitar conflictos con parámetros dinámicos.
 */

// Exportación general (basada en filtros actuales)
router.get('/export/excel', exportToExcel);
router.get('/export/pdf', exportToPDF);

// Exportación de un vuelo específico por ID
router.get('/export/single/:id/:format', exportSingleFlight);

/**
 * RUTAS DE CONSULTA (GET)
 */

// Obtener vuelos activos (con paginación y filtros)
router.get('/', getFlights);

// Obtener vuelos anulados (con paginación y filtros)
router.get('/anulados', getFlightsAnulados);

// Buscar datos históricos de una matrícula
router.get('/search-matricula/:matricula', searchByMatricula);


/**
 * RUTAS DE ACCIÓN (POST / PATCH / PUT)
 * Requieren token de autenticación para asegurar la integridad de los datos.
 */

// Crear un nuevo registro de vuelo
router.post('/', protect, createFlight);

// Editar un registro existente (Permitido para correcciones)
// Usamos PUT porque actualizamos el recurso con datos específicos
router.put('/:id', protect, updateFlight);

// Anular un registro existente
router.patch('/:id/anular', protect, anularFlight);

export default router;