import mongoose from 'mongoose';

const flightSchema = new mongoose.Schema({
    fecha: { type: String, required: true },
    hora: { type: String, required: true },
    matricula: { type: String, required: true },
    tipoAeronave: { type: String, required: true },
    propietario: { type: String, default: 'PARTICULAR' },
    procedencia: { type: String, default: 'N/A' },
    destino: { type: String, default: 'N/A' },
    tipoMovimiento: { type: String, enum: ['ARRIBO', 'PARTIDA'], required: true },
    
    personas: [{
        apellidoNombre: { type: String, required: true },
        tipoDni: { type: String, default: 'DNI' },
        nroDni: { type: String, required: true },
        tripPax: { type: String, enum: ['T', 'P'], default: 'T' },
        nacionalidad: { type: String, default: 'ARG' },
        equipajeMano: { type: Number, default: 0 },
        equipajeBodega: { type: Number, default: 0 },
    }],

    gradoOficial: { type: String, required: true },
    nombreOficial: { type: String, required: true },
    lupOficial: { type: String, required: true },
    observaciones: { type: String, default: '' } 
}, { 
    timestamps: true 
});

/**
 * Middleware pre-save
 */
flightSchema.pre('save', function() {
    if (this.matricula) {
        this.matricula = this.matricula.toUpperCase();
    }
    
    if (this.nombreOficial) {
        this.nombreOficial = this.nombreOficial.toUpperCase();
    }
});

export default mongoose.model('Flight', flightSchema);