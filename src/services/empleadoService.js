import apiClient from '../apiclient';

const empleadoService = {
  // Obtener todos los empleados
  getAllEmpleados: async () => {
    try {
      const response = await apiClient.get('/empleado');
      return response.data;
    } catch (error) {
      console.error('Error al obtener los empleados:', error);
      throw error;
    }
  },

  // Obtener un empleado por ID
  getEmpleadoById: async (id) => {
    try {
      const response = await apiClient.get(`/empleado/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener el empleado:', error);
      throw error;
    }
  },

  // Crear un nuevo empleado
  createEmpleado: async (empleadoData) => {
    try {
      const response = await apiClient.post('/empleado', empleadoData);
      return response.data;
    } catch (error) {
      console.error('Error al crear el empleado:', error);
      throw error;
    }
  },

  // Registro masivo de empleados (desde Excel)
  bulkCreate: async (empleados) => {
    try {
      const response = await apiClient.post('/empleado/bulk', { empleados });
      return response.data;
    } catch (error) {
      console.error('Error en el registro masivo:', error);
      throw error;
    }
  },

  // Actualizar un empleado
  updateEmpleado: async (id, empleadoData) => {
    try {
      const response = await apiClient.put(`/empleado/${id}`, empleadoData);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar el empleado:', error);
      throw error;
    }
  },

  // Eliminar un empleado
  deleteEmpleado: async (id) => {
    try {
      const response = await apiClient.delete(`/empleado/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al eliminar el empleado:', error);
      throw error;
    }
  },

  // Eliminar empleados en lote
  bulkDelete: async (ids) => {
    try {
      const response = await apiClient.post('/empleado/bulk-delete', { ids });
      return response.data;
    } catch (error) {
      console.error('Error en el borrado masivo:', error);
      throw error;
    }
  },

  // Cambiar estado de un empleado (activar/inactivar)
  toggleEstadoEmpleado: async (id, estado) => {
    try {
      const response = await apiClient.patch(`/empleado/${id}/estado`, { estado });
      return response.data;
    } catch (error) {
      console.error('Error al cambiar el estado del empleado:', error);
      throw error;
    }
  },

  // Obtener lista de cargos
  getCargos: async () => {
    try {
      const response = await apiClient.get('/cargos');
      return response.data;
    } catch (error) {
      console.error('Error al obtener los cargos:', error);
      throw error;
    }
  },

  // Obtener lista de empresas
  getEmpresas: async () => {
    try {
      const response = await apiClient.get('/empresas');
      return response.data;
    } catch (error) {
      console.error('Error al obtener las empresas:', error);
      throw error;
    }
  },

  // Obtener lista de EPS
  getEps: async () => {
    try {
      const response = await apiClient.get('/eps');
      return response.data;
    } catch (error) {
      console.error('Error al obtener las EPS:', error);
      throw error;
    }
  },

  // Obtener lista de fondos de pensión
  getFondosPension: async () => {
    try {
      const response = await apiClient.get('/fondos-pension');
      return response.data;
    } catch (error) {
      console.error('Error al obtener los fondos de pensión:', error);
      throw error;
    }
  },
  // Obtener contratos por vencer
  getExpiringContracts: async () => {
    try {
      const response = await apiClient.get('/empleado/alertas/vencimientos');
      return response.data;
    } catch (error) {
      console.error('Error al obtener alertas de vencimiento:', error);
      throw error;
    }
  },
  // Obtener aniversarios próximos
  getAnniversaryAlerts: async () => {
    try {
      const response = await apiClient.get('/empleado/aniversarios');
      return response.data;
    } catch (error) {
      console.error('Error al obtener alertas de aniversario:', error);
      throw error;
    }
  },
};

export default empleadoService;
