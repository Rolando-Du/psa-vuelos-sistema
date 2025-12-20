import React, { useEffect, useState } from "react";
import api from "../api/axios";
import Swal from "sweetalert2";
import {
  Trash2, Search, FilterX, Users, Hash, 
  MessageSquare, Fingerprint, Calendar
} from "lucide-react";

const FlightTable = ({ refreshTrigger }) => {
  const [flights, setFlights] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [limit, setLimit] = useState(25);
  const [total, setTotal] = useState(0);

  const [filterMatricula, setFilterMatricula] = useState("");
  const [filterPersona, setFilterPersona] = useState(""); 
  const [filterFecha, setFilterFecha] = useState("");

  useEffect(() => {
    const fetchFlights = async () => {
      try {
        const res = await api.get("/flights", {
          params: {
            page,
            limit,
            matricula: filterMatricula,
            persona: filterPersona,
            fecha: filterFecha
          }
        });
        setFlights(res.data.flights);
        setPages(res.data.pages);
        setTotal(res.data.total);
      } catch (err) {
        console.error("Error al obtener vuelos", err);
      }
    };

    const timer = setTimeout(() => {
      fetchFlights();
    }, 400);

    return () => clearTimeout(timer);
  }, [page, limit, refreshTrigger, filterMatricula, filterPersona, filterFecha]);

  const handleFilterChange = (setter, value) => {
    setter(value);
    setPage(1);
  };

  const cleanFilters = () => {
    setFilterMatricula("");
    setFilterPersona("");
    setFilterFecha("");
    setPage(1);
  };

  const anularRegistro = async (id) => {
    const { value: observaciones } = await Swal.fire({
      title: "Anular registro",
      input: "textarea",
      inputPlaceholder: "Escriba el motivo...",
      showCancelButton: true,
      confirmButtonText: "ANULAR",
      background: "#0f172a",
      color: "#f1f5f9",
      confirmButtonColor: "#ef4444"
    });

    if (!observaciones) return;

    try {
      await api.patch(`/flights/${id}/anular`, { observaciones });
      setFlights(prev => prev.map(f => f._id === id ? { ...f, estado: "ANULADO" } : f));
      Swal.fire("Anulado", "El registro ha sido anulado", "success");
    } catch {
      Swal.fire("Error", "No se pudo anular", "error");
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto p-2">
      <div className="bg-slate-900/40 backdrop-blur-md p-6 border border-slate-800 rounded-2xl shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="text-[10px] text-slate-500 font-black uppercase mb-2 block tracking-widest">Matrícula</label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input
                className="bg-slate-950/50 border border-slate-700 text-white rounded-xl pl-10 pr-4 py-2.5 w-full outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="Ej: LV-X540..."
                value={filterMatricula}
                onChange={(e) => handleFilterChange(setFilterMatricula, e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] text-slate-500 font-black uppercase mb-2 block tracking-widest">Persona o DNI</label>
            <div className="relative">
              <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input
                className="bg-slate-950/50 border border-slate-700 text-white rounded-xl pl-10 pr-4 py-2.5 w-full outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="Nombre o DNI..."
                value={filterPersona}
                onChange={(e) => handleFilterChange(setFilterPersona, e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] text-slate-500 font-black uppercase mb-2 block tracking-widest">Fecha</label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
              <input
                type="date"
                className="bg-slate-950/50 border border-slate-700 text-white rounded-xl pl-10 pr-4 py-2.5 w-full outline-none focus:ring-2 focus:ring-blue-500 text-sm scheme-dark"
                value={filterFecha}
                onChange={(e) => handleFilterChange(setFilterFecha, e.target.value)}
              />
            </div>
          </div>

          <button
            onClick={cleanFilters}
            className="group text-[10px] bg-red-500/5 text-slate-400 h-10 rounded-xl border border-slate-800 hover:border-red-500/40 hover:text-red-400 transition-all flex items-center justify-center gap-2 uppercase font-black"
          >
            <FilterX size={14} /> Limpiar Filtros
          </button>
        </div>
      </div>

      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-950/40 text-blue-400 text-[10px] uppercase tracking-widest font-black">
              <tr>
                <th className="p-5">Control Folio</th>
                <th className="p-5">Fecha / Hora</th>
                <th className="p-5">Aeronave</th>
                <th className="p-5">Movimiento</th>
                <th className="p-5">Manifiesto</th>
                <th className="p-5">Observaciones</th>
                <th className="p-5 text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {flights.length > 0 ? (
                flights.map((f) => (
                  <tr key={f._id} className={`group hover:bg-blue-500/5 transition-colors ${f.estado === "ANULADO" ? "bg-red-500/5" : ""}`}>
                    <td className="p-5">
                      <div className="flex items-center gap-2">
                        <Hash size={12} className={f.estado === "ANULADO" ? "text-red-500" : "text-blue-500"} />
                        <span className={`text-[11px] font-mono font-black ${f.estado === "ANULADO" ? "text-red-400/60" : "text-blue-300"}`}>
                          {f.nroRegistro}
                        </span>
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="font-bold text-slate-200 text-sm">{f.fecha}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{f.hora} HS</div>
                    </td>
                    <td className="p-5">
                      <div className="font-black text-white text-sm">{f.matricula}</div>
                      <div className="text-[9px] text-slate-500 uppercase">{f.tipoAeronave}</div>
                    </td>
                    <td className="p-5">
                      <span className={`px-2 py-1 rounded text-[9px] font-black uppercase ${f.tipoMovimiento === "ARRIBO" ? "bg-blue-500/10 text-blue-400" : "bg-amber-500/10 text-amber-400"}`}>
                        {f.tipoMovimiento}
                      </span>
                    </td>
                    <td className="p-5">
                      <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-slate-300">
                        <Users size={12} className="text-blue-500" /> {f.personas?.length || 0} Personas
                      </div>
                    </td>
                    <td className="p-5 max-w-xs">
                      <div className="flex gap-2">
                        <MessageSquare size={14} className={f.observaciones ? "text-amber-500" : "text-slate-700"} />
                        <p className="text-[10px] text-slate-400 italic line-clamp-2 leading-relaxed">
                          {f.observaciones || "Sin novedades"}
                        </p>
                      </div>
                    </td>
                    <td className="p-5 text-center">
                      {f.estado !== "ANULADO" ? (
                        <button onClick={() => anularRegistro(f._id)} className="p-2 text-slate-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all">
                          <Trash2 size={18} />
                        </button>
                      ) : (
                        <span className="text-[9px] font-black text-red-500/40 uppercase">Inactivo</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="p-20 text-center text-slate-600 uppercase font-black text-xs tracking-widest">
                    No se encontraron registros
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500 font-bold uppercase tracking-wider">
        <div className="bg-slate-900/50 px-4 py-2 rounded-lg border border-slate-800">
          Mostrando <span className="text-blue-400">{(page - 1) * limit + 1}</span>–
          <span className="text-blue-400">{Math.min(page * limit, total)}</span> de <span className="text-white">{total}</span>
        </div>
        <div className="flex gap-2">
          <button disabled={page === 1} onClick={() => setPage(page - 1)} className="px-4 py-2 bg-slate-800 rounded-lg disabled:opacity-20 hover:bg-slate-700 transition-colors">← ANTERIOR</button>
          <button disabled={page === pages} onClick={() => setPage(page + 1)} className="px-4 py-2 bg-slate-800 rounded-lg disabled:opacity-20 hover:bg-slate-700 transition-colors">SIGUIENTE →</button>
        </div>
        <select
          className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 outline-none text-blue-400"
          value={limit}
          onChange={(e) => { setLimit(+e.target.value); setPage(1); }}
        >
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
      </div>
    </div>
  );
};

export default FlightTable;