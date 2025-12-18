import React, { useState } from 'react';
import FlightForm from './components/FlightForm';
import FlightTable from './components/FlightTable';
import StatsCard from './components/StatsCard'; // Importamos las tarjetas
import { useFlights } from './hooks/useFlights'; // Importamos el hook
import { Plane, LayoutDashboard, History, PlaneLanding, PlaneTakeoff, Activity } from 'lucide-react';

function App() {
  const [refresh, setRefresh] = useState(0);
  
  // Usamos el hook para obtener los datos centralizados
  const { flights } = useFlights(refresh);

  const handleFlightAdded = () => {
    setRefresh(prev => prev + 1);
  };

  // Cálculo de estadísticas para las tarjetas
  const stats = {
    total: flights.length,
    arribos: flights.filter(f => f.tipoMovimiento === 'ARRIBO').length,
    partidas: flights.filter(f => f.tipoMovimiento === 'PARTIDA').length
  };

  return (
    <div className="min-h-screen bg-[#020617] font-sans antialiased text-slate-300">
      
      {/* NAVBAR */}
      <nav className="bg-[#0f172a] border-b border-blue-900/30 shadow-2xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg shadow-[0_0_15px_rgba(37,99,235,0.3)]">
              <Plane className="text-white" size={24} />
            </div>
            <span className="text-xl font-black tracking-tighter uppercase text-white">
              SkyLog <span className="text-blue-500 font-light">Pro</span>
            </span>
          </div>
          
          <div className="hidden md:flex items-center gap-4">
            <div className="text-[10px] font-bold bg-blue-950/50 border border-blue-800/50 px-4 py-1.5 rounded-full text-blue-400 uppercase tracking-[0.2em]">
              Terminal Junín de los Andes • PSA
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10 space-y-10">
        
        {/* SECCIÓN DE ESTADÍSTICAS (StatsCard) */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatsCard 
            title="Total Movimientos" 
            value={stats.total} 
            icon={Activity} 
            color="slate" 
          />
          <StatsCard 
            title="Arribos Registrados" 
            value={stats.arribos} 
            icon={PlaneLanding} 
            color="blue" 
          />
          <StatsCard 
            title="Partidas Registradas" 
            value={stats.partidas} 
            icon={PlaneTakeoff} 
            color="amber" 
          />
        </section>

        {/* SECCIÓN REGISTRO */}
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

        {/* SECCIÓN TABLA */}
        <section className="space-y-6">
          <div className="flex items-center justify-between ml-1">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-8 bg-blue-600 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.5)]"></div>
              <History className="text-blue-500" size={26} />
              <h2 className="text-xl font-bold text-white uppercase tracking-wider">Planilla de Registros</h2>
            </div>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest bg-slate-900/50 px-3 py-1 rounded-md border border-slate-800">
              Sincronizado en tiempo real
            </span>
          </div>

          <div className="bg-[#0f172a] rounded-3xl shadow-2xl border border-blue-900/20 overflow-hidden backdrop-blur-sm">
            {/* Le pasamos refreshTrigger para que la tabla sepa cuándo recargar */}
            <FlightTable refreshTrigger={refresh} />
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="py-12 text-center">
        <div className="w-20 h-1 bg-slate-800 mx-auto mb-6 rounded-full"></div>
        <p className="text-slate-600 text-[10px] font-bold uppercase tracking-[0.3em]">
          &copy; {new Date().getFullYear()} PSA - ROLANDO DUARTE • Todos los derechos reservados.
        </p>
      </footer>
    </div>
  );
}

export default App;