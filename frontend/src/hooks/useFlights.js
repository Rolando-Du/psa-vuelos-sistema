import { useState, useEffect, useCallback } from "react";
import api from "../api/axios";

export const useFlights = () => {
  const [flights, setFlights] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchFlights = useCallback(async () => {
    try {
      setLoading(true);

      const res = await api.get("/flights", {
        params: { page, limit }
      });

      setFlights(res.data.flights || []);
      setPages(res.data.pages || 1);
      setTotal(res.data.total || 0);
    } catch (error) {
      console.error("Error al obtener vuelos:", error);
      setFlights([]);
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    fetchFlights();
  }, [fetchFlights]);

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
