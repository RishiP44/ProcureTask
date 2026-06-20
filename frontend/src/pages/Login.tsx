import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import procureTaskLogo from '../assets/procuretask-logo.png';
import {
    ArrowRight, BarChart3, Bell, Building2, CheckCircle2,
    Eye, EyeOff, FileText, LayoutDashboard, Loader2, Lock, Mail,
    Menu, ReceiptText, Smartphone, User, Users, Workflow, X
} from 'lucide-react';

const features = [
    {
        icon: Users,
        title: 'Employee records',
        description: 'Keep employee details, assigned work, progress, and uploaded documents together.'
    },
    {
        icon: Building2,
        title: 'Vendor records',
        description: 'Manage vendor companies separately, including their services, workflows, and bills.'
    },
    {
        icon: Workflow,
        title: 'Workflows and tasks',
        description: 'Create different workflows for employees and vendors, then assign the right work.'
    },
    {
        icon: ReceiptText,
        title: 'Vendor bills',
        description: 'Vendors submit audited bills. Admins can review totals and mark bills approved, rejected, or paid.'
    },
    {
        icon: FileText,
        title: 'Documents',
        description: 'See uploaded documents directly inside the employee or vendor record they belong to.'
    },
    {
        icon: BarChart3,
        title: 'Reports',
        description: 'Check progress, completed work, pending tasks, and vendor spending in clear reports.'
    },
    {
        icon: Bell,
        title: 'Reminders',
        description: 'Notify people when work is assigned, due, completed, or needs attention.'
    },
    {
        icon: Smartphone,
        title: 'Web and mobile',
        description: 'Use ProcureTask from a browser or the mobile app while keeping the same information.'
    }
];

const steps = [
    ['1', 'Add your people', 'Invite employees and vendors. Each role gets the correct profile and access.'],
    ['2', 'Create the work', 'Build an employee or vendor workflow with the tasks and documents you need.'],
    ['3', 'Assign and track', 'Choose a person, set a due date, and follow progress from the dashboard.'],
    ['4', 'Review the results', 'Open profiles to see documents, vendor bills, completed work, and reports.']
];

