import React, { useState, useEffect } from "react";
import { Send, UserPlus, Trash2, Users, MessageSquare } from "lucide-react";
import api from "../api/axios";
import Swal from "sweetalert2";

const FlightForm = ({ onFlightAdded }) => {
  const today = new Date().toISOString().split("T")[0];

  const initialState = {
    fecha: today,
    hora: "",
    matricula: "",
    tipoAeronave: "",
    propietario: "",
    procedencia: "",
    destino: "",
    tipoMovimiento: "ARRIBO",
    gradoOficial: "AYUDANTE",
    nombreOficial: "",
    lupOficial: "",
    observaciones: "", // Campo para herramientas, victorinox, etc.
  };

  const [formData, setFormData] = useState(initialState);
  const [listaPersonas, setListaPersonas] = useState([]);
  const [historicoVuelos, setHistoricoVuelos] = useState([]); 
  
  const [personaActual, setPersonaActual] = useState({
    apellidoNombre: "",
    tipoDni: "DNI",
    nroDni: "",
    tripPax: "T",
    equipajeMano: 0,
    equipajeBodega: 0,
    nacionalidad: "ARG"
  });

  useEffect(() => {
    const cargarHistorial = async () => {
      try {
        const res = await api.get('/');
        setHistoricoVuelos(res.data);
      // eslint-disable-next-line no-unused-vars
      } catch (error) {
        console.error("Error cargando historial para autocompletado");
      }
    };
    cargarHistorial();
  }, [onFlightAdded]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handlePersonaChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "nroDni") {
      const personaEncontrada = historicoVuelos
        .flatMap(vuelo => vuelo.personas || [])
        .find(p => p.nroDni === value);

      if (personaEncontrada) {
        setPersonaActual({
          ...personaActual,
          nroDni: value,
          apellidoNombre: personaEncontrada.apellidoNombre,
          nacionalidad: personaEncontrada.nacionalidad || "ARG",
          tripPax: personaEncontrada.tripPax
        });
        return;
      }
    }
    setPersonaActual({ ...personaActual, [name]: value });
  };

  const agregarPersonaALista = () => {
    if (!personaActual.apellidoNombre || !personaActual.nroDni) {
      return Swal.fire("Atención", "Nombre y DNI son obligatorios", "warning");
    }
    setListaPersonas([...listaPersonas, personaActual]);
    setPersonaActual({
      apellidoNombre: "",
      tipoDni: "DNI",
      nroDni: "",
      tripPax: "T",
      equipajeMano: 0,
      equipajeBodega: 0,
      nacionalidad: "ARG"
    });
  };

  const quitarPersona = (index) => {
    setListaPersonas(listaPersonas.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (listaPersonas.length === 0) {
      return Swal.fire("Error", "Debe agregar al menos una persona", "error");
    }

    try {
      const dataFinal = { ...formData, personas: listaPersonas };
      await api.post("/", dataFinal);

      Swal.fire({ 
        icon: "success", 
        title: "Vuelo Registrado", 
        text: `${formData.tipoMovimiento} de ${formData.matricula} exitoso.`,
        background: "#0f172a", 
        color: "#fff" 
      });

      onFlightAdded();
      setFormData(initialState);
      setListaPersonas([]);
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      Swal.fire({ icon: "error", title: "Error al guardar" });
    }
  };

  return (
    <div className="bg-slate-900 rounded-2xl border border-blue-900/20 shadow-2xl overflow-hidden">
      {/* Selector de Movimiento */}
      <div className="flex border-b border-slate-800">
        <button type="button" onClick={() => setFormData({...formData, tipoMovimiento: "ARRIBO"})} 
          className={`flex-1 py-4 font-black tracking-widest transition-all ${formData.tipoMovimiento === "ARRIBO" ? "bg-blue-600 text-white" : "bg-slate-900 text-slate-500 hover:text-slate-300"}`}>
          ARRIBOS
        </button>
        <button type="button" onClick={() => setFormData({...formData, tipoMovimiento: "PARTIDA"})} 
          className={`flex-1 py-4 font-black tracking-widest transition-all ${formData.tipoMovimiento === "PARTIDA" ? "bg-amber-600 text-white" : "bg-slate-900 text-slate-500 hover:text-slate-300"}`}>
          PARTIDAS
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-8">
        
        {/* SECCIÓN 1: DATOS DEL VUELO */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] text-slate-500 font-bold ml-1 uppercase">Fecha</label>
            <input type="date" name="fecha" value={formData.fecha} onChange={handleChange} className="w-full p-3 bg-slate-800 text-white rounded-lg border border-slate-700 focus:border-blue-500 outline-none" required />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-slate-500 font-bold ml-1 uppercase">Hora</label>
            <input type="time" name="hora" value={formData.hora} onChange={handleChange} className="w-full p-3 bg-slate-800 text-white rounded-lg border border-slate-700 focus:border-blue-500 outline-none" required />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-slate-500 font-bold ml-1 uppercase">Matrícula</label>
            <input type="text" name="matricula" placeholder="MATRÍCULA" value={formData.matricula} onChange={handleChange} className="w-full p-3 bg-slate-800 text-blue-400 font-black rounded-lg border border-slate-700 uppercase outline-none focus:ring-1 focus:ring-blue-500" required />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input type="text" name="tipoAeronave" placeholder="TIPO AERONAVE" value={formData.tipoAeronave} onChange={handleChange} className="p-3 bg-slate-800 text-white rounded-lg border border-slate-700 uppercase outline-none" />
          <input type="text" name="propietario" placeholder="PROPIETARIO" value={formData.propietario} onChange={handleChange} className="p-3 bg-slate-800 text-white rounded-lg border border-slate-700 uppercase outline-none" />
          <input type="text" name={formData.tipoMovimiento === 'ARRIBO' ? 'procedencia' : 'destino'} placeholder={formData.tipoMovimiento === 'ARRIBO' ? 'PROCEDENCIA' : 'DESTINO'} value={formData.tipoMovimiento === 'ARRIBO' ? formData.procedencia : formData.destino} onChange={handleChange} className="p-3 bg-slate-800 text-white rounded-lg border border-blue-500/30 uppercase outline-none" />
        </div>

        {/* SECCIÓN 2: MANIFIESTO */}
        <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-blue-400 font-black text-sm uppercase tracking-widest flex items-center gap-2">
              <Users size={18}/> Manifiesto de Personas
            </h3>
            <span className="text-[10px] text-slate-500 italic">Autocompletado por DNI activo</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <input type="text" name="nroDni" placeholder="DNI" value={personaActual.nroDni} onChange={handlePersonaChange} className="p-2 bg-slate-900 text-white rounded-lg border border-slate-700 font-mono outline-none" />
            <input type="text" name="apellidoNombre" placeholder="APELLIDO Y NOMBRE" value={personaActual.apellidoNombre} onChange={handlePersonaChange} className="md:col-span-2 p-2 bg-slate-900 text-white rounded-lg border border-slate-700 uppercase outline-none" />
            <select name="tripPax" value={personaActual.tripPax} onChange={handlePersonaChange} className="p-2 bg-slate-900 text-blue-400 font-bold rounded-lg border border-slate-700 outline-none">
              <option value="T">TRIPULANTE</option>
              <option value="P">PASAJERO</option>
            </select>
            <button type="button" onClick={agregarPersonaALista} className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg flex items-center justify-center gap-2 font-black text-xs transition-all uppercase">
              <UserPlus size={16}/> Agregar
            </button>
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
            {listaPersonas.map((p, index) => (
              <div key={index} className="flex items-center justify-between bg-slate-900 p-3 rounded-lg border border-slate-800 animate-in slide-in-from-left-2">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${p.tripPax === 'T' ? 'bg-blue-500' : 'bg-purple-500'}`}></div>
                  <div className="text-slate-200 font-bold text-xs uppercase">{p.apellidoNombre} ({p.nroDni})</div>
                </div>
                <button type="button" onClick={() => quitarPersona(index)} className="text-slate-600 hover:text-red-500 p-1">
                  <Trash2 size={14}/>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* SECCIÓN 3: OBSERVACIONES (Novedades, Herramientas, Victorinox) */}
        <div className="space-y-2">
          <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1 flex items-center gap-2">
            <MessageSquare size={14}/> Observaciones y Elementos Controlados
          </label>
          <textarea 
            name="observaciones" 
            value={formData.observaciones} 
            onChange={handleChange} 
            placeholder="DETALLE AQUÍ HERRAMIENTAS, ELEMENTOS PUNZOCORTANTES O NOVEDADES DEL VUELO..."
            className="w-full p-4 bg-slate-950 text-slate-200 rounded-xl border border-slate-800 focus:border-blue-500/50 outline-none min-h-30 resize-none uppercase text-sm font-medium tracking-wide"
          />
        </div>

        {/* SECCIÓN 4: OFICIAL DE TURNO */}
        <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 space-y-4">
            <h3 className="text-slate-500 font-black text-[10px] uppercase tracking-[0.2em]">Oficial de Turno</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <select name="gradoOficial" value={formData.gradoOficial} onChange={handleChange} className="p-3 bg-slate-900 text-white border border-slate-700 rounded-lg font-bold outline-none">
                    <option value="AYUDANTE">AYUDANTE</option>
                    <option value="PRINCIPAL">PRINCIPAL</option>
                    <option value="MAYOR">MAYOR</option>
                    <option value="JEFE">JEFE</option>
                </select>
                <input type="text" name="nombreOficial" placeholder="NOMBRE Y APELLIDO" value={formData.nombreOficial} onChange={handleChange} className="p-3 bg-slate-900 text-white border border-slate-700 rounded-lg uppercase outline-none" required />
                <input type="text" name="lupOficial" placeholder="LUP" value={formData.lupOficial} onChange={handleChange} className="p-3 bg-slate-900 text-white border border-slate-700 rounded-lg outline-none" required />
            </div>
        </div>

        <button type="submit" className={`w-full py-4 rounded-xl font-black text-white transition-all shadow-2xl flex items-center justify-center gap-3 ${formData.tipoMovimiento === "ARRIBO" ? "bg-blue-600 hover:bg-blue-500 shadow-blue-900/20" : "bg-amber-600 hover:bg-amber-500 shadow-amber-900/20"}`}>
          <Send size={20} /> FINALIZAR REGISTRO
        </button>
      </form>
    </div>
  );
};

export default FlightForm;