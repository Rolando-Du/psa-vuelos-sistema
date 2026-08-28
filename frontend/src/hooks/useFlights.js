import { useCallback, useEffect, useState } from "react";
import api from "../api/axios";

const normalizeResponse = (response) => {
  const data = response.data?.flights || response.data || [];

  return {
    flights: Array.isArray(data) ? data : [],
    pages: response.data?.pages || 1,
    total:
      response.data?.total ??
      (Array.isArray(data) ? data.length : 0),
  };
};

export const useFlights = (refreshTrigger) => {
  const [flights, setFlights] = useState([]);
  const [page, setPageState] = useState(1);
  const [limit, setLimitState] = useState(25);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    api
      .get("/flights", {
        params: { page, limit },
      })
      .then((response) => {
        if (cancelled) return;

        const result = normalizeResponse(response);

        setFlights(result.flights);
        setPages(result.pages);
        setTotal(result.total);
      })
      .catch((error) => {
        if (cancelled) return;

        console.error("Error al obtener vuelos:", error);
        setFlights([]);
        setPages(1);
        setTotal(0);
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [page, limit, refreshTrigger]);

  const fetchFlights = useCallback(async () => {
    setLoading(true);

    try {
      const response = await api.get("/flights", {
        params: { page, limit },
      });

      const result = normalizeResponse(response);

      setFlights(result.flights);
      setPages(result.pages);
      setTotal(result.total);
    } catch (error) {
      console.error("Error al obtener vuelos:", error);
      setFlights([]);
      setPages(1);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  const setPage = useCallback((value) => {
    setLoading(true);
    setPageState(value);
  }, []);

  const setLimit = useCallback((value) => {
    setLoading(true);
    setLimitState(value);
  }, []);

  return {
    flights,
    loading,
    page,
    pages,
    limit,
    total,
    setPage,
    setLimit,
    refetch: fetchFlights,
  };
};