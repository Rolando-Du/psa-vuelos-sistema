import { useEffect, useState } from "react";
import { getFlights, anularFlight } from "@/services/flightApi";
import Swal from "sweetalert2";
import { Trash2 } from "lucide-react";

export default function Flights() {
  const [flights, setFlights] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [pages, setPages] = useState(1);

  /* ===============================
     CARGA DE REGISTROS (CORRECTA)
     =============================== */
  useEffect(() => {
    let active = true;

    const fetchFlights = async () => {
      const res = await getFlights(page, limit);

      if (!active) return;

      setFlights(res.data.flights);
      setPages(res.data.pages);
    };

    fetchFlights();

    return () => {
      active = false;
    };
  }, [page, limit]);

  /* ===============================
     ANULAR REGISTRO
     =============================== */
  const handleAnular = async (id) => {
    const { value } = await Swal.fire({
      title: "Anular registro",
      input: "textarea",
      inputLabel: "Motivo de anulación",
      showCancelButton: true,
      confirmButtonText: "ANULAR",
      background: "#020617",
      color: "#e5e7eb",
    });

    if (!value) return;

    await anularFlight(id, value);

    // recargar lista
    const res = await getFlights(page, limit);
    setFlights(res.data.flights);
    setPages(res.data.pages);

    Swal.fire("Anulado", "Registro anulado correctamente", "success");
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Libro de Movimientos</h1>

      {/* selector de cantidad */}
      <div className="mb-3">
        <select
          value={limit}
          onChange={(e) => {
            setPage(1);
            setLimit(Number(e.target.value));
          }}
          className="border px-2 py-1"
        >
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value={75}>75</option>
          <option value={100}>100</option>
        </select>
      </div>

      <table className="w-full border">
        <thead>
          <tr className="bg-slate-100">
            <th>N° Registro</th>
            <th>Fecha</th>
            <th>Matrícula</th>
            <th>Movimiento</th>
            <th>Oficial</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {flights.map((f) => (
            <tr key={f._id} className="border-t">
              <td>{f.nroRegistro}</td>
              <td>
                {f.fecha} {f.hora}
              </td>
              <td>{f.matricula}</td>
              <td>{f.tipoMovimiento}</td>
              <td>{f.nombreOficial}</td>
              <td className="text-center">
                <button
                  onClick={() => handleAnular(f._id)}
                  className="text-red-600"
                  title="Anular"
                >
                  <Trash2 size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* paginado */}
      <div className="flex gap-2 mt-4">
        <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
          ←
        </button>

        <span>
          Página {page} de {pages}
        </span>

        <button disabled={page === pages} onClick={() => setPage((p) => p + 1)}>
          →
        </button>
      </div>
    </div>
  );
}
