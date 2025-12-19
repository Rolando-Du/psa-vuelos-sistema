import React, { useEffect, useState, useMemo } from 'react';
import api from '../api/axios';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';
import { 
  Trash2, 
  Search, 
  FilterX, 
  Users, 
  FileText, 
  Table as TableIcon,
  Fingerprint,
  MessageSquare,
  Hash // Importado para el icono de registro
} from 'lucide-react';

const FlightTable = ({ refreshTrigger }) => {
    const [flights, setFlights] = useState([]);
    const [filterMatricula, setFilterMatricula] = useState('');
    const [filterPersona, setFilterPersona] = useState('');
    const [filterFecha, setFilterFecha] = useState(''); 
    const [filterMes, setFilterMes] = useState('');     

    useEffect(() => {
        let isMounted = true;
        const fetchFlights = async () => {
            try {
                const res = await api.get('/');
                if (isMounted) setFlights(res.data);
            } catch (error) {
                console.error("Error al obtener vuelos:", error);
            }
        };
        fetchFlights();
        return () => { isMounted = false; };
    }, [refreshTrigger]);

    const filteredFlights = useMemo(() => {
        return flights.filter(f => {
            const matchMatricula = f.matricula.toLowerCase().includes(filterMatricula.toLowerCase());
            const matchPersona = filterPersona === '' || f.personas?.some(p => 
                p.apellidoNombre.toLowerCase().includes(filterPersona.toLowerCase()) ||
                p.nroDni.includes(filterPersona)
            );

            let matchFecha = true;
            if (filterFecha) {
                const [y, m, d] = filterFecha.split('-');
                matchFecha = f.fecha === `${d}/${m}/${y}`;
            }

            let matchMes = true;
            if (filterMes) {
                const [y, m] = filterMes.split('-');
                matchMes = f.fecha.includes(`/${m}/${y}`);
            }

            return matchMatricula && matchPersona && matchFecha && matchMes;
        });
    }, [flights, filterMatricula, filterPersona, filterFecha, filterMes]);

    const deleteFlight = async (id) => {
        const result = await Swal.fire({
            title: '<span style="color: #f1f5f9">¿Eliminar registro?</span>',
            text: "Esta acción borrará el vuelo y todos sus pasajeros asociados permanentemente.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#334155',
            confirmButtonText: 'SÍ, ELIMINAR',
            cancelButtonText: 'CANCELAR',
            background: '#0f172a',
            color: '#94a3b8',
            iconColor: '#f59e0b',
            customClass: {
                popup: 'rounded-2xl border border-slate-800 shadow-2xl',
                confirmButton: 'rounded-xl font-black px-6 py-3',
                cancelButton: 'rounded-xl font-black px-6 py-3'
            }
        });

        if (result.isConfirmed) {
            try {
                await api.delete(`/${id}`);
                setFlights(prev => prev.filter(f => f._id !== id));
                Swal.fire({
                    icon: 'success',
                    title: 'Eliminado',
                    text: 'El registro ha sido borrado correctamente.',
                    timer: 2000,
                    showConfirmButton: false,
                    background: '#0f172a',
                    color: '#f1f5f9'
                });
            } catch (error) {
                console.error("Error al eliminar:", error);
                Swal.fire({ 
                    icon: 'error', 
                    title: 'Error', 
                    text: 'No se pudo eliminar el registro.',
                    background: '#0f172a',
                    color: '#f1f5f9'
                });
            }
        }
    };

    const getFileName = (extension) => {
        const dateStr = new Date().toLocaleDateString().replace(/\//g, '_');
        const namePart = filterMatricula ? filterMatricula.toUpperCase() : "PLANILLA";
        return `Reporte_${namePart}_${dateStr}.${extension}`;
    };

    // ACTUALIZADO: Exportación Excel con Nro Registro
    const exportarExcel = () => {
        const dataParaExcel = [];
        filteredFlights.forEach(f => {
            f.personas?.forEach(p => {
                dataParaExcel.push({
                    "CONTROL": f.nroRegistro || "N/A", // Nueva Columna
                    "FECHA": f.fecha,
                    "HORA": f.hora,
                    "MATRÍCULA": f.matricula,
                    "MOVIMIENTO": f.tipoMovimiento,
                    "ORIGEN/DESTINO": f.tipoMovimiento === 'ARRIBO' ? f.procedencia : f.destino,
                    "TIPO": p.tripPax === 'T' ? 'TRIPULANTE' : 'PASAJERO',
                    "APELLIDO Y NOMBRE": p.apellidoNombre,
                    "DNI": p.nroDni,
                    "NACIONALIDAD": p.nacionalidad,
                    "OBSERVACIONES": f.observaciones || "",
                    "OFICIAL": `${f.gradoOficial} ${f.nombreOficial}`,
                });
            });
        });
        const ws = XLSX.utils.json_to_sheet(dataParaExcel);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Vuelos");
        XLSX.writeFile(wb, getFileName('xlsx'));
    };

    // ACTUALIZADO: Exportación PDF con Nro Registro
    const exportarPDF = () => {
        const doc = new jsPDF({ orientation: 'landscape' });
        const tableRows = filteredFlights.map(f => [
            f.nroRegistro || "N/A", // Nueva Celda
            f.fecha, f.hora, f.matricula, f.tipoMovimiento,
            f.tipoMovimiento === 'ARRIBO' ? f.procedencia : f.destino,
            f.personas?.map(p => `${p.tripPax}: ${p.apellidoNombre}`).join('\n') || '-',
            f.observaciones || '-',
            `${f.gradoOficial} ${f.nombreOficial}`
        ]);
        autoTable(doc, {
            head: [["CONTROL", "FECHA", "HORA", "MATRICULA", "MOV.", "ORIGEN/DEST", "TRIP/PAX", "OBSERVACIONES", "OFICIAL"]],
            body: tableRows,
            theme: 'grid',
            styles: { fontSize: 6 },
            headStyles: { fillColor: [30, 41, 59] } // Color Slate 800
        });
        doc.save(getFileName('pdf'));
    };

    return (
        <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto p-2">
            {/* Filtros */}
            <div className="bg-slate-900/40 backdrop-blur-md p-6 border border-slate-800 rounded-2xl shadow-2xl">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div className="w-full">
                        <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-2 block ml-1">Aeronave</label>
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                            <input type="text" className="bg-slate-950/50 border border-slate-700 text-white rounded-xl pl-10 pr-4 py-2.5 w-full outline-none focus:ring-2 focus:ring-blue-500 text-sm" value={filterMatricula} onChange={(e) => setFilterMatricula(e.target.value)} placeholder="Matrícula..." />
                        </div>
                    </div>

                    <div className="w-full">
                        <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-2 block ml-1">Trip/Pax o DNI</label>
                        <div className="relative">
                            <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                            <input type="text" className="bg-slate-950/50 border border-slate-700 text-white rounded-xl pl-10 pr-4 py-2.5 w-full outline-none focus:ring-2 focus:ring-blue-500 text-sm" value={filterPersona} onChange={(e) => setFilterPersona(e.target.value)} placeholder="Nombre o DNI..." />
                        </div>
                    </div>

                    <div className="w-full">
                        <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-2 block ml-1">Fecha</label>
                        <input type="date" className="bg-slate-950/50 border border-slate-700 text-white rounded-xl px-4 py-2.5 w-full outline-none text-sm" value={filterFecha} onChange={(e) => {setFilterFecha(e.target.value); setFilterMes('');}} />
                    </div>

                    <div className="flex gap-2">
                        <button onClick={exportarPDF} className="flex-1 bg-rose-600 hover:bg-rose-500 text-white h-10 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase transition-all">
                            <FileText size={16}/> PDF
                        </button>
                        <button onClick={exportarExcel} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white h-10 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase transition-all">
                            <TableIcon size={16}/> EXCEL
                        </button>
                    </div>
                </div>

                {(filterMatricula || filterPersona || filterFecha) && (
                    <div className="mt-4 flex">
                        <button onClick={() => {setFilterMatricula(''); setFilterPersona(''); setFilterFecha('');}} className="text-[9px] bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full border border-blue-500/20 hover:bg-blue-500/20 transition-all flex items-center gap-2 uppercase font-bold">
                            <FilterX size={12}/> Limpiar Búsqueda
                        </button>
                    </div>
                )}
            </div>

            {/* Tabla Actualizada con Columna Control */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-sm shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-950/40 text-blue-400 text-[10px] uppercase tracking-widest font-black border-b border-slate-800">
                                <th className="p-5">Control</th> {/* NUEVA COLUMNA */}
                                <th className="p-5">Fecha / Hora</th>
                                <th className="p-5">Matrícula</th>
                                <th className="p-5">Movimiento</th>
                                <th className="p-5">Manifiesto</th>
                                <th className="p-5">Observaciones</th>
                                <th className="p-5 text-center">Borrar</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {filteredFlights.map((f) => (
                                <tr key={f._id} className="hover:bg-blue-500/5 transition-all">
                                    {/* Celda del Número de Registro */}
                                    <td className="p-5">
                                        <div className="flex items-center gap-2">
                                            <div className="bg-blue-500/10 p-1.5 rounded-md">
                                                <Hash size={12} className="text-blue-500" />
                                            </div>
                                            <span className="text-[11px] font-mono font-black text-blue-300 tracking-tighter">
                                                {f.nroRegistro || "---"}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-5 whitespace-nowrap">
                                        <div className="font-bold text-slate-200 text-sm">{f.fecha}</div>
                                        <div className="text-[10px] text-slate-500 font-mono mt-1">{f.hora} HS</div>
                                    </td>
                                    <td className="p-5 font-black text-white text-base tracking-tight">{f.matricula}</td>
                                    <td className="p-5">
                                        <span className={`px-2 py-1 rounded text-[9px] font-black uppercase ${
                                            f.tipoMovimiento === 'ARRIBO' ? 'bg-blue-500/10 text-blue-400' : 'bg-amber-500/10 text-amber-500'
                                        }`}>
                                            {f.tipoMovimiento}
                                        </span>
                                    </td>
                                    <td className="p-5">
                                        <div className="flex items-center gap-2 text-slate-200 font-bold text-[11px] uppercase">
                                            <Users size={14} className="text-blue-500 shrink-0"/>
                                            {f.personas?.length || 0} Registros
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        <div className="flex items-start gap-2 max-w-45">
                                            <MessageSquare size={14} className={`shrink-0 mt-0.5 ${f.observaciones ? "text-amber-500" : "text-slate-700"}`} />
                                            <p className="text-[10px] text-slate-400 uppercase italic line-clamp-2 leading-tight" title={f.observaciones}>
                                                {f.observaciones || "Sin novedades"}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="p-5 text-center">
                                        <button 
                                            onClick={() => deleteFlight(f._id)} 
                                            className="text-slate-700 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-500/10"
                                            title="Eliminar Registro"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredFlights.length === 0 && (
                        <div className="p-20 text-center text-slate-600 uppercase font-black text-xs tracking-widest">
                            No se encontraron movimientos registrados
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FlightTable;