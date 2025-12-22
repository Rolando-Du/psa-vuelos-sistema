import { useEffect, useState, useCallback } from "react";
import { getFlights, anularFlight, getFlightById } from "@/services/flightApi";
import Swal from "sweetalert2";
import {
  Trash2,
  Edit3,
  PlusCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import FlightForm from "./FlightForm";

export default function Flights() {
  const [flights, setFlights] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [pages, setPages] = useState(1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState(null);

  const fetchFlights = useCallback(async () => {
    try {
      const res = await getFlights(page, limit);

      // ✅ Soporta varias estructuras:
      // 1) { flights: [], pages: n }
      // 2) { data: { flights: [], pages: n } }
      // 3) [] directo
      // 4) { items: [], totalPages: n } (por si cambia)
      const payload = res?.data;

      const flightData =
        (payload && Array.isArray(payload.flights) && payload.flights) ||
        (payload &&
          payload.data &&
          Array.isArray(payload.data.flights) &&
          payload.data.flights) ||
        (Array.isArray(payload) && payload) ||
        (payload && Array.isArray(payload.items) && payload.items) ||
        [];

      const totalPages =
        (payload && Number(payload.pages)) ||
        (payload && payload.data && Number(payload.data.pages)) ||
        (payload && Number(payload.totalPages)) ||
        1;

      setFlights(flightData);
      setPages(totalPages);
    } catch (error) {
      console.error("Error al obtener vuelos:", error);
      setFlights([]);
      setPages(1);
    }
  }, [page, limit]);

  useEffect(() => {
    let ignore = false;
    const loadData = async () => {
      if (!ignore) await fetchFlights();
    };
    loadData();
    return () => {
      ignore = true;
    };
  }, [fetchFlights]);

  // Función para cerrar el modal y limpiar la selección
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedFlight(null);
  };

  // Función que se ejecuta tras guardar con éxito (Crear o Editar)
  const handleFlightActionSuccess = () => {
    fetchFlights(); // Refresca la lista desde el servidor
    handleCloseModal(); // Cierra el modal y limpia el estado
  };

  // ✅ EDIT ROBUSTO: trae el vuelo completo por ID y abre modal
  const handleEdit = async (flight) => {
    if (!flight) return;

    // opcional: evitamos editar anulados
    if (flight.estado === "ANULADO") return;

    try {
      // Mostramos un loader corto para UX
      Swal.fire({
        title: "Cargando registro...",
        text: "Obteniendo datos completos del vuelo",
        allowOutsideClick: false,
        allowEscapeKey: false,
        background: "#0f172a",
        color: "#f1f5f9",
        didOpen: () => Swal.showLoading(),
      });

      // ✅ Trae vuelo completo (incluye personas, etc.)
      const res = await getFlightById(flight._id);
      const full = res?.data;

      Swal.close();

      // fallback si el backend devolvió algo raro
      setSelectedFlight(full && typeof full === "object" ? full : flight);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error al obtener vuelo por ID:", error);
      Swal.close();

      // Si falla, igual abrimos con lo que haya (no te bloquea la edición)
      setSelectedFlight(flight);
      setIsModalOpen(true);

      Swal.fire({
        icon: "warning",
        title: "Atención",
        text: "No se pudo obtener el detalle completo. Se abrirá con los datos disponibles.",
        background: "#0f172a",
        color: "#f1f5f9",
      });
    }
  };

  // Función para manejar la anulación con confirmación
  const handleAnular = async (id) => {
    const result = await Swal.fire({
      title: "¿Anular registro?",
      text: "Esta acción marcará el vuelo como inactivo.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#334155",
      confirmButtonText: "Sí, anular",
      background: "#0f172a",
      color: "#f1f5f9",
    });

    if (result.isConfirmed) {
      try {
        await anularFlight(id);
        Swal.fire("Anulado", "El registro ha sido actualizado.", "success");
        handleFlightActionSuccess();
        // eslint-disable-next-line no-unused-vars
      } catch (error) {
        Swal.fire("Error", "No se pudo anular el registro.", "error");
      }
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Modal de Edición/Creación */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 p-2 rounded-2xl w-full max-w-4xl shadow-2xl my-auto">
            <div className="p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white uppercase tracking-tight">
                {selectedFlight
                  ? `Editar Registro SMA`
                  : "Nuevo Registro de Vuelo"}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-slate-500 hover:text-white font-bold transition-colors"
              >
                ESC / CERRAR
              </button>
            </div>

            {/* COMPONENTE FORMULARIO CONECTADO */}
            <div className="max-h-[80vh] overflow-y-auto rounded-xl">
              <FlightForm
                flightToEdit={selectedFlight}
                onFlightAdded={handleFlightActionSuccess}
                clearEdit={handleCloseModal}
              />
            </div>
          </div>
        </div>
      )}

      {/* Cabecera y Botón Nuevo */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-black text-slate-100 uppercase tracking-tighter">
          Libro de Movimientos
        </h1>

        <button
          onClick={() => {
            setSelectedFlight(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-black text-xs uppercase transition-all shadow-xl shadow-blue-900/40"
        >
          <PlusCircle size={18} /> NUEVO VUELO
        </button>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-sm shadow-2xl">
        {/* Selector de Límite */}
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/40">
          <div className="flex items-center gap-3 text-[10px] text-slate-500 font-black uppercase tracking-widest">
            <span>Mostrar:</span>
            <select
              value={limit}
              onChange={(e) => {
                setPage(1);
                setLimit(Number(e.target.value));
              }}
              className="bg-slate-900 border border-slate-700 text-blue-400 px-3 py-1.5 rounded-lg outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span>Registros</span>
          </div>
        </div>

        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-950/60 text-slate-500 text-[10px] uppercase tracking-widest font-black border-b border-slate-800">
              <th className="p-5">N° Registro</th>
              <th className="p-5">Fecha / Hora</th>
              <th className="p-4">Matrícula</th>
              <th className="p-4">Movimiento</th>
              <th className="p-4">Oficial</th>
              <th className="p-4 text-center">Acciones</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-800/50">
            {flights.map((f) => (
              <tr
                key={f._id}
                className={`hover:bg-blue-500/5 transition-all ${
                  f.estado === "ANULADO" ? "opacity-30 grayscale" : ""
                }`}
              >
                <td className="p-5 font-mono text-blue-400 font-black text-sm">
                  {f.nroRegistro || "---"}
                </td>

                <td className="p-5">
                  <div className="text-slate-200 font-bold text-sm">
                    {f.fecha}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono italic">
                    {f.hora} HS
                  </div>
                </td>

                <td className="p-4 font-black text-slate-100 text-base italic">
                  {f.matricula}
                </td>

                <td className="p-4">
                  <span
                    className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-tighter ${
                      f.tipoMovimiento === "ARRIBO"
                        ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                        : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                    }`}
                  >
                    {f.tipoMovimiento}
                  </span>
                </td>

                <td className="p-4 text-slate-400 text-[11px] font-bold uppercase">
                  {f.nombreOficial}
                </td>

                <td className="p-4">
                  <div className="flex justify-center gap-1">
                    <button
                      onClick={() => handleEdit(f)}
                      className="p-2 text-slate-500 hover:text-blue-400 transition-all disabled:opacity-30"
                      title="Editar"
                      disabled={f.estado === "ANULADO"}
                    >
                      <Edit3 size={18} />
                    </button>

                    <button
                      onClick={() => handleAnular(f._id)}
                      className="p-2 text-slate-500 hover:text-red-500 transition-all"
                      title="Anular"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* PAGINACIÓN */}
        <div className="p-5 bg-slate-950/60 border-t border-slate-800 flex justify-between items-center">
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">
            Página <span className="text-blue-500">{page}</span> de{" "}
            <span className="text-white">{pages}</span>
          </p>

          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="p-2 bg-slate-900 border border-slate-800 text-slate-400 rounded-xl disabled:opacity-10 hover:border-blue-500 transition-all"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              disabled={page === pages}
              onClick={() => setPage((p) => p + 1)}
              className="p-2 bg-slate-900 border border-slate-800 text-slate-400 rounded-xl disabled:opacity-10 hover:border-blue-500 transition-all"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
