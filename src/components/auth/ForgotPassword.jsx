import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2, Send } from 'lucide-react';
import authService from '../../services/authService';
import Swal from 'sweetalert2';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await authService.forgotPassword(email);
            Swal.fire({
                icon: 'success',
                title: 'Correo enviado',
                text: 'Se han enviado las instrucciones a tu correo electrónico.',
                confirmButtonText: 'Entendido'
            });
            navigate('/login');
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.response?.data?.msg || 'No se pudo procesar la solicitud'
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
                        <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-red-600">
                            <Mail className="w-8 h-8" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800 mb-2">¿Olvidaste tu contraseña?</h1>
                        <p className="text-gray-500 text-sm">No te preocupes, ingresa tu correo y te enviaremos instrucciones.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Correo Electrónico</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-600 transition-colors">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all"
                                    placeholder="ejemplo@correo.com"
                                />
                            </div>
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
                                    <Send className="w-4 h-4" />
                                    Enviar Instrucciones
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

export default ForgotPassword;
