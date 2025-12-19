import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth"; // ACTUALIZADO: Ahora viene de hooks
import { useNavigate } from "react-router-dom";
import { Lock, User, ShieldCheck, AlertCircle } from "lucide-react";
import logoPSA from "../assets/Logo-PSA.webp";
import Swal from "sweetalert2";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(username, password);
      
      const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
        background: '#0f172a',
        color: '#fff'
      });

      Toast.fire({
        icon: 'success',
        title: 'Acceso Autorizado'
      });

      navigate("/");
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error de Autenticación",
        text: "Usuario o contraseña incorrectos.",
        background: "#0f172a",
        color: "#fff",
        confirmButtonColor: "#2563eb"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="w-full max-w-md z-10">
        <div className="bg-[#0f172a] rounded-3xl border border-blue-900/30 shadow-2xl overflow-hidden">
          <div className="p-8 text-center border-b border-blue-900/20 bg-slate-900/50">
            <img src={logoPSA} alt="Logo PSA" className="h-16 mx-auto mb-4" />
            <h1 className="text-2xl font-black text-white tracking-[0.2em] uppercase">
              SKY<span className="text-blue-500">LOG</span>
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] text-slate-400 font-black uppercase tracking-widest ml-1 flex items-center gap-2">
                  <User size={12} className="text-blue-500" /> Identificador / LUP
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full p-4 bg-slate-950 text-white rounded-xl border border-slate-800 outline-none focus:border-blue-500/50"
                  placeholder="Ingrese su usuario"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] text-slate-400 font-black uppercase tracking-widest ml-1 flex items-center gap-2">
                  <Lock size={12} className="text-blue-500" /> Contraseña
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-4 bg-slate-950 text-white rounded-xl border border-slate-800 outline-none focus:border-blue-500/50"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black uppercase tracking-widest transition-all"
            >
              {loading ? "Verificando..." : "Iniciar Sesión"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;