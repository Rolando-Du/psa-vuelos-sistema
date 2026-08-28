import "dotenv/config";
import mongoose from "mongoose";

import Flight from "../models/Flight.js";
import User from "../models/User.js";
import Counter from "../models/Counter.js";
import prisma from "../config/prisma.js";

const toDate = (value) => new Date(`${value}T00:00:00.000Z`);

const toTime = (value) => {
  const normalized = value.length === 5 ? `${value}:00` : value;
  return new Date(`1970-01-01T${normalized}.000Z`);
};

const migrate = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const [mongoFlights, mongoUsers, mongoCounters] = await Promise.all([
      Flight.find({}).lean(),
      User.find({}).lean(),
      Counter.find({}).lean(),
    ]);

    await prisma.$transaction(
      async (tx) => {
        const [pgFlights, pgUsers, pgCounters, pgPersons, pgOfficers] =
          await Promise.all([
            tx.flight.count(),
            tx.user.count(),
            tx.counter.count(),
            tx.flightPerson.count(),
            tx.officer.count(),
          ]);

        if (
          pgFlights > 0 ||
          pgUsers > 0 ||
          pgCounters > 0 ||
          pgPersons > 0 ||
          pgOfficers > 0
        ) {
          throw new Error(
            "PostgreSQL no está vacío. Migración cancelada."
          );
        }

        for (const user of mongoUsers) {
          await tx.user.create({
            data: {
              id: user._id.toString(),
              username: user.username,
              password: user.password,
              nombre: user.nombre,
              lup: user.lup,
              role: user.role,
              createdAt: user.createdAt,
              updatedAt: user.updatedAt,
            },
          });
        }

        for (const counter of mongoCounters) {
          await tx.counter.create({
            data: {
              id: counter._id.toString(),
              seq: counter.seq ?? 0,
              createdAt: counter.createdAt,
              updatedAt: counter.updatedAt,
            },
          });
        }

        for (const flight of mongoFlights) {
          await tx.flight.create({
            data: {
              id: flight._id.toString(),
              nroRegistro: flight.nroRegistro,
              fecha: toDate(flight.fecha),
              hora: toTime(flight.hora),
              matricula: flight.matricula,
              tipoAeronave: flight.tipoAeronave,
              propietario: flight.propietario ?? "",
              procedencia: flight.procedencia ?? "",
              destino: flight.destino ?? "",
              tipoMovimiento: flight.tipoMovimiento,
              gradoOficial: flight.gradoOficial,
              nombreOficial: flight.nombreOficial,
              lupOficial: flight.lupOficial,
              observaciones: flight.observaciones ?? "",
              estado: flight.estado ?? "ACTIVO",
              createdAt: flight.createdAt,
              updatedAt: flight.updatedAt,
              personas: {
                create: flight.personas.map((persona) => ({
                  apellidoNombre: persona.apellidoNombre,
                  tipoDocumento: persona.tipoDocumento ?? "DNI",
                  nroDni: persona.nroDni,
                  tripPax: persona.tripPax ?? "T",
                  nacionalidad: persona.nacionalidad ?? "ARG",
                  equipajeMano: persona.equipajeMano ?? 0,
                  equipajeBodega: persona.equipajeBodega ?? 0,
                })),
              },
            },
          });
        }
      },
      {
        maxWait: 10000,
        timeout: 60000,
      }
    );

    console.log("Migración completada:");
    console.log(`Usuarios: ${mongoUsers.length}`);
    console.log(`Vuelos: ${mongoFlights.length}`);
    console.log(
      `Personas: ${mongoFlights.reduce(
        (total, flight) => total + flight.personas.length,
        0
      )}`
    );
    console.log(`Contadores: ${mongoCounters.length}`);
  } finally {
    await mongoose.disconnect();
    await prisma.$disconnect();
  }
};

migrate().catch((error) => {
  console.error("Error de migración:", error.message);
  process.exit(1);
});