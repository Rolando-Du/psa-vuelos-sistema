import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Buscamos al usuario pero ya no nos importa su rol
      req.user = await User.findById(decoded.id).select("-password");
      
      return next();
    } catch (error) {
      return res.status(401).json({ message: "Sesión expirada o token inválido" });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "No autorizado, falta el token" });
  }
};