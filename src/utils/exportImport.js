const exportImport = {
  /**
   * Genera un PDF premium con la lista de empleados
   */
  generatePDF: (empleados) => {
    const { jsPDF } = window.jspdf;
    if (!jsPDF) {
      console.error("jsPDF no está cargado");
      return;
    }
    const doc = new jsPDF("l", "mm", "a4");

    const primaryColor = [37, 99, 235];
    const today = new Date().toLocaleDateString();

    doc.setFontSize(20);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("REPORTE GENERAL DE EMPLEADOS", 14, 20);

    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text("Gestión Humana", 14, 28);
    doc.text(`Fecha de generación: ${today}`, 14, 34);

    doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setLineWidth(1);
    doc.line(14, 38, 283, 38);

    const body = empleados.map((emp, index) => [
      index + 1,
      emp.cedula,
      emp.nombre_completo,
      emp.fecha_nacimiento ? emp.fecha_nacimiento.split("T")[0] : "-",
      emp.correo_electronico,
      emp.celular,
      emp.cargo,
      emp.empresa,
      emp.fecha_ingreso ? emp.fecha_ingreso.split("T")[0] : "-",
      emp.eps || "-",
      emp.fondo_pension || "-",
      emp.estado ? "Activo" : "Inactivo",
    ]);

    doc.autoTable({
      startY: 45,
      head: [
        [
          "#",
          "Cédula",
          "Nombre",
          "F. Nac.",
          "Correo",
          "Teléfono",
          "Cargo",
          "Empresa",
          "F. Ingreso",
          "EPS",
          "Fondo",
          "Estado",
        ],
      ],
      body: body,
      theme: "grid",
      headStyles: {
        fillColor: primaryColor,
        textColor: 255,
        fontSize: 8,
        halign: "center",
      },
      styles: {
        fontSize: 7.5,
        cellPadding: 2,
      },
      alternateRowStyles: {
        fillColor: [245, 247, 251],
      },
      columnStyles: {
        0: { cellWidth: 8 },
        1: { cellWidth: 20 },
        4: { cellWidth: 35 },
      },
    });

    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(150);
      doc.text(`Página ${i} de ${pageCount}`, 260, 200);
    }

    doc.save(`Reporte_Empleados_${today.replace(/\//g, "-")}.pdf`);
  },

  /**
   * Genera un archivo Excel con el historial de nómina
   */
  exportPayrollToExcel: (payrolls) => {
    const XLSX = window.XLSX;
    if (!XLSX) {
      console.error("Librería XLSX no cargada");
      return;
    }

    const data = payrolls.map(p => ({
      'Fecha Registro': new Date(p.createdAt).toLocaleDateString(),
      'Cédula': p.empleado?.cedula || '',
      'Empleado': p.empleado?.nombre_completo || '',
      'Cargo': p.empleado?.cargo || '',
      'Periodo': p.periodo,
      'Quincena': `${p.quincena}°`,
      'Días Laborados': p.dias_trabajados,
      'Salario Base (1/2)': p.salario_base_momento / 2,
      'Recargos Nocturnos': p.recargos_nocturnos,
      'Recargos Dominicales': p.recargos_dominicales,
      'Recargos Festivos': p.recargos_festivos,
      'Horas Extras': p.horas_extras,
      'Bono Alimentación': p.bono_alimentacion,
      'Bono Movilidad': p.bono_movilidad,
      'Bono Desempeño': p.bono_desempeño,
      'Bono Referidos': p.bono_referidos,
      'Otros Ingresos': p.otros_ingresos,
      'Total Devengado': p.total_devengado,
      'Descuentos': p.descuentos,
      'NETO PAGADO': p.total_pagar,
      'Comentarios': p.comentarios || ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Nómina");
    
    // Auto-ajustar columnas
    const wscols = [
      {wch: 15}, {wch: 15}, {wch: 35}, {wch: 25}, {wch: 12}, {wch: 10}, 
      {wch: 15}, {wch: 18}, {wch: 18}, {wch: 18}, {wch: 18}, {wch: 18}, 
      {wch: 18}, {wch: 18}, {wch: 18}, {wch: 18}, {wch: 18}, {wch: 20}, 
      {wch: 15}, {wch: 20}, {wch: 40}
    ];
    worksheet['!cols'] = wscols;

    XLSX.writeFile(workbook, `Reporte_Nomina_${new Date().toISOString().split('T')[0]}.xlsx`);
  },

  /**
   * Genera un comprobante de pago individual en PDF
   */
  generatePayrollVoucher: (p) => {
    const { jsPDF } = window.jspdf;
    if (!jsPDF) return;

    const doc = new jsPDF();
    const primaryColor = [37, 99, 235];
    const formatCurrency = (amt) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(amt || 0);

    // Encabezado
    doc.setFillColor(248, 250, 252);
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setFontSize(18);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("COMPROBANTE DE PAGO", 14, 25);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("Gestión Humana", 14, 32);
    doc.text(`Generado: ${new Date().toLocaleString()}`, 140, 25);

    // Información del Empleado
    doc.setDrawColor(230);
    doc.line(14, 45, 196, 45);
    
    doc.setFontSize(11);
    doc.setTextColor(0);
    doc.text("INFORMACIÓN DEL EMPLEADO", 14, 55);
    
    doc.setFontSize(9);
    doc.setTextColor(80);
    doc.text(`Nombre: ${p.empleado?.nombre_completo}`, 14, 62);
    doc.text(`Cédula: ${p.empleado?.cedula}`, 14, 67);
    doc.text(`Cargo: ${p.empleado?.cargo || 'Colaborador'}`, 140, 62);
    doc.text(`Empresa: ${p.empleado?.empresa || 'Gestión Humana'}`, 140, 67);

    // Detalles del Periodo
    doc.setFillColor(240, 249, 255);
    doc.rect(14, 75, 182, 10, 'F');
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont(undefined, 'bold');
    doc.text(`PERIODO: ${p.periodo} - ${p.quincena}° QUINCENA`, 18, 81);
    doc.setFont(undefined, 'normal');

    // Tabla de Conceptos
    const startY = 95;
    doc.setTextColor(0);
    doc.setFontSize(10);
    doc.text("CONCEPTO", 14, startY);
    doc.text("VALOR", 170, startY);
    doc.line(14, startY + 2, 196, startY + 2);

    let currentY = startY + 10;
    const addRow = (label, value, isNegative = false) => {
      doc.setTextColor(80);
      doc.text(label, 14, currentY);
      doc.setTextColor(isNegative ? 180 : 0, 0, 0);
      doc.text(isNegative ? `- ${formatCurrency(value)}` : formatCurrency(value), 196, currentY, { align: 'right' });
      currentY += 8;
    };

    addRow("Salario Base (Quincenal)", p.salario_base_momento / 2);
    if (p.recargos_nocturnos > 0) addRow("Recargos Nocturnos", p.recargos_nocturnos);
    if (p.recargos_dominicales > 0) addRow("Recargos Dominicales", p.recargos_dominicales);
    if (p.recargos_festivos > 0) addRow("Recargos Festivos", p.recargos_festivos);
    if (p.horas_extras > 0) addRow("Horas Extras", p.horas_extras);
    if (p.bono_alimentacion > 0) addRow("Bono Alimentación", p.bono_alimentacion);
    if (p.bono_movilidad > 0) addRow("Bono Movilidad", p.bono_movilidad);
    if (p.bono_desempeño > 0) addRow("Bono Desempeño", p.bono_desempeño);
    if (p.bono_referidos > 0) addRow("Bono Referidos", p.bono_referidos);
    if (p.otros_ingresos > 0) addRow("Otros Ingresos", p.otros_ingresos);
    
    doc.line(14, currentY, 196, currentY);
    currentY += 8;
    doc.setFont(undefined, 'bold');
    addRow("TOTAL DEVENGADO", p.total_devengado);
    doc.setFont(undefined, 'normal');
    
    currentY += 4;
    if (p.descuentos > 0) addRow("Descuentos / Deducciones", p.descuentos, true);

    // Total Final
    currentY += 10;
    doc.setFillColor(30, 41, 59);
    doc.rect(120, currentY - 7, 76, 15, 'F');
    doc.setTextColor(255);
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text("NETO A PAGAR:", 125, currentY + 2);
    doc.setTextColor(56, 189, 248);
    doc.text(formatCurrency(p.total_pagar), 192, currentY + 2, { align: 'right' });

    // Pie de página
    doc.setTextColor(150);
    doc.setFontSize(8);
    doc.setFont(undefined, 'italic');
    doc.text("Este documento es un soporte informativo de pago quincenal.", 14, 280);
    doc.text("Gestión Humana - Sistema Administrativo", 140, 280);

    doc.save(`Voucher_${p.empleado?.nombre_completo.replace(/ /g, '_')}_${p.periodo}_Q${p.quincena}.pdf`);
  },

  /**
   * Procesa un archivo Excel y retorna los datos
   */
  importFromExcel: (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target.result;
          const XLSX = window.XLSX;
          if (!XLSX) {
            reject("La librería de Excel no está cargada.");
            return;
          }
          const workbook = XLSX.read(data, { type: "binary" });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];

          const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

          if (rows.length < 2) {
            reject(
              "El archivo parece estar vacío o no tiene el formato correcto.",
            );
            return;
          }

          const parseDate = (val) => {
            if (!val) return "";
            if (typeof val === "number") {
              const date = new Date(Math.round((val - 25569) * 86400 * 1000));
              return date.toISOString().split("T")[0];
            }
            const str = val.toString().trim();
            const parts = str.split(/[-/]/);
            if (parts.length === 3) {
              let [d, m, a] = parts;
              const year = a.length === 2 ? `20${a}` : a;
              const month = m.padStart(2, "0");
              const day = d.padStart(2, "0");
              if (parseInt(d) > 31)
                return `${d}-${m.padStart(2, "0")}-${a.padStart(2, "0")}`;
              return `${year}-${month}-${day}`;
            }
            return str;
          };

          const headers = rows[0].map((h) =>
            h
              ? h
                  .toString()
                  .toLowerCase()
                  .normalize("NFD")
                  .replace(/[\u0300-\u036f]/g, "")
              : "",
          );

          const findIdx = (keywords, defaultIdx) => {
            const idx = headers.findIndex((h) =>
              keywords.some((kw) => h.includes(kw)),
            );
            return idx !== -1 ? idx : defaultIdx;
          };

          const idx = {
            cedula: findIdx(["cedula", "documento", "id"], 0),
            nombre: findIdx(["nombre", "empleado", "persona"], 1),
            ingreso: findIdx(["ingreso", "vinculacion", "cha"], 2),
            cargo: findIdx(["cargo", "puesto", "rol"], 3),
            empresa: findIdx(["empresa", "temporal", "entidad"], 4),
            nacimiento: findIdx(["nacimiento", "ncto"], 5),
            eps: findIdx(["eps", "salud"], 6),
            fondo: findIdx(["fondo", "pension", "afp"], 7),
            celular: findIdx(["celular", "telefono", "movil"], 8),
            emergencia: findIdx(["emergencia", "caso", "contacto"], 9),
            parentesco: findIdx(["parentesco", "parentezco", "vinculo"], 10),
            correo: findIdx(["correo", "email", "electronico"], 11),
          };

          const mappedData = rows
            .slice(1)
            .map((row) => {
              if (!row || row.length === 0) return null;
              if (!row[idx.cedula] && !row[idx.nombre]) return null;

              return {
                cedula: row[idx.cedula]
                  ? row[idx.cedula].toString().trim()
                  : "",
                nombre_completo: row[idx.nombre]
                  ? row[idx.nombre].toString().trim()
                  : "",
                fecha_ingreso: parseDate(row[idx.ingreso]),
                cargo: row[idx.cargo] || "",
                empresa: row[idx.empresa] || "",
                fecha_nacimiento: parseDate(row[idx.nacimiento]),
                eps: row[idx.eps] || "",
                fondo_pension: row[idx.fondo] || "",
                celular: row[idx.celular]
                  ? row[idx.celular].toString().trim()
                  : "",
                telefono_contacto: row[idx.emergencia]
                  ? row[idx.emergencia].toString().trim()
                  : "",
                parentesco: row[idx.parentesco] || "",
                correo_electronico: row[idx.correo]
                  ? row[idx.correo].toString().trim()
                  : "",
                contacto_emergencia: "No especificado",
                estado: true,
              };
            })
            .filter((emp) => emp && emp.cedula && emp.nombre_completo);

          if (mappedData.length === 0) {
            reject(
              "No se pudieron encontrar datos válidos. Verifica que la primera columna sea la Cédula y la segunda el Nombre.",
            );
          } else {
            resolve(mappedData);
          }
        } catch (error) {
          console.error("Error Excel:", error);
          reject("Error al procesar el archivo Excel.");
        }
      };
      reader.onerror = () => reject("No se pudo leer el archivo.");
      reader.readAsBinaryString(file);
    });
  },
};

export default exportImport;
