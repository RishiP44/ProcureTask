import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Briefcase, Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react';

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
        <div className="min-h-screen bg-white flex flex-col justify-center items-center py-12 px-4">
            <div className="flex flex-col items-center gap-2 mb-12 animate-fade-in-up">
                <h1 className="text-4xl font-bold text-slate-900 tracking-tighter" style={{ fontFamily: 'Outfit, sans-serif' }}>ProcureTask</h1>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">HR Organization</p>
            </div>

            <div className="max-w-md w-full bg-white p-12 rounded border border-slate-100 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                {!isInviteFlow && (
                    <div className="flex border-b border-slate-50 mb-10">
                        <button
                            onClick={() => setTab('login')}
                            className={`flex-1 pb-4 text-[10px] font-bold uppercase tracking-[0.2em] border-b-2 transition-all ${tab === 'login' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-300'}`}
                        >
                            Sign In
                        </button>
                        <button
                            onClick={() => setTab('signup')}
                            className={`flex-1 pb-4 text-[10px] font-bold uppercase tracking-[0.2em] border-b-2 transition-all ${tab === 'signup' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-300'}`}
                        >
                            Sign Up
                        </button>
                    </div>
                )}

                {tab === 'login' ? (
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="pt-form-group">
                            <label className="pt-label !text-slate-500">Email</label>
                            <input
                                type="email"
                                className="pt-input !py-4"
                                placeholder="name@email.com"
                                value={loginData.email}
                                onChange={e => setLoginData({ ...loginData, email: e.target.value })}
                                required
                            />
                        </div>
                        <div className="pt-form-group">
                            <label className="pt-label !text-slate-500">Password</label>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                className="pt-input !py-4"
                                placeholder="••••••••"
                                value={loginData.password}
                                onChange={e => setLoginData({ ...loginData, password: e.target.value })}
                                required
                            />
                        </div>
                        <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white rounded py-4 text-[11px] uppercase tracking-widest font-bold hover:bg-black transition-all">
                            {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Log In'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleSignup} className="space-y-6">
                        <div className="pt-form-group">
                            <label className="pt-label !text-slate-500">Name</label>
                            <input type="text" className="pt-input !py-4" placeholder="Full Name"
                                value={signupData.name}
                                onChange={e => setSignupData({ ...signupData, name: e.target.value })}
                                required />
                        </div>
                        <div className="pt-form-group">
                            <label className="pt-label !text-slate-500">Email</label>
                            <input type="email" className="pt-input !py-4" placeholder="name@email.com"
                                value={signupData.email}
                                onChange={e => setSignupData({ ...signupData, email: e.target.value })}
                                disabled={isInviteFlow}
                                required />
                        </div>
                        {!isInviteFlow && (
                            <div className="pt-form-group">
                                <label className="pt-label !text-slate-500">Role</label>
                                <select className="pt-select !py-4" value={signupData.role}
                                    onChange={e => setSignupData({ ...signupData, role: e.target.value as any })}>
                                    <option value="Employee">Employee</option>
                                    <option value="HR">HR Manager</option>
                                    <option value="Vendor">Vendor</option>
                                </select>
                            </div>
                        )}
                        <div className="pt-form-group">
                            <label className="pt-label !text-slate-500">Password</label>
                            <input type="password"
                                className="pt-input !py-4" placeholder="Password"
                                value={signupData.password}
                                onChange={e => setSignupData({ ...signupData, password: e.target.value })}
                                required />
                        </div>
                        <div className="pt-form-group">
                            <label className="pt-label !text-slate-500">Confirm Password</label>
                            <input type="password" className="pt-input !py-4" placeholder="Confirm Password"
                                value={signupData.confirmPassword}
                                onChange={e => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                                required />
                        </div>
                        <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white rounded py-4 text-[11px] uppercase tracking-widest font-bold hover:bg-black transition-all">
                            {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Sign Up'}
                        </button>
                    </form>
                )}
            </div>
            
            <p className="mt-16 text-[9px] font-bold text-slate-300 uppercase tracking-[0.4em]">© 2026 ProcureTask</p>
        </div>
    );
};

export default Login;
