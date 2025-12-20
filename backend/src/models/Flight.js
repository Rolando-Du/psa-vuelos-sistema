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

/* NORMALIZACIÓN ANTES DE GUARDAR */
// Eliminamos 'next' para evitar el TypeError en versiones modernas de Mongoose
flightSchema.pre("save", function () {
  // 1. Limpieza de strings básicos
  this.matricula = (this.matricula || "S/M").toUpperCase().trim();
  this.nombreOficial = (this.nombreOficial || "S/N").toUpperCase().trim();
  this.propietario = (this.propietario || "PARTICULAR").toUpperCase().trim();

  // 2. Lógica estricta de Arribo/Partida
  if (this.tipoMovimiento === "ARRIBO") {
    this.destino = "N/A";
    this.procedencia = (this.procedencia && this.procedencia !== "N/A") 
      ? this.procedencia.toUpperCase().trim() 
      : "DESCONOCIDO";
  } else {
    this.procedencia = "N/A";
    this.destino = (this.destino && this.destino !== "N/A") 
      ? this.destino.toUpperCase().trim() 
      : "DESCONOCIDO";
  }

  // 3. Normalizar personas
  if (this.personas && Array.isArray(this.personas)) {
    this.personas.forEach((p) => {
      p.apellidoNombre = (p.apellidoNombre || "SIN NOMBRE").toUpperCase().trim();
      p.nacionalidad = (p.nacionalidad || "ARG").toUpperCase().trim();
      p.equipajeMano = Number(p.equipajeMano) || 0;
      p.equipajeBodega = Number(p.equipajeBodega) || 0;
    });
  }
});

export default mongoose.model("Flight", flightSchema);