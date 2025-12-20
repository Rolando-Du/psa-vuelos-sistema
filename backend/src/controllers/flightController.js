import Flight from "../models/Flight.js";
import Counter from "../models/Counter.js";

/**
 * Función auxiliar para construir la consulta (query) de búsqueda
 * Maneja la conversión de fecha de YYYY-MM-DD a DD/MM/YYYY.
 */
const buildSearchQuery = (params, baseEstado) => {
  const { matricula, persona, fecha } = params;
  let query = { estado: baseEstado };

  // 1. Filtro por Matrícula
  if (matricula) {
    query.matricula = { $regex: matricula.trim(), $options: "i" };
  }

  // 2. Filtro por Persona (Nombre o DNI)
  if (persona) {
    const searchRegex = { $regex: persona.trim(), $options: "i" };
    query.$or = [
      { "personas.apellidoNombre": searchRegex },
      { "personas.nroDni": searchRegex }
    ];
  }

  // 3. Filtro por Fecha: Convierte YYYY-MM-DD (input date) a DD/MM/YYYY (DB)
  if (fecha && fecha !== "") {
    if (fecha.includes("-")) {
      const [y, m, d] = fecha.split("-");
      query.fecha = `${d}/${m}/${y}`;
    } else {
      query.fecha = fecha;
    }
  }

  return query;
};

/* GET PAGINADO (ACTIVOS) */
export const getFlights = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 25;
    const skip = (page - 1) * limit;

    const query = buildSearchQuery(req.query, "ACTIVO");

    const [flights, total] = await Promise.all([
      Flight.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Flight.countDocuments(query),
    ]);

    res.json({
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      flights,
    });
  } catch (error) {
    res.status(500).json({ message: "Error al obtener registros" });
  }
};

/* GET PAGINADO (ANULADOS) */
export const getFlightsAnulados = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 25;
    const skip = (page - 1) * limit;

    const query = buildSearchQuery(req.query, "ANULADO");

    const [flights, total] = await Promise.all([
      Flight.find(query).sort({ anuladoAt: -1 }).skip(skip).limit(limit),
      Flight.countDocuments(query),
    ]);

    res.json({
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      flights,
    });
  } catch (error) {
    res.status(500).json({ message: "Error al obtener anulados" });
  }
};

/* CREAR REGISTRO */
export const createFlight = async (req, res) => {
  try {
    if (!req.body.personas || req.body.personas.length === 0) {
      return res.status(400).json({ message: "Debe existir al menos una persona" });
    }
    const year = new Date().getFullYear();
    const counterKey = `flight_${year}`;
    const counter = await Counter.findOneAndUpdate(
      { _id: counterKey }, 
      { $inc: { seq: 1 } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    const nroRegistro = `SMA-${counter.seq.toString().padStart(4, "0")}/${year}`;
    
    // El frontend ya debe enviar la fecha en formato DD/MM/YYYY según tu lógica
    const flight = await Flight.create({ ...req.body, nroRegistro, estado: "ACTIVO" });
    res.status(201).json({ message: "Registro creado", nroRegistro, id: flight._id });
  } catch (error) {
    res.status(500).json({ message: "Error al crear registro" });
  }
};

/* ANULAR REGISTRO */
export const anularFlight = async (req, res) => {
  try {
    const { observaciones } = req.body;
    const flight = await Flight.findById(req.params.id);
    if (!flight) return res.status(404).json({ message: "No encontrado" });

    flight.estado = "ANULADO";
    flight.anuladoAt = new Date();
    flight.observaciones = `[ANULADO: ${observaciones.toUpperCase()}] ${flight.observaciones}`;
    await flight.save();
    res.json({ message: "Registro anulado" });
  } catch (error) {
    res.status(500).json({ message: "Error al anular" });
  }
};

/* BÚSQUEDA PARA AUTOCOMPLETADO */
export const searchByMatricula = async (req, res) => {
  try {
    const { matricula } = req.params;
    const flight = await Flight.findOne({ 
      matricula: matricula.toUpperCase().trim(),
      estado: "ACTIVO" 
    }).sort({ createdAt: -1 });

    if (!flight) return res.status(404).json({ message: "No encontrado" });
    res.json(flight);
  } catch (error) {
    res.status(500).json({ message: "Error en servidor" });
  }
};