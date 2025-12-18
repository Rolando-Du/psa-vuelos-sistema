import express from 'express';
import { 
    getFlights, 
    createFlight, 
    updateFlight, 
    deleteFlight 
} from '../controllers/flightController.js';

const router = express.Router();

// Estas rutas ahora responden en: /api/
// Ejemplo: GET https://skylog-api.onrender.com/api/
router.route('/')
    .get(getFlights)   
    .post(createFlight); 

// Estas rutas responden en: /api/:id
// Ejemplo: DELETE https://skylog-api.onrender.com/api/64f1...
router.route('/:id')
    .put(updateFlight)   
    .delete(deleteFlight); 

export default router;