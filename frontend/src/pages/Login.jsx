import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Lock, User, ShieldCheck, AlertCircle, Eye, EyeOff } from "lucide-react"; 
import logoPSA from "../assets/Logo-PSA.webp";
import Swal from "sweetalert2";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); 
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
        text: "Usuario o contraseña incorrectos. Verifique sus credenciales.",
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
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-900/10 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/5 rounded-full blur-[120px]"></div>

      <div className="w-full max-w-md z-10">
        <div className="bg-[#0f172a] rounded-3xl border border-blue-900/30 shadow-2xl overflow-hidden backdrop-blur-sm">
          <div className="p-8 text-center border-b border-blue-900/20 bg-slate-900/50">
            <img 
              src={logoPSA} 
              alt="Logo PSA" 
              className="h-16 mx-auto mb-4 drop-shadow-[0_0_15px_rgba(37,99,235,0.3)]" 
            />
            <h1 className="text-2xl font-black text-white tracking-[0.2em] uppercase" style={{ fontFamily: "'Orbitron', sans-serif" }}>
              Registro de<span className="text-blue-500">Vuelos</span>
            </h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em] mt-2">
              SISTEMA DE CONTROL AEROPORTUARIO
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="space-y-4">
              {/* Usuario */}
              <div className="space-y-2">
                <label className="text-[10px] text-slate-400 font-black uppercase tracking-widest ml-1 flex items-center gap-2">
                  <User size={12} className="text-blue-500" /> Identificador / LUP
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full p-4 bg-slate-950 text-white rounded-xl border border-slate-800 focus:border-blue-500/50 outline-none transition-all placeholder:text-slate-700 font-medium"
                  placeholder="Ingrese su usuario"
                  required
                />
              </div>

              {/* Password con botón de ver/ocultar */}
              <div className="space-y-2">
                <label className="text-[10px] text-slate-400 font-black uppercase tracking-widest ml-1 flex items-center gap-2">
                  <Lock size={12} className="text-blue-500" /> Contraseña de Acceso
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"} 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-4 bg-slate-950 text-white rounded-xl border border-slate-800 focus:border-blue-500/50 outline-none transition-all placeholder:text-slate-700 pr-12"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-blue-400 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-xl font-black text-white transition-all shadow-xl flex items-center justify-center gap-3 uppercase tracking-widest text-sm ${
                loading 
                  ? "bg-slate-800 cursor-not-allowed" 
                  : "bg-blue-600 hover:bg-blue-500 shadow-blue-900/20 active:scale-[0.98]"
              }`}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  Verificando...
                </div>
              ) : (
                <>
                  <ShieldCheck size={18} /> Iniciar Sesión
                </>
              )}
            </button>
          </form>

          <div className="p-6 bg-slate-900/30 border-t border-blue-900/10 text-center">
            <div className="flex items-center justify-center gap-2 text-[9px] text-slate-500 font-bold uppercase tracking-wider">
              <AlertCircle size={12} /> Acceso restringido a personal de guardia
            </div>
          </div>
        </div>

        <p className="mt-8 text-center text-slate-600 text-[10px] font-bold uppercase tracking-[0.2em]">
          UOSPSMA • PSA NEUQUÉN
        </p>
      </div>
    </div>
  );
};

export default Login;