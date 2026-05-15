import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Lock, Eye, EyeOff, ArrowLeft, Loader2, ShieldCheck } from 'lucide-react';
import authService from '../../services/authService';
import Swal from 'sweetalert2';

const ResetPassword = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const { token } = useParams();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password.length < 6) {
            return Swal.fire({
                icon: 'warning',
                title: 'Contraseña muy corta',
                text: 'La contraseña debe tener al menos 6 caracteres.'
            });
        }

        if (password !== confirmPassword) {
            return Swal.fire({
                icon: 'error',
                title: 'No coinciden',
                text: 'Las contraseñas no coinciden. Intenta de nuevo.'
            });
        }

        setLoading(true);
        try {
            await authService.resetPassword(token, password);
            await Swal.fire({
                icon: 'success',
                title: '¡Contraseña actualizada!',
                text: 'Tu contraseña se ha restablecido correctamente. Ya puedes iniciar sesión.',
                confirmButtonText: 'Ir al Login'
            });
            navigate('/login');
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.response?.data?.msg || 'El enlace es inválido o ha expirado. Solicita uno nuevo.'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-600 via-primary-700 to-indigo-900 p-4">
            <div className="w-full max-w-md relative">
                <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/20 p-8 md:p-10">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-green-600">
                            <ShieldCheck className="w-8 h-8" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800 mb-2">Restablecer Contraseña</h1>
                        <p className="text-gray-500 text-sm">Ingresa tu nueva contraseña para continuar.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Nueva Contraseña */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Nueva Contraseña</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-600 transition-colors">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all"
                                    placeholder="Mínimo 6 caracteres"
                                    minLength={6}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Confirmar Contraseña */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Confirmar Contraseña</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-600 transition-colors">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <input
                                    type={showConfirm ? 'text' : 'password'}
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all"
                                    placeholder="Repite la contraseña"
                                    minLength={6}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirm(!showConfirm)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {/* Indicador de coincidencia */}
                            {confirmPassword && (
                                <p className={`text-xs mt-2 ml-1 font-medium ${password === confirmPassword ? 'text-green-600' : 'text-red-500'}`}>
                                    {password === confirmPassword ? '✓ Las contraseñas coinciden' : '✗ Las contraseñas no coinciden'}
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-bold shadow-lg transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <ShieldCheck className="w-4 h-4" />
                                    Restablecer Contraseña
                                </>
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={() => navigate('/login')}
                            className="w-full flex items-center justify-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors py-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Volver al Login
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
