import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
    CreditCard, 
    Calculator, 
    User, 
    Calendar, 
    PlusCircle,
    CheckCircle2,
    Info,
    ArrowLeft,
    RotateCcw,
    MinusCircle,
    Save
} from 'lucide-react';
import empleadoService from '../../services/empleadoService';
import payrollService from '../../services/payrollService';
import alerts from '../../utils/alerts';

const LiquidacionNomina = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [originalId, setOriginalId] = useState(null);
    const [empleados, setEmpleados] = useState([]);
    
    // Estado del Formulario
    const [formData, setFormData] = useState({
        employeeId: '',
        periodo: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`,
        quincena: 1,
        dias_trabajados: 15,
        recargos_nocturnos: 0,
        recargos_dominicales: 0,
        recargos_festivos: 0,
        horas_extras: 0,
        bono_alimentacion: 0,
        bono_movilidad: 0,
        bono_desempeño: 0,
        bono_referidos: 0,
        otros_ingresos: 0,
        descuentos: 0,
        comentarios: ''
    });

    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [totals, setTotals] = useState({ devengado: 0, pagar: 0 });

    useEffect(() => {
        cargarEmpleados();
        
        // Verificar si venimos del historial para editar
        if (location.state?.editData) {
            const { editData, originalId } = location.state;
            setFormData(editData);
            setIsEditing(true);
            setOriginalId(originalId);
        }
    }, [location.state]);

    useEffect(() => {
        if (selectedEmployee) {
            calculateTotals();
        }
    }, [formData, selectedEmployee]);

    useEffect(() => {
        if (isEditing && formData.nombre_empleado) {
            // Buscamos al empleado en la lista para tener su salario actual como respaldo
            const empActual = empleados.find(e => String(e.id) === String(formData.employeeId));
            
            setSelectedEmployee({
                id: formData.employeeId,
                nombre_completo: formData.nombre_empleado,
                // Si el histórico trae 0, usamos el salario actual del empleado
                salario_base: formData.salario_base_momento > 0 
                    ? formData.salario_base_momento 
                    : (empActual?.salario_base || 0)
            });
        } else if (empleados.length > 0 && formData.employeeId) {
            const emp = empleados.find(e => String(e.id) === String(formData.employeeId));
            if (emp) setSelectedEmployee(emp);
        }
    }, [empleados, formData.employeeId, isEditing, formData.nombre_empleado, formData.salario_base_momento]);

    const cargarEmpleados = async () => {
        try {
            const data = await empleadoService.getAllEmpleados();
            setEmpleados(data.filter(e => e.estado)); // Solo activos
        } catch (error) {
            console.error("Error cargando empleados:", error);
        }
    };

    const handleEmployeeChange = (e) => {
        const id = e.target.value;
        const emp = empleados.find(emp => emp.id === parseInt(id));
        setSelectedEmployee(emp);
        setFormData(prev => ({ ...prev, employeeId: id }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const formatInputValue = (value) => {
        if (!value && value !== 0) return "";
        const num = value.toString().replace(/\D/g, "");
        return num.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };

    const handlePriceChange = (e) => {
        const { name, value } = e.target;
        const rawValue = value.replace(/\D/g, "");
        setFormData(prev => ({ ...prev, [name]: rawValue }));
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(amount || 0);
    };

    const calculateTotals = () => {
        const salarioBase = selectedEmployee ? parseFloat(selectedEmployee.salario_base || 0) : 0;
        const salarioQuincena = salarioBase / 2;
        
        const recargos = parseFloat(formData.recargos_nocturnos || 0) +
                         parseFloat(formData.recargos_dominicales || 0) +
                         parseFloat(formData.recargos_festivos || 0) +
                         parseFloat(formData.horas_extras || 0);

        const bonos = parseFloat(formData.bono_alimentacion || 0) +
                      parseFloat(formData.bono_movilidad || 0) +
                      parseFloat(formData.bono_desempeño || 0) +
                      parseFloat(formData.bono_referidos || 0) +
                      parseFloat(formData.otros_ingresos || 0);
        
        const devengado = salarioQuincena + recargos + bonos;
        const pagar = devengado - parseFloat(formData.descuentos || 0);
        
        setTotals({ devengado, pagar });
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        if (!selectedEmployee) {
            alerts.error("Faltan datos", "Por favor seleccione un empleado");
            return;
        }

        try {
            setLoading(true);
            if (isEditing) {
                await payrollService.updatePayroll(originalId, formData);
                alerts.success("Corregido", "El registro de nómina ha sido actualizado correctamente.");
            } else {
                await payrollService.createPayroll(formData);
                alerts.success("¡Éxito!", "La liquidación ha sido registrada correctamente.");
            }
            navigate('/nomina/historial');
        } catch (error) {
            console.error("Error al procesar nómina:", error);
            alerts.error("Error", "No se pudo procesar la liquidación. Intente de nuevo.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-20">
            <div className="flex items-center justify-between w-full bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        {isEditing ? 'Corregir Liquidación' : 'Liquidación de Nómina'}
                    </h1>
                    <p className="text-sm text-gray-500">
                        {isEditing ? 'Modificando un registro de pago existente' : 'Procesa el pago quincenal de los colaboradores'}
                    </p>
                </div>
                {isEditing && (
                    <button 
                        onClick={() => navigate('/nomina/historial')}
                        className="flex items-center gap-2 px-6 py-2.5 text-red-600 hover:text-white hover:bg-red-600 border-2 border-red-100 hover:border-red-600 rounded-xl transition-all font-bold shadow-sm"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        CANCELAR CORRECCIÓN
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Panel Izquierdo: Selección y Periodo */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                        <h3 className="font-bold text-gray-700 flex items-center gap-2">
                            <User className="w-4 h-4 text-primary-500" /> Selección del Empleado
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1">Empleado *</label>
                                {isEditing ? (
                                    <div className="w-full px-4 py-3 bg-primary-50 border border-primary-100 rounded-xl text-primary-700 font-bold flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-primary-500" />
                                        {formData.nombre_empleado}
                                    </div>
                                ) : (
                                    <select 
                                        name="employeeId" 
                                        value={formData.employeeId} 
                                        onChange={handleEmployeeChange}
                                        className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                        required
                                    >
                                        <option value="">Seleccione un empleado...</option>
                                        {empleados.filter(e => e.estado).map(emp => (
                                            <option key={emp.id} value={emp.id}>{emp.nombre_completo} - {emp.cedula}</option>
                                        ))}
                                    </select>
                                )}
                            </div>
                            {selectedEmployee && (
                                <div className={`p-3 rounded-xl border ${selectedEmployee.salario_base > 0 ? 'bg-primary-50/50 border-primary-100' : 'bg-orange-50 border-orange-200'}`}>
                                    <p className={`text-[10px] font-bold uppercase tracking-wider ${selectedEmployee.salario_base > 0 ? 'text-primary-600' : 'text-orange-600'}`}>
                                        {selectedEmployee.salario_base > 0 ? 'Salario Base Pactado' : '¡Atención: Salario no asignado!'}
                                    </p>
                                    <p className={`text-xl font-black ${selectedEmployee.salario_base > 0 ? 'text-primary-700' : 'text-orange-700'}`}>
                                        {formatCurrency(selectedEmployee.salario_base)}
                                    </p>
                                    <p className={`text-[10px] ${selectedEmployee.salario_base > 0 ? 'text-primary-400' : 'text-orange-400'}`}>
                                        Pago Quincenal: {formatCurrency(selectedEmployee.salario_base / 2)}
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-50">
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1">Periodo (Mes)</label>
                                <input type="month" name="periodo" value={formData.periodo} onChange={handleChange} className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-primary-500" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1">Quincena</label>
                                <select name="quincena" value={formData.quincena} onChange={handleChange} className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-primary-500">
                                    <option value={1}>1ra Quincena</option>
                                    <option value={2}>2da Quincena</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1">Días Laborados</label>
                                <input type="number" name="dias_trabajados" value={formData.dias_trabajados} onChange={handleChange} className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-primary-500" />
                            </div>
                        </div>
                    </div>

                    {/* Novedades y Recargos */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
                        <div>
                            <h3 className="font-bold text-gray-700 flex items-center gap-2 mb-4">
                                <Calculator className="w-4 h-4 text-orange-500" /> Recargos y Horas Extras
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Rec. Nocturno ($)</label>
                                    <input type="text" name="recargos_nocturnos" value={formatInputValue(formData.recargos_nocturnos)} onChange={handlePriceChange} className="w-full px-3 py-2 border rounded-lg bg-orange-50/20 text-sm" placeholder="0" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Rec. Dominical ($)</label>
                                    <input type="text" name="recargos_dominicales" value={formatInputValue(formData.recargos_dominicales)} onChange={handlePriceChange} className="w-full px-3 py-2 border rounded-lg bg-orange-50/20 text-sm" placeholder="0" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Rec. Festivo ($)</label>
                                    <input type="text" name="recargos_festivos" value={formatInputValue(formData.recargos_festivos)} onChange={handlePriceChange} className="w-full px-3 py-2 border rounded-lg bg-orange-50/20 text-sm" placeholder="0" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Horas Extras ($)</label>
                                    <input type="text" name="horas_extras" value={formatInputValue(formData.horas_extras)} onChange={handlePriceChange} className="w-full px-3 py-2 border rounded-lg bg-orange-50/20 text-sm" placeholder="0" />
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-bold text-gray-700 flex items-center gap-2 mb-4">
                                <PlusCircle className="w-4 h-4 text-green-500" /> Bonificaciones y Otros
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Bono Alimentación</label>
                                    <input type="text" name="bono_alimentacion" value={formatInputValue(formData.bono_alimentacion)} onChange={handlePriceChange} className="w-full px-3 py-2 border rounded-lg bg-green-50/20 text-sm" placeholder="0" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Bono Movilidad</label>
                                    <input type="text" name="bono_movilidad" value={formatInputValue(formData.bono_movilidad)} onChange={handlePriceChange} className="w-full px-3 py-2 border rounded-lg bg-green-50/20 text-sm" placeholder="0" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Bono Desempeño</label>
                                    <input type="text" name="bono_desempeño" value={formatInputValue(formData.bono_desempeño)} onChange={handlePriceChange} className="w-full px-3 py-2 border rounded-lg bg-green-50/20 text-sm" placeholder="0" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Bono Referidos</label>
                                    <input type="text" name="bono_referidos" value={formatInputValue(formData.bono_referidos)} onChange={handlePriceChange} className="w-full px-3 py-2 border rounded-lg bg-green-50/20 text-sm" placeholder="0" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Otros Ingresos</label>
                                    <input type="text" name="otros_ingresos" value={formatInputValue(formData.otros_ingresos)} onChange={handlePriceChange} className="w-full px-3 py-2 border rounded-lg bg-green-50/20 text-sm" placeholder="0" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-red-500 uppercase mb-1">Descuentos (-)</label>
                                    <input type="text" name="descuentos" value={formatInputValue(formData.descuentos)} onChange={handlePriceChange} className="w-full px-3 py-2 border border-red-100 rounded-lg bg-red-50/20 text-red-600 font-bold text-sm" placeholder="0" />
                                </div>
                            </div>
                        </div>
                        
                        <div>
                            <label className="block text-xs font-medium text-gray-400 mb-1">Comentarios o Novedades Especiales</label>
                            <textarea name="comentarios" value={formData.comentarios} onChange={handleChange} rows="2" className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-primary-500" placeholder="Ej: Pago de retroactivo, ajuste de mes pasado..."></textarea>
                        </div>
                    </div>
                </div>

                {/* Panel Derecho: Resumen de Pago */}
                <div className="lg:col-span-1">
                    <div className="bg-slate-900 rounded-3xl p-6 shadow-2xl sticky top-24 text-white overflow-hidden">
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary-500/20 rounded-full blur-3xl"></div>
                        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-orange-500/20 rounded-full blur-3xl"></div>

                        <h3 className="text-xl font-bold mb-8 flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-primary-400" /> Resumen de Pago
                        </h3>

                        <div className="space-y-4 mb-8">
                            <div className="flex justify-between items-center text-slate-400 text-sm">
                                <span>Salario Base (1/2)</span>
                                <span className="font-medium text-white">{formatCurrency(selectedEmployee ? selectedEmployee.salario_base / 2 : 0)}</span>
                            </div>
                            <div className="flex justify-between items-center text-slate-400 text-sm">
                                <span>Total Recargos</span>
                                <span className="font-medium text-white">
                                    {formatCurrency(
                                        parseFloat(formData.recargos_nocturnos || 0) + 
                                        parseFloat(formData.recargos_dominicales || 0) + 
                                        parseFloat(formData.recargos_festivos || 0) + 
                                        parseFloat(formData.horas_extras || 0)
                                    )}
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-slate-400 text-sm">
                                <span>Total Bonificaciones</span>
                                <span className="font-medium text-green-400">
                                    {formatCurrency(
                                        parseFloat(formData.bono_alimentacion || 0) + 
                                        parseFloat(formData.bono_movilidad || 0) + 
                                        parseFloat(formData.bono_desempeño || 0) + 
                                        parseFloat(formData.bono_referidos || 0) + 
                                        parseFloat(formData.otros_ingresos || 0)
                                    )}
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-slate-400 text-sm">
                                <span>Deducciones</span>
                                <span className="font-medium text-red-400">-{formatCurrency(formData.descuentos || 0)}</span>
                            </div>
                            <div className="pt-4 border-t border-slate-800">
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-400">Total Devengado</span>
                                    <span className="text-lg font-bold">{formatCurrency(totals.devengado)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-800/50 rounded-2xl p-4 mb-8 border border-white/5">
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1 text-center">Neto a Pagar</p>
                            <p className="text-3xl font-black text-center text-primary-400">
                                {formatCurrency(totals.pagar)}
                            </p>
                        </div>

                        <button 
                            onClick={handleSubmit}
                            disabled={loading || !selectedEmployee}
                            className="w-full flex items-center justify-center gap-2 py-4 bg-primary-600 text-white rounded-2xl hover:bg-primary-700 shadow-xl shadow-primary-200 transition-all active:scale-95 font-black uppercase tracking-widest disabled:opacity-50"
                        >
                            {loading ? (
                                'Procesando...'
                            ) : (
                                <>
                                    {isEditing ? <RotateCcw className="w-5 h-5" /> : <CreditCard className="w-5 h-5" />}
                                    {isEditing ? 'GUARDAR CORRECCIÓN' : 'FINALIZAR PAGO'}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LiquidacionNomina;
