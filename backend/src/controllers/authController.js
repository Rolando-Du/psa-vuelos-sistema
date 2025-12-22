import User from '../models/User.js';
import jwt from 'jsonwebtoken';

/**
 * Generar Token JWT
 * Se utiliza para mantener la sesión del usuario por 30 días.
 */
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret_key_123', {
        expiresIn: '30d',
    });
};

// @desc    Registrar nuevo usuario
// @route   POST /api/auth/register
export const registerUser = async (req, res) => {
    console.log("=== DATOS RECIBIDOS EN EL BACKEND ===");
    console.log(req.body); 
    console.log("=====================================");

    try {
        const { username, password, nombre, lup, role } = req.body;

        // 1. Validar que todos los campos necesarios estén presentes
        if (!username || !password || !nombre || !lup) {
            return res.status(400).json({ 
                message: 'Por favor, complete todos los campos obligatorios',
                recibido: req.body 
            });
        }

        // 2. Verificar duplicados (Username o LUP)
        const userExists = await User.findOne({ $or: [{ username }, { lup }] });
        if (userExists) {
            return res.status(400).json({ message: 'El usuario o LUP ya se encuentra registrado' });
        }

        // 3. Crear el usuario
        const user = await User.create({
            username,
            password,
            nombre,
            lup,
            role: role || 'oficial'
        });

        if (user) {
            return res.status(201).json({
                _id: user._id,
                username: user.username,
                nombre: user.nombre,
                role: user.role,
                lup: user.lup,
                token: generateToken(user._id),
            });
        }
    } catch (error) {
        console.error("Error en Catch:", error.message);
        res.status(400).json({ 
            message: 'Error en el registro de datos', 
            error: error.message 
        });
    }
};

// @desc    Autenticar usuario y obtener token
// @route   POST /api/auth/login
export const loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;

        // 1. Buscar usuario por username
        const user = await User.findOne({ username });

        // 2. Verificar existencia y comparar contraseña usando el método del modelo
        if (user && (await user.comparePassword(password))) {
            res.json({
                _id: user._id,
                username: user.username,
                nombre: user.nombre,
                role: user.role,
                lup: user.lup,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Credenciales inválidas (Usuario o contraseña incorrectos)' });
        }
    } catch (error) {
        res.status(500).json({ 
            message: 'Error interno del servidor', 
            error: error.message 
        });
    }
};