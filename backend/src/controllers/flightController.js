import Flight from "../models/Flight.js";
import Counter from "../models/Counter.js";
import ExcelJS from "exceljs";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

/**
 * Función auxiliar para construir la consulta (query) de búsqueda
 */
const buildSearchQuery = (params, baseEstado) => {
  const { matricula, persona, fecha } = params;
  let query = { estado: baseEstado };

  if (matricula) {
    query.matricula = { $regex: matricula.trim(), $options: "i" };
  }

  if (persona) {
    const searchRegex = { $regex: persona.trim(), $options: "i" };
    query.$or = [
      { "personas.apellidoNombre": searchRegex },
      { "personas.nroDni": searchRegex }
    ];
  }

  if (fecha && fecha !== "") {
    if (fecha.includes("-")) {
      const [y, m, d] = fecha.split("-");
      query.fecha = `${d}/${m}/${y}`;
    } else {
      query.fecha = fecha;
    }
  }

  return query;
};

/* --- EXPORTACIÓN DE ARCHIVOS --- */

/**
 * Exportación individual de un vuelo por ID (PDF Completo)
 */
export const exportSingleFlight = async (req, res) => {
  try {
    const { id, format } = req.params;
    const f = await Flight.findById(id);

    if (!f) return res.status(404).json({ message: "Registro no encontrado" });

    if (format === "pdf") {
      const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
      
      doc.setFontSize(14);
      doc.text(`MANIFIESTO DE VUELO - MATRÍCULA: ${f.matricula}`, 14, 15);
      doc.setFontSize(9);
      doc.text(`Folio: ${f.nroRegistro} | Movimiento: ${f.tipoMovimiento} | Aeronave: ${f.tipoAeronave}`, 14, 20);

      const tableData = f.personas.map(p => [
        f.fecha,
        f.hora || "",
        f.matricula,
        f.tipoMovimiento,
        f.procedencia !== "N/A" ? f.procedencia : f.destino,
        p.tripPax === "T" ? "TRIP" : "PAX",
        p.apellidoNombre,
        p.nroDni,
        p.nacionalidad || "ARG",
        p.equipajeMano || "0",
        p.equipajeBodega || "0",
        `${f.gradoOficial} ${f.nombreOficial}`,
        f.nroRegistro
      ]);

      autoTable(doc, {
        startY: 25,
        head: [["Fecha", "Hora", "Matrícula", "Mov", "Origen/Dest", "T/P", "Nombre", "DNI", "Nac.", "Mano", "Bod.", "Oficial", "Folio"]],
        body: tableData,
        headStyles: { fillColor: [30, 41, 59], fontSize: 7 },
        styles: { fontSize: 6.5, cellPadding: 1.5 },
        alternateRowStyles: { fillColor: [241, 245, 249] }
      });

      const pdfBuffer = doc.output("arraybuffer");
      res.setHeader("Content-Type", "application/pdf");
      return res.send(Buffer.from(pdfBuffer));
    }

    res.status(400).json({ message: "Formato no soportado para exportación individual" });
  } catch (error) {
    console.error("Error exportSingleFlight:", error);
    res.status(500).json({ message: "Error al exportar el registro" });
  }
};

/**
 * Exportación General a Excel
 */
