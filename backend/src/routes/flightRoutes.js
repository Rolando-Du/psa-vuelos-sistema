import express from "express";

import {
  getFlights,
  createFlight,
  updateFlight,
  searchByDni,
  searchByMatricula,
  searchOficialByName,
  getFlightById,
} from "../controllers/flightController.js";

const router = express.Router();

router.use((req, res, next) => {
  console.log(
    `[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`
  );

  next();
});

// Rutas base
router.get("/", getFlights);
router.post("/", createFlight);

// Rutas de búsqueda
router.get("/search/dni/:dni", searchByDni);
router.get("/search/matricula/:matricula", searchByMatricula);
router.get("/search/oficial/:nombre", searchOficialByName);

// Rutas por ID
router.get("/:id", getFlightById);
router.put("/:id", updateFlight);

export default router;