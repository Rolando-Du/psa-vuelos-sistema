import React, { useEffect, useState, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import api from "../api/axios";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import Swal from "sweetalert2";
import {
  Edit3,
  Ban,
  Search,
  Users,
  FileText,
  Table as TableIcon,
  Plane,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  Download,
  Hash,
} from "lucide-react";
import FlightForm from "./FlightForm";

const toISODate = (value) => {
  if (!value) return "";

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    const y = value.getFullYear();
    const m = String(value.getMonth() + 1).padStart(2, "0");
    const d = String(value.getDate()).padStart(2, "0");

    return `${y}-${m}-${d}`;
  }

  if (typeof value === "string") {
    const v = value.trim();

    if (v.includes("T")) {
      const dateObj = new Date(v);

      if (!Number.isNaN(dateObj.getTime())) {
        const y = dateObj.getFullYear();
        const m = String(dateObj.getMonth() + 1).padStart(2, "0");
        const d = String(dateObj.getDate()).padStart(2, "0");

        return `${y}-${m}-${d}`;
      }
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(v)) {
      return v;
    }

    if (/^\d{2}\/\d{2}\/\d{4}$/.test(v)) {
      const [d, m, y] = v.split("/");

      return `${y}-${m}-${d}`;
    }
  }

  return "";
};

const displayDate = (value) => toISODate(value);

const safeToday = () => {
  const ahora = new Date();
  const y = ahora.getFullYear();
  const m = String(ahora.getMonth() + 1).padStart(2, "0");
  const d = String(ahora.getDate()).padStart(2, "0");

  return `${y}-${m}-${d}`;
};

