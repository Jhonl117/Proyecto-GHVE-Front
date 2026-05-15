import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Spinner from './components/ui/Spinner';
import authService from './services/authService';

// Lazy loading de componentes
const Dashboard = lazy(() => import('./components/Dashboard'));
const ListaEmpleados = lazy(() => import('./components/empleados/ListaEmpleados'));
const CrearEmpleado = lazy(() => import('./components/empleados/CrearEmpleado'));
const EditarEmpleado = lazy(() => import('./components/empleados/EditarEmpleado'));
const DetalleEmpleado = lazy(() => import('./components/empleados/DetalleEmpleado'));
const Login = lazy(() => import('./components/auth/Login'));
const ForgotPassword = lazy(() => import('./components/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('./components/auth/ResetPassword'));
const ChangePassword = lazy(() => import('./components/auth/ChangePassword'));
const LiquidacionNomina = lazy(() => import('./components/nomina/LiquidacionNomina'));
const HistorialNomina = lazy(() => import('./components/nomina/HistorialNomina'));
const Configuracion = lazy(() => import('./components/configuracion/Configuracion'));

// Componente de carga
const LoadingFallback = () => (
  <div className="flex items-center justify-center h-full min-h-[400px]">
    <Spinner size="lg" />
  </div>
);

// Middleware para proteger rutas
const PrivateRoute = ({ children }) => {
  const isAuthenticated = !!authService.getToken();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Middleware para rutas públicas (Login/Forgot)
const PublicRoute = ({ children }) => {
  const isAuthenticated = !!authService.getToken();
  return isAuthenticated ? <Navigate to="/" replace /> : children;
};

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Rutas Públicas */}
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          
          {/* Rutas Privadas Protegidas por Layout */}
          <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route index element={<Dashboard />} />
            
            {/* Rutas de Empleados */}
            <Route
              path="/empleados/listaEmpleados"
              element={<ListaEmpleados />}
            />
            <Route
              path="/empleados/crearEmpleados"
              element={<CrearEmpleado />}
            />
            <Route
              path="/empleados/editarEmpleado/:id"
              element={<EditarEmpleado />}
            />
            <Route
              path="/empleados/detalleEmpleado/:id"
              element={<DetalleEmpleado />}
            />
            <Route
              path="/configuracion/cambiar-password"
              element={<ChangePassword />}
            />
            <Route
              path="/nomina/liquidar"
              element={<LiquidacionNomina />}
            />
            <Route
              path="/nomina/historial"
              element={<HistorialNomina />}
            />
            <Route
              path="/configuracion"
              element={<Configuracion />}
            />
          </Route>

          {/* Redirección por defecto */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
