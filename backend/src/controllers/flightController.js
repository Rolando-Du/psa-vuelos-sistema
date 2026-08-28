import prisma from "../config/prisma.js";
import { generateSMA } from "../utils/generateSMA.js";

const serializeFlight = (flight) => {
  const { id, personas, ...data } = flight;

  return {
    _id: id,
    ...data,
    fecha: flight.fecha.toISOString().slice(0, 10),
    hora: flight.hora.toISOString().slice(11, 16),
    personas: personas.map(({ id: personaId, flightId, ...persona }) => persona),
  };
};

const toDate = (value) => {
  return new Date(`${String(value).trim()}T00:00:00.000Z`);
};

const toTime = (value) => {
  const time = String(value).trim();
  const normalized = time.length === 5 ? `${time}:00` : time;

  return new Date(`1970-01-01T${normalized}.000Z`);
};

const normalizePerson = (persona) => ({
  apellidoNombre: String(persona.apellidoNombre || "")
    .toUpperCase()
    .trim(),
  tipoDocumento: String(
    persona.tipoDocumento || persona.tipoDni || "DNI"
  )
    .toUpperCase()
    .trim(),
  nroDni: String(persona.nroDni || "").trim(),
  tripPax: String(persona.tripPax || "T").toUpperCase().trim(),
  nacionalidad: String(persona.nacionalidad || "ARG")
    .toUpperCase()
    .trim(),
  equipajeMano: Number(persona.equipajeMano || 0),
  equipajeBodega: Number(persona.equipajeBodega || 0),
});

export const getFlightById = async (req, res) => {
  try {
    const flight = await prisma.flight.findUnique({
      where: {
        id: req.params.id,
      },
      include: {
        personas: true,
      },
    });

    if (!flight) {
      return res.status(404).json({
        message: "Registro no encontrado",
      });
    }

    return res.status(200).json(serializeFlight(flight));
  } catch (error) {
    console.error("getFlightById error:", error.message);

    return res.status(500).json({
      message: "Error al buscar el registro",
      error: error.message,
    });
  }
};

export const getFlights = async (req, res) => {
  try {
    const flights = await prisma.flight.findMany({
      include: {
        personas: true,
      },
      orderBy: [
        { fecha: "desc" },
        { hora: "desc" },
        { createdAt: "desc" },
      ],
    });

    return res.status(200).json(flights.map(serializeFlight));
  } catch (error) {
    console.error("getFlights error:", error.message);

    return res.status(500).json({
      message: "Error al obtener los vuelos",
      error: error.message,
    });
  }
};

export const createFlight = async (req, res) => {
  try {
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
      (key) => !req.body?.[key] || String(req.body[key]).trim() === ""
    );

    if (missing.length > 0) {
      return res.status(400).json({
        message: "Faltan datos obligatorios",
        missing,
      });
    }

    const { personas } = req.body;

    if (!Array.isArray(personas) || personas.length === 0) {
      return res.status(400).json({
        message: "El manifiesto de personas no puede estar vacío.",
      });
    }

    const payload = {
      fecha: toDate(req.body.fecha),
      hora: toTime(req.body.hora),
      matricula: String(req.body.matricula).toUpperCase().trim(),
      tipoAeronave: String(req.body.tipoAeronave).toUpperCase().trim(),
      propietario: String(req.body.propietario || "").trim(),
      procedencia: String(req.body.procedencia || "").toUpperCase().trim(),
      destino: String(req.body.destino || "").toUpperCase().trim(),
      tipoMovimiento: String(req.body.tipoMovimiento).toUpperCase().trim(),
      gradoOficial: String(req.body.gradoOficial).toUpperCase().trim(),
      nombreOficial: String(req.body.nombreOficial).toUpperCase().trim(),
      lupOficial: String(req.body.lupOficial).trim(),
      observaciones: String(req.body.observaciones || "").trim(),
      estado: "ACTIVO",
      personas: personas.map(normalizePerson),
    };

    const savedFlight = await prisma.$transaction(async (tx) => {
      const nroRegistro = await generateSMA(tx);

      const flight = await tx.flight.create({
        data: {
          nroRegistro,
          fecha: payload.fecha,
          hora: payload.hora,
          matricula: payload.matricula,
          tipoAeronave: payload.tipoAeronave,
          propietario: payload.propietario,
          procedencia: payload.procedencia,
          destino: payload.destino,
          tipoMovimiento: payload.tipoMovimiento,
          gradoOficial: payload.gradoOficial,
          nombreOficial: payload.nombreOficial,
          lupOficial: payload.lupOficial,
          observaciones: payload.observaciones,
          estado: payload.estado,
          personas: {
            create: payload.personas,
          },
        },
        include: {
          personas: true,
        },
      });

      await tx.officer.upsert({
        where: {
          lup: payload.lupOficial,
        },
        update: {
          grado: payload.gradoOficial,
          nombre: payload.nombreOficial,
        },
        create: {
          grado: payload.gradoOficial,
          nombre: payload.nombreOficial,
          lup: payload.lupOficial,
        },
      });

      return flight;
    });

    return res.status(201).json(serializeFlight(savedFlight));
  } catch (error) {
    if (error?.code === "P2002") {
      return res.status(409).json({
        message:
          "Ya existe un registro ACTIVO con esa fecha/hora/matrícula/movimiento o número de registro.",
      });
    }

    console.error("createFlight error:", error);

    return res.status(500).json({
      message: "Error interno del servidor",
      error: error.message,
    });
  }
};

