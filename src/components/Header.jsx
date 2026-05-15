import { Menu, Bell, ChevronDown, LogOut, Settings, User as UserIcon, Key } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Avatar from './ui/Avatar';
import authService from '../services/authService';
import Swal from 'sweetalert2';

const Header = ({ onMenuClick, onToggleSidebar, sidebarOpen }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  const handleLogout = () => {
    setShowUserMenu(false);
    Swal.fire({
      title: '¿Cerrar sesión?',
      text: "Tendrás que volver a ingresar tus credenciales.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#4f46e5',
      cancelButtonColor: '#ef4444',
      confirmButtonText: 'Sí, salir',
      cancelButtonText: 'Cancelar',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        authService.logout();
        navigate('/login');
      }
    });
  };

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 lg:px-6">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
        >
          <Menu className="w-5 h-5" />
        </button>

        <button
          onClick={onToggleSidebar}
          className="hidden lg:flex p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="text-center lg:text-left">
          <h1 className="text-lg font-bold text-gray-800">Gestión Humana</h1>
          <p className="text-xs text-gray-500 tracking-widest">SISTEMA ADMINISTRATIVO</p>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1.5 hover:bg-gray-50 rounded-xl transition-all border border-transparent hover:border-gray-100"
          >
            <Avatar name={user?.username || 'Admin'} size="sm" />
            <span className="hidden sm:block text-sm font-bold text-gray-700">
              {user?.username || 'Administrador'}
            </span>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
          </button>

          {showUserMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)}></div>
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in zoom-in duration-200">
                <div className="px-4 py-2 border-b border-gray-50 mb-1">
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Cuenta</p>
                </div>

                <button 
                  onClick={() => { setShowUserMenu(false); navigate('/configuracion/cambiar-password'); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Key className="w-4 h-4 text-gray-400" />
                  Cambiar Contraseña
                </button>

                <div className="my-1 border-t border-gray-50"></div>
                
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Cerrar Sesión
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
