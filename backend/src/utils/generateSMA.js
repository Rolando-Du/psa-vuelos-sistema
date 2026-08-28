import prisma from "../config/prisma.js";

export const generateSMA = async (db = prisma) => {
  const year = new Date().getFullYear();

  const existingFlights = await db.flight.findMany({
    where: {
      nroRegistro: {
        endsWith: `/${year}`,
      },
    },
    select: {
      nroRegistro: true,
    },
  });

  const existingNumbers = existingFlights
    .map((flight) => {
      const match = (flight.nroRegistro || "").match(/SMA-(\d+)/);
      return match ? parseInt(match[1], 10) : null;
    })
    .filter((number) => number !== null)
    .sort((a, b) => a - b);

  let nextNumber = 1;

  for (let i = 0; i < existingNumbers.length; i++) {
    if (existingNumbers[i] === nextNumber) {
      nextNumber++;
    } else if (existingNumbers[i] > nextNumber) {
      break;
    }
  }

  const key = `SMA-${year}`;

  await db.counter.upsert({
    where: {
      id: key,
    },
    update: {
      seq: nextNumber,
    },
    create: {
      id: key,
      seq: nextNumber,
    },
  });

  const formattedNumber = String(nextNumber).padStart(4, "0");

  return `SMA-${formattedNumber}/${year}`;
};