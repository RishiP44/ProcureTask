import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
    LayoutDashboard, Users, ClipboardList, Workflow, FileText,
    Bell, LogOut, ChevronDown, Briefcase, Settings, User,
    Menu, X, SendHorizonal, BarChart3
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

    // Close dropdowns on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
            if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setUserMenuOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const markAllRead = async () => {
        try {
            await api.put('/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        } catch { /* silent */ }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems: NavItem[] = [
        { name: 'Dashboard', path: '/dashboard', icon: null, roles: ['Admin', 'HR', 'Employee', 'Vendor'] },
        { name: 'Employees', path: '/employees', icon: null, roles: ['Admin', 'HR'] },
        { name: 'Assign Task', path: '/assign', icon: null, roles: ['Admin', 'HR'] },
        { name: 'Offer Letters', path: '/offer-letters', icon: null, roles: ['Admin', 'HR'] },
        { name: 'Workflows', path: '/workflows', icon: null, roles: ['Admin', 'HR'] },
        { name: 'Documents', path: '/documents', icon: null, roles: ['Admin', 'HR'] },
        { name: 'My Tasks', path: '/my-tasks', icon: null, roles: ['Employee', 'Vendor'] },
        { name: 'My Profile', path: '/profile', icon: null, roles: ['Admin', 'HR', 'Employee', 'Vendor'] },
    ];

    const filteredNav = navItems.filter(item => item.roles.includes(user?.role || ''));

    const getInitials = (name: string) => {
        if (!name) return '?';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="px-8 py-10">
                <div className="font-bold text-slate-900 text-xl tracking-tighter" style={{ fontFamily: 'Outfit, sans-serif' }}>ProcureTask</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">HR Organization</div>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-4 py-2 space-y-1">
                {filteredNav.map(item => {
                    const isActive = location.pathname === item.path ||
                        (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
                    
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setSidebarOpen(false)}
                            className={`block px-4 py-2 text-[12px] font-semibold rounded transition-all ${isActive ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}
                        >
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            {/* User section */}
            <div className="px-6 py-8 border-t border-slate-50">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full px-4 py-2 text-[10px] font-bold text-red-600 uppercase tracking-widest hover:bg-red-50 rounded"
                >
                    <LogOut className="w-3 h-3" />
                    Sign Out
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-white flex">
            {/* Desktop Sidebar */}
            <aside className="w-[240px] bg-white border-r border-slate-100 flex-shrink-0 hidden md:flex flex-col fixed h-full z-20">
                <SidebarContent />
            </aside>

            {/* Mobile Sidebar Drawer */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-40 md:hidden">
                    <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
                    <aside className="absolute left-0 top-0 bottom-0 w-64 bg-white flex flex-col border-r border-slate-100 italic transition-all">
                        <SidebarContent />
                    </aside>
                </div>
            )}

            {/* Main */}
            <div className="flex-1 flex flex-col md:ml-[240px] min-h-screen">
                {/* Top Navbar */}
                <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-100 px-8 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setSidebarOpen(true)}
                            className="md:hidden text-slate-900 p-2 hover:bg-slate-50 rounded">
                            <Menu className="w-6 h-6" />
                        </button>
                        <div className="flex flex-col">
                            <h1 className="text-xs font-bold text-slate-900 uppercase tracking-widest">
                                {filteredNav.find(n => location.pathname.startsWith(n.path))?.name || 'Dashboard'}
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-8">
                        <div className="relative" ref={notifRef}>
                            <button
                                onClick={() => { setNotifOpen(!notifOpen); setUserMenuOpen(false); }}
                                className={`text-[11px] font-bold uppercase tracking-widest transition-colors ${unread > 0 ? 'text-blue-600' : 'text-slate-400 hover:text-slate-900'}`}
                            >
                                Notifications {unread > 0 ? `(${unread})` : ''}
                            </button>
                            {notifOpen && (
                                <div className="absolute right-0 top-full mt-4 w-80 bg-white rounded border border-slate-100 shadow-xl overflow-hidden z-20">
                                    <div className="px-5 py-4 border-b border-slate-50 bg-slate-50/30">
                                        <h3 className="font-bold text-slate-900 text-[10px] uppercase tracking-widest">Notifications</h3>
                                    </div>
                                    <div className="max-h-80 overflow-y-auto divide-y divide-blue-50">
                                        {notifications.map(n => (
                                            <div key={n._id} className="px-5 py-4 hover:bg-blue-50/50 transition-colors">
                                                <p className="text-[11px] font-bold text-blue-900">{n.title}</p>
                                                <p className="text-[10px] text-blue-400 mt-1">{n.message}</p>
                                            </div>
                                        ))}
                                        {notifications.length === 0 && (
                                            <div className="p-10 text-center text-blue-200 text-[10px] font-bold uppercase tracking-widest">No alerts</div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="relative" ref={userMenuRef}>
                            <button
                                onClick={() => { setUserMenuOpen(!userMenuOpen); setNotifOpen(false); }}
                                className="flex items-center gap-2 group"
                            >
                                <span className="text-[10px] font-bold text-blue-950 uppercase tracking-widest group-hover:text-blue-700">{user?.name}</span>
                                <ChevronDown className="w-3 h-3 text-blue-300" />
                            </button>
                            {userMenuOpen && (
                                <div className="absolute right-0 top-full mt-4 w-48 bg-white rounded border border-blue-100 shadow-2xl shadow-blue-900/10 overflow-hidden z-20 animate-fade-in">
                                    <div className="py-2">
                                        <Link to="/profile" className="block px-5 py-3 text-[10px] font-bold text-blue-900 uppercase tracking-widest hover:bg-blue-50">User Profile</Link>
                                        <button onClick={handleLogout} className="block w-full text-left px-5 py-3 text-[10px] font-bold text-red-600 uppercase tracking-widest hover:bg-red-50">Disconnect</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-8 md:p-12 w-full max-w-7xl mx-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;