export const exportToExcel = async (req, res) => {
  try {
    const query = buildSearchQuery(req.query, "ACTIVO");
    const flights = await Flight.find(query).sort({ createdAt: -1 });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Planilla de Vuelos");

    worksheet.columns = [
      { header: "FECHA", key: "fecha", width: 12 },
      { header: "HORA", key: "hora", width: 10 },
      { header: "MATRÍCULA", key: "matricula", width: 15 },
      { header: "MOVIMIENTO", key: "tipoMovimiento", width: 15 },
      { header: "PROCEDENCIA", key: "procedencia", width: 20 },
      { header: "DESTINO", key: "destino", width: 20 },
      { header: "TIPO AVION", key: "tipoAeronave", width: 15 },
      { header: "PROPIETARIO", key: "propietario", width: 20 },
      { header: "TIPO (T/P)", key: "tripPax", width: 15 },
      { header: "APELLIDO Y NOMBRE", key: "apellidoNombre", width: 35 },
      { header: "DNI / PASAPORTE", key: "nroDni", width: 18 },
      { header: "NACIONALIDAD", key: "nacionalidad", width: 15 },
      { header: "EQ. MANO", key: "equipajeMano", width: 12 },
      { header: "EQ. BODEGA", key: "equipajeBodega", width: 12 },
      { header: "OFICIAL CARGA", key: "oficial", width: 40 },
      { header: "OBSERVACIONES", key: "observaciones", width: 40 },
      { header: "FOLIO SISTEMA", key: "nroRegistro", width: 20 },
    ];

    flights.forEach((f) => {
      if (f.personas && f.personas.length > 0) {
        f.personas.forEach((p) => {
          const row = worksheet.addRow({
            fecha: f.fecha,
            hora: f.hora,
            matricula: f.matricula,
            tipoMovimiento: f.tipoMovimiento,
            procedencia: f.procedencia,
            destino: f.destino,
            tipoAeronave: f.tipoAeronave,
            propietario: f.propietario,
            tripPax: p.tripPax === "T" ? "TRIPULANTE" : "PASAJERO",
            apellidoNombre: p.apellidoNombre,
            nroDni: p.nroDni,
            nacionalidad: p.nacionalidad,
            equipajeMano: p.equipajeMano,
            equipajeBodega: p.equipajeBodega,
            oficial: `${f.gradoOficial} ${f.nombreOficial} (LUP: ${f.lupOficial})`,
            observaciones: f.observaciones,
            nroRegistro: f.nroRegistro
          });

          row.eachCell((cell) => {
            cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
            cell.alignment = { vertical: 'middle', horizontal: 'left' };
          });
        });
      }
    });

    const headerRow = worksheet.getRow(1);
    headerRow.height = 25;
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });

    worksheet.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: worksheet.columns.length } };

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename=Reporte_Skylog_${Date.now()}.xlsx`);

    await workbook.xlsx.write(res);
    res.status(200).end();

  } catch (error) {
    console.error("Error Excel:", error);
    res.status(500).json({ message: "Error al generar Excel" });
  }
};

/**
 * Exportación General a PDF (Completo con Equipaje)
 */
export const exportToPDF = async (req, res) => {
  try {
    const query = buildSearchQuery(req.query, "ACTIVO");
    const flights = await Flight.find(query).sort({ createdAt: -1 });

    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    
    doc.setFontSize(16);
    doc.text("REGISTRO DE MOVIMIENTOS Y MANIFIESTO DE PERSONAS", 14, 15);
    doc.setFontSize(9);
    doc.text(`Generado el: ${new Date().toLocaleString()}`, 14, 21);
    
    const tableData = [];
    flights.forEach(f => {
      if (f.personas && f.personas.length > 0) {
        f.personas.forEach(p => {
          tableData.push([
            f.fecha,
            f.hora || "",
            f.matricula,
            f.tipoMovimiento,
            f.procedencia !== "N/A" ? f.procedencia : f.destino,
            p.tripPax === "T" ? "TRIP" : "PAX",
            p.apellidoNombre,
            p.nroDni,
            p.nacionalidad || "",
            p.equipajeMano || "0",
            p.equipajeBodega || "0",
            `${f.gradoOficial} ${f.nombreOficial}`,
            f.nroRegistro
          ]);
        });
      }
    });

    autoTable(doc, {
      startY: 26,
      head: [["Fecha", "Hora", "Matrícula", "Mov", "Origen/Dest", "T/P", "Nombre", "DNI", "Nac.", "Mano", "Bod.", "Oficial", "Folio"]],
      body: tableData,
      headStyles: { fillColor: [30, 41, 59], fontSize: 7 },
      styles: { fontSize: 6, cellPadding: 1.2 },
      columnStyles: {
        6: { cellWidth: 35 }, // Nombre
        11: { cellWidth: 30 } // Oficial
      },
      alternateRowStyles: { fillColor: [241, 245, 249] }
    });

    const pdfBuffer = doc.output("arraybuffer");
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=Reporte_Skylog.pdf");
    res.send(Buffer.from(pdfBuffer));

  } catch (error) {
    console.error("Error detallado PDF:", error);
    res.status(500).json({ message: "Error al generar PDF", error: error.message });
  }
};

/* --- CRUD Y BÚSQUEDA --- */

export const getFlights = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 25;
    const skip = (page - 1) * limit;

    const query = buildSearchQuery(req.query, "ACTIVO");
    const [flights, total] = await Promise.all([
      Flight.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Flight.countDocuments(query),
    ]);

    res.json({ page, limit, total, pages: Math.ceil(total / limit), flights });
  } catch (error) {
    res.status(500).json({ message: "Error al obtener registros" });
  }
};

export const getFlightsAnulados = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 25;
    const skip = (page - 1) * limit;

    const query = buildSearchQuery(req.query, "ANULADO");
    const [flights, total] = await Promise.all([
      Flight.find(query).sort({ anuladoAt: -1 }).skip(skip).limit(limit),
      Flight.countDocuments(query),
    ]);

    res.json({ page, limit, total, pages: Math.ceil(total / limit), flights });
  } catch (error) {
    res.status(500).json({ message: "Error al obtener anulados" });
  }
};

export const createFlight = async (req, res) => {
  try {
    if (!req.body.personas || req.body.personas.length === 0) {
      return res.status(400).json({ message: "Debe existir al menos una persona" });
    }
    const year = new Date().getFullYear();
    const counterKey = `flight_${year}`;
    const counter = await Counter.findOneAndUpdate(
      { _id: counterKey }, 
      { $inc: { seq: 1 } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    const nroRegistro = `SMA-${counter.seq.toString().padStart(4, "0")}/${year}`;
    
    const flight = await Flight.create({ ...req.body, nroRegistro, estado: "ACTIVO" });
    res.status(201).json({ message: "Registro creado", nroRegistro, id: flight._id });
  } catch (error) {
    res.status(500).json({ message: "Error al crear registro" });
  }
};

/**
 * ACTUALIZAR REGISTRO (EDICIÓN PERMITIDA)
 */
export const updateFlight = async (req, res) => {
  try {
    const { id } = req.params;
    const { matricula, tipoMovimiento, observaciones, personas } = req.body;

    const flight = await Flight.findById(id);
    if (!flight) return res.status(404).json({ message: "Registro no encontrado" });

    // 1. Verificación de seguridad: No editar si está ANULADO
    if (flight.estado === "ANULADO") {
      return res.status(400).json({ message: "No se puede editar un registro anulado" });
    }

    // 2. Control de tiempo (Opcional): Por ejemplo, solo permitir editar en los primeros 30 min
    const diffMs = new Date() - new Date(flight.createdAt);
    const diffMins = Math.floor(diffMs / 60000);
    
    // Si quieres poner un límite de tiempo, descomenta esto:
    // if (diffMins > 30) return res.status(403).json({ message: "Tiempo de edición expirado (máximo 30 min)" });

    // 3. Actualizamos solo los campos permitidos expresamente
    flight.matricula = matricula || flight.matricula;
    flight.tipoMovimiento = tipoMovimiento || flight.tipoMovimiento;
    flight.observaciones = observaciones || flight.observaciones;
    
    if (personas) {
      flight.personas = personas;
    }

    // El número de registro y el oficial NO SE TOCAN aquí para mantener integridad
    await flight.save();

    res.json({ message: "Registro actualizado correctamente", flight });
  } catch (error) {
    console.error("Error al actualizar:", error);
    res.status(500).json({ message: "Error interno al actualizar registro" });
  }
};

export const anularFlight = async (req, res) => {
  try {
    const { observaciones } = req.body;
    const flight = await Flight.findById(req.params.id);
    if (!flight) return res.status(404).json({ message: "No encontrado" });

    flight.estado = "ANULADO";
    flight.anuladoAt = new Date();
    flight.observaciones = `[ANULADO: ${observaciones.toUpperCase()}] ${flight.observaciones}`;
    await flight.save();
    res.json({ message: "Registro anulado" });
  } catch (error) {
    res.status(500).json({ message: "Error al anular" });
  }
};

export const searchByMatricula = async (req, res) => {
  try {
    const { matricula } = req.params;
    const flight = await Flight.findOne({ 
      matricula: matricula.toUpperCase().trim(),
      estado: "ACTIVO" 
    }).sort({ createdAt: -1 });

    if (!flight) return res.status(404).json({ message: "No encontrado" });
    res.json(flight);
  } catch (error) {
    res.status(500).json({ message: "Error en servidor" });
  }
};