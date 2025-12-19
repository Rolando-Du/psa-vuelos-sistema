import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret_key_123', {
        expiresIn: '30d',
    });
};

// @desc    Registrar nuevo usuario
export const registerUser = async (req, res) => {
    // DIAGNÓSTICO COMENTADO (Activar solo si hay fallas en el registro)
    // console.log("=== DATOS RECIBIDOS EN EL BACKEND ===");
    // console.log(req.body); 
    // console.log("=====================================");

    try {
        const { username, password, nombre, lup, role } = req.body;

        // 1. Validar campos obligatorios
        if (!username || !password || !nombre || !lup) {
            return res.status(400).json({ 
                message: 'Por favor, complete todos los campos obligatorios'
                // recibido: req.body // Comentado por seguridad
            });
        }

        // 2. Verificar duplicados
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
        // console.error("Error en registro:", error.message);
        res.status(400).json({ 
            message: 'Error en el registro de datos', 
            error: error.message 
        });
    }
};

// @desc    Autenticar usuario y obtener token
export const loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });

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