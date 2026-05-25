import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  UserPlus, 
  FileSpreadsheet, 
  FileText,
  Edit, 
  Trash2, 
  Eye,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import empleadoService from '../../services/empleadoService';
import Spinner from '../ui/Spinner';
import alerts from '../../utils/alerts';
import exportImport from '../../utils/exportImport';

const ListaEmpleados = () => {
  const navigate = useNavigate();
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [showFilters, setShowFilters] = useState(false);

  const [activeFilter, setActiveFilter] = useState('todos');

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedIds, setSelectedIds] = useState([]);
  
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchEmpleados();
  }, []);

  const fetchEmpleados = async () => {
    try {
      setLoading(true);
      const data = await empleadoService.getAllEmpleados();
      setEmpleados(data);
    } catch (error) {
      console.error('Error fetching empleados:', error);
      alerts.error('Error', 'No se pudieron cargar los empleados.');
      setEmpleados([]); // Asegurar que quede vacío si falla
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    if (empleados.length === 0) {
      alerts.error('Error', 'No hay datos para exportar.');
      return;
    }
    exportImport.generatePDF(empleados);
  };

  const handleImportExcel = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      alerts.loading('Procesando archivo...');
      const data = await exportImport.importFromExcel(file);
      
      if (data.length === 0) {
        alerts.error('Error', 'El archivo Excel parece estar vacío o tiene un formato incorrecto.');
        return;
      }

      const result = await alerts.confirm(
        '¿Deseas importar estos empleados?',
        `Se han encontrado ${data.length} registros en el archivo.`,
        'Sí, importar todo'
      );

      if (result.isConfirmed) {
        alerts.loading('Guardando empleados...');
        await empleadoService.bulkCreate(data);
        alerts.success('¡Importación Exitosa!', `${data.length} empleados han sido registrados.`);
        fetchEmpleados(); // Recargar lista
      }
    } catch (error) {
      console.error('Error importing:', error);
      alerts.error('Error', error);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = ''; // Limpiar input
    }
  };

  const handleToggleEstado = async (id, estadoActual) => {
    const action = estadoActual ? 'inactivar' : 'activar';
    const result = await alerts.confirm(
      `¿Deseas ${action} este empleado?`,
      `El empleado dejará de estar ${estadoActual ? 'activo' : 'inactivo'} en el sistema.`,
      `Sí, ${action}`
    );

    if (result.isConfirmed) {
      try {
        const nuevoEstado = !estadoActual;
        setEmpleados(prev => 
          prev.map(emp => emp.id === id ? { ...emp, estado: nuevoEstado } : emp)
        );
        await empleadoService.toggleEstadoEmpleado(id, nuevoEstado);
        alerts.success('¡Hecho!', `Empleado ${nuevoEstado ? 'activado' : 'inactivado'} correctamente.`);
      } catch (error) {
        console.error('Error toggling estado:', error);
        alerts.error('Error', 'No se pudo cambiar el estado.');
      }
    }
  };

  const handleDelete = async (id) => {
    const result = await alerts.confirm(
      '¿Eliminar empleado?',
      'Esta acción es permanente y no se puede deshacer.',
      'Sí, eliminar'
    );

    if (result.isConfirmed) {
      try {
        await empleadoService.deleteEmpleado(id);
        setEmpleados(prev => prev.filter(emp => emp.id !== id));
        setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
        alerts.success('Eliminado', 'El empleado ha sido borrado con éxito.');
      } catch (error) {
        alerts.error('Error', 'No se pudo eliminar el empleado.');
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;

    const result = await alerts.confirm(
      '¿Eliminar seleccionados?',
      `Vas a eliminar ${selectedIds.length} empleados de forma permanente.`,
      'Sí, eliminar todos'
    );

    if (result.isConfirmed) {
      try {
        alerts.loading('Eliminando empleados...');
        await empleadoService.bulkDelete(selectedIds);
        setEmpleados(prev => prev.filter(emp => !selectedIds.includes(emp.id)));
        setSelectedIds([]);
        alerts.success('¡Eliminados!', `${selectedIds.length} empleados han sido borrados.`);
      } catch (error) {
        console.error('Error in bulk delete:', error);
        alerts.error('Error', 'Hubo un problema al realizar el borrado masivo.');
      }
    }
  };

  const handleSelectOne = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredEmpleados.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredEmpleados.map(emp => emp.id));
    }
  };

  const filteredEmpleados = empleados.filter((emp) => {

    const search = searchTerm.toLowerCase();

    if (!search) return true;

    switch (activeFilter) {

      case 'nombre':
        return emp.nombre_completo?.toLowerCase().includes(search);

      case 'cedula':
        return emp.cedula?.includes(search);

      case 'cargo':
        return emp.cargo?.toLowerCase().includes(search);

      case 'empresa':
        return emp.empresa?.toLowerCase().includes(search);

      case 'eps':
        return emp.eps?.toLowerCase().includes(search);

      case 'fondo_pension':
        return emp.fondo_pension?.toLowerCase().includes(search);

      case 'fecha_nacimiento':
        return emp.fecha_nacimiento?.split('T')[0].includes(search);

      case 'fecha_ingreso':
        return emp.fecha_ingreso?.split('T')[0].includes(search);  

      case 'todos':
      default:
        return (
          emp.nombre_completo?.toLowerCase().includes(search) ||
          emp.cedula?.includes(search) ||
          emp.cargo?.toLowerCase().includes(search) ||
          emp.empresa?.toLowerCase().includes(search) ||
          emp.eps?.toLowerCase().includes(search) ||
          emp.fondo_pension?.toLowerCase().includes(search) ||
          emp.fecha_nacimiento?.split('T')[0].includes(search) ||
          emp.fecha_ingreso?.split('T')[0].includes(search)
        );
    }
  });

  const totalPages = Math.ceil(filteredEmpleados.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedEmpleados = filteredEmpleados.slice(startIndex, startIndex + rowsPerPage);

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    // Dividir la fecha por '-' para evitar problemas de zona horaria (YYYY-MM-DD)
    const [year, month, day] = dateString.split('T')[0].split('-');
    return `${day}/${month}/${year}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary-600">Base General - Gestión de Empleados</h1>
        </div>
      </div>

      {/* Search and Actions Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Left Group: Search and Filters */}
          <div className="flex flex-1 items-center gap-2 w-full lg:max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={`Buscar por ${
                  activeFilter === 'todos'
                    ? 'todos los campos'
                    : activeFilter.replace('_', ' ')
                }...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary-500 transition-all"
              />
            </div>
            <div className="relative">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 text-gray-600 rounded-xl hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200"
            >
              <Filter className="w-4 h-4" />
              <span className="hidden md:inline text-sm font-medium">
                Filtros
              </span>
            </button>

            {showFilters && (
              <div className="absolute top-12 right-0 w-56 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">

                {[
                  { key: 'todos', label: 'Todos' },
                  { key: 'nombre', label: 'Nombre' },
                  { key: 'cedula', label: 'Cédula' },
                  { key: 'cargo', label: 'Cargo' },
                  { key: 'empresa', label: 'Empresa' },
                  { key: 'eps', label: 'EPS' },
                  { key: 'fondo_pension', label: 'Fondo Pensión' },
                  { key: 'fecha_nacimiento', label: 'Fecha Nacimiento' },
                  { key: 'fecha_ingreso', label: 'Fecha Ingreso' }
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => {
                      setActiveFilter(item.key);
                      setShowFilters(false);
                    }}
                    className={`w-full text-left px-4 py-3 text-sm transition-colors
                      ${activeFilter === item.key
                        ? 'bg-primary-50 text-primary-600'
                        : 'hover:bg-gray-50 text-gray-700'
                      }`}
                  >
                    {item.label}
                  </button>
                ))}

              </div>
            )}
          </div>
          </div>

          {/* Right Group: Actions */}
          <div className="flex items-center gap-2 self-end lg:self-auto">
            {/* Bulk Actions Contextual */}
            {selectedIds.length > 0 && (
              <button 
                onClick={handleBulkDelete}
                className="flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all border border-red-100"
              >
                <Trash2 className="w-4 h-4" />
                <span className="text-sm font-bold">Borrar ({selectedIds.length})</span>
              </button>
            )}

            {/* Secondary Actions (Export) */}
            <div className="flex items-center bg-gray-50 p-1 rounded-xl border border-gray-100">
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImportExcel} 
                accept=".xlsx, .xls" 
                className="hidden" 
              />
              <button 
                onClick={() => fileInputRef.current.click()}
                className="p-2 text-green-600 hover:bg-white hover:shadow-sm rounded-lg transition-all"
                title="Importar Excel"
              >
                <FileSpreadsheet className="w-5 h-5" />
              </button>
              <div className="w-px h-4 bg-gray-200 mx-1"></div>
              <button 
                onClick={handleExportPDF}
                className="p-2 text-red-500 hover:bg-white hover:shadow-sm rounded-lg transition-all"
                title="Exportar PDF"
              >
                <FileText className="w-5 h-5" />
              </button>
            </div>

            {/* Primary Action */}
            <button 
              onClick={() => navigate('/empleados/crearEmpleados')}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 shadow-md shadow-primary-200 transition-all transform active:scale-95"
            >
              <UserPlus className="w-4 h-4" />
              <span className="text-sm font-bold">Añadir Empleado</span>
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden w-full">
        <div className="overflow-x-auto w-full">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    checked={selectedIds.length === filteredEmpleados.length && filteredEmpleados.length > 0}
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">#</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Cédula</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Nombres</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Cargo</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Empresa</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Fecha Nacimiento</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Fondo Pensión</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Celular</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase sticky right-0 bg-gray-50 border-l border-gray-200">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedEmpleados.map((empleado, index) => (
                <tr key={empleado.id} className={`hover:bg-gray-50 transition-all ${!empleado.estado ? 'opacity-50' : ''} ${selectedIds.includes(empleado.id) ? 'bg-primary-50' : ''}`}>
                  <td className="px-4 py-3">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      checked={selectedIds.includes(empleado.id)}
                      onChange={() => handleSelectOne(empleado.id)}
                    />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">{startIndex + index + 1}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{empleado.cedula}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{empleado.nombre_completo}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{empleado.cargo}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{empleado.empresa}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{formatDate(empleado.fecha_nacimiento)}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{empleado.fondo_pension}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{empleado.celular}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium sticky right-0 bg-white shadow-[-2px_0_4px_-2px_rgba(0,0,0,0.06)]">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => navigate(`/empleados/detalleEmpleado/${empleado.id}`)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        title="Ver detalles"
                      >
                        <Eye size={18} />
                      </button>
                      <button 
                        onClick={() => navigate(`/empleados/editarEmpleado/${empleado.id}`)}
                        className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
                        title="Editar"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleToggleEstado(empleado.id, empleado.estado)}
                        className={`p-1 transition-colors rounded-full ${empleado.estado ? 'text-primary-600 bg-primary-50' : 'text-gray-400 bg-gray-100'}`}
                        title={empleado.estado ? 'Inactivar' : 'Activar'}
                      >
                        {empleado.estado ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                      </button>
                      <button 
                        onClick={() => handleDelete(empleado.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="Eliminar"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 border-t border-gray-200 gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Rows per page</span>
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border border-gray-200 rounded px-2 py-1 text-sm"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span className="text-sm text-gray-600 ml-4">
              {startIndex + 1} - {Math.min(startIndex + rowsPerPage, filteredEmpleados.length)} of {filteredEmpleados.length}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="p-1.5 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-1.5 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="p-1.5 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListaEmpleados;