export const updateFlight = async (req, res) => {
  try {
    if (
      Array.isArray(req.body.personas) &&
      req.body.personas.length === 0
    ) {
      return res.status(400).json({
        message: "El manifiesto de personas no puede estar vacío.",
      });
    }

    const data = {};

    if (req.body.fecha !== undefined) {
      data.fecha = toDate(req.body.fecha);
    }

    if (req.body.hora !== undefined) {
      data.hora = toTime(req.body.hora);
    }

    if (req.body.matricula !== undefined) {
      data.matricula = String(req.body.matricula).toUpperCase().trim();
    }

    if (req.body.tipoAeronave !== undefined) {
      data.tipoAeronave = String(req.body.tipoAeronave)
        .toUpperCase()
        .trim();
    }

    if (req.body.propietario !== undefined) {
      data.propietario = String(req.body.propietario || "").trim();
    }

    if (req.body.procedencia !== undefined) {
      data.procedencia = String(req.body.procedencia || "")
        .toUpperCase()
        .trim();
    }

    if (req.body.destino !== undefined) {
      data.destino = String(req.body.destino || "")
        .toUpperCase()
        .trim();
    }

    if (req.body.tipoMovimiento !== undefined) {
      data.tipoMovimiento = String(req.body.tipoMovimiento)
        .toUpperCase()
        .trim();
    }

    if (req.body.gradoOficial !== undefined) {
      data.gradoOficial = String(req.body.gradoOficial)
        .toUpperCase()
        .trim();
    }

    if (req.body.nombreOficial !== undefined) {
      data.nombreOficial = String(req.body.nombreOficial)
        .toUpperCase()
        .trim();
    }

    if (req.body.lupOficial !== undefined) {
      data.lupOficial = String(req.body.lupOficial).trim();
    }

    if (req.body.observaciones !== undefined) {
      data.observaciones = String(req.body.observaciones || "").trim();
    }

    if (req.body.estado !== undefined) {
      data.estado = String(req.body.estado).toUpperCase().trim();
    }

    if (Array.isArray(req.body.personas)) {
      data.personas = {
        deleteMany: {},
        create: req.body.personas.map(normalizePerson),
      };
    }

    const updatedFlight = await prisma.$transaction(async (tx) => {
      const existingFlight = await tx.flight.findUnique({
        where: {
          id: req.params.id,
        },
        select: {
          id: true,
        },
      });

      if (!existingFlight) {
        return null;
      }

      return tx.flight.update({
        where: {
          id: req.params.id,
        },
        data,
        include: {
          personas: true,
        },
      });
    });

    if (!updatedFlight) {
      return res.status(404).json({
        message: "Registro no encontrado",
      });
    }

    return res.status(200).json(serializeFlight(updatedFlight));
  } catch (error) {
    if (error?.code === "P2002") {
      return res.status(409).json({
        message:
          "Ya existe un registro ACTIVO con esa fecha/hora/matrícula/movimiento.",
      });
    }

    console.error("updateFlight error:", error);

    return res.status(400).json({
      message: "Error al actualizar",
      error: error.message,
    });
  }
};

export const searchByDni = async (req, res) => {
  try {
    const dni = req.params.dni.trim();

    const flights = await prisma.flight.findMany({
      where: {
        personas: {
          some: {
            nroDni: dni,
          },
        },
      },
      include: {
        personas: true,
      },
      orderBy: {
        fecha: "desc",
      },
    });

    return res.status(200).json(flights.map(serializeFlight));
  } catch (error) {
    console.error("searchByDni error:", error.message);

    return res.status(500).json({
      message: "Error en búsqueda",
      error: error.message,
    });
  }
};

export const searchByMatricula = async (req, res) => {
  try {
    const matricula = req.params.matricula.toUpperCase().trim();

    const flights = await prisma.flight.findMany({
      where: {
        matricula,
      },
      include: {
        personas: true,
      },
      orderBy: {
        fecha: "desc",
      },
    });

    return res.status(200).json(flights.map(serializeFlight));
  } catch (error) {
    console.error("searchByMatricula error:", error.message);

    return res.status(500).json({
      message: "Error en búsqueda",
      error: error.message,
    });
  }
};

export const searchOficialByName = async (req, res) => {
  try {
    const nombre = req.params.nombre.trim();

    const officers = await prisma.officer.findMany({
      where: {
        nombre: {
          contains: nombre,
          mode: "insensitive",
        },
      },
      orderBy: {
        nombre: "asc",
      },
      take: 10,
    });

    const results = officers.map((officer) => ({
      gradoOficial: officer.grado,
      nombreOficial: officer.nombre,
      lupOficial: officer.lup,
    }));

    return res.status(200).json(results);
  } catch (error) {
    console.error("searchOficialByName error:", error.message);

    return res.status(500).json({
      message: "Error en búsqueda",
      error: error.message,
    });
  }
};