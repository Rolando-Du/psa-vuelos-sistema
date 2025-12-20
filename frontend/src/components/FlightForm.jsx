import React, { useState, useEffect } from "react";
import { Send, UserPlus, Trash2, Users, Loader2 } from "lucide-react";
import api from "../api/axios";
import Swal from "sweetalert2";

/* ---------- COMPONENTE BASE DE CAMPO ---------- */
const Field = ({ label, required, children }) => (
  <div className="flex flex-col gap-1">
    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
      {label} {required && <span className="text-red-400">*</span>}
    </label>
    {children}
  </div>
);

const inputBase =
  "w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition";

const selectBase = inputBase;
const textareaBase = `${inputBase} min-h-[90px] resize-none`;

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
    gradoOficial: "OF. AYUDANTE",
    nombreOficial: "",
    lupOficial: "",
    observaciones: "",
  };

  const personaInicial = {
    tipoDni: "DNI",
    nroDni: "",
    apellidoNombre: "",
    nacionalidad: "ARG",
    tripPax: "T",
    equipajeMano: 0,
    equipajeBodega: 0,
  };

  const [formData, setFormData] = useState(initialState);
  const [listaPersonas, setListaPersonas] = useState([]);
  const [personaActual, setPersonaActual] = useState(personaInicial);
  const [isSearching, setIsSearching] = useState(false);

  /* ==========================================================
      LÓGICA DE AUTOCOMPLETADO POR MATRÍCULA
     ========================================================== */
  useEffect(() => {
    const buscarDatosMatricula = async () => {
      // Solo busca si tiene una longitud mínima (ej: 3 caracteres)
      if (formData.matricula.length >= 3) {
        setIsSearching(true);
        try {
          const res = await api.get(`/flights/search-matricula/${formData.matricula}`);
          
          if (res.data) {
            const lastFlight = res.data;
            setFormData(prev => ({
              ...prev,
              tipoAeronave: lastFlight.tipoAeronave || prev.tipoAeronave,
              propietario: lastFlight.propietario || prev.propietario,
            }));

            // Si hay personas registradas en ese último vuelo, sugerir o cargar la última persona (opcional)
            if (lastFlight.personas && lastFlight.personas.length > 0) {
              const p = lastFlight.personas[0];
              setPersonaActual(prev => ({
                ...prev,
                tipoDni: p.tipoDni || "DNI",
                nroDni: p.nroDni || "",
                apellidoNombre: p.apellidoNombre || "",
                nacionalidad: p.nacionalidad || "ARG",
                tripPax: p.tripPax || "T"
              }));
            }
          }
        // eslint-disable-next-line no-unused-vars
        } catch (err) {
          // No hacemos nada si no encuentra, el usuario sigue llenando manual
          console.log("Nueva matrícula detectada.");
        } finally {
          setIsSearching(false);
        }
      }
    };

    const timer = setTimeout(() => {
      buscarDatosMatricula();
    }, 800); // Espera 800ms después de que dejó de escribir

    return () => clearTimeout(timer);
  }, [formData.matricula]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handlePersonaChange = (e) => {
    const { name, value } = e.target;
    setPersonaActual((p) => ({
      ...p,
      [name]:
        name === "equipajeMano" || name === "equipajeBodega"
          ? Number(value) || 0
          : value,
    }));
  };

  const agregarPersona = () => {
    if (!personaActual.apellidoNombre || !personaActual.nroDni) {
      return Swal.fire("Atención", "Apellido y documento obligatorios", "warning");
    }
    setListaPersonas((p) => [...p, personaActual]);
    setPersonaActual(personaInicial);
  };

  const quitarPersona = (i) => {
    setListaPersonas((p) => p.filter((_, idx) => idx !== i));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (listaPersonas.length === 0) {
      return Swal.fire("Error", "Debe cargar al menos una persona", "error");
    }

    try {
      const payload = {
        ...formData,
        personas: listaPersonas,
        procedencia: formData.tipoMovimiento === "ARRIBO" ? (formData.procedencia || "DESCONOCIDO") : "N/A",
        destino: formData.tipoMovimiento === "PARTIDA" ? (formData.destino || "DESCONOCIDO") : "N/A",
      };

      const response = await api.post("/flights", payload);
      const numeroRegistro = response.data?.nroRegistro;

      await Swal.fire({
        icon: "success",
        title: "Registro guardado correctamente",
        html: `
          <div class="mt-2 p-3 bg-slate-100 rounded-lg border border-blue-200 text-center">
            <p class="text-sm text-slate-600">Número de Folio:</p>
            <strong class="text-xl text-blue-600">${numeroRegistro}</strong>
          </div>
        `,
        confirmButtonColor: "#2563eb"
      });

      setFormData(initialState);
      setListaPersonas([]);
      setPersonaActual(personaInicial);
      if (onFlightAdded) onFlightAdded();
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Error al guardar", "error");
    }
  };

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
      <div className="flex">
        {["ARRIBO", "PARTIDA"].map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setFormData({ ...formData, tipoMovimiento: t })}
            className={`flex-1 py-4 font-black tracking-widest transition ${
              formData.tipoMovimiento === t
                ? t === "ARRIBO" ? "bg-blue-600 text-white" : "bg-amber-600 text-white"
                : "bg-slate-950 text-slate-500"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-10">
        <div className="grid md:grid-cols-3 gap-5">
          <Field label="Fecha" required>
            <input type="date" name="fecha" value={formData.fecha} onChange={handleChange} className={inputBase} required />
          </Field>

          <Field label="Hora" required>
            <input type="time" name="hora" value={formData.hora} onChange={handleChange} className={inputBase} required />
          </Field>

          <Field label="Matrícula" required>
            <div className="relative">
              <input 
                name="matricula" 
                value={formData.matricula} 
                onChange={handleChange} 
                className={`${inputBase} uppercase pr-10`} 
                placeholder="LV-XXX" 
                required 
              />
              {isSearching && <Loader2 className="absolute right-3 top-2.5 animate-spin text-blue-500" size={16} />}
            </div>
          </Field>

          <Field label="Tipo de aeronave" required>
            <input name="tipoAeronave" value={formData.tipoAeronave} onChange={handleChange} className={`${inputBase} uppercase`} required />
          </Field>

          <Field label="Propietario / Empresa" required>
            <input name="propietario" value={formData.propietario} onChange={handleChange} className={`${inputBase} uppercase`} required />
          </Field>

          <Field label={formData.tipoMovimiento === "ARRIBO" ? "Procedencia" : "Destino"} required>
            <input
              name={formData.tipoMovimiento === "ARRIBO" ? "procedencia" : "destino"}
              value={formData.tipoMovimiento === "ARRIBO" ? formData.procedencia : formData.destino}
              onChange={handleChange}
              className={`${inputBase} uppercase`}
              required
            />
          </Field>
        </div>

        <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 space-y-5">
          <h3 className="text-blue-400 font-black flex items-center gap-2">
            <Users size={18} /> Manifiesto de Personas
          </h3>

          <div className="grid md:grid-cols-6 gap-4">
            <Field label="Documento" required>
              <select name="tipoDni" value={personaActual.tipoDni} onChange={handlePersonaChange} className={selectBase}>
                <option value="DNI">DNI</option>
                <option value="PAS">PASAPORTE</option>
                <option value="EXT">EXTRANJERO</option>
              </select>
            </Field>

            <Field label="Número" required>
              <input name="nroDni" value={personaActual.nroDni} onChange={handlePersonaChange} className={inputBase} />
            </Field>

            <Field label="Apellido y Nombre" required>
              <input name="apellidoNombre" value={personaActual.apellidoNombre} onChange={handlePersonaChange} className={`${inputBase} md:col-span-2 uppercase`} />
            </Field>

            <Field label="Nacionalidad" required>
              <input name="nacionalidad" value={personaActual.nacionalidad} onChange={handlePersonaChange} className={`${inputBase} uppercase`} />
            </Field>
          </div>

          <div className="grid md:grid-cols-6 gap-4 items-end">
            <Field label="TRIP / PAX" required>
              <select name="tripPax" value={personaActual.tripPax} onChange={handlePersonaChange} className={selectBase}>
                <option value="T">TRIPULANTE</option>
                <option value="P">PASAJERO</option>
              </select>
            </Field>

            <Field label="Equipaje mano">
              <input type="number" name="equipajeMano" value={personaActual.equipajeMano} onChange={handlePersonaChange} className={`${inputBase} text-center font-mono`} />
            </Field>

            <Field label="Equipaje bodega">
              <input type="number" name="equipajeBodega" value={personaActual.equipajeBodega} onChange={handlePersonaChange} className={`${inputBase} text-center font-mono`} />
            </Field>

            <button
              type="button"
              onClick={agregarPersona}
              className="md:col-span-3 h-11 bg-blue-600 hover:bg-blue-500 text-white rounded-lg flex items-center justify-center gap-2 font-black uppercase tracking-widest shadow-lg shadow-blue-900/40 transition"
            >
              <UserPlus size={16} /> Agregar Persona
            </button>
          </div>

          {/* LISTA DE PERSONAS AGREGADAS */}
          <div className="space-y-2 mt-4">
            {listaPersonas.map((p, i) => (
              <div key={i} className="flex justify-between items-center bg-slate-900 border border-slate-700 p-3 rounded-lg animate-in fade-in slide-in-from-left-2">
                <div className="flex gap-4 items-center">
                   <span className="text-[10px] bg-slate-700 px-2 py-0.5 rounded text-blue-300 font-bold">{p.tripPax === "T" ? "TRIP" : "PAX"}</span>
                   <span className="text-sm text-slate-200 uppercase">
                    {p.apellidoNombre} <span className="text-slate-500 ml-2">({p.tipoDni}: {p.nroDni})</span>
                  </span>
                </div>
                <button type="button" onClick={() => quitarPersona(i)} className="p-1 hover:bg-red-500/20 rounded transition text-red-500">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <Field label="Observaciones">
          <textarea name="observaciones" value={formData.observaciones} onChange={handleChange} className={textareaBase} />
        </Field>

        <div className="grid md:grid-cols-3 gap-5">
          <Field label="Jerarquía Oficial" required>
            <select name="gradoOficial" value={formData.gradoOficial} onChange={handleChange} className={selectBase}>
              <option value="OF. AYUDANTE">OF. AYUDANTE</option>
              <option value="OF. PRINCIPAL">OF. PRINCIPAL</option>
              <option value="OF. MAYOR">OF. MAYOR</option>
              <option value="OF. JEFE">OF. JEFE</option>
              <option value="SUBINSPECTOR">SUBINSPECTOR</option>
              <option value="INSPECTOR">INSPECTOR</option>
            </select>
          </Field>
          <Field label="Nombre del oficial" required>
            <input name="nombreOficial" value={formData.nombreOficial} onChange={handleChange} className={`${inputBase} uppercase`} required />
          </Field>
          <Field label="LUP" required>
            <input name="lupOficial" value={formData.lupOficial} onChange={handleChange} className={inputBase} required />
          </Field>
        </div>

        <button
          type="submit"
          className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white font-black text-lg rounded-xl shadow-2xl shadow-blue-900/50 tracking-widest transition-all active:scale-[0.98]"
        >
          <Send size={18} className="inline mr-2" /> FINALIZAR REGISTRO
        </button>
      </form>
    </div>
  );
};

export default FlightForm;