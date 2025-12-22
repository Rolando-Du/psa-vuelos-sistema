import mongoose from "mongoose";
import { generateSMA } from "../utils/generateSMA.js";

// (Opcional / legacy) si algún día volvés a usar contador incremental
// import Counter from "../models/Counter.js";

const personaSchema = new mongoose.Schema(
  {
    apellidoNombre: { type: String, required: true },
    tipoDocumento: {
      type: String,
      enum: ["DNI", "PASAPORTE", "CEDULA"],
      default: "DNI",
    },
    nroDni: { type: String, required: true },
    tripPax: { type: String, enum: ["T", "P"], default: "T" },
    nacionalidad: { type: String, default: "ARG" },
    equipajeMano: { type: Number, default: 0, min: 0 },
    equipajeBodega: { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

const flightSchema = new mongoose.Schema(
  {
    nroRegistro: {
      type: String,
      unique: true, // ✅ Esto ya crea índice único en Mongo (no dupliques con schema.index)
      // index: true, // ❌ NO lo actives si ya usás unique, porque también duplica
    },

    // 🔥 IMPORTANTE: si querés cargar vuelos del inicio del mes, NO bloquees fechas pasadas
    // Si algún día querés volver a bloquear, abajo te dejo el validador comentado
    fecha: { type: String, required: true },

    // ✅ Si querés volver a bloquear fechas pasadas, descomentá este bloque:
    /*
    fecha: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          // Permite controlar por ENV sin tocar código
          // if (process.env.ALLOW_PAST_FLIGHTS === "true") return true;

          const fechaIngresada = new Date(v + "T00:00:00");
          const hoy = new Date();
          hoy.setHours(0, 0, 0, 0);
          return fechaIngresada >= hoy;
        },
        message: (props) => `La fecha ${props.value} no puede ser una fecha pasada.`,
      },
    },
    */

    hora: { type: String, required: true },
    matricula: { type: String, required: true },
    tipoAeronave: { type: String, required: true },
    propietario: { type: String, default: "" },
    procedencia: { type: String, default: "" },
    destino: { type: String, default: "" },

    tipoMovimiento: {
      type: String,
      enum: ["ARRIBO", "PARTIDA"],
      required: true,
    },

    personas: {
      type: [personaSchema],
      required: true,
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length > 0,
        message: "El manifiesto de personas no puede estar vacío.",
      },
    },

    gradoOficial: { type: String, required: true },
    nombreOficial: { type: String, required: true },
    lupOficial: { type: String, required: true },

    observaciones: { type: String, default: "" },

    estado: {
      type: String,
      enum: ["ACTIVO", "ANULADO"],
      default: "ACTIVO",
    },
  },
  { timestamps: true }
);

// --- ÍNDICES ---
// ❌ NO pongas esto porque duplica con unique: true en nroRegistro
// flightSchema.index({ nroRegistro: 1 });

// ✅ Índices útiles
flightSchema.index({ matricula: 1 });
flightSchema.index({ "personas.nroDni": 1 });

flightSchema.index(
  { fecha: 1, hora: 1, matricula: 1, tipoMovimiento: 1 },
  {
    unique: true,
    partialFilterExpression: { estado: "ACTIVO" },
    name: "idx_vuelo_unico_activo",
  }
);

// --- PRE SAVE (PROMISE STYLE) ---
// ✅ En hooks async NO uses next()
flightSchema.pre("save", async function () {
  if (!this.nroRegistro) {
    // console.log("Generando nroRegistro para nuevo vuelo..."); // (debug opcional)
    this.nroRegistro = await generateSMA();
    // console.log("Asignado nroRegistro:", this.nroRegistro); // (debug opcional)
  }
});

const Flight = mongoose.models.Flight || mongoose.model("Flight", flightSchema);
export default Flight;
