import { useState, useEffect, useCallback } from "react";
import api from "../api/axios";

export const useFlights = (refreshTrigger) => { 
  const [flights, setFlights] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchFlights = useCallback(async () => {
    try {
      setLoading(true);

      // Si quieres estadísticas reales de TODO, a veces es mejor tener un endpoint 
      // específico o traer más datos. Por ahora, seguimos con paginación:
      const res = await api.get("/flights", {
        params: { page, limit }
      });

      // Validamos la estructura de respuesta según lo que envía tu backend
      const data = res.data.flights || res.data || [];
      
      setFlights(Array.isArray(data) ? data : []);
      setPages(res.data.pages || 1);
      setTotal(res.data.total || 0);
      
      // console.log("Hook useFlights: Datos recibidos con éxito");
    } catch (error) {
      console.error("Error al obtener vuelos:", error);
      setFlights([]);
    } finally {
      setLoading(false);
    }
    // Agregamos refreshTrigger a las dependencias para que reaccione al cambio
  }, [page, limit]);

  // Escuchamos cambios en la página, el límite Y el disparador de refresco
  useEffect(() => {
    fetchFlights();
  }, [fetchFlights, refreshTrigger]); 

  return {
    flights,
    loading,
    page,
    pages,
    limit,
    total,
    setPage,
    setLimit,
    refetch: fetchFlights
  };
};