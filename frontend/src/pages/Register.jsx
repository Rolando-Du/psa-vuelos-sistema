import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth"; 
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import logoPSA from "../assets/Logo-PSA.webp";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    nombre: "",
    lup: "",
    role: "admin" 
  });

  const { register } = useAuth(); 
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(formData);
      Swal.fire({
        icon: "success",
        title: "Éxito",
        text: "Usuario Administrador Creado Correctamente",
        background: "#0f172a",
        color: "#fff",
        confirmButtonColor: "#2563eb"
      });
      navigate("/login");
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.response?.data?.message || "Error al registrar el usuario",
        background: "#0f172a",
        color: "#fff"
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6">
      <div className="bg-[#0f172a] p-8 rounded-3xl border border-blue-900/30 w-full max-w-md shadow-2xl">
        <div className="text-center mb-8">
            <img src={logoPSA} alt="Logo PSA" className="h-12 mx-auto mb-4" />
            <h2 className="text-white text-xl font-black uppercase tracking-[0.2em]">Registro Inicial</h2>
            <p className="text-slate-500 text-[10px] font-bold mt-2 uppercase">Configuración de Administrador</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] text-slate-400 font-black uppercase tracking-widest ml-1">Nombre Completo</label>
            <input type="text" className="w-full p-3 bg-slate-950 text-white rounded-xl border border-slate-800 outline-none focus:border-blue-500/50"
              onChange={(e) => setFormData({...formData, nombre: e.target.value})} required />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-slate-400 font-black uppercase tracking-widest ml-1">Usuario (LUP o Apellido)</label>
            <input type="text" className="w-full p-3 bg-slate-950 text-white rounded-xl border border-slate-800 outline-none focus:border-blue-500/50"
              onChange={(e) => setFormData({...formData, username: e.target.value})} required />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-slate-400 font-black uppercase tracking-widest ml-1">LUP</label>
            <input type="text" className="w-full p-3 bg-slate-950 text-white rounded-xl border border-slate-800 outline-none focus:border-blue-500/50"
              onChange={(e) => setFormData({...formData, lup: e.target.value})} required />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-slate-400 font-black uppercase tracking-widest ml-1">Contraseña</label>
            <input type="password" className="w-full p-3 bg-slate-950 text-white rounded-xl border border-slate-800 outline-none focus:border-blue-500/50"
              onChange={(e) => setFormData({...formData, password: e.target.value})} required />
          </div>
          
          <button type="submit" className="w-full py-4 mt-4 bg-blue-600 text-white rounded-xl font-black uppercase tracking-widest hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/20">
            CREAR MI USUARIO ADMIN
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;