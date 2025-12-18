import mongoose from 'mongoose';

const flightSchema = new mongoose.Schema({
    fecha: { type: String, required: true },
    hora: { type: String, required: true },
    matricula: { type: String, required: true },
    tipoAeronave: { type: String, required: true },
    propietario: { type: String },
    procedencia: { type: String, default: '' },
    destino: { type: String, default: '' },
    tipoMovimiento: { type: String, enum: ['ARRIBO', 'PARTIDA'], required: true },
    
    // Lista de personas
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
    
    // Este campo guarda herramientas, victorinox, etc.
    observaciones: { type: String, default: '' } 
}, { timestamps: true });

export default mongoose.model('Flight', flightSchema);