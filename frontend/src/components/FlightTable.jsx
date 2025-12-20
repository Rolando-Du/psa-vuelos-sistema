import React, { useEffect, useState } from "react";
import api from "../api/axios";
import Swal from "sweetalert2";
import {
  Trash2,
  Search,
  FilterX,
  Users,
  Hash,
  MessageSquare,
  Fingerprint,
  Calendar,
  FileSpreadsheet,
  FileText,
  Download,
  Pencil,
  X,
} from "lucide-react";

const FlightTable = ({ refreshTrigger }) => {
  const [flights, setFlights] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [limit, setLimit] = useState(25);
  const [total, setTotal] = useState(0);

  // Estados para filtros
  const [filterMatricula, setFilterMatricula] = useState("");
  const [filterPersona, setFilterPersona] = useState("");
  const [filterFecha, setFilterFecha] = useState("");

  // Estados para edición
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState(null);

  useEffect(() => {
    const fetchFlights = async () => {
      try {
        const res = await api.get("/flights", {
          params: {
            page,
            limit,
            matricula: filterMatricula,
            persona: filterPersona,
            fecha: filterFecha,
          },
        });
        setFlights(res.data.flights);
        setPages(res.data.pages);
        setTotal(res.data.total);
      } catch (err) {
        console.error("Error al obtener vuelos", err);
      }
    };

    const timer = setTimeout(fetchFlights, 400);
    return () => clearTimeout(timer);
  }, [page, limit, refreshTrigger, filterMatricula, filterPersona, filterFecha]);

  // Función para actualizar vuelo
  const handleUpdateFlight = async (e) => {
    e.preventDefault();
    try {
      Swal.fire({
        title: "Actualizando...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const { data } = await api.put(`/flights/${selectedFlight._id}`, {
        matricula: selectedFlight.matricula,
        tipoMovimiento: selectedFlight.tipoMovimiento,
        observaciones: selectedFlight.observaciones,
        personas: selectedFlight.personas,
      });

      setFlights((prev) =>
        prev.map((f) => (f._id === selectedFlight._id ? data : f))
      );
      setIsEditModalOpen(false);
      Swal.fire("Éxito", "Registro actualizado correctamente", "success");
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "No se pudo actualizar el registro", "error");
    }
  };

  // Descargar vuelo individual en PDF
  const downloadSingleFlight = async (flight) => {
    try {
      Swal.fire({
        title: "Generando PDF",
        text: "Preparando manifiesto individual...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const response = await api.get(
        `/flights/export/single/${flight._id}/pdf`,
        { responseType: "blob" }
      );

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const fechaLimpia = flight.fecha.replace(/\//g, "-");
      const fileName = `${flight.matricula.toUpperCase()}_${flight.tipoMovimiento}_${fechaLimpia}.pdf`;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      Swal.close();
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      Swal.fire("Error", "No se pudo generar el PDF", "error");
    }
  };

  // Descargar reporte general
  const downloadReport = async (format) => {
    try {
      Swal.fire({
        title: "Generando archivo",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const response = await api.get(`/flights/export/${format}`, {
        params: { matricula: filterMatricula, persona: filterPersona, fecha: filterFecha },
        responseType: "blob",
      });

      const mimeType =
        format === "excel"
          ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          : "application/pdf";
      const blob = new Blob([response.data], { type: mimeType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const extension = format === "excel" ? "xlsx" : "pdf";
      const hoy = new Date().toISOString().split("T")[0];
      const fileName = filterMatricula
        ? `Reporte_${filterMatricula.toUpperCase()}_${hoy}.${extension}`
        : `Reporte_General_Skylog_${hoy}.${extension}`;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      Swal.close();
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo generar el reporte.",
      });
    }
  };

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
      inputPlaceholder: "Motivo de la anulación...",
      showCancelButton: true,
      confirmButtonText: "ANULAR",
      background: "#0f172a",
      color: "#f1f5f9",
      confirmButtonColor: "#ef4444",
    });
    if (!observaciones) return;
    try {
      await api.patch(`/flights/${id}/anular`, { observaciones });
      setFlights((prev) =>
        prev.map((f) => (f._id === id ? { ...f, estado: "ANULADO" } : f))
      );
      Swal.fire("Anulado", "El registro ha sido anulado", "success");
    } catch {
      Swal.fire("Error", "No se pudo anular", "error");
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto p-2">
      {/* Filtros */}
      <div className="bg-slate-900/40 backdrop-blur-md p-6 border border-slate-800 rounded-2xl shadow-2xl">
        <div className="flex flex-col lg:flex-row gap-6 items-end">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 grow w-full">
            <div>
              <label className="text-[10px] text-slate-500 font-black uppercase mb-2 block tracking-widest">Matrícula</label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input
                  className="bg-slate-950/50 border border-slate-700 text-white rounded-xl pl-10 pr-4 py-2.5 w-full outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="Ej: LV-GVO..."
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
          </div>

          <div className="flex gap-2 w-full lg:w-auto">
            <button
              onClick={cleanFilters}
              className="flex-1 lg:flex-none px-4 bg-slate-800 text-slate-400 h-10 rounded-xl border border-slate-700 hover:text-white transition-all flex items-center justify-center gap-2 uppercase text-[10px] font-black"
              title="Limpiar filtros"
            >
              <FilterX size={14} />
            </button>
            <button
              onClick={() => downloadReport("excel")}
              className="flex-1 lg:flex-none px-4 bg-emerald-500/10 text-emerald-500 h-10 rounded-xl border border-emerald-500/20 hover:bg-emerald-500 hover:text-white transition-all flex items-center justify-center gap-2 uppercase text-[10px] font-black"
            >
              <FileSpreadsheet size={16} /> EXCEL
            </button>
            <button
              onClick={() => downloadReport("pdf")}
              className="flex-1 lg:flex-none px-4 bg-red-500/10 text-red-500 h-10 rounded-xl border border-red-500/20 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2 uppercase text-[10px] font-black"
            >
              <FileText size={16} /> PDF
            </button>
          </div>
        </div>
      </div>

      {/* Tabla */}
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
                      <div className="flex items-center justify-center gap-2">
                        {f.estado !== "ANULADO" ? (
                          <>
                            <button
                              onClick={() => {
                                setSelectedFlight(f);
                                setIsEditModalOpen(true);
                              }}
                              className="p-2 text-amber-400 hover:text-white hover:bg-amber-500 rounded-lg transition-all"
                              title="Editar"
                            >
                              <Pencil size={18} />
                            </button>
                            <button
                              onClick={() => downloadSingleFlight(f)}
                              className="p-2 text-blue-400 hover:text-white hover:bg-blue-500 rounded-lg transition-all"
                              title="Descargar"
                            >
                              <Download size={18} />
                            </button>
                            <button
                              onClick={() => anularRegistro(f._id)}
                              className="p-2 text-slate-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                              title="Anular"
                            >
                              <Trash2 size={18} />
                            </button>
                          </>
                        ) : (
                          <span className="text-[9px] font-black text-red-500/40 uppercase">Inactivo</span>
                        )}
                      </div>
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

      {/* Paginación */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500 font-bold uppercase tracking-wider">
        <div className="bg-slate-900/50 px-4 py-2 rounded-lg border border-slate-800">
          Mostrando <span className="text-blue-400">{(page - 1) * limit + 1}</span>–
          <span className="text-blue-400">{Math.min(page * limit, total)}</span> de <span className="text-white">{total}</span>
        </div>
        <div className="flex gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="px-4 py-2 bg-slate-800 rounded-lg disabled:opacity-20 hover:bg-slate-700 transition-colors"
          >
            ← ANTERIOR
          </button>
          <button
            disabled={page === pages}
            onClick={() => setPage(page + 1)}
            className="px-4 py-2 bg-slate-800 rounded-lg disabled:opacity-20 hover:bg-slate-700 transition-colors"
          >
            SIGUIENTE →
          </button>
        </div>
        <select
          className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 outline-none text-blue-400"
          value={limit}
          onChange={(e) => {
            setLimit(+e.target.value);
            setPage(1);
          }}
        >
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
      </div>

      {/* Modal edición */}
      {isEditModalOpen && selectedFlight && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[50vh] animate-in fade-in zoom-in duration-200">
            
            {/* Cabecera */}
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950/50 shrink-0">
              <div>
                <h3 className="text-white font-black uppercase tracking-tighter text-lg">Editar Registro</h3>
                <p className="text-blue-500 font-mono text-xs">FOLIO: {selectedFlight.nroRegistro}</p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-500 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Formulario con scroll */}
            <form onSubmit={handleUpdateFlight} className="flex flex-col grow overflow-hidden">
              <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar grow">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-slate-500 font-black uppercase mb-1 block tracking-widest">Matrícula</label>
                    <input
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all uppercase"
                      value={selectedFlight.matricula}
                      onChange={(e) => setSelectedFlight({ ...selectedFlight, matricula: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-black uppercase mb-1 block tracking-widest">Movimiento</label>
                    <select
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white outline-none focus:ring-2 focus:ring-blue-500"
                      value={selectedFlight.tipoMovimiento}
                      onChange={(e) => setSelectedFlight({ ...selectedFlight, tipoMovimiento: e.target.value })}
                    >
                      <option value="ARRIBO">ARRIBO</option>
                      <option value="PARTIDA">PARTIDA</option>
                    </select>
                  </div>
                </div>

                {/* Personas */}
                <div>
                  <label className="text-[10px] text-slate-500 font-black uppercase mb-2 block tracking-widest">Pasajeros / Tripulación</label>
                  <div className="space-y-2">
                    {selectedFlight.personas.map((p, idx) => (
                      <div key={idx} className="grid grid-cols-2 gap-2 bg-slate-950/50 p-2 rounded-lg border border-slate-800">
                        <div className="flex flex-col gap-1 border-r border-slate-800 pr-2">
                          <span className="text-[8px] text-slate-500 font-bold uppercase">Apellido y Nombre</span>
                          <input
                            className="bg-transparent text-white text-xs outline-none uppercase"
                            value={p.apellidoNombre}
                            onChange={(e) => {
                              const newPersons = [...selectedFlight.personas];
                              newPersons[idx].apellidoNombre = e.target.value;
                              setSelectedFlight({ ...selectedFlight, personas: newPersons });
                            }}
                          />
                        </div>
                        <div className="flex flex-col gap-1 pl-2">
                          <span className="text-[8px] text-slate-500 font-bold uppercase">Documento</span>
                          <input
                            className="bg-transparent text-white text-xs outline-none"
                            value={p.nroDni}
                            onChange={(e) => {
                              const newPersons = [...selectedFlight.personas];
                              newPersons[idx].nroDni = e.target.value;
                              setSelectedFlight({ ...selectedFlight, personas: newPersons });
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-slate-500 font-black uppercase mb-1 block tracking-widest">Observaciones</label>
                  <textarea
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white h-24 outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    value={selectedFlight.observaciones}
                    onChange={(e) => setSelectedFlight({ ...selectedFlight, observaciones: e.target.value })}
                  />
                </div>
              </div>

              {/* Botones */}
              <div className="p-6 border-t border-slate-800 bg-slate-950/50 flex gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-3 bg-slate-800 text-slate-400 rounded-xl font-black text-[10px] uppercase hover:text-white transition-all"
                >
                  Descartar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase hover:bg-blue-500 shadow-lg shadow-blue-500/20 transition-all"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlightTable;
