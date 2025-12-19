import mongoose from 'mongoose';

const flightSchema = new mongoose.Schema({
    // Campo para identificar el vuelo (Ej: SMA-0001/2025)
    nroRegistro: { type: String, unique: true }, 
    
    fecha: { type: String, required: true },
    hora: { type: String, required: true },
    matricula: { type: String, required: true, trim: true },
    tipoAeronave: { type: String, required: true, trim: true },
    propietario: { type: String, default: 'PARTICULAR', trim: true },
    procedencia: { type: String, default: 'N/A', trim: true },
    destino: { type: String, default: 'N/A', trim: true },
    tipoMovimiento: { type: String, enum: ['ARRIBO', 'PARTIDA'], required: true },
    
    personas: [{
        apellidoNombre: { type: String, required: true, trim: true },
        tipoDni: { 
            type: String, 
            enum: ['DNI', 'PAS', 'EXT'], 
            default: 'DNI' 
        },
        nroDni: { type: String, required: true, trim: true },
        tripPax: { type: String, enum: ['T', 'P'], default: 'T' },
        nacionalidad: { type: String, default: 'ARG', trim: true },
        equipajeMano: { type: Number, default: 0 },
        equipajeBodega: { type: Number, default: 0 },
    }],

    gradoOficial: { type: String, required: true },
    nombreOficial: { type: String, required: true, trim: true },
    lupOficial: { type: String, required: true, trim: true },
    observaciones: { type: String, default: '' } 
}, { 
    timestamps: true 
});

flightSchema.pre('save', function() {
    if (this.matricula) this.matricula = this.matricula.toUpperCase().trim();
    if (this.nombreOficial) this.nombreOficial = this.nombreOficial.toUpperCase().trim();

    if (this.tipoMovimiento === 'ARRIBO') {
        this.destino = 'N/A';
    } else if (this.tipoMovimiento === 'PARTIDA') {
        this.procedencia = 'N/A';
    }

    if (this.personas && this.personas.length > 0) {
        this.personas.forEach(p => {
            if (p.apellidoNombre) p.apellidoNombre = p.apellidoNombre.toUpperCase().trim();
            if (p.nacionalidad) p.nacionalidad = p.nacionalidad.toUpperCase().trim();
            p.equipajeMano = Number(p.equipajeMano) || 0;
            p.equipajeBodega = Number(p.equipajeBodega) || 0;
        });
    }
});

export default mongoose.model('Flight', flightSchema);