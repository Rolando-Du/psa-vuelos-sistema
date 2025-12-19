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
    observaciones: "",
  };

  const [formData, setFormData] = useState(initialState);
  const [listaPersonas, setListaPersonas] = useState([]);
  const [historicoVuelos, setHistoricoVuelos] = useState([]);
  const [personaActual, setPersonaActual] = useState({
    apellidoNombre: "", tipoDni: "DNI", nroDni: "", tripPax: "T",
    equipajeMano: 0, equipajeBodega: 0, nacionalidad: "ARG",
  });

  useEffect(() => {
    const cargarHistorial = async () => {
      try {
        const res = await api.get("/");
        setHistoricoVuelos(res.data);
      // eslint-disable-next-line no-unused-vars
      } catch (error) {
        console.error("Error al obtener historial");
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
        .flatMap((vuelo) => vuelo.personas || [])
        .find((p) => p.nroDni === value.trim());

      if (personaEncontrada) {
        setPersonaActual({
          ...personaActual,
          nroDni: value.trim(),
          tipoDni: personaEncontrada.tipoDni || "DNI",
          apellidoNombre: personaEncontrada.apellidoNombre,
          nacionalidad: personaEncontrada.nacionalidad || "ARG",
          tripPax: personaEncontrada.tripPax || "T",
        });
        return;
      }
    }
    const finalValue = (name === "equipajeMano" || name === "equipajeBodega")
      ? (parseInt(value) || 0) : value;
    setPersonaActual({ ...personaActual, [name]: finalValue });
  };

  const agregarPersonaALista = () => {
    if (!personaActual.apellidoNombre.trim() || !personaActual.nroDni.trim()) {
      return Swal.fire("Atención", "Nombre y Documento son obligatorios", "warning");
    }
    setListaPersonas([...listaPersonas, { ...personaActual }]);
    setPersonaActual({
      apellidoNombre: "", tipoDni: "DNI", nroDni: "", tripPax: "T",
      equipajeMano: 0, equipajeBodega: 0, nacionalidad: "ARG",
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
      const payload = {
        ...formData,
        matricula: formData.matricula.trim().toUpperCase(),
        tipoAeronave: formData.tipoAeronave.trim().toUpperCase(),
        propietario: formData.propietario.trim().toUpperCase() || "",
        procedencia: formData.tipoMovimiento === "ARRIBO" ? (formData.procedencia.trim().toUpperCase() || "N/A") : "N/A",
        destino: formData.tipoMovimiento === "PARTIDA" ? (formData.destino.trim().toUpperCase() || "N/A") : "N/A",
        nombreOficial: formData.nombreOficial.trim().toUpperCase(),
        personas: listaPersonas.map(p => ({
          ...p,
          apellidoNombre: p.apellidoNombre.trim().toUpperCase(),
          nroDni: p.nroDni.toString().trim()
        }))
      };

      const response = await api.post("/", payload);
      const nroGenerado = response.data.nroRegistro; // Aquí ya no será undefined

      await Swal.fire({
        icon: "success",
        title: '<span style="color: #60a5fa; font-weight: 900;">REGISTRO EXITOSO</span>',
        html: `
          <div style="text-align: center; color: #f1f5f9">
            <p>Se ha generado el número de control:</p>
            <div style="margin: 20px 0; padding: 15px; background: #020617; border: 2px dashed #3b82f6; border-radius: 12px;">
              <span style="font-size: 32px; font-family: monospace; font-weight: 900; color: #3b82f6; letter-spacing: 2px;">
                ${nroGenerado}
              </span>
            </div>
            <p style="font-size: 12px; color: #94a3b8;">Vuelo ${payload.matricula} grabado en sistema.</p>
          </div>
        `,
        background: "#0f172a",
        confirmButtonColor: "#3b82f6",
        confirmButtonText: "ENTENDIDO"
      });

      onFlightAdded();
      setFormData(initialState);
      setListaPersonas([]);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.response?.data?.message || "Error al conectar con el servidor",
        background: "#0f172a",
        color: "#fff"
      });
    }
  };

  return (
    <div className="bg-slate-900 rounded-2xl border border-blue-900/20 shadow-2xl overflow-hidden">
      <div className="flex border-b border-slate-800">
        <button
          type="button"
          onClick={() => setFormData({ ...formData, tipoMovimiento: "ARRIBO" })}
          className={`flex-1 py-4 font-black tracking-widest transition-all ${
            formData.tipoMovimiento === "ARRIBO" ? "bg-blue-600 text-white" : "bg-slate-900 text-slate-500"
          }`}
        >ARRIBOS</button>
        <button
          type="button"
          onClick={() => setFormData({ ...formData, tipoMovimiento: "PARTIDA" })}
          className={`flex-1 py-4 font-black tracking-widest transition-all ${
            formData.tipoMovimiento === "PARTIDA" ? "bg-amber-600 text-white" : "bg-slate-900 text-slate-500"
          }`}
        >PARTIDAS</button>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] text-slate-500 font-bold uppercase ml-1">Fecha</label>
            <input type="date" name="fecha" value={formData.fecha} onChange={handleChange} className="w-full p-3 bg-slate-800 text-white rounded-lg border border-slate-700 outline-none" required />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-slate-500 font-bold uppercase ml-1">Hora</label>
            <input type="time" name="hora" value={formData.hora} onChange={handleChange} className="w-full p-3 bg-slate-800 text-white rounded-lg border border-slate-700 outline-none" required />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-slate-500 font-bold uppercase ml-1">Matrícula</label>
            <input type="text" name="matricula" placeholder="LV-XXX" value={formData.matricula} onChange={handleChange} className="w-full p-3 bg-slate-800 text-blue-400 font-black rounded-lg border border-slate-700 uppercase outline-none" required />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input type="text" name="tipoAeronave" placeholder="TIPO AERONAVE" value={formData.tipoAeronave} onChange={handleChange} className="p-3 bg-slate-800 text-white rounded-lg border border-slate-700 uppercase outline-none" required />
          <input type="text" name="propietario" placeholder="PROPIETARIO / EMPRESA" value={formData.propietario} onChange={handleChange} className="p-3 bg-slate-800 text-white rounded-lg border border-slate-700 uppercase outline-none" />
          <input 
            type="text" 
            name={formData.tipoMovimiento === "ARRIBO" ? "procedencia" : "destino"} 
            placeholder={formData.tipoMovimiento === "ARRIBO" ? "PROCEDENCIA" : "DESTINO"} 
            value={formData.tipoMovimiento === "ARRIBO" ? formData.procedencia : formData.destino} 
            onChange={handleChange} 
            className="p-3 bg-slate-800 text-white rounded-lg border border-blue-500/30 uppercase outline-none" 
            required 
          />
        </div>

        <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 space-y-6">
          <h3 className="text-blue-400 font-black text-sm uppercase tracking-widest flex items-center gap-2">
            <Users size={18} /> Manifiesto de Personas
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-10 gap-3">
              <div className="md:col-span-3 flex flex-col gap-1">
                <label className="text-[9px] text-slate-500 font-bold uppercase ml-1">Documento</label>
                <div className="flex">
                  <select name="tipoDni" value={personaActual.tipoDni} onChange={handlePersonaChange} className="bg-slate-900 text-blue-400 font-bold border border-slate-700 rounded-l-lg p-2 text-xs outline-none">
                    <option value="DNI">DNI</option>
                    <option value="PAS">PAS</option>
                    <option value="EXT">EXT</option>
                  </select>
                  <input type="text" name="nroDni" placeholder="Número..." value={personaActual.nroDni} onChange={handlePersonaChange} className="flex-1 p-2 bg-slate-900 text-white border border-l-0 border-slate-700 rounded-r-lg font-mono outline-none text-sm" />
                </div>
              </div>
              <div className="md:col-span-5 flex flex-col gap-1">
                <label className="text-[9px] text-slate-500 font-bold uppercase ml-1">Apellido y Nombre</label>
                <input type="text" name="apellidoNombre" placeholder="NOMBRE COMPLETO" value={personaActual.apellidoNombre} onChange={handlePersonaChange} className="p-2 bg-slate-900 text-white rounded-lg border border-slate-700 uppercase outline-none text-sm" />
              </div>
              <div className="md:col-span-2 flex flex-col gap-1">
                <label className="text-[9px] text-slate-500 font-bold uppercase ml-1">Nacionalidad</label>
                <input type="text" name="nacionalidad" placeholder="ARG" value={personaActual.nacionalidad} onChange={handlePersonaChange} className="p-2 bg-slate-900 text-blue-400 font-bold rounded-lg border border-slate-700 uppercase outline-none text-sm text-center" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-10 gap-3 items-end border-t border-slate-900 pt-4">
              <div className="md:col-span-3 flex flex-col gap-1">
                <label className="text-[9px] text-slate-500 font-bold uppercase ml-1">Rol</label>
                <select name="tripPax" value={personaActual.tripPax} onChange={handlePersonaChange} className="p-2 bg-slate-900 text-blue-400 font-bold rounded-lg border border-slate-700 outline-none text-sm h-9.5">
                  <option value="T">TRIPULANTE (T)</option>
                  <option value="P">PASAJERO (P)</option>
                </select>
              </div>
              <div className="md:col-span-2 flex flex-col gap-1">
                <label className="text-[9px] text-amber-500 font-bold uppercase ml-1">Mano</label>
                <input type="number" name="equipajeMano" value={personaActual.equipajeMano} onChange={handlePersonaChange} className="p-2 bg-slate-900 text-amber-500 rounded-lg border border-slate-700 text-center font-bold" min="0" />
              </div>
              <div className="md:col-span-2 flex flex-col gap-1">
                <label className="text-[9px] text-blue-400 font-bold uppercase ml-1">Bodega</label>
                <input type="number" name="equipajeBodega" value={personaActual.equipajeBodega} onChange={handlePersonaChange} className="p-2 bg-slate-900 text-blue-400 rounded-lg border border-slate-700 text-center font-bold" min="0" />
              </div>
              <button type="button" onClick={agregarPersonaALista} className="md:col-span-3 h-10 bg-blue-600 hover:bg-blue-500 text-white rounded-lg flex items-center justify-center gap-2 font-black text-[10px] transition-all uppercase">
                <UserPlus size={16} /> Agregar Persona
              </button>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
            {listaPersonas.map((p, index) => (
              <div key={index} className="flex items-center justify-between bg-slate-900 p-3 rounded-lg border border-slate-800">
                <div className="text-xs text-slate-200 uppercase">
                  {p.apellidoNombre} ({p.nroDni}) - {p.tripPax === "T" ? "TRIP" : "PAX"}
                </div>
                <button type="button" onClick={() => quitarPersona(index)} className="text-red-500"><Trash2 size={14} /></button>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] text-slate-500 font-black uppercase flex items-center gap-2"><MessageSquare size={14} /> Observaciones</label>
          <textarea name="observaciones" value={formData.observaciones} onChange={handleChange} className="w-full p-4 bg-slate-950 text-slate-200 rounded-xl border border-slate-800 outline-none min-h-24 resize-none uppercase text-sm" />
        </div>

        <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-4">
          <select name="gradoOficial" value={formData.gradoOficial} onChange={handleChange} className="p-3 bg-slate-900 text-white border border-slate-700 rounded-lg font-bold">
            <option value="AYUDANTE">AYUDANTE</option>
            <option value="PRINCIPAL">PRINCIPAL</option>
            <option value="MAYOR">MAYOR</option>
            <option value="JEFE">JEFE</option>
            <option value="SUBINSPECTOR">SUBINSPECTOR</option>
            <option value="INSPECTOR">INSPECTOR</option>
          </select>
          <input type="text" name="nombreOficial" placeholder="OFICIAL" value={formData.nombreOficial} onChange={handleChange} className="p-3 bg-slate-900 text-white border border-slate-700 rounded-lg uppercase outline-none" required />
          <input type="text" name="lupOficial" placeholder="LUP" value={formData.lupOficial} onChange={handleChange} className="p-3 bg-slate-900 text-white border border-slate-700 rounded-lg outline-none" required />
        </div>

        <button type="submit" className={`w-full py-4 rounded-xl font-black text-white transition-all ${formData.tipoMovimiento === "ARRIBO" ? "bg-blue-600 shadow-blue-900/40" : "bg-amber-600 shadow-amber-900/40"}`}>
          <Send size={20} className="inline mr-2" /> FINALIZAR REGISTRO
        </button>
      </form>
    </div>
  );
};

export default FlightForm;