import React, { useState } from 'react';
import { Send, ArrowDownCircle, ArrowUpCircle, MessageSquare } from 'lucide-react';
import api from '../api/axios';
import Swal from 'sweetalert2';

const FlightForm = ({ onFlightAdded }) => {
    const initialState = {
        fecha: new Date().toISOString().split('T')[0],
        hora: '',
        matricula: '',
        tipoAeronave: '',
        propietario: '',
        procedencia: '',
        destino: '',
        tipoMovimiento: 'ARRIBO',
        apellidoNombre: '',
        tipoDni: 'DNI',
        nroDni: '',
        tripPax: 'T',
        equipajeMano: 0,
        equipajeBodega: 0,
        nacionalidad: 'ARG',
        gradoOficial: 'AYUDANTE',
        nombreOficial: '',
        lupOficial: '',
        observaciones: ''
    };

    const [formData, setFormData] = useState(initialState);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/flights', formData);
            
            // Notificación de éxito 
            Swal.fire({
                icon: 'success',
                title: 'Registro Guardado',
                text: `${formData.tipoMovimiento} de ${formData.matricula} registrado con éxito.`,
                background: '#0f172a',
                color: '#fff',
                confirmButtonColor: '#2563eb',
                timer: 2000
            });

            onFlightAdded(); 
            setFormData(initialState); 
        // eslint-disable-next-line no-unused-vars
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'Error de Sistema',
                text: 'No se pudo conectar con el servidor.',
                background: '#0f172a',
                color: '#fff',
                confirmButtonColor: '#ef4444'
            });
        }
    };

    return (
        <div className="bg-slate-900 rounded-2xl overflow-hidden border border-blue-900/20 shadow-2xl">
            {/* SELECTOR DE TIPO DE FORMULARIO */}
            <div className="flex border-b border-slate-800">
                <button 
                    type="button"
                    onClick={() => setFormData({...formData, tipoMovimiento: 'ARRIBO', destino: ''})}
                    className={`flex-1 py-4 flex items-center justify-center gap-2 font-bold tracking-widest transition-all ${formData.tipoMovimiento === 'ARRIBO' ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-500 hover:bg-slate-800'}`}
                >
                    <ArrowDownCircle size={20}/> ARRIBOS
                </button>
                <button 
                    type="button"
                    onClick={() => setFormData({...formData, tipoMovimiento: 'PARTIDA', procedencia: ''})}
                    className={`flex-1 py-4 flex items-center justify-center gap-2 font-bold tracking-widest transition-all ${formData.tipoMovimiento === 'PARTIDA' ? 'bg-amber-600 text-white' : 'bg-slate-900 text-slate-500 hover:bg-slate-800'}`}
                >
                    <ArrowUpCircle size={20}/> PARTIDAS
                </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Datos de Vuelo */}
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-slate-400 uppercase">Fecha</label>
                    <input type="date" name="fecha" value={formData.fecha} onChange={handleChange} className="p-3 border border-slate-700 rounded-lg bg-slate-800 text-white outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-slate-400 uppercase">Hora</label>
                    <input type="time" name="hora" value={formData.hora} onChange={handleChange} className="p-3 border border-slate-700 rounded-lg bg-slate-800 text-white outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-slate-400 uppercase">Matrícula</label>
                    <input type="text" name="matricula" placeholder="LV-XXX" value={formData.matricula} onChange={handleChange} className="p-3 border border-slate-700 rounded-lg font-bold bg-slate-800 text-blue-400 uppercase outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>

                <input type="text" name="tipoAeronave" placeholder="TIPO AERONAVE" value={formData.tipoAeronave} onChange={handleChange} className="p-3 border border-slate-700 rounded-lg bg-slate-800 text-white uppercase outline-none" required />
                <input type="text" name="propietario" placeholder="PROPIETARIO" value={formData.propietario} onChange={handleChange} className="p-3 border border-slate-700 rounded-lg bg-slate-800 text-white uppercase outline-none" />
                
                {formData.tipoMovimiento === 'ARRIBO' ? (
                    <input type="text" name="procedencia" placeholder="PROCEDENCIA" value={formData.procedencia} onChange={handleChange} className="p-3 border border-blue-500/30 rounded-lg bg-slate-800 text-white uppercase outline-none focus:ring-2 focus:ring-blue-500" required />
                ) : (
                    <input type="text" name="destino" placeholder="DESTINO" value={formData.destino} onChange={handleChange} className="p-3 border border-amber-500/30 rounded-lg bg-slate-800 text-white uppercase outline-none focus:ring-2 focus:ring-amber-500" required />
                )}

                {/* SECCIÓN PERSONA */}
                <div className="col-span-full grid grid-cols-1 md:grid-cols-3 gap-4 bg-blue-900/10 p-5 rounded-xl border border-blue-900/30">
                    <input type="text" name="apellidoNombre" placeholder="APELLIDO Y NOMBRE" value={formData.apellidoNombre} onChange={handleChange} className="p-2.5 border border-slate-700 rounded-lg bg-slate-800 text-white uppercase outline-none" required />
                    <div className="flex gap-1">
                        <select name="tipoDni" value={formData.tipoDni} onChange={handleChange} className="p-2 bg-slate-800 text-white border border-slate-700 rounded-lg outline-none">
                            <option value="DNI">DNI</option>
                            <option value="PAS">PAS</option>
                        </select>
                        <input type="text" name="nroDni" placeholder="NRO DOC" value={formData.nroDni} onChange={handleChange} className="p-2 border border-slate-700 rounded-lg bg-slate-800 text-white flex-1 outline-none" required />
                    </div>
                    <select name="tripPax" value={formData.tripPax} onChange={handleChange} className="p-2 border border-slate-700 rounded-lg bg-slate-800 text-blue-400 font-bold outline-none">
                        <option value="T">TRIPULANTE (T)</option>
                        <option value="P">PASAJERO (P)</option>
                    </select>
                </div>

                {/* SECCIÓN PSA */}
                <div className="col-span-full grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-950 p-5 rounded-xl border border-slate-800">
                    <select name="gradoOficial" value={formData.gradoOficial} onChange={handleChange} className="p-2 bg-slate-900 text-white border border-slate-700 rounded-lg outline-none">
                        <option value="AYUDANTE">AYUDANTE</option>
                        <option value="PRINCIPAL">PRINCIPAL</option>
                        <option value="MAYOR">MAYOR</option>
                        <option value="JEFE">JEFE</option>
                        <option value="SUBINSPECTOR">SUBINSPECTOR</option>
                        <option value="INSPECTOR">INSPECTOR</option>
                    </select>
                    <input type="text" name="nombreOficial" placeholder="NOMBRE OFICIAL DE GUARDIA" value={formData.nombreOficial} onChange={handleChange} className="md:col-span-2 p-2 bg-slate-900 text-white border border-slate-700 rounded-lg uppercase outline-none" required />
                    <input type="text" name="lupOficial" placeholder="LUP" value={formData.lupOficial} onChange={handleChange} className="p-2 bg-slate-900 text-white border border-slate-700 rounded-lg outline-none" required />
                </div>

                <div className="col-span-full flex flex-col gap-1">
                    <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                        <MessageSquare size={14}/> Observaciones adicionales
                    </label>
                    <textarea 
                        name="observaciones" 
                        rows="3" 
                        value={formData.observaciones} 
                        onChange={handleChange} 
                        placeholder="Ingrese novedades, equipo especial, o detalles del vuelo..."
                        className="p-3 bg-slate-800 border border-slate-700 rounded-lg text-white outline-none focus:ring-2 focus:ring-slate-600 resize-none"
                    ></textarea>
                </div>

                <button type="submit" className={`col-span-full py-4 rounded-xl font-black text-lg text-white transition-all uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 ${formData.tipoMovimiento === 'ARRIBO' ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-900/20' : 'bg-amber-600 hover:bg-amber-500 shadow-amber-900/20'}`}>
                    <Send size={20}/> Confirmar {formData.tipoMovimiento}
                </button>
            </form>
        </div>
    );
};

export default FlightForm;