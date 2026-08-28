import prisma from "../config/prisma.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || "secret_key_123",
    { expiresIn: "30d" }
  );
};

export const registerUser = async (req, res) => {
  try {
    const { username, password, nombre, lup, role } = req.body;

    if (!username || !password || !nombre || !lup) {
      return res.status(400).json({
        message: "Por favor, complete todos los campos obligatorios",
      });
    }

    const usernameNormalizado = String(username).trim();
    const lupNormalizado = String(lup).trim();

    const userExists = await prisma.user.findFirst({
      where: {
        OR: [
          { username: usernameNormalizado },
          { lup: lupNormalizado },
        ],
      },
    });

    if (userExists) {
      return res.status(400).json({
        message: "El usuario o LUP ya se encuentra registrado",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username: usernameNormalizado,
        password: hashedPassword,
        nombre: String(nombre).trim(),
        lup: lupNormalizado,
        role: role === "admin" ? "admin" : "oficial",
      },
    });

    return res.status(201).json({
      _id: user.id,
      username: user.username,
      nombre: user.nombre,
      role: user.role,
      lup: user.lup,
      token: generateToken(user.id),
    });
  } catch (error) {
    if (error?.code === "P2002") {
      return res.status(400).json({
        message: "El usuario o LUP ya se encuentra registrado",
      });
    }

    console.error("Error en registro:", error.message);

    return res.status(400).json({
      message: "Error en el registro de datos",
      error: error.message,
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await prisma.user.findUnique({
      where: {
        username: String(username || "").trim(),
      },
    });

    if (user && (await bcrypt.compare(password, user.password))) {
      return res.json({
        _id: user.id,
        username: user.username,
        nombre: user.nombre,
        role: user.role,
        lup: user.lup,
        token: generateToken(user.id),
      });
    }

    return res.status(401).json({
      message:
        "Credenciales inválidas (Usuario o contraseña incorrectos)",
    });
  } catch (error) {
    console.error("Error en login:", error.message);

    return res.status(500).json({
      message: "Error interno del servidor",
      error: error.message,
    });
  }
};