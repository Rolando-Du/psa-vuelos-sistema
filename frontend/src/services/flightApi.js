// src/services/flightApi.js
import api from "@/api/axios";

/**
 * Obtener vuelos (soporta paginación si tu backend la implementa)
 * Si el backend ignora page/limit no pasa nada: te devuelve todo igual.
 */
export const getFlights = (page = 1, limit = 25) => {
  return api.get("/flights", {
    params: { page, limit },
  });
};

/**
 * Obtener vuelo por ID (para edición completa)
 */
export const getFlightById = (id) => api.get(`/flights/${id}`);

/**
 * Anular vuelo (marca estado ANULADO)
 * Compatible con tu FlightTable y FlightForm (PUT /flights/:id)
 */
export const anularFlight = (id) => {
  return api.put(`/flights/${id}`, { estado: "ANULADO" });
};

/**
 * Opcionales (por si querés unificar todo por service)
 */
export const createFlight = (data) => api.post("/flights", data);

export const updateFlight = (id, data) => api.put(`/flights/${id}`, data);
