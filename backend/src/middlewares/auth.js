import jwt from "jsonwebtoken";
import prisma from "../config/prisma.js";

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "secret_key_123"
      );

      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          username: true,
          nombre: true,
          lup: true,
          role: true,
        },
      });

      if (!user) {
        return res.status(401).json({
          message: "Usuario no encontrado",
        });
      }

      req.user = {
        ...user,
        _id: user.id,
      };

      return next();
    } catch (error) {
      return res.status(401).json({
        message: "Sesión expirada o token inválido",
      });
    }
  }

  return res.status(401).json({
    message: "No autorizado, falta el token",
  });
};