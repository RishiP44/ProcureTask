import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    LayoutDashboard, Users, Workflow, FileText, 
    User, LogOut, Menu, SendHorizontal, Bell,
    Mail, ClipboardList, ChevronDown
} from 'lucide-react';

interface NavItem {
    name: string;
    path: string;
    icon: React.ReactNode;
    roles: string[];
    badge?: number;
}

const Layout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [notifOpen, setNotifOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const notifRef = useRef<HTMLDivElement>(null);
    const userMenuRef = useRef<HTMLDivElement>(null);

    const unread = notifications.filter(n => !n.read).length;

    useEffect(() => {
        const fetchNotifs = async () => {
            try {
                const res = await api.get('/notifications');
                setNotifications(res.data);
            } catch { /* silent */ }
        };
        fetchNotifs();
        const interval = setInterval(fetchNotifs, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
            if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setUserMenuOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems: NavItem[] = [
        { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="w-4 h-4" />, roles: ['Admin', 'HR', 'Employee', 'Vendor'] },
        { name: 'Employees', path: '/employees', icon: <Users className="w-4 h-4" />, roles: ['Admin', 'HR'] },
        { name: 'Assign Task', path: '/assign', icon: <SendHorizontal className="w-4 h-4" />, roles: ['Admin', 'HR'] },
        { name: 'Offer Letters', path: '/offer-letters', icon: <Mail className="w-4 h-4" />, roles: ['Admin', 'HR'] },
        { name: 'Workflows', path: '/workflows', icon: <Workflow className="w-4 h-4" />, roles: ['Admin', 'HR'] },
        { name: 'Documents', path: '/documents', icon: <FileText className="w-4 h-4" />, roles: ['Admin', 'HR'] },
        { name: 'My Tasks', path: '/my-tasks', icon: <ClipboardList className="w-4 h-4" />, roles: ['Employee', 'Vendor'] },
        { name: 'My Profile', path: '/profile', icon: <User className="w-4 h-4" />, roles: ['Admin', 'HR', 'Employee', 'Vendor'] },
    ];

    const filteredNav = navItems.filter(item => item.roles.includes(user?.role || ''));

    const SidebarContent = () => (
        <div className="flex flex-col h-full glass-overlay">
            {/* Logo */}
            <div className="px-8 py-12">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white font-black italic">P</div>
                    <div>
                        <div className="font-extrabold text-slate-900 text-lg tracking-tighter pt-outfit">ProcureTrack</div>
                        <div className="text-[9px] font-extrabold text-blue-500 uppercase tracking-widest leading-none mt-0.5">Systems v2.4</div>
                    </div>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-4 space-y-1">
                {filteredNav.map(item => {
                    const isActive = location.pathname === item.path ||
                        (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
                    
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setSidebarOpen(false)}
                            className="relative group"
                        >
                            <div className={isActive ? 'pt-sidebar-item-active' : 'pt-sidebar-item-inactive'}>
                                <span className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-900 transition-colors'}>
                                    {item.icon}
                                </span>
                                {item.name}
                                {isActive && (
                                    <motion.div 
                                        layoutId="active-pill"
                                        className="absolute right-2 w-1.5 h-1.5 bg-blue-400 rounded-full"
                                    />
                                )}
                            </div>
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom section */}
            <div className="px-6 py-10 border-t border-slate-100">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-3 text-[10px] font-extrabold text-rose-500 uppercase tracking-widest hover:bg-rose-50 rounded-xl transition-all"
                >
                    <LogOut className="w-4 h-4" />
                    Logout Session
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#f8fafc] flex">
            {/* Desktop Sidebar */}
            <aside className="w-[260px] bg-white border-r border-slate-100 flex-shrink-0 hidden md:flex flex-col fixed h-full z-20">
                <SidebarContent />
            </aside>

            {/* Mobile Sidebar */}
            <AnimatePresence>
                {sidebarOpen && (
                    <div className="fixed inset-0 z-40 md:hidden">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" 
                            onClick={() => setSidebarOpen(false)} 
                        />
                        <motion.aside 
                            initial={{ x: -260 }}
                            animate={{ x: 0 }}
                            exit={{ x: -260 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="absolute left-0 top-0 bottom-0 w-[260px] bg-white flex flex-col border-r border-slate-100 shadow-2xl"
                        >
                            <SidebarContent />
                        </motion.aside>
                    </div>
                )}
            </AnimatePresence>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col md:ml-[260px] min-h-screen">
                <header className="sticky top-0 z-10 bg-white/70 backdrop-blur-xl border-b border-slate-100 px-8 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setSidebarOpen(true)}
                            className="md:hidden text-slate-900 p-2 hover:bg-slate-100 rounded-lg transition-colors">
                            <Menu className="w-6 h-6" />
                        </button>
                        <div className="flex flex-col">
                            <h2 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em] mb-0.5">Current View</h2>
                            <h1 className="text-sm font-black text-slate-950 uppercase tracking-widest pt-outfit">
                                {filteredNav.find(n => location.pathname.startsWith(n.path))?.name || 'Overview'}
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        {/* Notifications */}
                        <div className="relative" ref={notifRef}>
                            <button
                                onClick={() => { setNotifOpen(!notifOpen); setUserMenuOpen(false); }}
                                className="relative p-2 text-slate-400 hover:text-slate-900 transition-colors"
                            >
                                <Bell className="w-5 h-5" />
                                {unread > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full border-2 border-white" />}
                            </button>
                            <AnimatePresence>
                                {notifOpen && (
                                    <motion.div 
                                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                        className="absolute right-0 top-full mt-4 w-80 pt-glass-card shadow-2xl z-20"
                                    >
                                        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                                            <h3 className="font-extrabold text-slate-900 text-[10px] uppercase tracking-widest">Recent Activity</h3>
                                        </div>
                                        <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
                                            {notifications.map(n => (
                                                <div key={n._id} className="px-6 py-4 hover:bg-slate-50 transition-colors cursor-pointer">
                                                    <p className="text-[11px] font-bold text-slate-900">{n.title}</p>
                                                    <p className="text-[10px] text-slate-500 mt-0.5">{n.message}</p>
                                                </div>
                                            ))}
                                            {notifications.length === 0 && (
                                                <div className="p-10 text-center text-slate-300 text-[10px] font-extrabold uppercase tracking-widest">Inbox Empty</div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* User Profile Dropdown */}
                        <div className="relative" ref={userMenuRef}>
                            <button
                                onClick={() => { setUserMenuOpen(!userMenuOpen); setNotifOpen(false); }}
                                className="flex items-center gap-3 pl-4 border-l border-slate-100 group"
                            >
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold ring-2 ring-white shadow-md">
                                    {user?.name?.charAt(0) || 'U'}
                                </div>
                                <div className="hidden lg:flex flex-col items-start">
                                    <span className="text-[11px] font-extrabold text-slate-900 uppercase tracking-widest">{user?.name}</span>
                                    <span className="text-[9px] font-bold text-blue-500 uppercase tracking-tighter">{user?.role}</span>
                                </div>
                                <ChevronDown className="w-3 h-3 text-slate-300 group-hover:text-slate-900 transition-colors" />
                            </button>
                            <AnimatePresence>
                                {userMenuOpen && (
                                    <motion.div 
                                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                        className="absolute right-0 top-full mt-4 w-52 pt-glass-card shadow-2xl z-20"
                                    >
                                        <div className="py-2">
                                            <Link to="/profile" className="flex items-center gap-3 px-6 py-3 text-[10px] font-extrabold text-slate-600 uppercase tracking-widest hover:bg-slate-50 hover:text-slate-900">
                                                <User className="w-3.5 h-3.5" />
                                                Account Settings
                                            </Link>
                                            <button onClick={handleLogout} className="flex items-center gap-3 w-full text-left px-6 py-3 text-[10px] font-extrabold text-rose-500 uppercase tracking-widest hover:bg-rose-50">
                                                <LogOut className="w-3.5 h-3.5" />
                                                Disconnect
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </header>

                <main className="flex-1 p-8 md:p-12 w-full max-w-7xl mx-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;
