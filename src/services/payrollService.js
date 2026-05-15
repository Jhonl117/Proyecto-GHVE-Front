import apiClient from '../apiclient';

const payrollService = {
  // Obtener todos los registros de nómina
  getPayrolls: async () => {
    try {
      const response = await apiClient.get('/nomina');
      return response.data;
    } catch (error) {
      console.error('Error al obtener nóminas:', error);
      throw error;
    }
  },

  // Obtener una nómina por ID
  getPayrollById: async (id) => {
    try {
      const response = await apiClient.get(`/nomina/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener nómina ${id}:`, error);
      throw error;
    }
  },

  // Crear un nuevo registro de nómina
  createPayroll: async (payrollData) => {
    try {
      const response = await apiClient.post('/nomina', payrollData);
      return response.data;
    } catch (error) {
      console.error('Error al crear registro de nómina:', error);
      throw error;
    }
  },

  // Obtener historial de nómina de un empleado
  getPayrollByEmployee: async (employeeId) => {
    try {
      const response = await apiClient.get(`/nomina/empleado/${employeeId}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener historial de nómina para el empleado ${employeeId}:`, error);
      throw error;
    }
  },

  // Eliminar un registro de nómina
  deletePayroll: async (id) => {
    try {
      const response = await apiClient.delete(`/nomina/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error al eliminar nómina ${id}:`, error);
      throw error;
    }
  },

  // Actualizar un registro de nómina
  updatePayroll: async (id, payrollData) => {
    try {
      const response = await apiClient.put(`/nomina/${id}`, payrollData);
      return response.data;
    } catch (error) {
      console.error(`Error al actualizar nómina ${id}:`, error);
      throw error;
    }
  }
};

export default payrollService;
