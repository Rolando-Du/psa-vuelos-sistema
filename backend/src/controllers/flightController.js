import Flight from "../models/Flight.js";

// 1. Obtener todos los vuelos - OPTIMIZADO PARA EVITAR ERROR 400
export const getFlights = async (req, res) => {
  try {
    // Intentamos la consulta con el orden deseado
    const flights = await Flight.find()
      .sort({
        fecha: -1,
        hora: -1,
        createdAt: -1,
      })
      .lean();

    return res.status(200).json(flights);
  } catch (error) {
    console.error(
      "⚠️ Error con Sort detallado, intentando consulta simple:",
      error.message
    );

    try {
      // Plan B: Si el error 400 es por el Sort o Índices, intentamos sin Sort
      const simpleFlights = await Flight.find().lean();
      return res.status(200).json(simpleFlights);
    } catch (innerError) {
      return res.status(500).json({
        message: "Error crítico en el servidor",
        error: innerError.message,
      });
    }
  }
};

// 2. Crear un nuevo registro de vuelo
export const createFlight = async (req, res) => {
  try {
    // 1) Validar campos obligatorios del vuelo
    const required = [
      "fecha",
      "hora",
      "matricula",
      "tipoAeronave",
      "tipoMovimiento",
      "gradoOficial",
      "nombreOficial",
      "lupOficial",
    ];

    const missing = required.filter(
      (k) => !req.body?.[k] || String(req.body[k]).trim() === ""
    );
    if (missing.length > 0) {
      return res.status(400).json({
        message: "Faltan datos obligatorios",
        missing,
      });
    }

    // 2) Validar manifiesto
    const { personas } = req.body;
    if (!Array.isArray(personas) || personas.length === 0) {
      return res.status(400).json({
        message: "El manifiesto de personas no puede estar vacío.",
      });
    }

    // 3) Normalizar datos (mayúsculas, trims, compat tipoDocumento/tipoDni)
    const payload = {
      ...req.body,
      estado: "ACTIVO",
      fecha: String(req.body.fecha).trim(),
      hora: String(req.body.hora).trim(),
      matricula: String(req.body.matricula).toUpperCase().trim(),
      tipoAeronave: String(req.body.tipoAeronave).toUpperCase().trim(),
      nombreOficial: String(req.body.nombreOficial).toUpperCase().trim(),
      personas: personas.map((p) => ({
        ...p,
        apellidoNombre: String(p.apellidoNombre || "")
          .toUpperCase()
          .trim(),
        nacionalidad: String(p.nacionalidad || "ARG")
          .toUpperCase()
          .trim(),
        // soporta tanto tipoDocumento como tipoDni (por si tu front usa el viejo nombre)
        tipoDocumento: p.tipoDocumento || p.tipoDni || "DNI",
        nroDni: String(p.nroDni || "").trim(),
      })),
    };

    const savedFlight = await new Flight(payload).save();
    return res.status(201).json(savedFlight);
  } catch (error) {
    // ✅ DUPLICADO: mismo fecha + hora + matricula + tipoMovimiento (o nroRegistro)
    if (error?.code === 11000) {
      return res.status(409).json({
        message:
          "Ya existe un registro ACTIVO con esa fecha/hora/matrícula/movimiento (o nroRegistro duplicado).",
        duplicateKey: error?.keyValue,
      });
    }

    // ✅ VALIDACIÓN DEL MODELO
    if (error?.name === "ValidationError") {
      const details = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({
        message: "Error de validación",
        details,
      });
    }

    console.error("createFlight error:", error);
    return res.status(500).json({
      message: "Error interno del servidor",
      error: error.message,
    });
  }
};

// 3. Actualizar un registro (Edición o Anulación)
export const updateFlight = async (req, res) => {
  try {
    const payload = { ...req.body };
    if (payload.matricula)
      payload.matricula = payload.matricula.toUpperCase().trim();
    if (payload.nombreOficial)
      payload.nombreOficial = payload.nombreOficial.toUpperCase().trim();

    if (Array.isArray(payload.personas)) {
      payload.personas = payload.personas.map((p) => ({
        ...p,
        apellidoNombre: p.apellidoNombre?.toString().toUpperCase().trim(),
        nacionalidad: (p.nacionalidad || "ARG").toString().toUpperCase().trim(),
        tipoDocumento: p.tipoDocumento || "DNI",
        nroDni: p.nroDni?.toString().trim(),
      }));
    }

    delete payload.nroRegistro; // Protegemos el ID correlativo

    const updatedFlight = await Flight.findByIdAndUpdate(
      req.params.id,
      payload,
      { new: true, runValidators: true }
    );

    if (!updatedFlight)
      return res.status(404).json({ message: "Registro no encontrado" });
    res.status(200).json(updatedFlight);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error al actualizar", error: error.message });
  }
};

// 4. Eliminar registro
export const deleteFlight = async (req, res) => {
  try {
    const flight = await Flight.findByIdAndDelete(req.params.id);
    if (!flight)
      return res.status(404).json({ message: "Registro no encontrado" });
    res.status(200).json({ message: "Eliminado correctamente" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al eliminar", error: error.message });
  }
};

// 5. Búsquedas
export const searchByDni = async (req, res) => {
  try {
    const flights = await Flight.find({
      "personas.nroDni": req.params.dni.trim(),
    }).sort({ fecha: -1 });
    res.status(200).json(flights);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error en búsqueda", error: error.message });
  }
};

export const searchByMatricula = async (req, res) => {
  try {
    const flights = await Flight.find({
      matricula: req.params.matricula.toUpperCase().trim(),
    }).sort({ fecha: -1 });
    res.status(200).json(flights);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error en búsqueda", error: error.message });
  }
};

export const searchOficialByName = async (req, res) => {
  try {
    const flights = await Flight.find({
      nombreOficial: { $regex: req.params.nombre, $options: "i" },
    }).sort({ fecha: -1 });
    res.status(200).json(flights);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error en búsqueda", error: error.message });
  }
};
