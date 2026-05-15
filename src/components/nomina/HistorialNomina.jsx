import { useState, useEffect } from 'react';
import { 
  FileText, 
  Search, 
  Calendar, 
  Download, 
  Eye,
  Filter,
  ArrowLeft,
  Trash2,
  Edit
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import payrollService from '../../services/payrollService';
import exportImport from '../../utils/exportImport';
import Spinner from '../ui/Spinner';
import alerts from '../../utils/alerts';

const HistorialNomina = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [payrolls, setPayrolls] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPeriodo, setFilterPeriodo] = useState('');
  const [selectedPayroll, setSelectedPayroll] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchPayrolls();
  }, []);

  const fetchPayrolls = async () => {
    try {
      setLoading(true);
      const data = await payrollService.getPayrolls();
      setPayrolls(data);
    } catch (error) {
      console.error("Error fetching payrolls:", error);
      alerts.error("Error", "No se pudo cargar el historial de pagos.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await alerts.confirm(
      "¿Anular este pago?",
      "Esta acción eliminará el registro de forma permanente. Deberás volver a liquidarlo si es necesario.",
      "warning"
    );

    if (result.isConfirmed) {
      try {
        await payrollService.deletePayroll(id);
        alerts.success("Anulado", "El registro de nómina ha sido eliminado.");
        fetchPayrolls();
      } catch (error) {
        alerts.error("Error", "No se pudo eliminar el registro.");
      }
    }
  };

  const handleEdit = (p) => {
    // Llevamos los datos de vuelta a la liquidación para corregir
    navigate('/nomina/liquidar', { 
      state: { 
        editData: {
          employeeId: p.employeeId,
          nombre_empleado: p.empleado?.nombre_completo || 'Empleado',
          salario_base_momento: p.salario_base_momento,
          periodo: p.periodo,
          quincena: p.quincena,
          dias_trabajados: p.dias_trabajados,
          recargos_nocturnos: p.recargos_nocturnos,
          recargos_dominicales: p.recargos_dominicales,
          recargos_festivos: p.recargos_festivos,
          horas_extras: p.horas_extras,
          bono_alimentacion: p.bono_alimentacion,
          bono_movilidad: p.bono_movilidad,
          bono_desempeño: p.bono_desempeño,
          bono_referidos: p.bono_referidos,
          otros_ingresos: p.otros_ingresos,
          descuentos: p.descuentos,
          comentarios: p.comentarios
        },
        originalId: p.id // Para saber que es una corrección
      } 
    });
  };

  const handleViewDetails = (p) => {
    setSelectedPayroll(p);
    setShowDetails(true);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-CO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const filteredPayrolls = payrolls.filter(p => {
    const matchesSearch = 
      p.empleado?.nombre_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.empleado?.cedula.includes(searchTerm);
    
    const matchesPeriodo = filterPeriodo ? p.periodo === filterPeriodo : true;

    return matchesSearch && matchesPeriodo;
  });

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
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Historial de Pagos</h1>
            <p className="text-sm text-gray-500">Consulta y exporta los registros de nómina realizados</p>
          </div>
        </div>

        <button 
          onClick={() => exportImport.exportPayrollToExcel(filteredPayrolls)}
          disabled={filteredPayrolls.length === 0}
          className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 shadow-md shadow-green-200 transition-all active:scale-95 font-bold disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          Exportar a Excel
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por empleado o cédula..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="month"
            value={filterPeriodo}
            onChange={(e) => setFilterPeriodo(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div className="flex items-center gap-2 text-gray-500 bg-gray-50 px-4 py-2 rounded-xl border border-transparent">
          <Filter className="w-4 h-4" />
          <span className="text-xs font-medium">Resultados: {filteredPayrolls.length}</span>
        </div>
      </div>

      {/* Tabla de Registros */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Fecha Registro</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Empleado</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Periodo</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Quincena</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Neto Pagado</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredPayrolls.map((p) => (
                <tr key={p.id} className="hover:bg-primary-50/30 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {formatDate(p.createdAt)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-gray-900">{p.empleado?.nombre_completo}</span>
                      <span className="text-xs text-gray-400">CC {p.empleado?.cedula}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {p.periodo}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-md text-[10px] font-black uppercase">
                      {p.quincena}° Quincena
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right font-black text-primary-600">
                    {formatCurrency(p.total_pagar)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button 
                        onClick={() => handleViewDetails(p)}
                        title="Ver Detalles"
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleEdit(p)}
                        title="Corregir Pago"
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => exportImport.generatePayrollVoucher(p)}
                        title="Descargar Comprobante"
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(p.id)}
                        title="Anular Registro"
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredPayrolls.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-400 italic">
                    No se encontraron registros de pago.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Detalles */}
      {showDetails && selectedPayroll && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in duration-300">
            {/* Header Modal */}
            <div className="p-6 border-b flex items-center justify-between bg-primary-600 text-white">
              <div>
                <h2 className="text-xl font-bold">Detalle de Liquidación</h2>
                <p className="text-primary-100 text-xs">Periodo: {selectedPayroll.periodo} - {selectedPayroll.quincena === 1 ? '1ra Quincena' : '2da Quincena'}</p>
              </div>
              <button onClick={() => setShowDetails(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white">
                <ArrowLeft className="w-6 h-6 rotate-90" />
              </button>
            </div>

            {/* Contenido Modal */}
            <div className="p-8 overflow-y-auto space-y-8">
              {/* Info Empleado */}
              <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl">
                <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center font-bold text-lg">
                  {selectedPayroll.empleado?.nombre_completo.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{selectedPayroll.empleado?.nombre_completo}</h3>
                  <p className="text-sm text-gray-500">C.C. {selectedPayroll.empleado?.cedula}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Devengados */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b pb-2">Devengados</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Salario Base (1/2)</span>
                      <span className="font-semibold">{formatCurrency(selectedPayroll.salario_base_momento / 2)}</span>
                    </div>
                    {parseFloat(selectedPayroll.recargos_nocturnos) > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Recargos Nocturnos</span>
                        <span className="font-semibold text-green-600">+{formatCurrency(selectedPayroll.recargos_nocturnos)}</span>
                      </div>
                    )}
                    {parseFloat(selectedPayroll.recargos_dominicales) > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Recargos Dominicales</span>
                        <span className="font-semibold text-green-600">+{formatCurrency(selectedPayroll.recargos_dominicales)}</span>
                      </div>
                    )}
                    {parseFloat(selectedPayroll.recargos_festivos) > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Recargos Festivos</span>
                        <span className="font-semibold text-green-600">+{formatCurrency(selectedPayroll.recargos_festivos)}</span>
                      </div>
                    )}
                    {parseFloat(selectedPayroll.horas_extras) > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Horas Extras</span>
                        <span className="font-semibold text-green-600">+{formatCurrency(selectedPayroll.horas_extras)}</span>
                      </div>
                    )}
                    {parseFloat(selectedPayroll.bono_alimentacion) > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Bono Alimentación</span>
                        <span className="font-semibold text-green-600">+{formatCurrency(selectedPayroll.bono_alimentacion)}</span>
                      </div>
                    )}
                    {parseFloat(selectedPayroll.bono_movilidad) > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Bono Movilidad</span>
                        <span className="font-semibold text-green-600">+{formatCurrency(selectedPayroll.bono_movilidad)}</span>
                      </div>
                    )}
                    {parseFloat(selectedPayroll.otros_ingresos) > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Otros Ingresos</span>
                        <span className="font-semibold text-green-600">+{formatCurrency(selectedPayroll.otros_ingresos)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Deducciones */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b pb-2">Deducciones</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Descuentos</span>
                      <span className="font-semibold text-red-600">-{formatCurrency(selectedPayroll.descuentos)}</span>
                    </div>
                  </div>
                  
                  {selectedPayroll.comentarios && (
                    <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-100">
                      <p className="text-[10px] font-bold text-amber-600 uppercase mb-1">Observaciones</p>
                      <p className="text-xs text-amber-800 leading-relaxed italic">"{selectedPayroll.comentarios}"</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Totales */}
              <div className="border-t pt-6">
                <div className="flex items-center justify-between bg-primary-50 p-6 rounded-2xl">
                  <div>
                    <p className="text-xs font-bold text-primary-600 uppercase tracking-wider">Neto a Recibir</p>
                    <p className="text-3xl font-black text-primary-900">{formatCurrency(selectedPayroll.total_pagar)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400 uppercase">Fecha Registro</p>
                    <p className="font-bold text-gray-600">{new Date(selectedPayroll.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Modal */}
            <div className="p-6 bg-gray-50 border-t flex justify-end gap-3">
              <button 
                onClick={() => exportImport.generatePayrollVoucher(selectedPayroll)}
                className="flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-100 transition-all font-bold shadow-sm"
              >
                <Download className="w-4 h-4" />
                Voucher PDF
              </button>
              <button 
                onClick={() => setShowDetails(false)}
                className="px-8 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all font-bold shadow-md shadow-primary-200"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistorialNomina;
