import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Componentes
import FlightForm from "./components/FlightForm";
import FlightTable from "./components/FlightTable";
import StatsCard from "./components/StatsCard";
import ProtectedRoute from "./components/ProtectedRoute";

// Páginas
import Login from "./pages/Login"; 
import Register from "./pages/Register"; 

// Hooks y Contexto (IMPORTANTE: Rutas actualizadas)
import { useFlights } from "./hooks/useFlights"; 
import { useAuth } from "./hooks/useAuth";
import { AuthProvider } from "./context/AuthContext"; 

// Iconos y Assets
import {
  LayoutDashboard,
  History,
  PlaneLanding,
  PlaneTakeoff,
  Activity,
  LogOut
} from "lucide-react";
import logoPSA from "./assets/Logo-PSA.webp";

// Componente Interno para el Dashboard Principal
function Dashboard() {
  const [refresh, setRefresh] = useState(0);
  const { user, logout } = useAuth();
  const { flights } = useFlights(refresh);

  const handleFlightAdded = () => setRefresh((prev) => prev + 1);

  const stats = {
    total: flights.length,
    arribos: flights.filter((f) => f.tipoMovimiento === "ARRIBO").length,
    partidas: flights.filter((f) => f.tipoMovimiento === "PARTIDA").length,
  };

  return (
    <div className="min-h-screen bg-[#020617] font-sans antialiased text-slate-300">
      {/* NAVBAR */}
      <nav className="bg-[#0f172a] border-b border-blue-900/30 shadow-2xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={logoPSA} alt="Logo PSA" className="h-10 w-auto object-contain" />
            <div className="hidden sm:block w-px h-8 bg-blue-900/40"></div>
            <span className="text-xl font-black tracking-[0.15em] uppercase text-white" style={{ fontFamily: "'Orbitron', sans-serif" }}>
             Registro de<span className="text-blue-500">Vuelos</span>
            </span>
          </div>

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
          <StatsCard title="Total Movimientos" value={stats.total} icon={Activity} color="slate" />
          <StatsCard title="Arribos" value={stats.arribos} icon={PlaneLanding} color="blue" />
          <StatsCard title="Partidas" value={stats.partidas} icon={PlaneTakeoff} color="amber" />
        </section>

        <section className="space-y-6">
          <div className="flex items-center gap-3 ml-1">
            <div className="w-1.5 h-8 bg-blue-600 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.5)]"></div>
            <LayoutDashboard className="text-blue-500" size={26} />
            <h2 className="text-xl font-bold text-white uppercase tracking-wider">Carga de Movimientos</h2>
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
              <h2 className="text-xl font-bold text-white uppercase tracking-wider">Planilla de Registros</h2>
            </div>
          </div>
          <div className="bg-[#0f172a] rounded-3xl shadow-2xl border border-blue-900/20 overflow-hidden">
            <FlightTable refreshTrigger={refresh} />
          </div>
        </section>
      </main>
       {/* FOOTER */}
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

// App Principal
function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          {/* RUTA TEMPORAL - Úsala para crear usuario luego borrar */}
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