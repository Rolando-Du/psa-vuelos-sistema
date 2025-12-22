import React, { useState, useEffect, useCallback } from "react";
import {
  Send,
  UserPlus,
  Trash2,
  Users,
  MessageSquare,
  Briefcase,
  Package,
  RefreshCcw,
} from "lucide-react";
import api from "../api/axios";
import Swal from "sweetalert2";

/* ─────────────────────────────────────────────────────────────
   Helpers de fecha (para que el input date SIEMPRE funcione)
   - Si te llega "DD/MM/YYYY" lo convierte a "YYYY-MM-DD"
   - Si ya viene "YYYY-MM-DD" lo deja igual
───────────────────────────────────────────────────────────── */
const todayISO = () => new Date().toISOString().split("T")[0];

const normalizeDateForInput = (value) => {
  if (!value) return "";
  // yyyy-mm-dd
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  // dd/mm/yyyy
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
    const [d, m, y] = value.split("/");
    return `${y}-${m}-${d}`;
  }
  return value;
};

// Lo que mandamos al backend (en ISO)
const normalizeDateForAPI = (value) => normalizeDateForInput(value);

/* ─────────────────────────────────────────────────────────────
   Estado inicial
───────────────────────────────────────────────────────────── */
const initialState = {
  fecha: todayISO(),
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

const FlightForm = ({ onFlightAdded, flightToEdit, clearEdit }) => {
  const [formData, setFormData] = useState(initialState);
  const [listaPersonas, setListaPersonas] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Autocompletado de personas (histórico)
  const [historicoPersonas, setHistoricoPersonas] = useState([]);

  const [personaActual, setPersonaActual] = useState({
    apellidoNombre: "",
    tipoDocumento: "DNI",
    nroDni: "",
    tripPax: "T",
    equipajeMano: 0,
    equipajeBodega: 0,
    nacionalidad: "ARG",
  });

  /* ─────────────────────────────────────────────────────────────
     Cargar personas previas para autocompletar
  ───────────────────────────────────────────────────────────── */
  const cargarPersonas = useCallback(async () => {
    try {
      const res = await api.get("/flights");
      const personas = (res.data || []).flatMap((v) => v.personas || []);
      setHistoricoPersonas(personas);
    } catch (error) {
      console.error("Error al obtener personas para autocompletado", error);
    }
  }, []);

  useEffect(() => {
    cargarPersonas();
  }, [onFlightAdded, cargarPersonas]);

  /* ─────────────────────────────────────────────────────────────
     Si hay edición: cargamos el vuelo y NORMALIZAMOS la fecha
     (Si te viene DD/MM/YYYY, el input date no lo entiende)
  ───────────────────────────────────────────────────────────── */
  useEffect(() => {
    if (flightToEdit) {
      setFormData({
        fecha: normalizeDateForInput(flightToEdit.fecha) || todayISO(),
        hora: flightToEdit.hora || "",
        matricula: flightToEdit.matricula || "",
        tipoAeronave: flightToEdit.tipoAeronave || "",
        propietario: flightToEdit.propietario || "",
        procedencia: flightToEdit.procedencia || "",
        destino: flightToEdit.destino || "",
        tipoMovimiento: flightToEdit.tipoMovimiento || "ARRIBO",
        gradoOficial: flightToEdit.gradoOficial || "AYUDANTE",
        nombreOficial: flightToEdit.nombreOficial || "",
        lupOficial: flightToEdit.lupOficial || "",
        observaciones: flightToEdit.observaciones || "",
      });
      setListaPersonas(flightToEdit.personas || []);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setFormData({ ...initialState, fecha: todayISO() });
      setListaPersonas([]);
    }
  }, [flightToEdit]);

  /* ─────────────────────────────────────────────────────────────
     Inputs del vuelo
  ───────────────────────────────────────────────────────────── */
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "fecha") {
      // Aseguramos que SIEMPRE sea YYYY-MM-DD
      setFormData((prev) => ({ ...prev, fecha: normalizeDateForInput(value) }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /* ─────────────────────────────────────────────────────────────
     Inputs de persona (autocompletado por documento)
  ───────────────────────────────────────────────────────────── */
  const handlePersonaChange = (e) => {
    const { name, value } = e.target;

    if (name === "nroDni") {
      const encontrada = historicoPersonas.find(
        (p) => (p.nroDni || "").trim() === value.trim()
      );

      if (encontrada) {
        setPersonaActual((prev) => ({
          ...prev,
          nroDni: value,
          apellidoNombre: encontrada.apellidoNombre || "",
          nacionalidad: encontrada.nacionalidad || "ARG",
          tipoDocumento: encontrada.tipoDocumento || encontrada.tipoDocumento || "DNI",
        }));
        return;
      }
    }

    const finalValue = name.includes("equipaje")
      ? parseInt(value, 10) || 0
      : value;

    setPersonaActual((prev) => ({ ...prev, [name]: finalValue }));
  };

  /* ─────────────────────────────────────────────────────────────
     Agregar persona al manifiesto
  ───────────────────────────────────────────────────────────── */
  const agregarPersonaALista = () => {
    if (!personaActual.apellidoNombre || !personaActual.nroDni) {
      return Swal.fire("Atención", "Nombre y Documento obligatorios", "warning");
    }

    setListaPersonas((prev) => [...prev, { ...personaActual }]);

    setPersonaActual({
      apellidoNombre: "",
      tipoDocumento: "DNI",
      nroDni: "",
      tripPax: "T",
      equipajeMano: 0,
      equipajeBodega: 0,
      nacionalidad: "ARG",
    });
  };

  /* ─────────────────────────────────────────────────────────────
     Submit: normaliza TODO antes de enviar
     (uppercase / trim / fecha ISO / números)
  ───────────────────────────────────────────────────────────── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (listaPersonas.length === 0) {
      return Swal.fire("Error", "El manifiesto no puede estar vacío", "error");
    }

    setIsSubmitting(true);

    try {
      const dataFinal = {
        ...formData,
        fecha: normalizeDateForAPI(formData.fecha),
        hora: (formData.hora || "").trim(),
        matricula: (formData.matricula || "").toUpperCase().trim(),
        tipoAeronave: (formData.tipoAeronave || "").toUpperCase().trim(),
        propietario: (formData.propietario || "").toUpperCase().trim(),
        procedencia: (formData.procedencia || "").toUpperCase().trim(),
        destino: (formData.destino || "").toUpperCase().trim(),
        tipoMovimiento: (formData.tipoMovimiento || "ARRIBO").toUpperCase().trim(),
        gradoOficial: (formData.gradoOficial || "").toUpperCase().trim(),
        nombreOficial: (formData.nombreOficial || "").toUpperCase().trim(),
        lupOficial: (formData.lupOficial || "").toUpperCase().trim(),
        observaciones: (formData.observaciones || "").toUpperCase().trim(),
        personas: listaPersonas.map((p) => ({
          ...p,
          apellidoNombre: (p.apellidoNombre || "").toUpperCase().trim(),
          tipoDocumento: (p.tipoDocumento || "DNI").toUpperCase().trim(),
          nroDni: (p.nroDni || "").trim(),
          tripPax: (p.tripPax || "T").toUpperCase().trim(),
          nacionalidad: (p.nacionalidad || "ARG").toUpperCase().trim(),
          equipajeMano: Number(p.equipajeMano || 0),
          equipajeBodega: Number(p.equipajeBodega || 0),
        })),
      };

      if (flightToEdit) {
        //  ACTUALIZACIÓN
        await api.put(`/flights/${flightToEdit._id}`, dataFinal);

        Swal.fire({
          icon: "success",
          title: "Actualizado",
          text: `Registro ${flightToEdit.nroRegistro} guardado.`,
          background: "#0f172a",
          color: "#fff",
        });

        clearEdit?.();
      } else {
        //  CREACIÓN
        const res = await api.post("/flights", dataFinal);
        const nroAsignado = res.data?.nroRegistro;

        Swal.fire({
          icon: "success",
          title: "Registro Exitoso",
          html: `<div class="text-lg">Asignado:<br/><b class="text-blue-400 text-2xl">${
            nroAsignado || "-"
          }</b></div>`,
          background: "#0f172a",
          color: "#fff",
        });
      }

      onFlightAdded?.();
      setFormData({ ...initialState, fecha: todayISO() });
      setListaPersonas([]);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error de Servidor",
        text: err.response?.data?.message || "No se pudo conectar con el servidor",
        background: "#0f172a",
        color: "#fff",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-900 rounded-2xl border border-blue-900/20 shadow-2xl overflow-hidden text-slate-200">
      {/* Selector de Movimiento */}
      <div className="flex border-b border-slate-800">
        {!flightToEdit ? (
          <>
            <button
              type="button"
              onClick={() =>
                setFormData({ ...formData, tipoMovimiento: "ARRIBO" })
              }
              className={`flex-1 py-4 font-black tracking-widest transition-all ${
                formData.tipoMovimiento === "ARRIBO"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-900 text-slate-500 hover:text-slate-300"
              }`}
            >
              ARRIBOS
            </button>
            <button
              type="button"
              onClick={() =>
                setFormData({ ...formData, tipoMovimiento: "PARTIDA" })
              }
              className={`flex-1 py-4 font-black tracking-widest transition-all ${
                formData.tipoMovimiento === "PARTIDA"
                  ? "bg-amber-600 text-white"
                  : "bg-slate-900 text-slate-500 hover:text-slate-300"
              }`}
            >
              PARTIDAS
            </button>
          </>
        ) : (
          <div className="flex-1 py-4 bg-indigo-900/40 flex justify-between items-center px-8 border-b-2 border-indigo-500">
            <h2 className="font-black tracking-widest text-indigo-400 flex items-center gap-3">
              <RefreshCcw
                size={20}
                className={isSubmitting ? "animate-spin" : ""}
              />
              EDITANDO: {flightToEdit.nroRegistro}
            </h2>
            <button
              type="button"
              onClick={clearEdit}
              className="text-xs bg-red-500/20 text-red-500 px-4 py-1 rounded-full border border-red-500/50 font-bold"
            >
              CANCELAR
            </button>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-8">
        {/* Fila 1: Fecha, Hora, Matrícula */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] text-slate-500 font-bold uppercase ml-1">
              Fecha
            </label>
            <input
              type="date"
              name="fecha"
              value={formData.fecha}
              onChange={handleChange}
              className="w-full p-3 bg-slate-800 text-white rounded-lg border border-slate-700 outline-none focus:border-blue-500"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-slate-500 font-bold uppercase ml-1">
              Hora
            </label>
            <input
              type="time"
              name="hora"
              value={formData.hora}
              onChange={handleChange}
              className="w-full p-3 bg-slate-800 text-white rounded-lg border border-slate-700 outline-none focus:border-blue-500"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-slate-500 font-bold uppercase ml-1">
              Matrícula
            </label>
            <input
              type="text"
              name="matricula"
              placeholder="LV-XXX"
              value={formData.matricula}
              onChange={handleChange}
              className="w-full p-3 bg-slate-800 text-blue-400 font-black rounded-lg border border-slate-700 uppercase outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        {/* Fila 2: Aeronave, Propietario, Ruta */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            name="tipoAeronave"
            placeholder="TIPO AERONAVE"
            value={formData.tipoAeronave}
            onChange={handleChange}
            className="p-3 bg-slate-800 text-white rounded-lg border border-slate-700 uppercase outline-none"
            required
          />
          <input
            type="text"
            name="propietario"
            placeholder="PROPIETARIO / EMPRESA"
            value={formData.propietario}
            onChange={handleChange}
            className="p-3 bg-slate-800 text-white rounded-lg border border-slate-700 uppercase outline-none"
          />
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

        {/* Sección de Manifiesto */}
        <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 space-y-6">
          <h3 className="text-blue-400 font-black text-sm uppercase tracking-widest flex items-center gap-2">
            <Users size={18} /> Manifiesto de Personas
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-2">
              <select
                name="tipoDocumento"
                value={personaActual.tipoDocumento}
                onChange={handlePersonaChange}
                className="w-full p-3 bg-slate-900 text-white rounded-lg border border-slate-700 outline-none text-xs font-bold"
              >
                <option value="DNI">DNI</option>
                <option value="PASAPORTE">PASAPORTE</option>
                <option value="CEDULA">CÉDULA</option>
              </select>
            </div>

            <div className="md:col-span-3">
              <input
                type="text"
                name="nroDni"
                placeholder="NRO DOC"
                value={personaActual.nroDni}
                onChange={handlePersonaChange}
                className="w-full p-3 bg-slate-900 text-white rounded-lg border border-slate-700 font-mono outline-none text-sm"
              />
            </div>

            <div className="md:col-span-5">
              <input
                type="text"
                name="apellidoNombre"
                placeholder="APELLIDO Y NOMBRE"
                value={personaActual.apellidoNombre}
                onChange={handlePersonaChange}
                className="w-full p-3 bg-slate-900 text-white rounded-lg border border-slate-700 uppercase outline-none text-sm"
              />
            </div>

            <div className="md:col-span-2">
              <input
                type="text"
                name="nacionalidad"
                placeholder="ARG"
                value={personaActual.nacionalidad}
                onChange={handlePersonaChange}
                className="w-full p-3 bg-slate-900 text-white rounded-lg border border-slate-700 uppercase outline-none text-sm text-center font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <div className="md:col-span-3">
              <label className="text-[9px] text-amber-500 font-bold uppercase ml-1 flex gap-2 items-center">
                <Briefcase size={12} /> Mano (Kg)
              </label>
              <input
                type="number"
                name="equipajeMano"
                value={personaActual.equipajeMano}
                onChange={handlePersonaChange}
                className="w-full p-3 bg-slate-900 text-amber-500 rounded-lg border border-slate-700 outline-none text-sm font-bold"
              />
            </div>

            <div className="md:col-span-3">
              <label className="text-[9px] text-blue-400 font-bold uppercase ml-1 flex gap-2 items-center">
                <Package size={12} /> Bodega (Kg)
              </label>
              <input
                type="number"
                name="equipajeBodega"
                value={personaActual.equipajeBodega}
                onChange={handlePersonaChange}
                className="w-full p-3 bg-slate-900 text-blue-400 rounded-lg border border-slate-700 outline-none text-sm font-bold"
              />
            </div>

            <div className="md:col-span-3">
              <label className="text-[9px] text-slate-500 font-bold uppercase ml-1">
                Rol
              </label>
              <select
                name="tripPax"
                value={personaActual.tripPax}
                onChange={handlePersonaChange}
                className="w-full p-3 bg-slate-900 text-blue-400 font-bold rounded-lg border border-slate-700 outline-none text-sm"
              >
                <option value="T">TRIPULACIÓN</option>
                <option value="P">PASAJERO</option>
              </select>
            </div>

            <div className="md:col-span-3">
              <button
                type="button"
                onClick={agregarPersonaALista}
                className="w-full h-11.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg flex items-center justify-center gap-2 font-black text-xs transition-all uppercase shadow-lg shadow-blue-900/20"
              >
                <UserPlus size={18} /> Agregar
              </button>
            </div>
          </div>

          {/* Listado de personas agregadas */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {listaPersonas.map((p, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-slate-900 p-4 rounded-xl border border-slate-800"
              >
                <div>
                  <div className="text-slate-200 font-bold text-xs uppercase">
                    {p.apellidoNombre}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    {p.nacionalidad} — {p.nroDni} ({p.tripPax})
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setListaPersonas((prev) =>
                      prev.filter((_, i) => i !== index)
                    )
                  }
                  className="text-slate-600 hover:text-red-500 p-2"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Observaciones */}
        <div className="space-y-2">
          <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1 flex items-center gap-2">
            <MessageSquare size={14} /> Observaciones
          </label>
          <textarea
            name="observaciones"
            value={formData.observaciones}
            onChange={handleChange}
            className="w-full p-4 bg-slate-950 text-slate-200 rounded-xl border border-slate-800 focus:border-blue-500/50 outline-none min-h-24 resize-none uppercase text-sm font-medium"
          />
        </div>

        {/* Firma del Oficial */}
        <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-[9px] text-slate-500 font-bold uppercase ml-1">
              Grado
            </label>
            <select
              name="gradoOficial"
              value={formData.gradoOficial}
              onChange={handleChange}
              className="w-full p-3 bg-slate-900 text-white border border-slate-700 rounded-lg font-bold outline-none text-sm"
            >
              <option value="AYUDANTE">AYUDANTE</option>
              <option value="PRINCIPAL">PRINCIPAL</option>
              <option value="MAYOR">MAYOR</option>
              <option value="JEFE">JEFE</option>
              <option value="SUBINSPECTOR">SUBINSPECTOR</option>
              <option value="INSPECTOR">INSPECTOR</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[9px] text-slate-500 font-bold uppercase ml-1">
              Firma Oficial
            </label>
            <input
              type="text"
              name="nombreOficial"
              value={formData.nombreOficial}
              onChange={handleChange}
              className="w-full p-3 bg-slate-900 text-white border border-slate-700 rounded-lg uppercase outline-none text-sm"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-[9px] text-slate-500 font-bold uppercase ml-1">
              L.U.P.
            </label>
            <input
              type="text"
              name="lupOficial"
              value={formData.lupOficial}
              onChange={handleChange}
              className="w-full p-3 bg-slate-900 text-white border border-slate-700 rounded-lg outline-none text-sm"
              required
            />
          </div>
        </div>

        {/* Botón Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-5 rounded-xl font-black text-white transition-all shadow-2xl flex items-center justify-center gap-3 text-lg tracking-widest ${
            isSubmitting ? "opacity-50 cursor-not-allowed" : ""
          } ${
            flightToEdit
              ? "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-900/40"
              : formData.tipoMovimiento === "ARRIBO"
              ? "bg-blue-600 hover:bg-blue-500"
              : "bg-amber-600 hover:bg-amber-500"
          }`}
        >
          {isSubmitting ? (
            <RefreshCcw className="animate-spin" size={24} />
          ) : flightToEdit ? (
            <RefreshCcw size={24} />
          ) : (
            <Send size={24} />
          )}
          {isSubmitting
            ? "PROCESANDO..."
            : flightToEdit
            ? "ACTUALIZAR REGISTRO"
            : "FINALIZAR REGISTRO"}
        </button>
      </form>
    </div>
  );
};

export default FlightForm;
