import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit, User, Mail, Phone, Calendar, Building, Briefcase, Shield, CreditCard } from 'lucide-react';
import empleadoService from '../../services/empleadoService';
import Spinner from '../ui/Spinner';
import Avatar from '../ui/Avatar';

const DetalleEmpleado = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [empleado, setEmpleado] = useState(null);

  useEffect(() => {
    cargarEmpleado();
  }, [id]);

  const cargarEmpleado = async () => {
    try {
      setLoading(true);
      const data = await empleadoService.getEmpleadoById(id);
      setEmpleado(data);
    } catch (error) {
      console.error('Error cargando empleado:', error);
      alerts.error('Error', 'No se pudieron cargar los datos del empleado.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No especificado';
    // Dividir la fecha por '-' para evitar problemas de zona horaria (YYYY-MM-DD)
    const datePart = dateString.split('T')[0];
    const [year, month, day] = datePart.split('-');
    return `${day}/${month}/${year}`;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!empleado) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No se encontró el empleado</p>
        <button
          onClick={() => navigate('/empleados/listaEmpleados')}
          className="mt-4 text-primary-600 hover:text-primary-700"
        >
          Volver a la lista
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/empleados/listaEmpleados')}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Detalle del Empleado</h1>
            <p className="text-gray-500">Información completa del empleado</p>
          </div>
        </div>
        
        <button
          onClick={() => navigate(`/empleados/editarEmpleado/${id}`)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          <Edit className="w-4 h-4" />
          Editar
        </button>
      </div>

      {/* Perfil del empleado */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <Avatar name={empleado.nombre_completo} size="xl" />
          
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900">{empleado.nombre_completo}</h2>
            <p className="text-gray-500">{empleado.cargo}</p>
            <div className="flex items-center gap-4 mt-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                empleado.estado 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {empleado.estado ? 'Activo' : 'Inactivo'}
              </span>
              <span className="text-sm text-gray-500">
                ID: {empleado.cedula}
              </span>
            </div>
          </div>
        </div>
      </div>
           
      {/* Información detallada */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Información Personal */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-primary-600" />
            Información Personal
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Documento</p>
                <p className="font-medium text-gray-900">{empleado.cedula}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
                <Mail className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Correo Electrónico</p>
                <p className="font-medium text-gray-900">{empleado.correo_electronico || 'No especificado'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
                <Phone className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Teléfono</p>
                <p className="font-medium text-gray-900">{empleado.celular}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Fecha de Nacimiento</p>
                <p className="font-medium text-gray-900">{formatDate(empleado.fecha_nacimiento)}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Información Laboral */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-primary-600" />
            Información Laboral
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
                <Building className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Empresa</p>
                <p className="font-medium text-gray-900">{empleado.empresa || '-'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Cargo</p>
                <p className="font-medium text-gray-900">{empleado.cargo || '-'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Fecha de Ingreso</p>
                <p className="font-medium text-gray-900">{formatDate(empleado.fecha_ingreso)}</p>
              </div>
            </div>

            <div className="pt-2 border-t border-gray-50">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Tipo de Contrato</p>
                  <p className="font-medium text-gray-900">{empleado.tipo_contrato || 'No especificado'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Vencimiento</p>
                  <p className={`font-medium ${empleado.fecha_vencimiento_contrato ? 'text-orange-600' : 'text-gray-900'}`}>
                    {formatDate(empleado.fecha_vencimiento_contrato)}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <p className="text-sm text-gray-500">Salario Base</p>
              <p className="text-lg font-bold text-primary-700">{formatCurrency(empleado.salario_base)}</p>
            </div>


          </div>
        </div>

        {/* Seguridad Social */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary-600" />
            Seguridad Social
          </h3>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">EPS</p>
              <p className="font-medium text-gray-900">{empleado.eps || '-'}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Fondo de Pensión</p>
              <p className="font-medium text-gray-900">{empleado.fondo_pension || '-'}</p>
            </div>
  
              
          </div>
        </div>
            
        {/* Contacto de Emergencia */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Phone className="w-5 h-5 text-primary-600" />
            Contacto de Emergencia
          </h3>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Nombre</p>
              <p className="font-medium text-gray-900">{empleado.contacto_emergencia || 'No especificado'}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Parentesco</p>
              <p className="font-medium text-gray-900">
                {empleado.parentesco === 'Otr@' && empleado.parentesco_otro
                  ? empleado.parentesco_otro
                  : empleado.parentesco || 'No especificado'}
              </p>
            </div>
                  
            <div>
              <p className="text-sm text-gray-500">Teléfono</p>
              <p className="font-medium text-gray-900">{empleado.telefono_contacto || 'No especificado'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetalleEmpleado;
