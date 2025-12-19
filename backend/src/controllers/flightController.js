import Flight from '../models/Flight.js';
import Counter from '../models/Counter.js';

// @desc    Obtener todos los movimientos (Más recientes primero)
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

// @desc    Registrar nuevo movimiento de aeronave con Correlativo
export const createFlight = async (req, res) => {
    try {
        if (!req.body.personas || req.body.personas.length === 0) {
            return res.status(400).json({ message: "El manifiesto de personas no puede estar vacío." });
        }

        // 1. Incrementar el contador atómicamente
        const counter = await Counter.findOneAndUpdate(
            { id: 'flight_number' },
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );

        // 2. Generar el número de registro (Ej: SMA-0015/2025)
        const year = new Date().getFullYear();
        const paddedSeq = counter.seq.toString().padStart(4, '0');
        const nroRegistro = `SMA-${paddedSeq}/${year}`;

        // 3. Crear el vuelo incluyendo el nroRegistro
        const newFlight = new Flight({
            ...req.body,
            nroRegistro: nroRegistro
        });
        
        const savedFlight = await newFlight.save();
        
        // 4. Enviamos el objeto completo (que incluye el nroRegistro para el SweetAlert)
        res.status(201).json(savedFlight);

    } catch (error) {
        console.error("Error en CreateFlight:", error);
        
        if (error.name === 'ValidationError') {
            const mensajes = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ 
                message: "Error de validación en los datos", 
                details: mensajes 
            });
        }
        
        res.status(400).json({ 
            message: "No se pudo procesar la solicitud", 
            error: error.message 
        });
    }
};

// @desc    Actualizar un registro existente
export const updateFlight = async (req, res) => {
    try {
        const updatedFlight = await Flight.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        
        if (!updatedFlight) {
            return res.status(404).json({ message: "El registro no existe" });
        }
        
        res.status(200).json(updatedFlight);
    } catch (error) {
        res.status(400).json({ 
            message: "Error al actualizar el registro", 
            error: error.message 
        });
    }
};

// @desc    Eliminar un registro de la planilla
export const deleteFlight = async (req, res) => {
    try {
        const flight = await Flight.findByIdAndDelete(req.params.id);
        if (!flight) {
            return res.status(404).json({ message: "El registro ya fue eliminado o no existe" });
        }
        res.status(200).json({ message: "Movimiento eliminado correctamente" });
    } catch (error) {
        res.status(500).json({ 
            message: "Error al eliminar el registro", 
            error: error.message 
        });
    }
};