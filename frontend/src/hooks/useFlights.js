import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

export const useFlights = (refreshTrigger) => {
    const [flights, setFlights] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchFlights = useCallback(async () => {
        try {
            setLoading(true);
            const res = await api.get('/flights');
            setFlights(res.data);
        } catch (error) {
            console.error("Error al obtener vuelos:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchFlights();
    }, [fetchFlights, refreshTrigger]);

    return { flights, setFlights, loading, refetch: fetchFlights };
};