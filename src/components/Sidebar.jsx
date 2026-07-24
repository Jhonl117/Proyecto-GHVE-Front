import { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import Swal from 'sweetalert2';

import logoEmpresa from '../assets/VE-sin-fondo.png';

import { 
  Users, 
  ChevronDown,
  ChevronRight,
  X,
  LogOut,
  LayoutDashboard,
  CreditCard,
  Settings
} from 'lucide-react';

const menuItems = [
  {
    title: 'Dashboard',
    icon: LayoutDashboard,
    path: '/'
  },
  {
    title: 'Empleados',
    icon: Users,
    path: '/empleados/listaEmpleados'
  },
  {
    title: 'Configuración',
    icon: Settings,
    path: '/configuracion'
  },
];

const Sidebar = ({ isOpen, mobileOpen, onMobileClose }) => {
  const [expandedItems, setExpandedItems] = useState(['Procesos de Servicio']);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
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

  const toggleExpand = (title) => {
    setExpandedItems(prev => 
      prev.includes(title) 
        ? prev.filter(item => item !== title)
        : [...prev, title]
    );
  };

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const isParentActive = (children) => {
    return children?.some(child => isActive(child.path));
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside 
        className={`fixed top-0 left-0 h-full bg-gradient-to-b from-sidebar-light to-sidebar z-50 transition-all duration-300 hidden lg:flex flex-col ${
          isOpen ? 'w-64' : 'w-20'
        }`}
      >
        <div className="flex items-center justify-center h-20 border-b border-primary-100 px-4">
          <img
            src={logoEmpresa}
            alt="Logo empresa"
            className={`transition-all duration-300 object-contain ${
              isOpen ? 'w-40 h-20' : 'w-14 h-14'
            }`}
          />
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {menuItems.map((item) => (
            <div key={item.title} className="mb-1">
              {item.children ? (
                <>
                  <button
                    onClick={() => toggleExpand(item.title)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                      isParentActive(item.children)
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-600 hover:bg-primary-50'
                    }`}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    {isOpen && (
                      <>
                        <span className="flex-1 text-left text-sm font-medium">{item.title}</span>
                        {item.badge && (
                          <span className="w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium">
                            {item.badge}
                          </span>
                        )}
                        {expandedItems.includes(item.title) ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </>
                    )}
                  </button>
                  
                  {/* Submenu */}
                  {isOpen && expandedItems.includes(item.title) && (
                    <div className="ml-4 mt-1 pl-4 border-l-2 border-primary-200">
                      {item.children.map((child) => (
                        <NavLink
                          key={child.path}
                          to={child.path}
                          className={({ isActive }) => `
                            flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors
                            ${isActive 
                              ? 'bg-primary-600 text-white' 
                              : 'text-gray-600 hover:bg-primary-50'
                            }
                          `}
                        >
                          {child.icon && <child.icon className="w-4 h-4" />}
                          <span className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
                            {child.title}
                          </span>
                        </NavLink>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <NavLink
                  to={item.path}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors
                    ${isActive 
                      ? 'bg-primary-100 text-primary-700' 
                      : 'text-gray-600 hover:bg-primary-50'
                    }
                  `}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {isOpen && (
                    <span className="text-sm font-medium">{item.title}</span>
                  )}
                </NavLink>
              )}
            </div>
          ))}
        </nav>

        {/* Logout Section */}
        <div className="border-t border-primary-100 p-4">
          <button 
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors ${
              !isOpen ? 'justify-center' : ''
            }`}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {isOpen && (
              <span className="text-sm font-medium">Cerrar Sesión</span>
            )}
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <aside 
        className={`fixed top-0 left-0 h-full w-72 bg-gradient-to-b from-sidebar-light to-sidebar z-50 transform transition-transform duration-300 lg:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={onMobileClose}
          className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-700"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center justify-center h-20 border-b border-primary-100">
          <img
            src={logoEmpresa}
            alt="Logo empresa"
            className={`transition-all duration-300 object-contain ${
              isOpen ? 'w-40 h-20' : 'w-14 h-14'
            }`}
          />
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {menuItems.map((item) => (
            <div key={item.title} className="mb-1">
              {item.children ? (
                <>
                  <button
                    onClick={() => toggleExpand(item.title)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                      isParentActive(item.children)
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-600 hover:bg-primary-50'
                    }`}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    <span className="flex-1 text-left text-sm font-medium">{item.title}</span>
                    {item.badge && (
                      <span className="w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium">
                        {item.badge}
                      </span>
                    )}
                    {expandedItems.includes(item.title) ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>
                  
                  {expandedItems.includes(item.title) && (
                    <div className="ml-4 mt-1 pl-4 border-l-2 border-primary-200">
                      {item.children.map((child) => (
                        <NavLink
                          key={child.path}
                          to={child.path}
                          onClick={onMobileClose}
                          className={({ isActive }) => `
                            flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors
                            ${isActive 
                              ? 'bg-primary-600 text-white' 
                              : 'text-gray-600 hover:bg-primary-50'
                            }
                          `}
                        >
                          {child.icon && <child.icon className="w-4 h-4" />}
                          <span className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
                            {child.title}
                          </span>
                        </NavLink>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <NavLink
                  to={item.path}
                  onClick={onMobileClose}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors
                    ${isActive 
                      ? 'bg-primary-100 text-primary-700' 
                      : 'text-gray-600 hover:bg-primary-50'
                    }
                  `}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm font-medium">{item.title}</span>
                </NavLink>
              )}
            </div>
          ))}
        </nav>

        {/* Logout Section */}
        <div className="border-t border-primary-100 p-4">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-medium">Cerrar Sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
