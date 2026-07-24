const esCedulaValida  = (v) => /^\d{6,12}$/.test(String(v).trim());
const esCelularValido = (v) => /^\d{7,15}$/.test(String(v).trim());
const esCorreoValido = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v).trim());

// Validación estricta: detecta fechas con formato correcto pero inexistentes (ej: 30/02)
const esFechaValida = (v) => {
  if (!v) return false;
  const str = String(v).trim();
  if (str === '' || str === '00/00/0000' || str === '0000-00-00') return false;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(str)) return false;

  const [year, month, day] = str.split('-').map(Number);

  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;
  if (year < 1900 || year > 2100) return false;

  const fecha = new Date(Date.UTC(year, month - 1, day));
  if (fecha.getUTCFullYear() !== year) return false;
  if (fecha.getUTCMonth() + 1 !== month) return false;
  if (fecha.getUTCDate() !== day) return false;

  return true;
};

// Verifica que una fecha (YYYY-MM-DD) no sea posterior a hoy
const esFechaFutura = (fechaISO) => {
  const hoy = new Date();
  hoy.setUTCHours(0, 0, 0, 0);

  const [year, month, day] = fechaISO.split('-').map(Number);
  const fecha = new Date(Date.UTC(year, month - 1, day));

  return fecha > hoy;
};



// ── Campos que SÍ bloquean si están vacíos ────────────────────────────────
const CAMPOS_REQUERIDOS = {
  cedula          : 'Cédula',
  nombre_completo : 'Nombre completo',
  fecha_ingreso   : 'Fecha de ingreso',
  cargo           : 'Cargo',
  empresa         : 'Empresa',
  celular         : 'Celular',
};

// ── Campos opcionales — si están vacíos se importan con null ─────────────
// NO bloquean el registro, simplemente se dejan en null para llenar después
const CAMPOS_OPCIONALES = [
  'fecha_nacimiento',
  'eps',
  'fondo_pension',
  'correo_electronico',
  'contacto_emergencia',
  'parentesco',
];

export const validarRegistros = (registros, empleadosExistentes = []) => {
  const errores = [];
  const validos = [];

  // Duplicados dentro del archivo
  const cedulasArchivo = new Map();
  const correosArchivo = new Map();

  // Duplicados contra la BD
  const cedulasBD = new Set(empleadosExistentes.map(e => String(e.cedula).trim()));
  const correosBD = new Set(
    empleadosExistentes
      .filter(e => e.correo_electronico)
      .map(e => String(e.correo_electronico).trim().toLowerCase())
  );

  registros.forEach((reg, i) => {
    const fila    = i + 2;
    const errFila = [];

    // 1. Campos requeridos
    Object.entries(CAMPOS_REQUERIDOS).forEach(([campo, etiqueta]) => {
      const val = reg[campo];
      if (!val || String(val).trim() === '') {
        errFila.push(`"${etiqueta}" está vacío`);
      }
    });

    // 2. Cédula
    const cedula = String(reg.cedula ?? '').trim().split('.')[0];

    if (cedula && !esCedulaValida(cedula)) {
      errFila.push(`Cédula "${cedula}" inválida — solo dígitos, entre 6 y 12 caracteres`);
    }
    if (cedula && esCedulaValida(cedula)) {
      if (cedulasArchivo.has(cedula)) {
        errFila.push(`Cédula "${cedula}" duplicada en el archivo — ya aparece en la fila ${cedulasArchivo.get(cedula)}`);
      } else if (cedulasBD.has(cedula)) {
        errFila.push(`Cédula "${cedula}" ya existe en el sistema`);
      } else {
        cedulasArchivo.set(cedula, fila);
      }
    }

    // 3. Correo
    const correo = String(reg.correo_electronico ?? '').trim().toLowerCase();

    if (correo && !esCorreoValido(correo)) {
      errFila.push(`Correo "${correo}" tiene formato inválido`);
    }
    if (correo && esCorreoValido(correo)) {
      if (correosArchivo.has(correo)) {
        errFila.push(`Correo "${correo}" duplicado en el archivo — ya aparece en la fila ${correosArchivo.get(correo)}`);
      } else if (correosBD.has(correo)) {
        errFila.push(`Correo "${correo}" ya está registrado en el sistema`);
      } else {
        correosArchivo.set(correo, fila);
      }
    }

    // 4. Celular
    const celular = String(reg.celular ?? '').trim().split('.')[0];

    if (celular && !esCelularValido(celular)) {
      errFila.push(`Celular "${celular}" inválido — solo dígitos, sin puntos, comas ni símbolos`);
    }

    // 5. Fechas
    if (reg.fecha_ingreso && !esFechaValida(reg.fecha_ingreso)) {
      errFila.push(`Fecha de ingreso "${reg.fecha_ingreso}" es inválida`);
    }
    if (reg.fecha_nacimiento && !esFechaValida(reg.fecha_nacimiento)) {
      errFila.push(`Fecha de nacimiento "${reg.fecha_nacimiento}" es inválida`);
    }

    // Clasificar
    if (errFila.length > 0) {
      errores.push({
        fila,
        nombre : reg.nombre_completo || `Fila ${fila}`,
        cedula : cedula || '—',
        errores: errFila,
      });
    } else {
      validos.push(reg);
    }
  });


  return { validos, errores };
};

