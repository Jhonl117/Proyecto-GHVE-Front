import { useState } from 'react';
import { Key, Lock, ShieldCheck, Loader2, Save, ArrowLeft, Mail } from 'lucide-react';
import authService from '../../services/authService';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

const ChangePassword = () => {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    
    const user = authService.getCurrentUser();

    // Validaciones en tiempo real
    const passwordsMatch = newPassword === confirmPassword && confirmPassword !== '';
    const isLengthValid = newPassword.length >= 6;

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!passwordsMatch) {
            return Swal.fire('Error', 'Las contraseñas no coinciden', 'error');
        }

        if (!isLengthValid) {
            return Swal.fire('Error', 'La nueva contraseña debe tener al menos 6 caracteres', 'warning');
        }

        setLoading(true);
        try {
            await authService.changePassword(oldPassword, newPassword);
            Swal.fire({
                icon: 'success',
                title: 'Contraseña actualizada',
                text: 'Tu contraseña ha sido cambiada exitosamente.',
                timer: 2000,
                showConfirmButton: false
            });
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
            navigate('/empleados/listaEmpleados');
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.response?.data?.msg || 'No se pudo cambiar la contraseña'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto mt-8">
            <div className="mb-6 flex items-center gap-4">
                <button 
                    onClick={() => navigate(-1)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 text-gray-500" />
                </button>
                <h1 className="text-2xl font-bold text-gray-800">Seguridad de la Cuenta</h1>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-8">
                    <div className="flex items-center gap-4 mb-8 p-4 bg-primary-50 rounded-2xl">
                        <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center text-white">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="font-bold text-gray-800">Cambiar Contraseña</h2>
                            <p className="text-sm text-gray-500 text-pretty">Gestión de seguridad para <strong>{user?.username}</strong></p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Campo de Email (Lectura) */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Correo Electrónico</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    disabled
                                    value={user?.email || ''}
                                    className="w-full pl-11 pr-4 py-3 bg-gray-100 border border-gray-200 rounded-2xl text-gray-500 cursor-not-allowed"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Contraseña Actual</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="password"
                                    required
                                    value={oldPassword}
                                    onChange={(e) => setOldPassword(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all"
                                    placeholder="Ingresa tu clave actual"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Nueva Contraseña</label>
                                <div className="relative">
                                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="password"
                                        required
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className={`w-full pl-11 pr-4 py-3 bg-gray-50 border rounded-2xl focus:bg-white focus:ring-4 outline-none transition-all ${
                                            newPassword === '' ? 'border-gray-100 focus:ring-primary-500/10' :
                                            isLengthValid ? 'border-green-200 focus:ring-green-500/10' : 'border-red-200 focus:ring-red-500/10'
                                        }`}
                                        placeholder="Mínimo 6 caracteres"
                                    />
                                </div>
                                {newPassword !== '' && !isLengthValid && (
                                    <p className="text-[10px] text-red-500 mt-1 ml-1 font-medium italic">Debe tener al menos 6 caracteres</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Confirmar Nueva Contraseña</label>
                                <div className="relative">
                                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="password"
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className={`w-full pl-11 pr-4 py-3 bg-gray-50 border rounded-2xl focus:bg-white focus:ring-4 outline-none transition-all ${
                                            confirmPassword === '' ? 'border-gray-100 focus:ring-primary-500/10' :
                                            passwordsMatch ? 'border-green-200 focus:ring-green-500/10' : 'border-red-200 focus:ring-red-500/10'
                                        }`}
                                        placeholder="Repite la nueva clave"
                                    />
                                </div>
                                {confirmPassword !== '' && (
                                    <p className={`text-[10px] mt-1 ml-1 font-medium italic ${passwordsMatch ? 'text-green-600' : 'text-red-500'}`}>
                                        {passwordsMatch ? '✓ Las contraseñas coinciden' : '✗ Las contraseñas no coinciden'}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                disabled={loading || !passwordsMatch || !isLengthValid}
                                className="flex items-center gap-2 px-8 py-3 bg-primary-600 text-white rounded-2xl font-bold hover:bg-primary-700 shadow-lg shadow-primary-100 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        Actualizar Contraseña
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ChangePassword;
