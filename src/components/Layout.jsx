import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />
      
      {/* Main Content */}
      <div className={`flex flex-col flex-1 min-w-0 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`}>
        {/* Header */}
        <Header 
          onMenuClick={toggleMobileMenu}
          onToggleSidebar={toggleSidebar}
          sidebarOpen={sidebarOpen}
        />
        
        {/* Main Area */}
        <main className="flex-1 overflow-auto p-6 bg-white">
          <Outlet />
        </main>
        
        {/* Footer */}
        <Footer />
      </div>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;
