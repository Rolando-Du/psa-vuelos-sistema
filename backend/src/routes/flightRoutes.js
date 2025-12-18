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
    .get(getFlights)   
    .post(createFlight); 

// Operaciones por ID: /api/flights/:id
router.route('/:id')
    .put(updateFlight)   
    .delete(deleteFlight); 

export default router;