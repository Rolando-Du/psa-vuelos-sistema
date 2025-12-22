import React, { useState, useMemo } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import FlightForm from "./components/FlightForm";
import FlightTable from "./components/FlightTable";
import StatsCard from "./components/StatsCard";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { useFlights } from "./hooks/useFlights";
import { useAuth } from "./hooks/useAuth";
import { AuthProvider } from "./context/AuthContext";
import {
  LayoutDashboard,
  History,
  PlaneLanding,
  PlaneTakeoff,
  Activity,
  LogOut,
  ChevronDown,
  Plane,
} from "lucide-react";
import logoPSA from "./assets/Logo-PSA.webp";

// Componente Interno para el Dashboard Principal
function Dashboard() {
  const [refresh, setRefresh] = useState(0);
  const [isTableOpen, setIsTableOpen] = useState(false);
  const { user, logout } = useAuth();
  const { flights } = useFlights(refresh);

  const handleFlightAdded = () => {
    setRefresh((prev) => prev + 1);
    setIsTableOpen(true);
  };

  const stats = useMemo(() => {
    if (!flights || !Array.isArray(flights))
      return { total: 0, arribos: 0, partidas: 0 };

    const activeFlights = flights.filter((f) => f.estado !== "ANULADO");

    return {
      total: activeFlights.length,
      arribos: activeFlights.filter(
        (f) => f.tipoMovimiento?.toString().trim().toUpperCase() === "ARRIBO"
      ).length,
      partidas: activeFlights.filter(
        (f) => f.tipoMovimiento?.toString().trim().toUpperCase() === "PARTIDA"
      ).length,
    };
  }, [flights]);

  return (
    <div className="min-h-screen bg-[#020617] font-sans antialiased text-slate-300">
      {/* ESTILOS PARA LA ANIMACIÓN DEL AVIÓN Y ESTELA BLANCA */}
      <style>
        {`
          @keyframes horizontalFly {
            0% { transform: translateX(-150px); opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { transform: translateX(250px); opacity: 0; }
          }
          .animate-horizontal-fly {
            animation: horizontalFly 12s linear infinite;
          }
          .plane-trail {
            /* Cambio a color Blanco con degradado */
            background: linear-gradient(to left, rgba(255, 255, 255, 0.4), transparent);
            height: 1px;
            width: 70px;
            position: absolute;
            left: -65px;
            top: 50%;
            transform: translateY(-50%);
            filter: blur(1px);
          }
        `}
      </style>

      {/* NAVBAR */}
      <nav className="bg-[#0f172a] border-b border-blue-900/30 shadow-2xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* LADO IZQUIERDO: LOGO Y TÍTULOS */}
          <div className="flex items-center gap-4">
            <img
              src={logoPSA}
              alt="Logo PSA"
              className="h-12 w-auto object-contain"
            />
            <div className="hidden sm:block w-px h-10 bg-blue-900/40"></div>

            <div className="flex flex-col justify-center">
              <span
                className="text-lg sm:text-xl font-black tracking-widest uppercase text-white leading-none"
                style={{ fontFamily: "'Orbitron', sans-serif" }}
              >
                Registro de<span className="text-blue-500">Vuelos</span>
              </span>
              <span className="text-[10px] font-bold text-blue-400/60 tracking-[0.5em] uppercase mt-1.5 ml-0.5">
                UOSPSMA
              </span>
            </div>
          </div>

          {/* CENTRO: AVIÓN CON ESTELA BLANCA */}
          <div className="hidden lg:flex flex-1 justify-center items-center overflow-hidden h-full mx-10 relative">
            <div className="animate-horizontal-fly relative flex items-center">
              {/* Estela de color BLANCO */}
              <div className="plane-trail"></div>
              {/* Icono de avión claro */}
              <div className="text-blue-400/30">
                <Plane
                  size={28}
                  strokeWidth={1.5}
                  style={{ transform: "rotate(43deg)" }}
                />
              </div>
            </div>
          </div>

          {/* LADO DERECHO: USUARIO Y LOGOUT */}
          <div className="flex items-center gap-6">
            <div className="hidden md:flex flex-col items-end text-right">
              <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest leading-none">
                {user?.nombre || "Usuario"}
              </span>
              <span className="text-[9px] text-slate-500 font-bold uppercase mt-1">
                {user?.role} • LUP {user?.lup}
              </span>
            </div>
            <button
              onClick={logout}
              className="p-2 hover:bg-red-500/10 text-slate-400 hover:text-red-500 rounded-lg transition-colors"
              title="Cerrar Sesión"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10 space-y-10">
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatsCard
            title="Total Movimientos"
            value={stats.total}
            icon={Activity}
            color="slate"
          />
          <StatsCard
            title="Arribos"
            value={stats.arribos}
            icon={PlaneLanding}
            color="blue"
          />
          <StatsCard
            title="Partidas"
            value={stats.partidas}
            icon={PlaneTakeoff}
            color="amber"
          />
        </section>

        <section className="space-y-6">
          <div className="flex items-center gap-3 ml-1">
            <div className="w-1.5 h-8 bg-blue-600 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.5)]"></div>
            <LayoutDashboard className="text-blue-500" size={26} />
            <h2 className="text-xl font-bold text-white uppercase tracking-wider">
              Carga de Movimientos
            </h2>
          </div>
          <div className="bg-[#0f172a] rounded-3xl shadow-2xl border border-blue-900/20 overflow-hidden">
            <FlightForm onFlightAdded={handleFlightAdded} />
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center justify-between ml-1">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-8 bg-blue-600 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.5)]"></div>
              <History className="text-blue-500" size={26} />
              <h2 className="text-xl font-bold text-white uppercase tracking-wider">
                Planilla de Registros
              </h2>
              <span className="hidden sm:inline-block ml-2 px-2 py-0.5 bg-blue-500/10 text-blue-400 text-[10px] rounded border border-blue-500/20 font-black tracking-widest uppercase">
                {flights.length} TOTAL EN BASE
              </span>
            </div>
            <button
              onClick={() => setIsTableOpen(!isTableOpen)}
              className="flex items-center gap-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-blue-500/50 px-5 py-2.5 rounded-xl transition-all shadow-lg active:scale-95 group"
            >
              <span
                className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${
                  isTableOpen
                    ? "text-blue-400"
                    : "text-slate-400 group-hover:text-white"
                }`}
              >
                {isTableOpen ? "Ocultar Planilla" : "Desplegar Planilla"}
              </span>
              <ChevronDown
                size={18}
                className={`transition-transform duration-500 ${
                  isTableOpen
                    ? "rotate-180 text-blue-400"
                    : "text-slate-500 group-hover:text-blue-400"
                }`}
              />
            </button>
          </div>
          <div
            className={`transition-all duration-700 ease-in-out overflow-hidden ${
              isTableOpen
                ? "max-h-500 opacity-100 translate-y-0"
                : "max-h-0 opacity-0 -translate-y-4 pointer-events-none"
            }`}
          >
            <div className="bg-[#0f172a] rounded-3xl shadow-2xl border border-blue-900/20 overflow-hidden">
              <FlightTable refreshTrigger={refresh} />
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 text-center">
        <div className="w-20 h-1 bg-slate-800 mx-auto mb-6 rounded-full"></div>
        <p className="text-slate-600 text-[10px] font-bold uppercase tracking-[0.3em]">
          &copy; {new Date().getFullYear()} PSA - ROLANDO DUARTE • Todos los
          derechos reservados.
        </p>
      </footer>
    </div>
  );
}

// App Principal con Rutas
function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register-temp-psa" element={<Register />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
