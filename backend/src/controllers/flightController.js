import Flight from '../models/Flight.js';

// @desc    Obtener todos los movimientos (Más recientes primero)
// @route   GET /api/flights
export const getFlights = async (req, res) => {
    try {
        const flights = await Flight.find().sort({ createdAt: -1 });
        res.status(200).json(flights);
    } catch (error) {
        res.status(500).json({ 
            message: "Error al obtener la planilla de movimientos", 
            error: error.message 
        });
    }
};

// @desc    Registrar nuevo movimiento de aeronave
// @route   POST /api/flights
export const createFlight = async (req, res) => {
    try {
        // req.body ahora contiene gradoOficial, nombreOficial, lupOficial
        const newFlight = new Flight(req.body);
        const savedFlight = await newFlight.save();
        res.status(201).json(savedFlight);
    } catch (error) {
        res.status(400).json({ 
            message: "Error de validación: Verifique que todos los campos del Oficial y la Aeronave estén completos.", 
            error: error.message 
        });
    }
};

// @desc    Actualizar un registro existente
// @route   PUT /api/flights/:id
export const updateFlight = async (req, res) => {
    try {
        const updatedFlight = await Flight.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!updatedFlight) return res.status(404).json({ message: "El registro no existe" });
        res.status(200).json(updatedFlight);
    } catch (error) {
        res.status(400).json({ message: "Error al actualizar", error: error.message });
    }
};

// @desc    Eliminar un registro de la planilla
// @route   DELETE /api/flights/:id
export const deleteFlight = async (req, res) => {
    try {
        const flight = await Flight.findByIdAndDelete(req.params.id);
        if (!flight) return res.status(404).json({ message: "El registro ya fue eliminado previamente" });
        res.status(200).json({ message: "Movimiento eliminado correctamente" });
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar el registro", error: error.message });
    }
};