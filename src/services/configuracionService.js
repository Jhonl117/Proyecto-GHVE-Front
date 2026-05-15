import apiClient from '../apiclient';

const configuracionService = {
  // CARGOS
  getCargos: async () => {
    const response = await apiClient.get('/cargos');
    return response.data;
  },
  createCargo: async (data) => {
    const response = await apiClient.post('/cargos', data);
    return response.data;
  },
  updateCargo: async (id, data) => {
    const response = await apiClient.put(`/cargos/${id}`, data);
    return response.data;
  },
  deleteCargo: async (id) => {
    const response = await apiClient.delete(`/cargos/${id}`);
    return response.data;
  },

  // EMPRESAS
  getEmpresas: async () => {
    const response = await apiClient.get('/empresas');
    return response.data;
  },
  createEmpresa: async (data) => {
    const response = await apiClient.post('/empresas', data);
    return response.data;
  },
  updateEmpresa: async (id, data) => {
    const response = await apiClient.put(`/empresas/${id}`, data);
    return response.data;
  },
  deleteEmpresa: async (id) => {
    const response = await apiClient.delete(`/empresas/${id}`);
    return response.data;
  },

  // CONFIGURACIÓN DE REPORTES
  getReportConfigs: async () => {
    const response = await apiClient.get('/config-reportes');
    return response.data;
  },
  createReportConfig: async (data) => {
    const response = await apiClient.post('/config-reportes', data);
    return response.data;
  },
  updateReportConfig: async (id, data) => {
    const response = await apiClient.put(`/config-reportes/${id}`, data);
    return response.data;
  },
  deleteReportConfig: async (id) => {
    const response = await apiClient.delete(`/config-reportes/${id}`);
    return response.data;
  },

  // DISPARAR CRON MANUALMENTE (PRUEBAS)
  testCron: async () => {
    const response = await apiClient.post('/config-reportes/test-cron');
    return response.data;
  }
};

export default configuracionService;
