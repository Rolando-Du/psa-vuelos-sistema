import Flight from "../models/Flight.js";
import Counter from "../models/Counter.js";

export const generateSMA = async () => {
  const year = new Date().getFullYear();
  
  // 1. Obtener todos los registros del año actual (solo el nroRegistro)
  const existingFlights = await Flight.find(
    { nroRegistro: { $regex: `/${year}$` } },
    { nroRegistro: 1 }
  ).lean();

  // 2. Extraer solo los números (ej: de "SMA-0003/2025" extraer 3)
  const existingNumbers = existingFlights
    .map(f => parseInt(f.nroRegistro.split("-")[1].split("/")[0]))
    .sort((a, b) => a - b);

  // 3. Buscar el primer hueco disponible
  let nextNumber = 0;
  for (let i = 1; i <= existingNumbers.length + 1; i++) {
    if (!existingNumbers.includes(i)) {
      nextNumber = i;
      break;
    }
  }

  // 4. Sincronizar el Counter de la DB (para que no se desfase)
  const key = `SMA-${year}`;
  const maxNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers, nextNumber) : nextNumber;
  
  await Counter.findOneAndUpdate(
    { _id: key },
    { seq: maxNumber },
    { upsert: true }
  );

  // 5. Formatear el string
  const formatted = String(nextNumber).padStart(4, "0");
  return `SMA-${formatted}/${year}`;
};