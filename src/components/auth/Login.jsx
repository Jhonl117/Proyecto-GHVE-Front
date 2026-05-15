import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Loader2, LogIn, Mail } from 'lucide-react';
import authService from '../../services/authService';
import Swal from 'sweetalert2';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await authService.login(username, password);
            Swal.fire({
                icon: 'success',
                title: 'Bienvenido',
                text: 'Inicio de sesión exitoso',
                timer: 1500,
                showConfirmButton: false
            });
            navigate('/empleados/listaEmpleados');
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.response?.data?.msg || 'Credenciales inválidas'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            {/* Neutral Minimalist Background */}
            <div className="absolute inset-0 z-0 bg-slate-50 flex items-center justify-center">
                {/* Subtle Geometric Detail */}
                <div className="absolute top-0 left-0 w-full h-full opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
                <div className="w-[500px] h-[500px] bg-primary-100/30 rounded-full blur-3xl"></div>
            </div>

            <div className="w-full max-w-md relative z-10">
                {/* Glass Card */}
                <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/20">
                    <div className="p-8 md:p-10">
                        {/* Header */}
                        <div className="text-center mb-10">
                            <div className="w-20 h-20 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary-200 transform -rotate-6">
                                <span className="text-white font-black text-4xl transform rotate-6">V</span>
                            </div>
                            <h1 className="text-3xl font-bold text-gray-800 mb-2">Gestión Humana</h1>
                            <p className="text-gray-500">Gestión de Empleados - Acceso Administrativo</p>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Usuario</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-600 transition-colors">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all"
                                        placeholder="Tu nombre de usuario"
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-2 ml-1">
                                    <label className="text-sm font-semibold text-gray-700">Contraseña</label>
                                    <button 
                                        type="button"
                                        onClick={() => navigate('/forgot-password')}
                                        className="text-xs font-bold text-primary-600 hover:text-primary-700 transition-colors"
                                    >
                                        ¿Olvidaste tu contraseña?
                                    </button>
                                </div>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-600 transition-colors">
                                        <Lock className="w-5 h-5" />
                                    </div>
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-bold shadow-lg shadow-primary-200 transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Iniciando sesión...
                                    </>
                                ) : (
                                    'Entrar al Panel'
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Footer Decoration */}
                    <div className="bg-gray-50/50 p-6 border-t border-gray-100 text-center">
                        <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
                            <Mail className="w-4 h-4" />
                            soporte@veprodutions.com
                        </p>
                    </div>
                </div>
                
                {/* Copyright */}
                <p className="text-center text-white/60 text-xs mt-8">
                    © 2026 Gestión Humana. Todos los derechos reservados.
                </p>
            </div>
        </div>
    );
};

export default Login;
