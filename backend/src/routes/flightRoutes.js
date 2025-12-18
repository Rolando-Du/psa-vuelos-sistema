import express from 'express';
import { 
    getFlights, 
    createFlight, 
    updateFlight, 
    deleteFlight 
} from '../controllers/flightController.js';

const router = express.Router();

// Operaciones en la raíz: /api/flights
router.route('/')
    .get(getFlights)    // Listar todos los vuelos
    .post(createFlight); // Crear un nuevo vuelo

// Operaciones por ID: /api/flights/:id
router.route('/:id')
    .put(updateFlight)    // Editar un vuelo existente
    .delete(deleteFlight); // Borrar un registro

export default router;