export default function FlightTable({ refreshTrigger, onEdit }) {
  const [flights, setFlights] = useState([]);
  const [filterMatricula, setFilterMatricula] = useState("");
  const [filterPersona, setFilterPersona] = useState("");
  const [filterFecha, setFilterFecha] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState(null);

  const rowsPerPage = 10;

  const fetchFlights = useCallback(async () => {
    try {
      const res = await api.get("/flights");
      const data = Array.isArray(res.data) ? res.data : [];

      setFlights(data);
    } catch (error) {
      console.error("Error al obtener vuelos:", error);
      setFlights([]);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    api
      .get("/flights")
      .then((res) => {
        if (cancelled) return;

        const data = Array.isArray(res.data) ? res.data : [];
        setFlights(data);
      })
      .catch((error) => {
        if (cancelled) return;

        console.error("Error al obtener vuelos:", error);
        setFlights([]);
      });

    return () => {
      cancelled = true;
    };
  }, [refreshTrigger]);

  const filteredFlights = useMemo(() => {
    const mat = filterMatricula.trim().toLowerCase();
    const per = filterPersona.trim().toLowerCase();
    const filterFechaISO = toISODate(filterFecha);

    return flights.filter((f) => {
      const fMat = (f.matricula || "").toLowerCase();
      const fReg = String(f.nroRegistro || "").toLowerCase();

      const matchMatricula = fMat.includes(mat) || fReg.includes(mat);

      const matchPersona =
        per === "" ||
        (Array.isArray(f.personas) &&
          f.personas.some((p) =>
            (p.apellidoNombre || "").toLowerCase().includes(per)
          ));

      const matchFecha =
        !filterFechaISO || toISODate(f.fecha) === filterFechaISO;

      return matchMatricula && matchPersona && matchFecha;
    });
  }, [flights, filterMatricula, filterPersona, filterFecha]);

  const totalPages = Math.ceil(filteredFlights.length / rowsPerPage) || 1;
  const visiblePage = Math.min(currentPage, totalPages);

  const indexOfLastItem = visiblePage * rowsPerPage;
  const indexOfFirstItem = indexOfLastItem - rowsPerPage;

  const currentItems = filteredFlights.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const stats = useMemo(() => {
    let totalPax = 0;
    let totalTrip = 0;

    filteredFlights.forEach((f) => {
      if (f.estado !== "ANULADO") {
        f.personas?.forEach((p) => {
          if (p.tripPax === "T") {
            totalTrip++;
          } else {
            totalPax++;
          }
        });
      }
    });

    return {
      totalPax,
      totalTrip,
      totalVuelos: filteredFlights.length,
    };
  }, [filteredFlights]);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedFlight(null);
  }, []);

  useEffect(() => {
    if (!isModalOpen) return undefined;

    const previousOverflow = document.body.style.overflow;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        handleCloseModal();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isModalOpen, handleCloseModal]);

  const handleFlightActionSuccess = useCallback(async () => {
    await fetchFlights();
    handleCloseModal();
  }, [fetchFlights, handleCloseModal]);

  const openLocalEditModal = useCallback(async (flight) => {
    if (!flight?._id) return;

    setSelectedFlight(flight);
    setIsModalOpen(true);

    try {
      const res = await api.get(`/flights/${flight._id}`);

      if (res?.data?._id) {
        setSelectedFlight(res.data);
      }
    } catch (error) {
      console.warn("Error cargando detalle:", error);
    }
  }, []);

  const handleEditClick = useCallback(
    (flight) => {
      if (!flight || flight.estado === "ANULADO") return;

      if (typeof onEdit === "function") {
        onEdit(flight);
        return;
      }

      openLocalEditModal(flight);
    },
    [onEdit, openLocalEditModal]
  );

  const handleMatriculaChange = (event) => {
    setFilterMatricula(event.target.value);
    setCurrentPage(1);
  };

  const handlePersonaChange = (event) => {
    setFilterPersona(event.target.value);
    setCurrentPage(1);
  };

  const handleFechaChange = (event) => {
    setFilterFecha(event.target.value);
    setCurrentPage(1);
  };

  const exportarExcel = () => {
    const dataParaExcel = [];

    filteredFlights.forEach((f) => {
      (f.personas || []).forEach((p) => {
        dataParaExcel.push({
          "Nº REGISTRO": f.nroRegistro || "S/N",
          ESTADO: f.estado || "ACTIVO",
          FECHA: displayDate(f.fecha),
          HORA: f.hora,
          MATRÍCULA: (f.matricula || "").toUpperCase(),
          MOVIMIENTO: (f.tipoMovimiento || "").toUpperCase(),
          "ORIGEN/DESTINO": (
            f.tipoMovimiento === "ARRIBO"
              ? f.procedencia
              : f.destino || ""
          ).toUpperCase(),
          TIPO: p.tripPax === "T" ? "TRIPULANTE" : "PASAJERO",
          "APELLIDO Y NOMBRE": (p.apellidoNombre || "").toUpperCase(),
          NACIONALIDAD: (p.nacionalidad || "ARG").toUpperCase(),
          "TIPO DOC": (p.tipoDocumento || "DNI").toUpperCase(),
          "NRO DOC": p.nroDni,
          "EQ. MANO": Number(p.equipajeMano || 0),
          "EQ. BODEGA": Number(p.equipajeBodega || 0),
          OBSERVACIONES: (f.observaciones || "").toUpperCase(),
          OFICIAL: `${f.gradoOficial || ""} ${f.nombreOficial || ""}`
            .trim()
            .toUpperCase(),
        });
      });
    });

    const ws = XLSX.utils.json_to_sheet(dataParaExcel);

    ws["!cols"] = Array(16).fill({ wch: 20 });
    ws["!rows"] = Array(dataParaExcel.length + 1).fill({ hpt: 22 });

    const range = XLSX.utils.decode_range(ws["!ref"]);

    for (let R = range.s.r; R <= range.e.r; R++) {
      for (let C = range.s.c; C <= range.e.c; C++) {
        const cell = XLSX.utils.encode_cell({
          r: R,
          c: C,
        });

        if (!ws[cell]) continue;

        if (R === 0) {
          ws[cell].s = {
            font: {
              bold: true,
              color: {
                rgb: "FFFFFF",
              },
            },
            fill: {
              fgColor: {
                rgb: "0F172A",
              },
            },
            alignment: {
              horizontal: "center",
              vertical: "center",
            },
            border: {
              top: {
                style: "thin",
              },
              bottom: {
                style: "thin",
              },
              left: {
                style: "thin",
              },
              right: {
                style: "thin",
              },
            },
          };
        } else {
          ws[cell].s = {
            alignment: {
              horizontal: "center",
              vertical: "center",
            },
            fill: {
              fgColor: {
                rgb: R % 2 === 0 ? "F1F5F9" : "FFFFFF",
              },
            },
            border: {
              top: {
                style: "thin",
              },
              bottom: {
                style: "thin",
              },
              left: {
                style: "thin",
              },
              right: {
                style: "thin",
              },
            },
          };
        }
      }
    }

    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      wb,
      ws,
      "Reporte_SMA"
    );

    XLSX.writeFile(
      wb,
      `Reporte_SMA_${safeToday()}.xlsx`
    );
  };

  const exportarPDF = () => {
    const doc = new jsPDF({
      orientation: "landscape",
    });

    const tableRows = [];

    filteredFlights.forEach((f) => {
      (f.personas || []).forEach((p) => {
        tableRows.push([
          f.nroRegistro || "-",
          f.estado === "ANULADO"
            ? `${displayDate(f.fecha)} (ANULADO)`
            : displayDate(f.fecha),
          f.hora,
          f.matricula,
          f.tipoMovimiento,
          f.tipoMovimiento === "ARRIBO"
            ? f.procedencia
            : f.destino,
          p.tripPax === "T" ? "TRIP" : "PAX",
          p.apellidoNombre,
          p.nacionalidad || "ARG",
          p.tipoDocumento || "DNI",
          p.nroDni,
          Number(p.equipajeMano || 0),
          Number(p.equipajeBodega || 0),
          f.observaciones || "-",
          `${f.gradoOficial} ${f.nombreOficial}`,
        ]);
      });
    });

    autoTable(doc, {
      head: [
        [
          "Nº REG",
          "FECHA",
          "HORA",
          "MATRÍCULA",
          "MOV.",
          "ORIG/DEST",
          "TIPO",
          "NOMBRE",
          "NAC.",
          "DOC",
          "NÚMERO",
          "EQ. MANO",
          "EQ. BODEGA",
          "OBS.",
          "OFICIAL",
        ],
      ],
      body: tableRows,
      theme: "grid",
      styles: {
        fontSize: 4.8,
        cellPadding: 0.8,
      },
      headStyles: {
        fillColor: [15, 23, 42],
      },
    });

    doc.save(
      `Reporte_SMA_General_${safeToday()}.pdf`
    );
  };

  const descargarVueloUnicoPDF = (f) => {
    const doc = new jsPDF({
      orientation: "landscape",
    });

    const tableRows = (f.personas || []).map((p) => [
      f.nroRegistro || "-",
      f.estado === "ANULADO"
        ? `${displayDate(f.fecha)} (ANULADO)`
        : displayDate(f.fecha),
      f.hora,
      f.matricula,
      f.tipoMovimiento,
      f.tipoMovimiento === "ARRIBO"
        ? f.procedencia
        : f.destino,
      p.tripPax === "T" ? "TRIP" : "PAX",
      p.apellidoNombre,
      p.nacionalidad || "ARG",
      p.tipoDocumento || "DNI",
      p.nroDni,
      Number(p.equipajeMano || 0),
      Number(p.equipajeBodega || 0),
      f.observaciones || "-",
      `${f.gradoOficial} ${f.nombreOficial}`,
    ]);

    autoTable(doc, {
      head: [
        [
          "Nº REG",
          "FECHA",
          "HORA",
          "MATRÍCULA",
          "MOV.",
          "ORIG/DEST",
          "TIPO",
          "NOMBRE",
          "NAC.",
          "DOC",
          "NÚMERO",
          "EQ. MANO",
          "EQ. BODEGA",
          "OBS.",
          "OFICIAL",
        ],
      ],
      body: tableRows,
      theme: "grid",
      styles: {
        fontSize: 5.2,
        cellPadding: 0.9,
      },
      headStyles: {
        fillColor: [15, 23, 42],
      },
    });

    doc.save(
      `Vuelo_${f.nroRegistro || f.matricula}_${displayDate(f.fecha)}.pdf`
    );
  };

  const anularVuelo = async (id) => {
    const result = await Swal.fire({
      title:
        '<span style="color: #f1f5f9">¿Anular registro?</span>',
      text: "El registro se marcará como INVÁLIDO en el sistema.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#f59e0b",
      cancelButtonColor: "#334155",
      confirmButtonText: "SÍ, ANULAR",
      cancelButtonText: "CANCELAR",
      background: "#0f172a",
      color: "#94a3b8",
    });

    if (result.isConfirmed) {
      try {
        await api.put(`/flights/${id}`, {
          estado: "ANULADO",
        });

        await fetchFlights();

        Swal.fire({
          icon: "success",
          title: "Anulado",
          background: "#0f172a",
          color: "#f1f5f9",
          timer: 1500,
          showConfirmButton: false,
        });
      } catch (error) {
        console.error("Error al anular vuelo:", error);

        Swal.fire(
          "Error",
          "No se pudo anular",
          "error"
        );
      }
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto p-2">
      {isModalOpen &&
        selectedFlight &&
        createPortal(
          <div
            className="fixed inset-0 z-9999 overflow-y-auto bg-black/80 backdrop-blur-sm"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                handleCloseModal();
              }
            }}
          >
            <div className="flex min-h-full items-start justify-center p-4 sm:p-6">
              <div
                className="my-4 w-full max-w-4xl rounded-2xl border border-slate-800 bg-slate-900 p-2 shadow-2xl"
                onMouseDown={(event) => event.stopPropagation()}
              >
                <div className="sticky top-0 z-10 flex items-center justify-between rounded-xl bg-slate-900 p-4">
                  <h2 className="text-xl font-bold uppercase text-white">
                    Editar Registro SMA
                  </h2>

                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="font-bold text-slate-500 transition-colors hover:text-white"
                  >
                    ESC / CERRAR
                  </button>
                </div>

                <div className="max-h-[calc(100vh-8rem)] overflow-y-auto rounded-xl">
                  <FlightForm
                    flightToEdit={selectedFlight}
                    onFlightAdded={handleFlightActionSuccess}
                    clearEdit={handleCloseModal}
                  />
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}

      <div className="bg-slate-900/40 backdrop-blur-md p-6 border border-slate-800 rounded-2xl shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="text-[10px] text-slate-500 font-black uppercase mb-2 block ml-1">
              Aeronave / Nº Registro
            </label>

            <div className="relative">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                size={16}
              />

              <input
                type="text"
                className="bg-slate-950/50 border border-slate-700 text-white rounded-xl pl-10 pr-4 py-2.5 w-full outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                value={filterMatricula}
                onChange={handleMatriculaChange}
                placeholder="Matrícula o SMA..."
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] text-slate-500 font-black uppercase mb-2 block ml-1">
              Persona (Nombre)
            </label>

            <div className="relative">
              <Users
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                size={16}
              />

              <input
                type="text"
                className="bg-slate-950/50 border border-slate-700 text-white rounded-xl pl-10 pr-4 py-2.5 w-full outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                value={filterPersona}
                onChange={handlePersonaChange}
                placeholder="Buscar por nombre..."
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] text-slate-500 font-black uppercase mb-2 block ml-1">
              Fecha
            </label>

            <input
              type="date"
              className="bg-slate-950/50 border border-slate-700 text-white rounded-xl px-4 py-2.5 w-full outline-none text-sm"
              value={filterFecha}
              onChange={handleFechaChange}
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={exportarPDF}
              className="flex-1 bg-rose-600 hover:bg-rose-500 text-white h-10 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase transition-all shadow-lg"
            >
              <FileText size={16} /> PDF
            </button>

            <button
              onClick={exportarExcel}
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white h-10 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase transition-all shadow-lg"
            >
              <TableIcon size={16} /> EXCEL
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-800/50">
          <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800 flex items-center gap-4">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Plane
                size={20}
                className="text-blue-500"
              />
            </div>

            <div>
              <p className="text-[9px] text-slate-500 font-black uppercase">
                Vuelos
              </p>

              <p className="text-xl font-black text-white">
                {stats.totalVuelos}
              </p>
            </div>
          </div>

          <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800 flex items-center gap-4">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <UserCheck
                size={20}
                className="text-emerald-500"
              />
            </div>

            <div>
              <p className="text-[9px] text-slate-500 font-black uppercase">
                Pasajeros
              </p>

              <p className="text-xl font-black text-white">
                {stats.totalPax}
              </p>
            </div>
          </div>

          <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800 flex items-center gap-4">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <Users
                size={20}
                className="text-amber-500"
              />
            </div>

            <div>
              <p className="text-[9px] text-slate-500 font-black uppercase">
                Tripulantes
              </p>

              <p className="text-xl font-black text-white">
                {stats.totalTrip}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-sm shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/40 text-blue-400 text-[10px] uppercase font-black border-b border-slate-800">
                <th className="p-5">
                  Nº Registro
                </th>

                <th className="p-5">
                  Fecha / Hora
                </th>

                <th className="p-5">
                  Matrícula
                </th>

                <th className="p-5">
                  Movimiento
                </th>

                <th className="p-5">
                  Manifiesto
                </th>

                <th className="p-5 text-center">
                  Acciones
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/50">
              {currentItems.map((f) => (
                <tr
                  key={f._id}
                  className={`transition-all ${
                    f.estado === "ANULADO"
                      ? "bg-red-950/10 opacity-50 grayscale"
                      : "hover:bg-blue-500/5"
                  }`}
                >
                  <td className="p-5 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Hash
                        size={14}
                        className="text-slate-600"
                      />

                      <span className="font-mono font-bold text-blue-400 text-sm">
                        {f.nroRegistro || "S/N"}
                      </span>
                    </div>
                  </td>

                  <td className="p-5 whitespace-nowrap">
                    <div className="font-bold text-slate-200 text-sm">
                      {displayDate(f.fecha)}
                    </div>

                    <div className="text-[10px] text-slate-500 mt-1">
                      {f.hora} HS
                    </div>
                  </td>

                  <td className="p-5 font-black text-slate-200 text-base">
                    {f.matricula}
                  </td>

                  <td className="p-5">
                    <span
                      className={`px-2 py-1 rounded text-[9px] font-black uppercase ${
                        f.tipoMovimiento === "ARRIBO"
                          ? "bg-blue-500/10 text-blue-400"
                          : "bg-amber-500/10 text-amber-500"
                      }`}
                    >
                      {f.tipoMovimiento}
                    </span>
                  </td>

                  <td className="p-5">
                    <div className="text-slate-200 font-bold text-[11px] uppercase">
                      {f.personas?.length || 0} Pers.
                    </div>
                  </td>

                  <td className="p-5 text-center">
                    <div className="flex justify-center gap-2">
                      {f.estado !== "ANULADO" && (
                        <>
                          <button
                            onClick={() =>
                              descargarVueloUnicoPDF(f)
                            }
                            className="text-emerald-500 hover:bg-emerald-500/10 p-2 rounded-lg"
                            title="Descargar"
                          >
                            <Download size={18} />
                          </button>

                          <button
                            onClick={() =>
                              handleEditClick(f)
                            }
                            className="text-slate-400 hover:text-blue-400 p-2 rounded-lg"
                            title="Editar"
                          >
                            <Edit3 size={18} />
                          </button>

                          <button
                            onClick={() =>
                              anularVuelo(f._id)
                            }
                            className="text-slate-400 hover:text-orange-500 p-2 rounded-lg"
                            title="Anular"
                          >
                            <Ban size={18} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-slate-950/40 border-t border-slate-800 flex items-center justify-between">
          <span className="text-[10px] text-slate-500 font-black uppercase">
            Página {visiblePage} de {totalPages}
          </span>

          <div className="flex items-center gap-3">
            <button
              disabled={visiblePage === 1}
              onClick={() =>
                setCurrentPage((page) =>
                  Math.max(1, page - 1)
                )
              }
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-blue-400 disabled:opacity-10 transition-all"
            >
              <ChevronLeft size={18} />
            </button>

            <button
              disabled={visiblePage === totalPages}
              onClick={() =>
                setCurrentPage((page) =>
                  Math.min(totalPages, page + 1)
                )
              }
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-blue-400 disabled:opacity-10 transition-all"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}