import mongoose from 'mongoose';

const flightSchema = new mongoose.Schema({
    fecha: { 
        type: String, 
        required: true,
        validate: {
            validator: function(v) {
                // Converto el string 'YYYY-MM-DD' a un objeto Date
                const fechaIngresada = new Date(v + 'T00:00:00');
                const hoy = new Date();
                hoy.setHours(0, 0, 0, 0); // Pongo 'hoy' al inicio del día para comparar solo fechas
                
                return fechaIngresada >= hoy;
            },
            message: props => `La fecha ${props.value} no puede ser una fecha pasada.`
        }
    },
    hora: { type: String, required: true },
    matricula: { type: String, required: true },
    tipoAeronave: { type: String, required: true },
    propietario: { type: String },
    // CAMPOS SEPARADOS
    procedencia: { type: String, default: '' },
    destino: { type: String, default: '' },
    tipoMovimiento: { type: String, enum: ['ARRIBO', 'PARTIDA'], required: true },
    
    apellidoNombre: { type: String, required: true },
    tipoDni: { type: String, default: 'DNI' },
    nroDni: { type: String, required: true },
    tripPax: { type: String, enum: ['T', 'P'], default: 'T' },
    nacionalidad: { type: String, default: 'ARG' },
    equipajeMano: { type: Number, default: 0 },
    equipajeBodega: { type: Number, default: 0 },
    gradoOficial: { type: String, required: true },
    nombreOficial: { type: String, required: true },
    lupOficial: { type: String, required: true },
    observaciones: { type: String, default: '' }
}, { timestamps: true });

export default mongoose.model('Flight', flightSchema);