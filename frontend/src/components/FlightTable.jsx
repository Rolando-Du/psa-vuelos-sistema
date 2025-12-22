import React, { useEffect, useState, useMemo } from "react";
import api from "../api/axios";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import Swal from "sweetalert2";
import {
  Edit3,
  Ban,
  Search,
  Users,
  FileText,
  Table as TableIcon,
  MessageSquare,
  Plane,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  Download,
  Hash,
} from "lucide-react";

const FlightTable = ({ refreshTrigger, onEdit }) => {
  const [flights, setFlights] = useState([]);
  const [filterMatricula, setFilterMatricula] = useState("");
  const [filterPersona, setFilterPersona] = useState("");
  const [filterFecha, setFilterFecha] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  useEffect(() => {
    let isMounted = true;
    const fetchFlights = async () => {
      try {
        const res = await api.get("/flights");
        if (isMounted) setFlights(res.data);
      } catch (error) {
        console.error("Error al obtener vuelos:", error);
      }
    };
    fetchFlights();
    return () => { isMounted = false; };
  }, [refreshTrigger]);

  const filteredFlights = useMemo(() => {
    const mat = filterMatricula.trim().toLowerCase();
    const per = filterPersona.trim().toLowerCase();

    return flights.filter((f) => {
      const fMat = (f.matricula || "").toLowerCase();
      const fReg = (f.nroRegistro || "").toLowerCase();
      const matchMatricula = fMat.includes(mat) || fReg.includes(mat);

      const matchPersona =
        per === "" ||
        (Array.isArray(f.personas) &&
          f.personas.some((p) => (p.apellidoNombre || "").toLowerCase().includes(per)));

      let matchFecha = true;
      if (filterFecha) matchFecha = f.fecha === filterFecha;

      return matchMatricula && matchPersona && matchFecha;
    });
  }, [flights, filterMatricula, filterPersona, filterFecha]);

  const totalPages = Math.ceil(filteredFlights.length / rowsPerPage) || 1;
  const indexOfLastItem = currentPage * rowsPerPage;
  const indexOfFirstItem = indexOfLastItem - rowsPerPage;
  const currentItems = filteredFlights.slice(indexOfFirstItem, indexOfLastItem);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterMatricula, filterPersona, filterFecha]);

  const stats = useMemo(() => {
    let totalPax = 0;
    let totalTrip = 0;
    filteredFlights.forEach((f) => {
      if (f.estado !== "ANULADO") {
        f.personas?.forEach((p) => {
          if (p.tripPax === "T") totalTrip++;
          else totalPax++;
        });
      }
    });
    return { totalPax, totalTrip, totalVuelos: filteredFlights.length };
  }, [filteredFlights]);

  const descargarVueloUnicoPDF = (f) => {
    const doc = new jsPDF({ orientation: "landscape" });
    const tableRows = (f.personas || []).map((p) => [
      f.nroRegistro || "-",
      f.estado === "ANULADO" ? `${f.fecha} (ANULADO)` : f.fecha,
      f.hora,
      f.matricula,
      f.tipoMovimiento,
      f.tipoMovimiento === "ARRIBO" ? f.procedencia : f.destino,
      p.tripPax === "T" ? "TRIP" : "PAX",
      p.apellidoNombre,
      p.nacionalidad || "ARG",
      p.tipoDocumento || "DNI",
      p.nroDni,
      f.observaciones || "-",
      `${f.gradoOficial} ${f.nombreOficial}`,
    ]);

    autoTable(doc, {
      head: [["Nº REG", "FECHA", "HORA", "MATRÍCULA", "MOV.", "ORIG/DEST", "TIPO", "NOMBRE", "NAC.", "DOC", "NÚMERO", "OBS.", "OFICIAL"]],
      body: tableRows,
      theme: "grid",
      styles: { fontSize: 6, cellPadding: 1.2 },
      headStyles: { fillColor: [15, 23, 42] },
    });
    doc.save(`Vuelo_${f.nroRegistro || f.matricula}_${f.fecha}.pdf`);
  };

  const anularVuelo = async (id) => {
    const result = await Swal.fire({
      title: '<span style="color: #f1f5f9">¿Anular registro?</span>',
      text: "El registro permanecerá en la base de datos pero se marcará como INVÁLIDO.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#f59e0b",
      cancelButtonColor: "#334155",
      confirmButtonText: "SÍ, ANULAR",
      cancelButtonText: "CANCELAR",
      background: "#0f172a",
      color: "#94a3b8",
    });

    if (result.isConfirmed) {
      try {
        await api.put(`/flights/${id}`, { estado: "ANULADO" });
        setFlights((prev) => prev.map((f) => (f._id === id ? { ...f, estado: "ANULADO" } : f)));
        Swal.fire({
          icon: "success",
          title: "Registro Anulado",
          timer: 2000,
          showConfirmButton: false,
          background: "#0f172a",
          color: "#f1f5f9",
        });
      } catch (error) {
        console.error("Error al anular:", error);
      }
    }
  };

  const exportarExcel = () => {
    const dataParaExcel = [];
    filteredFlights.forEach((f) => {
      (f.personas || []).forEach((p) => {
        dataParaExcel.push({
          "Nº REGISTRO": f.nroRegistro || "S/N",
          ESTADO: f.estado || "ACTIVO",
          FECHA: f.fecha,
          HORA: f.hora,
          MATRÍCULA: f.matricula,
          MOVIMIENTO: f.tipoMovimiento,
          "ORIGEN/DESTINO": f.tipoMovimiento === "ARRIBO" ? f.procedencia : f.destino,
          TIPO: p.tripPax === "T" ? "TRIPULANTE" : "PASAJERO",
          "APELLIDO Y NOMBRE": p.apellidoNombre,
          NACIONALIDAD: p.nacionalidad || "ARG",
          "TIPO DOC": p.tipoDocumento || "DNI",
          "NRO DOC": p.nroDni,
          OBSERVACIONES: f.observaciones || "",
          OFICIAL: `${f.gradoOficial} ${f.nombreOficial}`,
        });
      });
    });
    const ws = XLSX.utils.json_to_sheet(dataParaExcel);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Vuelos");
    XLSX.writeFile(wb, `Reporte_SMA_${new Date().toLocaleDateString()}.xlsx`);
  };

  const exportarPDF = () => {
    const doc = new jsPDF({ orientation: "landscape" });
    const tableRows = [];
    filteredFlights.forEach((f) => {
      (f.personas || []).forEach((p) => {
        tableRows.push([
          f.nroRegistro || "-",
          f.estado === "ANULADO" ? `${f.fecha} (ANULADO)` : f.fecha,
          f.hora,
          f.matricula,
          f.tipoMovimiento,
          f.tipoMovimiento === "ARRIBO" ? f.procedencia : f.destino,
          p.tripPax === "T" ? "TRIP" : "PAX",
          p.apellidoNombre,
          p.nacionalidad || "ARG",
          p.tipoDocumento || "DNI",
          p.nroDni,
          f.observaciones || "-",
          `${f.gradoOficial} ${f.nombreOficial}`,
        ]);
      });
    });
    autoTable(doc, {
      head: [["Nº REG", "FECHA", "HORA", "MATRÍCULA", "MOV.", "ORIG/DEST", "TIPO", "NOMBRE", "NAC.", "DOC", "NÚMERO", "OBS.", "OFICIAL"]],
      body: tableRows,
      theme: "grid",
      styles: { fontSize: 5.5, cellPadding: 1 },
      headStyles: { fillColor: [15, 23, 42] },
    });
    doc.save(`Reporte_SMA_General_${new Date().toLocaleDateString()}.pdf`);
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto p-2">
      <div className="bg-slate-900/40 backdrop-blur-md p-6 border border-slate-800 rounded-2xl shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="w-full">
            <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-2 block ml-1">Aeronave / Nº Registro</label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input type="text" className="bg-slate-950/50 border border-slate-700 text-white rounded-xl pl-10 pr-4 py-2.5 w-full outline-none focus:ring-2 focus:ring-blue-500 text-sm" value={filterMatricula} onChange={(e) => setFilterMatricula(e.target.value)} placeholder="Matrícula o SMA..." />
            </div>
          </div>
          <div className="w-full">
            <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-2 block ml-1">Persona (Nombre)</label>
            <div className="relative">
              <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input type="text" className="bg-slate-950/50 border border-slate-700 text-white rounded-xl pl-10 pr-4 py-2.5 w-full outline-none focus:ring-2 focus:ring-blue-500 text-sm" value={filterPersona} onChange={(e) => setFilterPersona(e.target.value)} placeholder="Buscar por nombre..." />
            </div>
          </div>
          <div className="w-full">
            <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-2 block ml-1">Fecha</label>
            <input type="date" className="bg-slate-950/50 border border-slate-700 text-white rounded-xl px-4 py-2.5 w-full outline-none text-sm" value={filterFecha} onChange={(e) => setFilterFecha(e.target.value)} />
          </div>
          <div className="flex gap-2">
            <button onClick={exportarPDF} className="flex-1 bg-rose-600 hover:bg-rose-500 text-white h-10 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase transition-all shadow-lg shadow-rose-900/20"><FileText size={16} /> REPORTE PDF</button>
            <button onClick={exportarExcel} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white h-10 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase transition-all shadow-lg shadow-emerald-900/20"><TableIcon size={16} /> EXCEL</button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-800/50">
          <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800 flex items-center gap-4">
            <div className="p-2 bg-blue-500/10 rounded-lg"><Plane size={20} className="text-blue-500" /></div>
            <div>
              <p className="text-[9px] text-slate-500 font-black uppercase">Vuelos</p>
              <p className="text-xl font-black text-white">{stats.totalVuelos}</p>
            </div>
          </div>
          <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800 flex items-center gap-4">
            <div className="p-2 bg-emerald-500/10 rounded-lg"><UserCheck size={20} className="text-emerald-500" /></div>
            <div>
              <p className="text-[9px] text-slate-500 font-black uppercase">Pasajeros</p>
              <p className="text-xl font-black text-white">{stats.totalPax}</p>
            </div>
          </div>
          <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800 flex items-center gap-4">
            <div className="p-2 bg-amber-500/10 rounded-lg"><Users size={20} className="text-amber-500" /></div>
            <div>
              <p className="text-[9px] text-slate-500 font-black uppercase">Tripulantes</p>
              <p className="text-xl font-black text-white">{stats.totalTrip}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-sm shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/40 text-blue-400 text-[10px] uppercase tracking-widest font-black border-b border-slate-800">
                <th className="p-5">Nº Registro</th>
                <th className="p-5">Fecha / Hora</th>
                <th className="p-5">Matrícula</th>
                <th className="p-5">Movimiento</th>
                <th className="p-5">Manifiesto</th>
                <th className="p-5">Observaciones</th>
                <th className="p-5 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {currentItems.length > 0 ? (
                currentItems.map((f) => (
                  <tr key={f._id} className={`transition-all ${f.estado === "ANULADO" ? "bg-red-950/10 opacity-50 grayscale" : "hover:bg-blue-500/5"}`}>
                    <td className="p-5 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Hash size={14} className="text-slate-600" />
                        <span className="font-mono font-bold text-blue-400 text-sm">{f.nroRegistro || "S/N"}</span>
                      </div>
                    </td>
                    <td className="p-5 whitespace-nowrap">
                      <div className="font-bold text-slate-200 text-sm">{f.fecha}</div>
                      <div className="text-[10px] text-slate-500 font-mono mt-1">{f.hora} HS</div>
                    </td>
                    <td className="p-5 font-black text-slate-200 text-base">
                      {f.matricula}
                      {f.estado === "ANULADO" && <span className="block text-[8px] text-red-500 tracking-tighter">REGISTRO ANULADO</span>}
                    </td>
                    <td className="p-5">
                      <span className={`px-2 py-1 rounded text-[9px] font-black uppercase ${f.tipoMovement === "ARRIBO" ? "bg-blue-500/10 text-blue-400" : "bg-amber-500/10 text-amber-500"}`}>{f.tipoMovimiento}</span>
                    </td>
                    <td className="p-5">
                      <div className="flex items-center gap-2 text-slate-200 font-bold text-[11px] uppercase">
                        <Users size={14} className="text-blue-500 shrink-0" />
                        {f.personas?.length || 0} Pers.
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="flex items-start gap-2 max-w-45">
                        <MessageSquare size={14} className={`shrink-0 mt-0.5 ${f.observaciones ? "text-amber-500" : "text-slate-700"}`} />
                        <p className="text-[10px] text-slate-400 uppercase italic line-clamp-2 leading-tight">{f.observaciones || "Sin novedades"}</p>
                      </div>
                    </td>
                    <td className="p-5 text-center">
                      <div className="flex justify-center gap-2">
                        {f.estado !== "ANULADO" && (
                          <>
                            <button onClick={() => descargarVueloUnicoPDF(f)} className="text-emerald-500 hover:bg-emerald-500/10 p-2 rounded-lg transition-all" title="Descargar"><Download size={18} /></button>
                            <button onClick={() => onEdit(f)} className="text-slate-400 hover:text-blue-400 p-2 rounded-lg hover:bg-blue-500/10" title="Editar"><Edit3 size={18} /></button>
                            <button onClick={() => anularVuelo(f._id)} className="text-slate-400 hover:text-orange-500 p-2 rounded-lg hover:bg-orange-500/10" title="Anular"><Ban size={18} /></button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="p-20 text-center text-slate-500 uppercase text-xs font-black tracking-[0.2em]">No se encontraron registros</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-slate-950/40 border-t border-slate-800 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 font-black uppercase">Página {currentPage} de {totalPages}</span>
            <span className="text-[9px] text-blue-500/50 font-bold">{filteredFlights.length} resultados</span>
          </div>
          <div className="flex items-center gap-3">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage((prev) => prev - 1)} className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-blue-400 disabled:opacity-10 transition-all"><ChevronLeft size={18} /></button>
            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage((prev) => prev + 1)} className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-blue-400 disabled:opacity-10 transition-all"><ChevronRight size={18} /></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlightTable;