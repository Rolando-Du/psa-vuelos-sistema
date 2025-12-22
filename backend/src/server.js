import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config/db.js";

import flightRoutes from "./routes/flightRoutes.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();
connectDB();

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("SkyLog API is running... 🚀");
});

app.use("/api/auth", authRoutes);
app.use("/api/flights", flightRoutes);

app.use((req, res) => {
  res
    .status(404)
    .json({ message: `La ruta ${req.originalUrl} no existe en este servidor.` });
});

app.use((err, req, res, next) => {
  const status = err.statusCode || 500;
  res.status(status).json({
    message: err.message || "Error interno del servidor",
    error: process.env.NODE_ENV === "development" ? err.stack : {},
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT);
