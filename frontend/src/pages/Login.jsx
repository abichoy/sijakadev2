import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Anchor, User, Lock, Eye, EyeOff, LifeBuoy } from 'lucide-react';
import { CircularProgress } from '@mui/material';

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            // Kita menggunakan 'username' sebagai input, namun di UI labelnya 'Email' karena template.
            const success = await login(username, password);
            if (success) {
                navigate('/');
            } else {
                setError('Login gagal. Periksa kembali kredensial Anda.');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login gagal.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-white">
            {/* Left Side (Hero Section) */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-[#1e40af] to-[#3b82f6] text-white p-12 flex-col justify-center items-start overflow-hidden">
                {/* Decorative wave pattern at the bottom */}
                <div className="absolute bottom-0 left-0 right-0 h-32 opacity-20">
                    <svg viewBox="0 0 1440 320" className="w-full h-full" preserveAspectRatio="none">
                        <path fill="#ffffff" fillOpacity="1" d="M0,256L60,245.3C120,235,240,213,360,208C480,203,600,213,720,234.7C840,256,960,288,1080,288C1200,288,1320,256,1380,240L1440,224L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"></path>
                    </svg>
                </div>

                <div className="relative z-10 max-w-lg">
                    <div className="bg-white/10 p-4 rounded-2xl w-max mb-10 border border-white/20 backdrop-blur-sm">
                        <LifeBuoy size={40} className="text-[#f97316]" strokeWidth={2} />
                    </div>

                    <h1 className="text-5xl font-bold leading-tight mb-6">
                        Keselamatan adalah tanggung jawab kita bersama.
                    </h1>

                    <p className="text-blue-100 text-lg mb-10 leading-relaxed font-bold">
                        Pantau, kelola, dan pastikan ketersediaan serta kelayakan jaket keselamatan di setiap perjalanan perairan Anda melalui satu dasbor pintar.
                    </p>

                    <div className="flex flex-wrap gap-4">
                        <div className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/30 bg-white/5 backdrop-blur-sm text-sm font-medium">
                            <ShieldCheck size={18} />
                            Terverifikasi BKI
                        </div>
                        <div className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/30 bg-white/5 backdrop-blur-sm text-sm font-medium">
                            <Anchor size={18} />
                            Standar Maritim
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side (Form Section) */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-white">
                <div className="w-full max-w-md bg-white p-10 rounded-2xl shadow-xl border border-gray-100 pb-12">
                    <div className="flex flex-col items-center mb-8">
                        <img 
                            src="/logo.png" 
                            alt="SiJaka Logo" 
                            className="w-20 h-20 mb-3 object-contain" 
                        />
                        <h2 className="text-2xl font-bold text-gray-900 mt-2">SiJaka</h2>
                        <p className="text-gray-400 text-sm mt-1">Sistem Informasi Jaket Keselamatan Kapal</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-semibold border border-red-100 flex items-center gap-2">
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Nama Pengguna</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <User size={20} className="text-slate-400" />
                                </div>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#f97316]/50 focus:border-[#f97316] transition-all"
                                    placeholder="Nama Pengguna"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Kata Sandi</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock size={20} className="text-slate-400" />
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-11 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#f97316]/50 focus:border-[#f97316] transition-all"
                                    placeholder="••••••••"
                                    required
                                />
                                <div 
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer text-slate-400 hover:text-slate-600"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between mt-6 mb-8">
                            <label className="flex items-center cursor-pointer">
                                <input type="checkbox" className="form-checkbox h-4 w-4 text-[#f97316] rounded border-gray-300 focus:ring-[#f97316]" />
                                <span className="ml-2 text-sm text-gray-700">Ingat saya</span>
                            </label>
                            <a href="#" className="text-sm font-semibold text-blue-600 hover:text-blue-800">
                                Lupa sandi?
                            </a>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-[#f97316] hover:bg-[#ea580c] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#f97316] transition-colors"
                        >
                            {loading ? <CircularProgress size={24} color="inherit" /> : 'Masuk ke Dasbor'}
                        </button>
                    </form>

                    <div className="mt-8">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500"></span>
                            </div>
                        </div>

                        <p className="mt-8 text-center text-sm text-gray-500">
                            Belum memiliki akses?{' '}
                            <a href="#" className="font-semibold text-[#f97316] hover:text-[#ea580c]">
                                Hubungi Administrator
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
