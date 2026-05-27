import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import empleadoService from '../../services/empleadoService';
import alerts from '../../utils/alerts';

// Listas de referencia (se cargarán dinámicamente)
const EPS_LIST = [
  'SURA', 'NUEVA EPS', 'SANITAS', 'COMPENSAR', 'SALUD TOTAL', 'SAVIA SALUD', 'COOSALUD'
];

const FONDOS_LIST = [
  'PORVENIR', 'COLPENSIONES', 'PROTECCION', 'SKANDIA'
];

const CONTRATOS_LIST = [
  'Obra o Labor', 'Término Indefinido', 'Aprendizaje', 'Temporal'
];

const CrearEmpleado = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [cargosList, setCargosList] = useState([]);
  const [empresasList, setEmpresasList] = useState([]);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const [cargos, empresas] = await Promise.all([
          empleadoService.getCargos(),
          empleadoService.getEmpresas()
        ]);
        setCargosList(cargos);
        setEmpresasList(empresas);
      } catch (error) {
        console.error("Error al cargar configuración:", error);
      }
    };
    fetchConfig();
  }, []);
  const [mensaje, setMensaje] = useState('');
  const [tipoMensaje, setTipoMensaje] = useState('success');
  const [formErrors, setFormErrors] = useState({});

  // Refs para hacer foco en los errores
  const refs = {
    cedula: useRef(null),
    nombre_completo: useRef(null),
    celular: useRef(null),
    correo_electronico: useRef(null)
  };

  // Campos del formulario
  const [cedula, setCedula] = useState('');
  const [nombre_completo, setNombre_Completo] = useState('');
  const [fecha_ingreso, setFecha_ingreso] = useState('');
  const [fecha_nacimiento, setFecha_nacimiento] = useState('');
  const [celular, setCelular] = useState('');
  const [correo_electronico, setCorreo_electronico] = useState('');
  const [contacto_emergencia, setContacto_emergencia] = useState('');
  const [parentesco, setParentesco] = useState('');
  const [parentesco_otro, setParentesco_Otro] = useState('');
  const [telefono_contacto, setTelefono_contacto] = useState('');
  const [cargo, setCargo] = useState('');
  const [empresa, setEmpresa] = useState('');
  const [eps, setEps] = useState('');
  const [fondo_pension, setFondo_pension] = useState('');
  const [tipo_contrato, setTipo_contrato] = useState('Obra o Labor');
  const [fecha_vencimiento_contrato, setFecha_vencimiento_contrato] = useState('');
  const [salario_base, setSalario_base] = useState('');

  const PARENTESCOS_LIST = ["Herman@", "Tí@", "Prim@", "Amig@", "Espos@", "Otr@"];

  const handleNumericChange = (setter, value, maxLength, fieldName) => {
    const numericValue = value.replace(/[^0-9]/g, "");
    if (maxLength && numericValue.length > maxLength) return;
    setter(numericValue);
    
    // Limpiar error del campo mientras escribe
    if (formErrors[fieldName]) {
      setFormErrors(prev => ({ ...prev, [fieldName]: null }));
    }
  };

  const formatInputValue = (value) => {
    if (!value && value !== 0) return "";
    const num = value.toString().replace(/\D/g, "");
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = {};

    // Validaciones de Frontend
    if (!cedula) errors.cedula = "La cédula es obligatoria";
    if (!nombre_completo) errors.nombre_completo = "El nombre es obligatorio";
    if (!celular) {
      errors.celular = "El celular es obligatorio";
    } else if (celular.length !== 10) {
      errors.celular = "El celular debe tener 10 dígitos";
    }
    if (!correo_electronico) {
      errors.correo_electronico = "El correo es obligatorio";
    } else if (!/\S+@\S+\.\S+/.test(correo_electronico)) {
      errors.correo_electronico = "Formato de correo inválido";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      // Hacer foco en el primer error
      const firstErrorField = Object.keys(errors)[0];
      refs[firstErrorField]?.current?.focus();
      return;
    }

    setLoading(true);
    setFormErrors({});

    const empleadoData = {
      cedula,
      nombre_completo,
      fecha_ingreso,
      fecha_nacimiento,
      celular,
      correo_electronico,
      contacto_emergencia,
      parentesco,
      parentesco_otro,
      telefono_contacto,
      cargo,
      empresa,
      eps,
      fondo_pension,
      tipo_contrato,
      fecha_vencimiento_contrato: fecha_vencimiento_contrato || null,
      salario_base: parseFloat(salario_base) || 0
    };

    try {
      await empleadoService.createEmpleado(empleadoData);
      alerts.success("¡Creado!", "El empleado ha sido registrado correctamente.");
      setTimeout(() => navigate("/empleados/listaEmpleados"), 1500);
    } catch (error) {
      const backendErrors = error.response?.data?.errors || [];
      const newErrors = {};

      if (backendErrors.length > 0) {
        backendErrors.forEach((err) => {
          if (err.toLowerCase().includes("cédula")) newErrors.cedula = err;
          if (err.toLowerCase().includes("celular")) newErrors.celular = err;
          if (err.toLowerCase().includes("correo")) newErrors.correo_electronico = err;
          if (err.toLowerCase().includes("nombre")) newErrors.nombre_completo = err;
        });
      }

      if (Object.keys(newErrors).length > 0) {
        setFormErrors(newErrors);
        const firstErrorField = Object.keys(newErrors)[0];
        refs[firstErrorField]?.current?.focus();
        alerts.error("Validación", "Por favor corrige los campos marcados en rojo.");
      } else {
        alerts.error("Error", error.response?.data?.msg || "No se pudo crear el empleado.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Nuevo Empleado</h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Datos Básicos */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-700 border-b pb-2">
              Datos Básicos
            </h3>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Documento *
              </label>
              <input
                ref={refs.cedula}
                type="text"
                value={cedula}
                onChange={(e) =>
                  handleNumericChange(setCedula, e.target.value, null, 'cedula')
                }
                placeholder="Solo números"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 outline-none ${formErrors.cedula ? 'border-red-500 ring-red-200' : 'focus:ring-primary-500'}`}
                required
              />
              {formErrors.cedula && <p className="text-red-500 text-[10px] mt-1">{formErrors.cedula}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Nombre Completo *
              </label>
              <input
                ref={refs.nombre_completo}
                type="text"
                value={nombre_completo}
                onChange={(e) => {
                  setNombre_Completo(e.target.value);
                  if (formErrors.nombre_completo) setFormErrors(prev => ({ ...prev, nombre_completo: null }));
                }}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 outline-none ${formErrors.nombre_completo ? 'border-red-500 ring-red-200' : 'focus:ring-primary-500'}`}
                required
              />
              {formErrors.nombre_completo && <p className="text-red-500 text-[10px] mt-1">{formErrors.nombre_completo}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Celular *
              </label>
              <input
                ref={refs.celular}
                type="text"
                value={celular}
                onChange={(e) =>
                  handleNumericChange(setCelular, e.target.value, 10, 'celular')
                }
                placeholder="10 dígitos"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 outline-none ${formErrors.celular ? 'border-red-500 ring-red-200' : 'focus:ring-primary-500'}`}
                required
              />
              {formErrors.celular && <p className="text-red-500 text-[10px] mt-1">{formErrors.celular}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Correo Electrónico *
              </label>
              <input
                ref={refs.correo_electronico}
                type="email"
                value={correo_electronico}
                onChange={(e) => {
                  setCorreo_electronico(e.target.value);
                  if (formErrors.correo_electronico) setFormErrors(prev => ({ ...prev, correo_electronico: null }));
                }}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 outline-none ${formErrors.correo_electronico ? 'border-red-500 ring-red-200' : 'focus:ring-primary-500'}`}
                required
              />
              {formErrors.correo_electronico && <p className="text-red-500 text-[10px] mt-1">{formErrors.correo_electronico}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Fecha Nacimiento</label>
              <input type="date" value={fecha_nacimiento} onChange={(e) => setFecha_nacimiento(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
            </div>
          </div>

          {/* Vinculación Laboral */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-700 border-b pb-2">Vinculación Laboral</h3>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Empresa</label>
              <select value={empresa} onChange={(e) => setEmpresa(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none">
                <option value="">Seleccione...</option>
                {empresasList.map(item => <option key={item.id} value={item.nombre}>{item.nombre}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Cargo</label>
              <select value={cargo} onChange={(e) => setCargo(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none">
                <option value="">Seleccione...</option>
                {cargosList.map(item => <option key={item.id} value={item.nombre}>{item.nombre}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Fecha Ingreso</label>
              <input type="date" value={fecha_ingreso} onChange={(e) => setFecha_ingreso(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Contrato y Salario */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-700 border-b pb-2">Contrato y Salario</h3>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Tipo de Contrato</label>
              <select value={tipo_contrato} onChange={(e) => setTipo_contrato(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none">
                {CONTRATOS_LIST.map(item => <option key={item} value={item}>{item}</option>)}
              </select>
            </div>
            {tipo_contrato !== 'Término Indefinido' && (
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Vencimiento Contrato</label>
                <input type="date" value={fecha_vencimiento_contrato} onChange={(e) => setFecha_vencimiento_contrato(e.target.value)} className="w-full px-4 py-2 border border-orange-200 bg-orange-50/30 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" />
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Salario Base ($)</label>
              <input 
                type="text" 
                value={formatInputValue(salario_base)} 
                onChange={(e) => handleNumericChange(setSalario_base, e.target.value)} 
                placeholder="Ej: 1.300.000"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none font-semibold text-primary-700" 
              />
            </div>
          </div>

          {/* Seguridad Social */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-700 border-b pb-2">Seguridad Social</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">EPS</label>
                <select value={eps} onChange={(e) => setEps(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none">
                  <option value="">Seleccione...</option>
                  {EPS_LIST.map(item => <option key={item} value={item}>{item}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Fondo Pensión</label>
                <select value={fondo_pension} onChange={(e) => setFondo_pension(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none">
                  <option value="">Seleccione...</option>
                  {FONDOS_LIST.map(item => <option key={item} value={item}>{item}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">

          {/* Contacto de Emergencia */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-700 border-b pb-2">Contacto de Emergencia</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Nombre del contacto</label>
                <input type="text" value={contacto_emergencia} onChange={(e) => setContacto_emergencia(e.target.value)} placeholder="Ej: Maria Torres" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Parentesco</label>
                  <select 
                    value={parentesco} 
                    onChange={(e) => {
                      setParentesco(e.target.value);
                      if (e.target.value !== 'Otr@') setParentesco_Otro('');
                    }} 
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  >
                    <option value="">Seleccione...</option>
                    {PARENTESCOS_LIST.map(item => <option key={item} value={item}>{item}</option>)}
                  </select>
                </div>
                {parentesco === 'Otr@' ? (
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">¿Cuál parentesco?</label>
                    <input 
                      type="text" 
                      value={parentesco_otro} 
                      onChange={(e) => setParentesco_Otro(e.target.value)} 
                      placeholder="Especifique..."
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" 
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Teléfono</label>
                    <input 
                      type="text" 
                      value={telefono_contacto} 
                      onChange={(e) => handleNumericChange(setTelefono_contacto, e.target.value)} 
                      placeholder="Ej: 312..."
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" 
                    />
                  </div>
                )}
              </div>
              {parentesco === 'Otr@' && (
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Teléfono</label>
                  <input 
                    type="text" 
                    value={telefono_contacto} 
                    onChange={(e) => handleNumericChange(setTelefono_contacto, e.target.value, 10)} 
                    placeholder="Ej: 312..."
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" 
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-between pt-6 border-t">
          <button 
            type="button" 
            onClick={() => navigate('/empleados/listaEmpleados')} 
            className="flex items-center gap-2 px-6 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 shadow-md shadow-red-200 transition-all transform active:scale-95 font-bold"
          >
            <ArrowLeft className="w-4 h-4" /> Volver
          </button>
          <button type="submit" disabled={loading} className="flex items-center gap-2 px-8 py-2 text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 font-bold">
            <Save className="w-4 h-4" /> {loading ? 'Guardando...' : 'GUARDAR EMPLEADO'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CrearEmpleado;
