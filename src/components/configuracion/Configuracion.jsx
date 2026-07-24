import { useState, useEffect, useCallback } from 'react';
import { 
  Settings, 
  Briefcase, 
  Building2, 
  Plus, 
  Edit2, 
  Trash2, 
  Mail, 
  Bell, 
  Save,
  Send, 
  X,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  Check
} from 'lucide-react';
import configuracionService from '../../services/configuracionService';
import alerts from '../../utils/alerts';
import Spinner from '../ui/Spinner';

const Configuracion = () => {
  const [activeTab, setActiveTab] = useState('cargos');
  const [loading, setLoading] = useState(true);
  const [cargos, setCargos] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [eps, setEps] = useState([]);
  const [reportConfigs, setReportConfigs] = useState([]);
  
  // Modals
  const [showCargoModal, setShowCargoModal] = useState(false);
  const [showEmpresaModal, setShowEmpresaModal] = useState(false);
  const [showEpsModal, setShowEpsModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  // Cargo Form
  const [cargoName, setCargoName] = useState('');
  
  // Empresa Form
  const [empresaName, setEmpresaName] = useState('');

    // EPS Form
  const [epsName, setEpsName] = useState('');
  
  // Report Form
  const [reportForm, setReportForm] = useState({
    empresas: [],
    email_reportes: [],
    activo: true
  });
  const [emailInput, setEmailInput] = useState('');
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);
  const [testingCron, setTestingCron] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [cargosData, empresasData, epsData, reportsData] = await Promise.all([
        configuracionService.getCargos(),
        configuracionService.getEmpresas(),
        configuracionService.getEps(),
        configuracionService.getReportConfigs()
      ]);
      setCargos(cargosData);
      setEmpresas(empresasData);
      setEps(epsData);

      // Parsear empresas de JSON string a array
      const parsedReports = reportsData.map(r => ({
        ...r,
        empresas: JSON.parse(r.empresas)
      }));
      setReportConfigs(parsedReports);
    } catch (error) {
      console.error("Error fetching config data:", error);
      alerts.error("Error", "No se pudo cargar la configuración.");
    } finally {
      setLoading(false);
    }
  };

  // --- CARGO HANDLERS ---
  const handleOpenCargoModal = (cargo = null) => {
    setEditingItem(cargo);
    setCargoName(cargo ? cargo.nombre : '');
    setShowCargoModal(true);
  };

  const handleSaveCargo = async (e) => {
    e.preventDefault();
    if (!cargoName.trim()) return;
    try {
      if (editingItem) {
        await configuracionService.updateCargo(editingItem.id, { nombre: cargoName });
        alerts.success("Actualizado", "Cargo actualizado correctamente.");
      } else {
        await configuracionService.createCargo({ nombre: cargoName });
        alerts.success("Creado", "Nuevo cargo creado correctamente.");
      }
      setShowCargoModal(false);
      fetchData();
    } catch (error) {
      alerts.error("Error", error.response?.data?.msg || "No se pudo guardar el cargo.");
    }
  };

  const handleDeleteCargo = async (id) => {
    const result = await alerts.confirm("¿Eliminar cargo?", "Esta acción no se puede deshacer.");
    if (result.isConfirmed) {
      try {
        await configuracionService.deleteCargo(id);
        alerts.success("Eliminado", "Cargo eliminado.");
        fetchData();
      } catch (error) {
        alerts.error("Error", "No se pudo eliminar.");
      }
    }
  };

  // --- EMPRESA HANDLERS ---
  const handleOpenEmpresaModal = (empresa = null) => {
    setEditingItem(empresa);
    setEmpresaName(empresa ? empresa.nombre : '');
    setShowEmpresaModal(true);
  };

  const handleSaveEmpresa = async (e) => {
    e.preventDefault();
    if (!empresaName.trim()) return;
    try {
      if (editingItem) {
        await configuracionService.updateEmpresa(editingItem.id, { nombre: empresaName });
        alerts.success("Actualizado", "Empresa actualizada.");
      } else {
        await configuracionService.createEmpresa({ nombre: empresaName });
        alerts.success("Creada", "Empresa creada.");
      }
      setShowEmpresaModal(false);
      fetchData();
    } catch (error) {
      alerts.error("Error", error.response?.data?.msg || "No se pudo guardar.");
    }
  };

  const handleDeleteEmpresa = async (id) => {
    const result = await alerts.confirm("¿Eliminar empresa?", "Se eliminará el nombre de la empresa.");
    if (result.isConfirmed) {
      try {
        await configuracionService.deleteEmpresa(id);
        alerts.success("Eliminada", "Empresa eliminada.");
        fetchData();
      } catch (error) {
        alerts.error("Error", "No se pudo eliminar.");
      }
    }
  };

   // --- EMPRESA HANDLERS ---
   const handleOpenEpsModal = (epsItem = null) => {
        setEditingItem(epsItem);

        setEpsName(epsItem ? epsItem.nombre : '');

        setShowEpsModal(true);
    };


    const handleSaveEps = async (e) => {
        e.preventDefault();

        if (!epsName.trim()) return;

        try {

            if (editingItem) {

                await configuracionService.updateEps(
                    editingItem.id,
                    { nombre: epsName }
                );

                alerts.success(
                    "Actualizado",
                    "EPS actualizada correctamente."
                );

            } else {

                await configuracionService.createEps({
                    nombre: epsName
                });

                alerts.success(
                    "Creada",
                    "Nueva EPS creada correctamente."
                );
            }

            setShowEpsModal(false);

            fetchData();

        } catch (error) {

            alerts.error(
                "Error",
                error.response?.data?.msg ||
                "No se pudo guardar."
            );
        }
    };

    const handleDeleteEps = async (id) => {

        const result = await alerts.confirm(
            "¿Eliminar EPS?",
            "Esta acción no se puede deshacer."
        );

        if (result.isConfirmed) {

            try {

                await configuracionService.deleteEps(id);

                alerts.success(
                    "Eliminada",
                    "EPS eliminada."
                );

                fetchData();

            } catch {

                alerts.error(
                    "Error",
                    "No se pudo eliminar."
                );
            }
        }
    };


  // --- REPORT HANDLERS ---
  const handleOpenReportModal = (config = null) => {
    setEditingItem(config);
    setReportForm(config ? {
      empresas: config.empresas,
      email_reportes: config.emails ? config.emails.split(',').map(e => e.trim()) : [],
      activo: config.activo
    } : {
      empresas: [],
      email_reportes: [],
      activo: true
    });
    setEmailInput('');
    setShowReportModal(true);
  };

  const toggleCompanySelection = (name) => {
    setReportForm(prev => {
      const isSelected = prev.empresas.includes(name);
      return {
        ...prev,
        empresas: isSelected 
          ? prev.empresas.filter(n => n !== name)
          : [...prev.empresas, name]
      };
    });
  };

  const handleAddEmail = (e) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      const val = emailInput.trim().toLowerCase();
      if (val && /\S+@\S+\.\S+/.test(val) && !reportForm.email_reportes.includes(val)) {
        setReportForm({ ...reportForm, email_reportes: [...reportForm.email_reportes, val] });
        setEmailInput('');
      }
    } else if (e.key === 'Backspace' && !emailInput && reportForm.email_reportes.length > 0) {
      const newEmails = [...reportForm.email_reportes];
      newEmails.pop();
      setReportForm({ ...reportForm, email_reportes: newEmails });
    }
  };

  const removeEmail = (email) => {
    setReportForm({ ...reportForm, email_reportes: reportForm.email_reportes.filter(e => e !== email) });
  };

  const handleSaveReport = async (e) => {
    e.preventDefault();
    if (reportForm.empresas.length === 0) {
      return alerts.error("Error", "Debes seleccionar al menos una empresa.");
    }
    try {
      const data = {
        empresas: reportForm.empresas,
        emails: reportForm.email_reportes.join(', '),
        activo: reportForm.activo
      };
      if (editingItem) {
        await configuracionService.updateReportConfig(editingItem.id, data);
        alerts.success("Actualizado", "Configuración actualizada.");
      } else {
        await configuracionService.createReportConfig(data);
        alerts.success("Creado", "Configuración de reporte creada.");
      }
      setShowReportModal(false);
      fetchData();
    } catch (error) {
      alerts.error("Error", "No se pudo guardar la configuración.");
    }
  };

  const handleDeleteReport = async (id) => {
    const result = await alerts.confirm("¿Eliminar configuración?", "Este grupo de empresas dejará de recibir reportes.");
    if (result.isConfirmed) {
      try {
        await configuracionService.deleteReportConfig(id);
        alerts.success("Eliminado", "Configuración eliminada.");
        fetchData();
      } catch (error) {
        alerts.error("Error", "No se pudo eliminar.");
      }
    }
  };

  const handleTestCron = async () => {
    const result = await alerts.confirm(
      '¿Probar envío de correos?', 
      'Se ejecutará el cron de aniversarios ahora mismo. Se enviarán correos reales a los destinatarios configurados si hay empleados con aniversarios próximos (30 días).'
    );
    if (result.isConfirmed) {
      try {
        setTestingCron(true);
        const response = await configuracionService.testCron();
        alerts.success('Ejecutado', response.msg || 'Cron ejecutado correctamente. Revisa la consola del servidor.');
      } catch (error) {
        alerts.error('Error', error.response?.data?.msg || 'No se pudo ejecutar el cron.');
      } finally {
        setTestingCron(false);
      }
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary-100 rounded-lg">
          <Settings className="w-6 h-6 text-primary-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configuración del Sistema</h1>
          <p className="text-sm text-gray-500">Gestiona los parámetros dinámicos y reportes automáticos.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button onClick={() => setActiveTab('cargos')} className={`px-6 py-3 text-sm font-medium transition-all border-b-2 ${activeTab === 'cargos' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
          <div className="flex items-center gap-2"><Briefcase className="w-4 h-4" /> Cargos</div>
        </button>
        <button onClick={() => setActiveTab('empresas')} className={`px-6 py-3 text-sm font-medium transition-all border-b-2 ${activeTab === 'empresas' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
          <div className="flex items-center gap-2"><Building2 className="w-4 h-4" /> Empresas</div>
        </button>

        <button
          onClick={() => setActiveTab('eps')}
          className={`px-6 py-3 text-sm font-medium transition-all border-b-2 ${
              activeTab === 'eps'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
      >
          <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              EPS
          </div>
      </button>

              <button onClick={() => setActiveTab('reportes')} className={`px-6 py-3 text-sm font-medium transition-all border-b-2 ${activeTab === 'reportes' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
          <div className="flex items-center gap-2"><Bell className="w-4 h-4" /> Reportes Aniversario</div>
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {activeTab === 'cargos' && (
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800">Listado de Cargos</h3>
              <button onClick={() => handleOpenCargoModal()} className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all text-sm font-bold shadow-md shadow-primary-100"><Plus className="w-4 h-4" /> Nuevo Cargo</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {cargos.map(cargo => (
                <div key={cargo.id} className="group flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-transparent hover:border-primary-200 hover:bg-white transition-all">
                  <span className="font-medium text-gray-700 uppercase text-sm">{cargo.nombre}</span>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleOpenCargoModal(cargo)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleDeleteCargo(cargo.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
              {cargos.length === 0 && <p className="text-gray-500 text-sm italic col-span-full py-8 text-center">No hay cargos configurados.</p>}
            </div>
          </div>
        )}

        {activeTab === 'empresas' && (
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800">Listado de Empresas</h3>
              <button onClick={() => handleOpenEmpresaModal()} className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all text-sm font-bold shadow-md shadow-primary-100"><Plus className="w-4 h-4" /> Nueva Empresa</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {empresas.map(emp => (
                <div key={emp.id} className="group flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-transparent hover:border-primary-200 hover:bg-white transition-all">
                  <span className="font-medium text-gray-700 uppercase text-sm font-bold">{emp.nombre}</span>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleOpenEmpresaModal(emp)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleDeleteEmpresa(emp.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
              {empresas.length === 0 && <p className="text-gray-500 text-sm italic col-span-full py-8 text-center">No hay empresas configuradas.</p>}
            </div>
          </div>
        )}


        {activeTab === 'eps' && (
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800">Listado de Eps</h3>
              <button onClick={() => handleOpenEpsModal()} className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all text-sm font-bold shadow-md shadow-primary-100"><Plus className="w-4 h-4" /> Nueva EPS</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {eps.map(eps => (
                <div key={eps.id} className="group flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-transparent hover:border-primary-200 hover:bg-white transition-all">
                  <span className="font-medium text-gray-700 uppercase text-sm">{eps.nombre}</span>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleOpenEpsModal(eps)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleDeleteEps(eps.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
              {eps.length === 0 && <p className="text-gray-500 text-sm italic col-span-full py-8 text-center">No hay EPS configuradas.</p>}
            </div>
          </div>
        )}

        {activeTab === 'reportes' && (
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800">Configuración de Reportes</h3>
              <div className="flex gap-2">
                <button 
                  onClick={handleTestCron} 
                  disabled={testingCron}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-all text-sm font-bold shadow-md shadow-amber-100 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" /> {testingCron ? 'Enviando...' : 'Probar Envío'}
                </button>
                <button onClick={() => handleOpenReportModal()} className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all text-sm font-bold shadow-md shadow-primary-100"><Plus className="w-4 h-4" /> Configurar Reporte</button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 text-left">
                  <tr>
                    <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Empresas</th>
                    <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Destinatarios</th>
                    <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Estado</th>
                    <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {reportConfigs.map(config => (
                    <tr key={config.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-1">
                          {config.empresas.map((name, i) => (
                            <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-[10px] font-bold uppercase">{name}</span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-xs text-gray-600 truncate max-w-[200px]">{config.emails}</td>
                      <td className="px-4 py-4 text-center">
                        {config.activo ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-100"><CheckCircle2 className="w-3 h-3" /> Activo</span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-500 border border-gray-200"><AlertCircle className="w-3 h-3" /> Inactivo</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleOpenReportModal(config)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => handleDeleteReport(config.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Cargo Modal */}
      {showCargoModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in duration-300">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">{editingItem ? 'Editar Cargo' : 'Nuevo Cargo'}</h3>
              <button onClick={() => setShowCargoModal(false)} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSaveCargo} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nombre del Cargo</label>
                <input autoFocus type="text" value={cargoName} onChange={(e) => setCargoName(e.target.value.toUpperCase())} className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none uppercase" placeholder="Ej: ANALISTA" required />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowCargoModal(false)} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-xl">Cancelar</button>
                <button type="submit" className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 font-bold shadow-md shadow-primary-200"><Save className="w-4 h-4" /> Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Empresa Modal */}
      {showEmpresaModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in duration-300">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">{editingItem ? 'Editar Empresa' : 'Nueva Empresa'}</h3>
              <button onClick={() => setShowEmpresaModal(false)} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSaveEmpresa} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nombre de la Empresa</label>
                <input autoFocus type="text" value={empresaName} onChange={(e) => setEmpresaName(e.target.value.toUpperCase())} className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none uppercase font-bold" placeholder="Ej: STAFFING" required />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowEmpresaModal(false)} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-xl">Cancelar</button>
                <button type="submit" className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 font-bold shadow-md shadow-primary-200"><Save className="w-4 h-4" /> Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EPS Modal */}
      {showEpsModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in duration-300">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">{editingItem ? 'Editar EPS' : 'Nueva EPS'}</h3>
              <button onClick={() => setShowEpsModal(false)} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSaveEps} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nombre de la EPS</label>
                <input autoFocus type="text" value={epsName} onChange={(e) => setEpsName(e.target.value.toUpperCase())} className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none uppercase" placeholder="Ej: SALUD TOTAL" required />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowEpsModal(false)} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-xl">Cancelar</button>
                <button type="submit" className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 font-bold shadow-md shadow-primary-200"><Save className="w-4 h-4" /> Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Report Modal (Multi-select implemented here) */}
      {showReportModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-300">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">{editingItem ? 'Editar Configuración' : 'Nueva Configuración'}</h3>
              <button onClick={() => setShowReportModal(false)} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSaveReport} className="p-6 space-y-5">
              {/* Multi-select de Empresas */}
              <div className="relative">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Seleccionar Empresas *</label>
                <div 
                  onClick={() => setShowCompanyDropdown(!showCompanyDropdown)}
                  className="flex items-center justify-between px-4 py-2.5 border rounded-xl cursor-pointer hover:border-primary-300 transition-all bg-gray-50/50"
                >
                  <div className="flex flex-wrap gap-1">
                    {reportForm.empresas.length > 0 ? (
                      reportForm.empresas.map((name, i) => (
                        <span key={i} className="px-2 py-0.5 bg-primary-600 text-white rounded-lg text-[10px] font-bold uppercase">{name}</span>
                      ))
                    ) : (
                      <span className="text-gray-400 text-sm italic">Selecciona una o varias...</span>
                    )}
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showCompanyDropdown ? 'rotate-180' : ''}`} />
                </div>

                {showCompanyDropdown && (
                  <div className="absolute z-[110] left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-xl max-h-48 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-2 space-y-1">
                      {empresas.map(emp => (
                        <div 
                          key={emp.id} 
                          onClick={() => toggleCompanySelection(emp.nombre)}
                          className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors ${reportForm.empresas.includes(emp.nombre) ? 'bg-primary-50 text-primary-700' : 'hover:bg-gray-50 text-gray-700'}`}
                        >
                          <span className="text-sm font-bold uppercase">{emp.nombre}</span>
                          {reportForm.empresas.includes(emp.nombre) && <Check className="w-4 h-4" />}
                        </div>
                      ))}
                      {empresas.length === 0 && <p className="p-4 text-center text-xs text-gray-500">No hay empresas creadas.</p>}
                    </div>
                  </div>
                )}
              </div>

              {/* Chips de Correos */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Correos para Reportes</label>
                <div className="flex flex-wrap gap-2 p-2 border rounded-xl focus-within:ring-2 focus-within:ring-primary-500 min-h-[42px] transition-all bg-white">
                  {reportForm.email_reportes.map((email, idx) => (
                    <span key={idx} className="flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-700 rounded-lg text-xs font-bold animate-in zoom-in duration-200">
                      {email}
                      <button type="button" onClick={() => removeEmail(email)} className="hover:text-primary-900 transition-colors"><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                  <input type="text" value={emailInput} onChange={(e) => setEmailInput(e.target.value)} onKeyDown={handleAddEmail} className="flex-1 outline-none text-sm min-w-[120px] bg-transparent" placeholder={reportForm.email_reportes.length === 0 ? "Presiona Espacio para añadir..." : ""} />
                </div>
                <p className="text-[10px] text-gray-400 mt-1">El administrador siempre recibirá copia automáticamente.</p>
              </div>

              {/* Switch de Activo */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={reportForm.activo} onChange={(e) => setReportForm({...reportForm, activo: e.target.checked})} className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-700">Notificaciones Activas</label>
                  <p className="text-[10px] text-gray-500">Habilita el envío automático para estas empresas.</p>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowReportModal(false)} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-xl">Cancelar</button>
                <button type="submit" className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 font-bold shadow-md shadow-primary-200"><Save className="w-4 h-4" /> Guardar Configuración</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Configuracion;
