import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL + '/flights',
  withCredentials: true
});

export const getFlights = (page = 1, limit = 25) =>
  api.get(`/?page=${page}&limit=${limit}`);

export const createFlight = (data) =>
  api.post('/', data);

export const anularFlight = (id, observaciones) =>
  api.patch(`/${id}/anular`, { observaciones });
