import express from 'express';
import {
    getFlights,
    getFlightsAnulados,
    createFlight,
    anularFlight,
    searchByMatricula // Función para autocompletado por matrícula
} from '../controllers/flightController.js';

import { protect } from '../middlewares/auth.js';

const router = express.Router();

/**
 * RUTAS DE CONSULTA (GET)
 * Estas rutas obtienen los listados y datos para autocompletado.
 */

// Obtener vuelos activos (con paginación y filtros)
router.get('/', getFlights);

// Obtener vuelos anulados (con paginación y filtros)
router.get('/anulados', getFlightsAnulados);

// Buscar datos históricos de una matrícula (para autocompletar el formulario)
router.get('/search-matricula/:matricula', searchByMatricula);


/**
 * RUTAS DE ACCIÓN (POST / PATCH)
 * Estas rutas requieren autenticación (protect) ya que modifican la base de datos.
 */

// Crear un nuevo registro de vuelo
router.post('/', protect, createFlight);

// Anular un registro existente (cambia estado a ANULADO y guarda observaciones)
router.patch('/:id/anular', protect, anularFlight);

export default router;