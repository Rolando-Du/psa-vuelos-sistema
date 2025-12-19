import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    username: { 
        type: String, 
        required: true, 
        unique: true,
        trim: true 
    },
    password: { 
        type: String, 
        required: true 
    },
    nombre: { 
        type: String, 
        required: true 
    },
    lup: { 
        type: String, 
        required: true,
        unique: true 
    },
    role: { 
        type: String, 
        enum: ['admin', 'oficial'], 
        default: 'oficial' 
    }
}, { 
    timestamps: true 
});

/**
 * Middleware para encriptar la contraseña antes de guardar.
 * Al ser una función async, Mongoose maneja el flujo automáticamente sin necesidad de 'next'.
 */
userSchema.pre('save', async function() {
    // Si la contraseña no ha sido modificada, salimos de la función
    if (!this.isModified('password')) return;

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    } catch (error) {
        throw new Error('Error al procesar la encriptación de seguridad');
    }
});

/**
 * Método para comparar contraseñas durante el inicio de sesión.
 */
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', userSchema);