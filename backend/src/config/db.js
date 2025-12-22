import mongoose from "mongoose";

/**
 * Conecta la app a MongoDB usando process.env.MONGO_URI
 */
export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);

    // Log solo en desarrollo (opcional)
    if (process.env.NODE_ENV !== "production") {
      console.log(`✅ MongoDB Conectado: ${conn.connection.host}`);
    }

    return conn;
  } catch (error) {
    console.error(`❌ Error de conexión a MongoDB: ${error.message}`);
    process.exit(1);
  }
};
