import mongoose from "mongoose";

const flightSchema = new mongoose.Schema(
  {
    nroRegistro: {
      type: String,
      unique: true,
      index: true,
      required: true,
    },
    fecha: { type: String, required: true },
    hora: { type: String, required: true },
    matricula: { type: String, required: true, trim: true, uppercase: true },
    tipoAeronave: { type: String, required: true, trim: true, uppercase: true },
    propietario: { type: String, default: "PARTICULAR", trim: true, uppercase: true },
    procedencia: { type: String, default: "N/A", trim: true, uppercase: true },
    destino: { type: String, default: "N/A", trim: true, uppercase: true },
    tipoMovimiento: {
      type: String,
      enum: ["ARRIBO", "PARTIDA"],
      required: true,
    },
    personas: [
      {
        apellidoNombre: { type: String, required: true, trim: true, uppercase: true },
        tipoDni: { type: String, enum: ["DNI", "PAS", "EXT"], default: "DNI" },
        nroDni: { type: String, required: true, trim: true },
        tripPax: { type: String, enum: ["T", "P"], default: "T" },
        nacionalidad: { type: String, default: "ARG", trim: true, uppercase: true },
        equipajeMano: { type: Number, default: 0 },
        equipajeBodega: { type: Number, default: 0 },
      },
    ],
    gradoOficial: { type: String, required: true },
    nombreOficial: { type: String, required: true, trim: true, uppercase: true },
    lupOficial: { type: String, required: true, trim: true },
    observaciones: { type: String, default: "" },
    estado: {
      type: String,
      enum: ["ACTIVO", "ANULADO"],
      default: "ACTIVO",
      index: true,
    },
    anuladoAt: { type: Date, default: null },
    anuladoBy: { type: String, default: null },
  },
  { 
    timestamps: true,
    strict: true 
  }
);

/**
 * NORMALIZACIÓN PARA .save()
 * Se ejecuta al crear (flight.save() o Flight.create())
 */
flightSchema.pre("save", function () {
  this.matricula = (this.matricula || "S/M").toUpperCase().trim();
  this.nombreOficial = (this.nombreOficial || "").toUpperCase().trim();
  
  // Limpieza de procedencia/destino según movimiento
  if (this.tipoMovimiento === "ARRIBO") {
    this.destino = "N/A";
  } else {
    this.procedencia = "N/A";
  }

  // Normalizar array de personas
  if (this.personas && Array.isArray(this.personas)) {
    this.personas.forEach((p) => {
      p.apellidoNombre = (p.apellidoNombre || "SIN NOMBRE").toUpperCase().trim();
      p.nroDni = (p.nroDni || "").toString().trim();
    });
  }
  // Al no declarar 'next' en los parámetros, Mongoose no lo busca.
});

/**
 * NORMALIZACIÓN PARA ACTUALIZACIONES
 * Se ejecuta en findOneAndUpdate / findByIdAndUpdate
 */
flightSchema.pre("findOneAndUpdate", function () {
  const update = this.getUpdate();
  if (!update) return;

  // Si se actualiza la matrícula
  if (update.matricula) {
    update.matricula = update.matricula.toUpperCase().trim();
  }

  // Si se actualizan personas (reemplazo de array)
  if (update.personas && Array.isArray(update.personas)) {
    update.personas = update.personas.map(p => ({
      ...p,
      apellidoNombre: (p.apellidoNombre || "").toUpperCase().trim(),
      nroDni: (p.nroDni || "").toString().trim()
    }));
  }
});

export default mongoose.model("Flight", flightSchema);