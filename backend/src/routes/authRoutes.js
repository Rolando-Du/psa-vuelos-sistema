import express from "express";
import { loginUser, registerUser } from "../controllers/authController.js";

const router = express.Router();

// Ruta: POST /api/auth/login
router.post("/login", loginUser);

// Ruta: POST /api/auth/register
router.post("/register", registerUser);

export default router;