const Login = () => {
    const [tab, setTab] = useState<'login' | 'signup'>('login');
    const [searchParams] = useSearchParams();
    const { login } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const [loginData, setLoginData] = useState({ email: '', password: '' });
    const [signupData, setSignupData] = useState({
        name: '',
        email: searchParams.get('email') || '',
        password: '',
        confirmPassword: '',
        role: 'Employee' as const,
        inviteToken: searchParams.get('token') || '',
    });

    useEffect(() => {
        if (searchParams.get('token')) {
            setTab('signup');
            document.getElementById('access')?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [searchParams]);

    const handleLogin = async (event: React.FormEvent) => {
        event.preventDefault();
        setLoading(true);
        try {
            const response = await api.post('/auth/login', loginData);
            login(response.data);
            toast.success(`Welcome back, ${response.data.name}!`);
            navigate('/dashboard');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Could not log in');
        } finally {
            setLoading(false);
        }
    };

    const handleSignup = async (event: React.FormEvent) => {
        event.preventDefault();
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

            const response = await api.post('/auth/register', payload);
            login(response.data);
            toast.success('Your account is ready');
            navigate('/dashboard');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Could not create your account');
        } finally {
            setLoading(false);
        }
    };

    const isInviteFlow = Boolean(signupData.inviteToken);
    const openAccess = (nextTab: 'login' | 'signup') => {
        setTab(nextTab);
        setMobileMenuOpen(false);
        document.getElementById('access')?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="landing-page">
            <nav className="landing-nav">
                <div className="landing-nav-inner">
                    <a href="#home" className="landing-brand">
                        <img src={procureTaskLogo} alt="" className="h-10 w-10 rounded-xl object-cover shadow-lg" />
                        <span className="text-xl font-black tracking-tight pt-outfit">ProcureTask</span>
                    </a>

                    <div className="landing-nav-links">
                        <a href="#features" className="text-sm font-semibold text-slate-300 transition hover:text-blue-300">Features</a>
                        <a href="#how-it-works" className="text-sm font-semibold text-slate-300 transition hover:text-blue-300">How it works</a>
                        <a href="#roles" className="text-sm font-semibold text-slate-300 transition hover:text-blue-300">Who it helps</a>
                    </div>

                    <div className="landing-nav-actions">
                        <button onClick={() => openAccess('login')} className="text-sm font-bold text-slate-200 transition hover:text-white">Login</button>
                        <button onClick={() => openAccess('signup')} className="rounded-xl bg-blue-600 px-5 py-3 text-xs font-black uppercase tracking-wider shadow-lg shadow-blue-600/20 transition hover:bg-blue-500">
                            Get Started
                        </button>
                    </div>

                    <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="landing-menu-button" aria-label="Open navigation">
                        {mobileMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>
                <AnimatePresence>
                    {mobileMenuOpen && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="border-t border-white/10 px-6 py-5 md:hidden">
                            <div className="flex flex-col gap-4">
                                <a href="#features" onClick={() => setMobileMenuOpen(false)}>Features</a>
                                <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)}>How it works</a>
                                <a href="#roles" onClick={() => setMobileMenuOpen(false)}>Who it helps</a>
                                <button onClick={() => openAccess('login')} className="text-left font-bold">Login</button>
                                <button onClick={() => openAccess('signup')} className="rounded-xl bg-blue-600 px-5 py-3 font-bold">Get Started</button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>

            <main>
                <section id="home" className="landing-hero">
                    <div className="landing-glow landing-glow-one" />
                    <div className="landing-glow landing-glow-two" />
                    <div className="landing-hero-inner">
                        <motion.div className="landing-hero-copy" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
                            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-2 text-xs font-bold text-blue-300">
                                <CheckCircle2 className="h-4 w-4" />
                                One place for employees, vendors, tasks, and bills
                            </div>
                            <h1 className="landing-hero-title">
                                Make company work <span className="text-blue-400">easy to manage.</span>
                            </h1>
                            <p className="landing-hero-text">
                                ProcureTask helps your team organize employees, vendors, workflows, documents, bills, and reports without confusing tools or complicated words.
                            </p>
                            <div className="landing-hero-actions">
                                <button onClick={() => openAccess('signup')} className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-7 py-4 text-sm font-black shadow-xl shadow-blue-600/20 transition hover:bg-blue-500">
                                    Start Using ProcureTask <ArrowRight className="h-4 w-4" />
                                </button>
                                <a href="#features" className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-7 py-4 text-sm font-bold transition hover:bg-white/10">
                                    See All Features
                                </a>
                            </div>
                            <div className="landing-hero-stats">
                                <div><strong>4 roles</strong><span>Admin, HR, employee, vendor</span></div>
                                <div><strong>1 place</strong><span>Profiles, work, files, and bills</span></div>
                                <div><strong>2 apps</strong><span>Web and mobile access</span></div>
                            </div>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 }} className="landing-preview-wrap">
                            <div className="landing-preview-glow" />
                            <div className="landing-preview-shell">
                                <div className="landing-preview">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-widest text-blue-600">Dashboard</p>
                                            <h2 className="mt-1 text-2xl font-black pt-outfit">Today’s work</h2>
                                        </div>
                                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white"><LayoutDashboard /></div>
                                    </div>
                                    <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                                        {[['12', 'Employees'], ['5', 'Vendors'], ['8', 'Open tasks']].map(([value, label]) => (
                                            <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4">
                                                <strong className="block text-2xl">{value}</strong>
                                                <span className="text-xs text-slate-500">{label}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-5 space-y-3">
                                        {[
                                            ['New employee setup', '75%', 'bg-blue-500'],
                                            ['Vendor service review', '50%', 'bg-amber-500'],
                                            ['Document collection', '100%', 'bg-emerald-500']
                                        ].map(([name, progress, color]) => (
                                            <div key={name} className="rounded-2xl border border-slate-200 bg-white p-4">
                                                <div className="flex items-center justify-between text-sm font-bold"><span>{name}</span><span>{progress}</span></div>
                                                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100"><div className={`h-full ${color}`} style={{ width: progress }} /></div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>

                <section id="features" className="bg-[#F8FAFC] px-6 py-24 text-slate-950 lg:px-8 lg:py-28">
                    <div className="mx-auto max-w-7xl">
                        <div className="mx-auto max-w-3xl text-center">
                            <p className="text-xs font-black uppercase tracking-[0.3em] text-blue-600">Everything in one system</p>
                            <h2 className="mt-4 text-4xl font-black pt-outfit sm:text-5xl">Simple tools for real company work</h2>
                            <p className="mt-5 text-lg leading-8 text-slate-600">Each feature is connected, so your team does not need to search through different apps and folders.</p>
                        </div>
                        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
                            {features.map(({ icon: Icon, title, description }) => (
                                <div key={title} className="min-h-[230px] rounded-3xl border border-slate-200/80 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600"><Icon className="h-6 w-6" /></div>
                                    <h3 className="mt-6 text-lg font-black pt-outfit">{title}</h3>
                                    <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section id="how-it-works" className="bg-[#081127] px-6 py-24 lg:px-8 lg:py-28">
                    <div className="mx-auto max-w-7xl">
                        <div className="grid gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-20">
                            <div>
                                <p className="text-xs font-black uppercase tracking-[0.3em] text-blue-400">How it works</p>
                                <h2 className="mt-4 text-4xl font-black pt-outfit sm:text-5xl">From setup to completed work</h2>
                                <p className="mt-6 text-lg leading-8 text-slate-300">ProcureTask gives everyone a clear next step. Admins organize the work, employees complete tasks, and vendors submit services and bills.</p>
                            </div>
                            <div className="grid gap-5 sm:grid-cols-2">
                                {steps.map(([number, title, description]) => (
                                    <div key={number} className="min-h-[220px] rounded-3xl border border-white/10 bg-white/[0.045] p-7">
                                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500 font-black">{number}</span>
                                        <h3 className="mt-5 text-xl font-black pt-outfit">{title}</h3>
                                        <p className="mt-3 text-sm leading-6 text-slate-400">{description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                <section id="roles" className="bg-[#EAF1FF] px-6 py-24 text-slate-950 lg:px-8 lg:py-28">
                    <div className="mx-auto max-w-7xl">
                        <div className="text-center">
                            <p className="text-xs font-black uppercase tracking-[0.3em] text-blue-600">Built for every role</p>
                            <h2 className="mt-4 text-4xl font-black pt-outfit sm:text-5xl">Everyone sees what they need</h2>
                        </div>
                        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
                            {[
                                ['Admin', 'Manage employees, vendors, workflows, reports, and bill reviews.'],
                                ['HR', 'Invite employees, send offer letters, assign work, and check progress.'],
                                ['Employee', 'View assigned tasks, upload documents, and update profile details.'],
                                ['Vendor', 'Complete vendor workflows, submit audited bills, and track bill status.']
                            ].map(([role, description]) => (
                                <div key={role} className="min-h-[190px] rounded-3xl border border-blue-100 bg-white p-7 text-slate-950 shadow-lg shadow-blue-900/5">
                                    <h3 className="text-xl font-black pt-outfit">{role}</h3>
                                    <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section id="access" className="relative overflow-hidden bg-[#050B1D] px-6 py-24 lg:px-8 lg:py-28">
                    <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/20 blur-[120px]" />
                    <div className="relative mx-auto grid max-w-6xl gap-14 lg:grid-cols-2 lg:items-center lg:gap-20">
                        <div>
                            <p className="text-xs font-black uppercase tracking-[0.3em] text-blue-400">{isInviteFlow ? 'Invitation' : 'Account Access'}</p>
                            <h2 className="mt-4 text-4xl font-black pt-outfit sm:text-5xl">{isInviteFlow ? 'Finish setting up your account' : 'Ready to get started?'}</h2>
                            <p className="mt-5 text-lg leading-8 text-slate-300">
                                {isInviteFlow ? 'Enter your name and choose a password to accept your invitation.' : 'Log in to your workspace or create an employee account. Vendor and HR accounts are created through invitations.'}
                            </p>
                            <div className="mt-8 space-y-4 text-sm text-slate-300">
                                {['Clear role-based access', 'Secure password login', 'Your information stays connected'].map(item => (
                                    <div key={item} className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-emerald-400" />{item}</div>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-[32px] border border-white/10 bg-[#0B1530]/90 p-7 shadow-2xl backdrop-blur-xl sm:p-10">
                            <div className="mb-8">
                                <h3 className="text-2xl font-black pt-outfit">{isInviteFlow ? 'Accept Invitation' : tab === 'login' ? 'Login' : 'Create Account'}</h3>
                                <p className="mt-2 text-sm text-slate-400">{isInviteFlow ? 'Complete the form below.' : tab === 'login' ? 'Enter your email and password.' : 'Create a standard employee account.'}</p>
                            </div>

                            {!isInviteFlow && (
                                <div className="mb-8 flex rounded-2xl border border-white/10 bg-slate-950/50 p-1">
                                    <button onClick={() => setTab('login')} className={`flex-1 rounded-xl px-4 py-3 text-sm font-bold transition ${tab === 'login' ? 'bg-white text-slate-950' : 'text-slate-400'}`}>Login</button>
                                    <button onClick={() => setTab('signup')} className={`flex-1 rounded-xl px-4 py-3 text-sm font-bold transition ${tab === 'signup' ? 'bg-white text-slate-950' : 'text-slate-400'}`}>Create Account</button>
                                </div>
                            )}

                            <AnimatePresence mode="wait">
                                {tab === 'login' && !isInviteFlow ? (
                                    <motion.form key="login" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} onSubmit={handleLogin} className="space-y-5">
                                        <div>
                                            <label className="mb-2 block text-xs font-bold text-slate-300">Email</label>
                                            <div className="relative">
                                                <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                                                <input type="email" className="w-full rounded-xl border border-white/10 bg-slate-950/50 py-3.5 pl-11 pr-4 text-white outline-none focus:border-blue-500" placeholder="name@company.com" value={loginData.email} onChange={event => setLoginData({ ...loginData, email: event.target.value })} required />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="mb-2 block text-xs font-bold text-slate-300">Password</label>
                                            <div className="relative">
                                                <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                                                <input type={showPassword ? 'text' : 'password'} className="w-full rounded-xl border border-white/10 bg-slate-950/50 py-3.5 pl-11 pr-12 text-white outline-none focus:border-blue-500" value={loginData.password} onChange={event => setLoginData({ ...loginData, password: event.target.value })} required />
                                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white" aria-label="Show password">
                                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </button>
                                            </div>
                                        </div>
                                        <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-4 text-sm font-black transition hover:bg-blue-500 disabled:opacity-50">
                                            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Login <ArrowRight className="h-4 w-4" /></>}
                                        </button>
                                    </motion.form>
                                ) : (
                                    <motion.form key="signup" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} onSubmit={handleSignup} className="space-y-5">
                                        <div>
                                            <label className="mb-2 block text-xs font-bold text-slate-300">Full Name</label>
                                            <div className="relative">
                                                <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                                                <input className="w-full rounded-xl border border-white/10 bg-slate-950/50 py-3.5 pl-11 pr-4 text-white outline-none focus:border-blue-500" placeholder="Your name" value={signupData.name} onChange={event => setSignupData({ ...signupData, name: event.target.value })} required />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="mb-2 block text-xs font-bold text-slate-300">Email</label>
                                            <div className="relative">
                                                <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                                                <input type="email" className="w-full rounded-xl border border-white/10 bg-slate-950/50 py-3.5 pl-11 pr-4 text-white outline-none focus:border-blue-500 disabled:opacity-60" placeholder="name@company.com" value={signupData.email} onChange={event => setSignupData({ ...signupData, email: event.target.value })} disabled={isInviteFlow} required />
                                            </div>
                                        </div>
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <div><label className="mb-2 block text-xs font-bold text-slate-300">Password</label><input type="password" className="w-full rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3.5 text-white outline-none focus:border-blue-500" value={signupData.password} onChange={event => setSignupData({ ...signupData, password: event.target.value })} required /></div>
                                            <div><label className="mb-2 block text-xs font-bold text-slate-300">Confirm Password</label><input type="password" className="w-full rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3.5 text-white outline-none focus:border-blue-500" value={signupData.confirmPassword} onChange={event => setSignupData({ ...signupData, confirmPassword: event.target.value })} required /></div>
                                        </div>
                                        <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-4 text-sm font-black transition hover:bg-blue-500 disabled:opacity-50">
                                            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>{isInviteFlow ? 'Finish Account Setup' : 'Create Account'} <ArrowRight className="h-4 w-4" /></>}
                                        </button>
                                    </motion.form>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="border-t border-white/10 bg-[#030817] px-6 py-12 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
                        <div className="lg:col-span-2">
                            <div className="flex items-center gap-3"><img src={procureTaskLogo} alt="" className="h-10 w-10 rounded-xl object-cover" /><span className="text-xl font-black pt-outfit">ProcureTask</span></div>
                            <p className="mt-5 max-w-md text-sm leading-6 text-slate-400">A simple way to manage employees, vendors, tasks, documents, bills, and reports.</p>
                        </div>
                        <div>
                            <h3 className="font-bold">Product</h3>
                            <div className="mt-4 flex flex-col gap-3 text-sm text-slate-400"><a href="#features">Features</a><a href="#how-it-works">How it works</a><a href="#roles">Who it helps</a></div>
                        </div>
                        <div>
                            <h3 className="font-bold">Account</h3>
                            <div className="mt-4 flex flex-col gap-3 text-sm text-slate-400"><button onClick={() => openAccess('login')} className="text-left">Login</button><button onClick={() => openAccess('signup')} className="text-left">Create Account</button></div>
                        </div>
                    </div>
                    <div className="mt-10 flex flex-col justify-between gap-3 border-t border-white/10 pt-7 text-xs text-slate-500 sm:flex-row">
                        <span>© 2026 ProcureTask. All rights reserved.</span>
                        <span>Employee and vendor workflow management</span>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Login;
