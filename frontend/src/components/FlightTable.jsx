import React, { useEffect, useState, useMemo } from 'react';
import api from '../api/axios';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import Swal from 'sweetalert2';
import { Download, Trash2, Search, Calendar, FilterX } from 'lucide-react';

const FlightTable = ({ refreshTrigger }) => {
    const [flights, setFlights] = useState([]);
    const [filterMatricula, setFilterMatricula] = useState('');
    const [filterFecha, setFilterFecha] = useState(''); 
    const [filterMes, setFilterMes] = useState('');     

    useEffect(() => {
        let isMounted = true;
        const fetchFlights = async () => {
            try {
                const res = await api.get('/flights');
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
            return matchMatricula && matchFecha && matchMes;
        });
    }, [flights, filterMatricula, filterFecha, filterMes]);

    const deleteFlight = async (id) => {
        const result = await Swal.fire({
            title: '¿Eliminar registro?',
            text: "Esta acción no se puede deshacer.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'Sí, eliminar',
            background: '#0f172a',
            color: '#f1f5f9'
        });

        if (result.isConfirmed) {
            try {
                await api.delete(`/flights/${id}`);
                setFlights(prev => prev.filter(f => f._id !== id));
            // eslint-disable-next-line no-unused-vars
            } catch (error) {
                Swal.fire({ icon: 'error', title: 'Error' });
            }
        }
    };

    const exportarPDF = () => {
        const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
        let nombreArchivo = `Planilla_PSA_${filterMatricula || filterFecha || filterMes || 'General'}`;
        
        autoTable(doc, {
            head: [["FECHA", "HORA", "MATRICULA", "MOV.", "ORIGEN/DEST", "SUJETO", "DNI", "EQUIPAJE", "OFICIAL"]],
            body: filteredFlights.map(f => [
                f.fecha, f.hora, f.matricula, f.tipoMovimiento,
                f.tipoMovimiento === 'ARRIBO' ? f.procedencia : f.destino,
                f.apellidoNombre, f.nroDni,
                `${(Number(f.equipajeMano) || 0) + (Number(f.equipajeBodega) || 0)}kg`,
                `${f.gradoOficial} ${f.nombreOficial}`
            ]),
            startY: 20,
            theme: 'grid',
            styles: { fontSize: 8 }
        });
        doc.save(`${nombreArchivo}.pdf`);
    };

    return (
        <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto p-2">
            
            {/* PANEL DE FILTROS REFINADO */}
            <div className="bg-slate-900/40 backdrop-blur-md p-6 border border-slate-800 rounded-2xl shadow-2xl">
                <div className="flex flex-col md:flex-row gap-6 items-end">
                    
                    {/* Input Matrícula */}
                    <div className="flex-1 w-full">
                        <label className="text-[11px] text-slate-400 font-black uppercase tracking-widest mb-2 block ml-1">
                            Aeronave (Matrícula)
                        </label>
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={20} />
                            <input 
                                type="text" 
                                className="bg-slate-950/50 border border-slate-700 text-white text-base rounded-xl pl-12 pr-4 py-3 w-full focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all placeholder:text-slate-600"
                                value={filterMatricula}
                                onChange={(e) => setFilterMatricula(e.target.value)}
                                placeholder="Ej: LV-CBA..."
                            />
                        </div>
                    </div>

                    {/* Input Fecha */}
                    <div className="w-full md:w-56">
                        <label className="text-[11px] text-slate-400 font-black uppercase tracking-widest mb-2 block ml-1">
                            Búsqueda por Día
                        </label>
                        <input 
                            type="date" 
                            className="bg-slate-950/50 border border-slate-700 text-white text-sm rounded-xl px-4 py-3 w-full focus:ring-2 focus:ring-blue-500/50 outline-none appearance-none"
                            value={filterFecha} 
                            onChange={(e) => {setFilterFecha(e.target.value); setFilterMes('');}} 
                        />
                    </div>

                    {/* Input Mes */}
                    <div className="w-full md:w-56">
                        <label className="text-[11px] text-slate-400 font-black uppercase tracking-widest mb-2 block ml-1">
                            Búsqueda por Mes
                        </label>
                        <input 
                            type="month" 
                            className="bg-slate-950/50 border border-slate-700 text-white text-sm rounded-xl px-4 py-3 w-full focus:ring-2 focus:ring-blue-500/50 outline-none"
                            value={filterMes} 
                            onChange={(e) => {setFilterMes(e.target.value); setFilterFecha('');}} 
                        />
                    </div>

                    {/* Botón Exportar */}
                    <button 
                        onClick={exportarPDF} 
                        className="bg-emerald-600 hover:bg-emerald-500 text-white h-12.5 px-8 rounded-xl flex items-center justify-center gap-3 text-sm font-black transition-all uppercase shadow-lg shadow-emerald-900/20 active:scale-95 w-full md:w-auto"
                    >
                        <Download size={20}/> Exportar
                    </button>
                </div>

                {/* Badge de Filtros Activos */}
                {(filterMatricula || filterFecha || filterMes) && (
                    <div className="mt-4 flex items-center gap-2">
                        <span className="text-[10px] text-slate-500 font-bold uppercase">Filtros activos:</span>
                        <button 
                            onClick={() => {setFilterMatricula(''); setFilterFecha(''); setFilterMes('');}}
                            className="flex items-center gap-1 text-[10px] bg-blue-500/10 text-blue-400 px-2 py-1 rounded-md hover:bg-blue-500/20 transition-all"
                        >
                            <FilterX size={12}/> Limpiar todo
                        </button>
                    </div>
                )}
            </div>

            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-sm shadow-xl">
                <div className="p-4 bg-slate-800/20 border-b border-slate-800 flex justify-between items-center">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">
                        Registros Encontrados: {filteredFlights.length}
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-950/40 text-blue-400 text-[11px] uppercase tracking-[0.2em] font-black border-b border-slate-800">
                                <th className="p-5">Fecha / Hora</th>
                                <th className="p-5">Matrícula</th>
                                <th className="p-5">Movimiento</th>
                                <th className="p-5">Origen / Destino</th>
                                <th className="p-5">Sujeto / DNI</th>
                                <th className="p-5 text-center">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {filteredFlights.map((f) => (
                                <tr key={f._id} className="hover:bg-blue-500/5 transition-all group">
                                    <td className="p-5">
                                        <div className="font-bold text-slate-200 text-sm">{f.fecha}</div>
                                        <div className="text-[11px] text-slate-500 font-mono mt-1">{f.hora} HS</div>
                                    </td>
                                    <td className="p-5 font-black text-blue-400 text-base tracking-tight">{f.matricula}</td>
                                    <td className="p-5">
                                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${
                                            f.tipoMovimiento === 'ARRIBO' ? 'bg-blue-500/10 text-blue-400' : 'bg-amber-500/10 text-amber-500'
                                        }`}>
                                            {f.tipoMovimiento}
                                        </span>
                                    </td>
                                    <td className="p-5 uppercase text-sm font-semibold text-slate-300">{f.tipoMovimiento === 'ARRIBO' ? f.procedencia : f.destino}</td>
                                    <td className="p-5">
                                        <div className="text-slate-200 font-bold text-sm uppercase">{f.apellidoNombre}</div>
                                        <div className="text-[11px] text-slate-500 mt-1">{f.nroDni}</div>
                                    </td>
                                    <td className="p-5 text-center">
                                        <button onClick={() => deleteFlight(f._id)} className="text-slate-600 hover:text-red-500 hover:scale-125 transition-all p-2">
                                            <Trash2 size={20} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filteredFlights.length === 0 && (
                    <div className="py-24 flex flex-col items-center justify-center text-slate-600 border-t border-slate-800">
                        <FilterX size={48} className="mb-4 opacity-20" />
                        <p className="uppercase tracking-[0.3em] font-black text-xs">Sin coincidencias</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FlightTable;