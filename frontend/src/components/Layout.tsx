import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Layout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const menuItems = [
        { name: 'Dashboard', path: '/dashboard', roles: ['Admin', 'HR', 'Employee', 'Vendor'] },
        { name: 'Workflows', path: '/workflows', roles: ['Admin', 'HR'] },
        { name: 'Assign', path: '/assign', roles: ['Admin', 'HR'] },
        { name: 'Documents', path: '/documents', roles: ['Admin', 'HR'] },
    ];

    const filteredMenu = menuItems.filter(item => item.roles.includes(user?.role || ''));

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white shadow-md flex-shrink-0 hidden md:flex flex-col">
                <div className="p-6 border-b">
                    <h1 className="text-2xl font-bold text-indigo-600">ProcureTrack</h1>
                    <p className="text-xs text-gray-500 mt-1">Role: {user?.role}</p>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    {filteredMenu.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`block px-4 py-2 rounded-md transition-colors ${location.pathname === item.path
                                ? 'bg-indigo-50 text-indigo-600 font-medium'
                                : 'text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            {item.name}
                        </Link>
                    ))}
                </nav>
                <div className="p-4 border-t">
                    <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    >
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Mobile Header */}
                <header className="bg-white shadow-sm md:hidden p-4 flex justify-between items-center">
                    <h1 className="text-xl font-bold text-indigo-600">ProcureTrack</h1>
                    <button onClick={handleLogout} className="text-sm text-red-600">Sign Out</button>
                </header>

                <div className="flex-1 overflow-auto p-4 sm:p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;
