import { useState, useEffect } from 'react';
import { Users, UserCheck, UserMinus, AlertTriangle, Calendar, ArrowRight, Gift, PartyPopper } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import empleadoService from '../services/empleadoService';
import Spinner from './ui/Spinner';

const Dashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({ total: 0, activos: 0, inactivos: 0 });
    const [alertas, setAlertas] = useState([]);
    const [aniversarios, setAniversarios] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                const [empleados, vencimientos, aniversariosData] = await Promise.all([
                    empleadoService.getAllEmpleados(),
                    empleadoService.getExpiringContracts(),
                    empleadoService.getAnniversaryAlerts()
                ]);

                setStats({
                    total: empleados.length,
                    activos: empleados.filter(e => e.estado).length,
                    inactivos: empleados.filter(e => !e.estado).length
                });

                setAlertas(vencimientos);
                setAniversarios(aniversariosData);
            } catch (error) {
                console.error("Error cargando dashboard:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full min-h-[400px]">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Bienvenida al Sistema</h1>
                <p className="text-gray-500 mt-1">Resumen general de Talento Humano - Gestión Humana</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center">
                        <Users className="w-6 h-6 text-primary-600" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Total Empleados</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                        <UserCheck className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Activos</p>
                        <p className="text-2xl font-bold text-green-600">{stats.activos}</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center">
                        <UserMinus className="w-6 h-6 text-slate-600" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Inactivos</p>
                        <p className="text-2xl font-bold text-slate-600">{stats.inactivos}</p>
                    </div>
                </div>
            </div>

            {/* Alertas de Vencimiento */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-orange-50/30">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                            <AlertTriangle className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Alertas de Vencimiento</h2>
                            <p className="text-xs text-gray-500">Contratos por vencer en los próximos 30 días</p>
                        </div>
                    </div>
                    <span className="bg-orange-100 text-orange-700 text-xs font-bold px-3 py-1 rounded-full">
                        {alertas.length} Pendientes
                    </span>
                </div>

                <div className="p-0">
                    {alertas.length > 0 ? (
                        <div className="divide-y divide-gray-50">
                            {alertas.map((emp) => (
                                <div key={emp.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-500">
                                            {emp.nombre_completo.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-800">{emp.nombre_completo}</p>
                                            <p className="text-xs text-gray-500">{emp.cargo} • {emp.empresa}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-8">
                                        <div className="text-right">
                                            <p className="text-xs font-medium text-gray-400 flex items-center gap-1 justify-end">
                                                <Calendar className="w-3 h-3" /> Vence el:
                                            </p>
                                            <p className="text-sm font-bold text-orange-600">
                                                {new Date(emp.fecha_vencimiento_contrato).toLocaleDateString('es-ES', { 
                                                    day: '2-digit', 
                                                    month: 'long', 
                                                    year: 'numeric' 
                                                })}
                                            </p>
                                        </div>
                                        <button 
                                            onClick={() => navigate(`/empleados/editarEmpleado/${emp.id}`)}
                                            className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                                        >
                                            <ArrowRight className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-4 px-6 flex items-center justify-center gap-2 text-gray-400">
                            <UserCheck className="w-5 h-5 text-green-500" />
                            <p className="text-sm">¡Todo al día! No hay vencimientos de contrato para los próximos 30 días.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Alertas de Aniversario */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-primary-50/30">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                            <Gift className="w-5 h-5 text-primary-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Próximos Aniversarios</h2>
                            <p className="text-xs text-gray-500">Empleados que cumplen años en la empresa este mes</p>
                        </div>
                    </div>
                    <span className="bg-primary-100 text-primary-700 text-xs font-bold px-3 py-1 rounded-full">
                        {aniversarios.length} Próximos
                    </span>
                </div>

                <div className="p-0">
                    {aniversarios.length > 0 ? (
                        <div className="divide-y divide-gray-50">
                            {aniversarios.map((emp) => {
                                const ingreso = new Date(emp.fecha_ingreso + 'T00:00:00');
                                const antiguedad = new Date().getFullYear() - ingreso.getFullYear();
                                return (
                                    <div key={emp.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-primary-50 rounded-full flex items-center justify-center text-primary-600">
                                                <PartyPopper className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-800">{emp.nombre_completo}</p>
                                                <p className="text-xs text-gray-500">{emp.empresa} • Cumple {antiguedad} {antiguedad === 1 ? 'año' : 'años'}</p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-8">
                                            <div className="text-right">
                                                <p className="text-xs font-medium text-gray-400 flex items-center gap-1 justify-end">
                                                    Fecha de ingreso:
                                                </p>
                                                <p className="text-sm font-bold text-primary-600">
                                                    {new Date(emp.fecha_ingreso + 'T00:00:00').toLocaleDateString('es-ES', { 
                                                        day: '2-digit', 
                                                        month: 'long',
                                                        year: 'numeric'
                                                    })}
                                                </p>
                                            </div>
                                            <button 
                                                onClick={() => navigate(`/empleados/detalleEmpleado/${emp.id}`)}
                                                className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                                            >
                                                <ArrowRight className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="p-12 text-center">
                            <p className="text-gray-500 text-sm italic">No hay aniversarios próximos en los próximos 30 días.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
