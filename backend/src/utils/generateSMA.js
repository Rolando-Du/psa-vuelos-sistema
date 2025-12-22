import mongoose from "mongoose";
import Counter from "../models/Counter.js";

/**
 * Genera el próximo número de registro SMA-XXXX/YYYY
 * Busca el primer número disponible (hueco) en el año actual.
 * IMPORTANTE: NO importamos Flight acá para evitar el "loop" de imports.
 */
export const generateSMA = async () => {
  const year = new Date().getFullYear();

  // Tomamos el modelo ya registrado en mongoose (evita el import circular)
  const Flight = mongoose.models.Flight;
  if (!Flight) {
    throw new Error("El modelo Flight no está inicializado en mongoose.");
  }

  // Regex real (no string) para que Mongo lo interprete bien
  const regex = new RegExp(`/${year}$`);

  // 1) Traemos solo nroRegistro del año actual
  const existingFlights = await Flight.find(
    { nroRegistro: { $regex: regex } },
    { nroRegistro: 1 }
  ).lean();

  // 2) Extraemos números (SMA-0003/2025 -> 3) y ordenamos
  const existingNumbers = existingFlights
    .map((f) => {
      const match = (f.nroRegistro || "").match(/SMA-(\d+)/);
      return match ? parseInt(match[1], 10) : null;
    })
    .filter((n) => n !== null)
    .sort((a, b) => a - b);

  // 3) Buscamos el primer hueco
  let nextNumber = 1;
  for (let i = 0; i < existingNumbers.length; i++) {
    if (existingNumbers[i] === nextNumber) {
      nextNumber++;
    } else if (existingNumbers[i] > nextNumber) {
      break;
    }
  }

  // 4) Guardamos/actualizamos contador (opcional)
  const key = `SMA-${year}`;
  await Counter.findOneAndUpdate(
    { _id: key },
    { $set: { seq: nextNumber } },
    { upsert: true, new: true }
  );

  // 5) Formateo 4 dígitos
  const formattedNumber = String(nextNumber).padStart(4, "0");
  return `SMA-${formattedNumber}/${year}`;
};
