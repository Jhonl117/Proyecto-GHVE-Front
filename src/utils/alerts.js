/**
 * Utilidad para alertas elegantes usando SweetAlert2
 */

const alerts = {
  success: (title, text) => {
    return window.Swal.fire({
      icon: 'success',
      title: title || '¡Éxito!',
      text: text || 'La operación se realizó correctamente.',
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true,
      background: '#ffffff',
      iconColor: '#10b981',
      customClass: {
        popup: 'premium-swal-popup'
      }
    });
  },

  error: (title, text) => {
    return window.Swal.fire({
      icon: 'error',
      title: title || 'Error',
      text: text || 'Hubo un problema al procesar la solicitud.',
      confirmButtonColor: '#ef4444',
      customClass: {
        popup: 'premium-swal-popup'
      }
    });
  },

  confirm: (title, text, confirmButtonText = 'Sí, continuar') => {
    return window.Swal.fire({
      title: title || '¿Estás seguro?',
      text: text || 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#2563eb',
      cancelButtonColor: '#6b7280',
      confirmButtonText: confirmButtonText,
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
      customClass: {
        popup: 'premium-swal-popup'
      }
    });
  },

  loading: (title) => {
    window.Swal.fire({
      title: title || 'Cargando...',
      allowOutsideClick: false,
      didOpen: () => {
        window.Swal.showLoading();
      }
    });
  },

  close: () => {
    window.Swal.close();
  }
};

export default alerts;
