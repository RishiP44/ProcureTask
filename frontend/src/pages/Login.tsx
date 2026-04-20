import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Briefcase, Mail, Lock, User, ArrowRight, Loader2, ShieldCheck, Zap } from 'lucide-react';

const Login = () => {
    const [tab, setTab] = useState<'login' | 'signup'>('login');
    const [searchParams] = useSearchParams();
    const { login } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Login form
    const [loginData, setLoginData] = useState({ email: '', password: '' });

    // Signup form
    const [signupData, setSignupData] = useState({
        name: '',
        email: searchParams.get('email') || '',
        password: '',
        confirmPassword: '',
        role: 'Employee' as const,
        inviteToken: searchParams.get('token') || '',
    });

    useEffect(() => {
        if (searchParams.get('token')) setTab('signup');
    }, [searchParams]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post('/auth/login', loginData);
            login(res.data);
            toast.success(`Welcome back, ${res.data.name}!`);
            navigate('/dashboard');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (signupData.password !== signupData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }
        if (signupData.password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }
        setLoading(true);
        try {
            const payload: any = {
                name: signupData.name,
                email: signupData.email,
                password: signupData.password,
                role: signupData.role,
            };
            if (signupData.inviteToken) payload.inviteToken = signupData.inviteToken;

            const res = await api.post('/auth/register', payload);
            login(res.data);
            toast.success('Account created! Welcome to ProcureTask 🎉');
            navigate('/dashboard');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const isInviteFlow = !!signupData.inviteToken;

    return (
        <div className="min-h-screen bg-slate-950 flex font-sans relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
            
            <div className="flex-1 hidden lg:flex flex-col justify-center p-24 relative z-10">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-2xl ring-4 ring-white/10">
                            <ShieldCheck className="w-7 h-7 text-slate-900" />
                        </div>
                        <span className="text-white font-black text-2xl pt-outfit tracking-tight">ProcureTask</span>
                    </div>
                    <h1 className="text-7xl font-black text-white leading-[1.1] pt-outfit mb-8 max-w-xl">
                        Universal <span className="pt-title-gradient">Onboarding</span> Infrastructure.
                    </h1>
                    <p className="text-slate-400 text-lg max-w-lg leading-relaxed mb-12 font-medium">
                        The ultimate high-performance hub for organizational logistics, candidate management, and process automation. Secure, scalable, and beautifully engineered.
                    </p>
                    <div className="flex gap-12">
                        <div className="flex flex-col">
                            <span className="text-3xl font-black text-white pt-outfit">256-bit</span>
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">AES Encryption</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-3xl font-black text-white pt-outfit">10ms</span>
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Registry Latency</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-3xl font-black text-white pt-outfit">Active</span>
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Audit Protocol</span>
                        </div>
                    </div>
                </motion.div>
            </div>

            <div className="flex-1 flex items-center justify-center p-8 relative z-10">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-[480px] pt-glass-card border-white/10 p-12 shadow-2xl"
                >
                    <div className="mb-10 text-center">
                        <h2 className="text-2xl font-black text-white pt-outfit mb-3">
                            {isInviteFlow ? 'Identity Verification' : tab === 'login' ? 'Authentication' : 'Initialize Registry'}
                        </h2>
                        <p className="text-slate-400 text-sm font-medium">
                            {isInviteFlow ? 'Complete your profile to access the organizational hub.' : 'Access your centralized personnel workstation.'}
                        </p>
                    </div>

                    {!isInviteFlow && (
                        <div className="flex bg-slate-900/50 p-1 rounded-2xl mb-8 border border-white/5 shadow-inner">
                            <button 
                                onClick={() => setTab('login')}
                                className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${tab === 'login' ? 'bg-white text-slate-950 shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                Sign In
                            </button>
                            <button 
                                onClick={() => setTab('signup')}
                                className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${tab === 'signup' ? 'bg-white text-slate-950 shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                Register
                            </button>
                        </div>
                    )}

                    <AnimatePresence mode="wait">
                        {tab === 'login' && !isInviteFlow ? (
                            <motion.form 
                                key="login"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                onSubmit={handleLogin} 
                                className="space-y-6"
                            >
                                <div className="space-y-2">
                                    <label className="pt-label text-slate-500">Corporate Email</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-blue-500 transition-colors" />
                                        <input type="email" className="pt-input !bg-slate-900/40 !pt-3 !pb-3 !pl-12 !border-white/5 !text-white" placeholder="name@organization.com" value={loginData.email} onChange={e => setLoginData({ ...loginData, email: e.target.value })} required />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="pt-label text-slate-500">Security Key</label>
                                        <button type="button" className="text-[9px] font-black text-blue-500 uppercase tracking-widest hover:text-blue-400">Recovery?</button>
                                    </div>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-blue-500 transition-colors" />
                                        <input type={showPassword ? 'text' : 'password'} className="pt-input !bg-slate-900/40 !pt-3 !pb-3 !pl-12 !border-white/5 !text-white" value={loginData.password} onChange={e => setLoginData({ ...loginData, password: e.target.value })} required />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white transition-colors">
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                                <button type="submit" disabled={loading} className="pt-btn-primary w-full py-4 !rounded-2xl shadow-xl shadow-blue-600/20 active:scale-95 transition-all mt-4">
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (
                                        <>
                                            Begin Authenticated Session
                                            <ArrowRight className="w-4 h-4" />
                                        </>
                                    )}
                                </button>
                            </motion.form>
                        ) : (
                            <motion.form 
                                key="signup"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                onSubmit={handleSignup} 
                                className="space-y-5"
                            >
                                <div className="space-y-2">
                                    <label className="pt-label text-slate-500">Legal Name</label>
                                    <div className="relative group">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-blue-500 transition-colors" />
                                        <input className="pt-input !bg-slate-900/40 !pt-3 !pb-3 !pl-12 !border-white/5 !text-white" placeholder="Michael Chen" value={signupData.name} onChange={e => setSignupData({ ...signupData, name: e.target.value })} required />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="pt-label text-slate-500">Email Address</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-blue-500 transition-colors" />
                                        <input type="email" className="pt-input !bg-slate-900/40 !pt-3 !pb-3 !pl-12 !border-white/5 !text-white" placeholder="michael@hub.com" value={signupData.email} onChange={e => setSignupData({ ...signupData, email: e.target.value })} disabled={isInviteFlow} required />
                                    </div>
                                </div>
                                {!isInviteFlow && (
                                    <div className="space-y-2">
                                        <label className="pt-label text-slate-500">Functional Role</label>
                                        <div className="relative group">
                                            <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-blue-500 transition-colors" />
                                            <select className="pt-input !bg-slate-900/40 !pt-3 !pb-3 !pl-12 !border-white/5 !text-white cursor-pointer" value={signupData.role} onChange={e => setSignupData({ ...signupData, role: e.target.value as any })}>
                                                <option value="Employee">Employee</option>
                                                <option value="HR">HR Specialist</option>
                                                <option value="Vendor">Vendor Partner</option>
                                            </select>
                                        </div>
                                    </div>
                                )}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="pt-label text-slate-500">Password</label>
                                        <input type="password" className="pt-input !bg-slate-900/40 !pt-3 !pb-3 !border-white/5 !text-white" value={signupData.password} onChange={e => setSignupData({ ...signupData, password: e.target.value })} required />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="pt-label text-slate-500">Verify</label>
                                        <input type="password" className="pt-input !bg-slate-900/40 !pt-3 !pb-3 !border-white/5 !text-white" value={signupData.confirmPassword} onChange={e => setSignupData({ ...signupData, confirmPassword: e.target.value })} required />
                                    </div>
                                </div>
                                <button type="submit" disabled={loading} className="pt-btn-primary w-full py-4 !rounded-2xl shadow-xl shadow-blue-600/20 active:scale-95 transition-all mt-4">
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (
                                        <>
                                            Secure System Access
                                            <Zap className="w-4 h-4 fill-current" />
                                        </>
                                    )}
                                </button>
                            </motion.form>
                        )}
                    </AnimatePresence>

                    <div className="mt-12 flex flex-col items-center gap-6">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-px bg-white/5" />
                            <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em]">Encrypted Session</span>
                            <div className="w-8 h-px bg-white/5" />
                        </div>
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em]">© 2026 ProcureTrack Organizational Infrastructure</p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Login;
