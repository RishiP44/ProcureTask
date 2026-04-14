import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
    Users, ClipboardList, CheckCircle2, Clock, TrendingUp,
    ArrowRight, AlertCircle, UserPlus, Workflow, Eye
} from 'lucide-react';

const getInitials = (name: string) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

const StatusBadge = ({ status }: { status: string }) => {
    const map: Record<string, string> = {
        completed: 'pt-badge-green',
        in_progress: 'pt-badge-blue',
        pending: 'pt-badge-yellow',
    };
    return <span className={map[status] || 'pt-badge-gray'}>{status.replace('_', ' ')}</span>;
};

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [assignments, setAssignments] = useState<any[]>([]);
    const [hrStats, setHRStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const isHR = user?.role === 'Admin' || user?.role === 'HR';

    useEffect(() => {
        const fetchData = async () => {
            try {
                const endpoint = isHR ? '/assignments' : '/assignments/my-assignments';
                const res = await api.get(endpoint);
                setAssignments(res.data);

                if (isHR) {
                    const statsRes = await api.get('/users/stats');
                    setHRStats(statsRes.data);
                }
            } catch (err) {
                console.error('Dashboard fetch error', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    const pending = assignments.filter(a => a.status === 'pending').length;
    const inProgress = assignments.filter(a => a.status === 'in_progress').length;
    const completed = assignments.filter(a => a.status === 'completed').length;
    const completionRate = assignments.length > 0
        ? Math.round((completed / assignments.length) * 100)
        : 0;

    if (loading) {
        return (
            <div>
                <div className="pt-page-header">
                    <div>
                        <div className="pt-skeleton h-8 w-48 mb-2" />
                        <div className="pt-skeleton h-4 w-64" />
                    </div>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 stagger">
                    {[1,2,3,4].map(i => <div key={i} className="pt-skeleton h-32 animate-fade-in-up" />)}
                </div>
                <div className="pt-skeleton h-80 animate-fade-in-up" />
            </div>
        );
    }

    return (
        <div className="animate-fade-in-up">
            {/* Page Header */}
            <div className="mb-12 border-b border-slate-100 pb-8 flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-bold text-slate-900 tracking-tighter" style={{ fontFamily: 'Outfit, sans-serif' }}>
                        Dashboard
                    </h1>
                    <p className="text-slate-400 text-[11px] font-bold uppercase mt-2 tracking-widest">
                        Welcome, {user?.name}
                    </p>
                </div>
                {isHR && (
                    <div className="flex items-center gap-4">
                        <Link to="/employees" className="px-6 py-3 bg-slate-900 text-white text-[11px] font-bold rounded uppercase tracking-widest hover:bg-black transition-all">
                            Employees
                        </Link>
                        <Link to="/assign" className="px-6 py-3 border border-slate-200 text-slate-900 text-[11px] font-bold rounded uppercase tracking-widest hover:bg-slate-50 transition-all">
                            Assign Task
                        </Link>
                    </div>
                )}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                {isHR && hrStats && (
                    <div className="p-8 bg-white rounded border border-slate-100">
                        <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Total Employees</span>
                        <div className="text-4xl font-bold text-slate-900 mt-2 tracking-tighter" style={{ fontFamily: 'Outfit, sans-serif' }}>{hrStats.total}</div>
                        <div className="text-slate-300 text-[10px] mt-1 uppercase font-bold tracking-widest">{hrStats.active} Active</div>
                    </div>
                )}

                <div className="p-8 bg-white rounded border border-slate-100">
                    <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Pending</span>
                    <div className="text-4xl font-bold text-slate-900 mt-2 tracking-tighter" style={{ fontFamily: 'Outfit, sans-serif' }}>{pending}</div>
                </div>

                <div className="p-8 bg-white rounded border border-slate-100">
                    <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">In Progress</span>
                    <div className="text-4xl font-bold text-slate-900 mt-2 tracking-tighter" style={{ fontFamily: 'Outfit, sans-serif' }}>{inProgress}</div>
                </div>

                <div className="p-8 bg-white rounded border border-slate-100">
                    <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Completed</span>
                    <div className="text-4xl font-bold text-slate-900 mt-2 tracking-tighter" style={{ fontFamily: 'Outfit, sans-serif' }}>{completionRate}%</div>
                </div>
            </div>

            {/* Recent Assignments Table */}
            <div>
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xs font-bold text-blue-900 uppercase tracking-[0.2em]">
                        {isHR ? 'System Activity Log' : 'Personal Task List'}
                    </h2>
                </div>

                <div className="overflow-x-auto bg-white border border-blue-100 rounded">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-blue-50/50">
                                {isHR && <th className="px-6 py-4 text-[10px] font-bold text-blue-400 uppercase tracking-widest border-b border-blue-100">Staff</th>}
                                <th className="px-6 py-4 text-[10px] font-bold text-blue-400 uppercase tracking-widest border-b border-blue-100">Workflow</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-blue-400 uppercase tracking-widest border-b border-blue-100">Status</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-blue-400 uppercase tracking-widest border-b border-blue-100">Initiated</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-blue-400 uppercase tracking-widest border-b border-blue-100 text-right">Reference</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-blue-50">
                            {assignments.slice(0, 10).map(a => {
                                const pct = Math.round(((a.tasks?.filter((t: any) => t.status === 'completed').length || 0) / (a.tasks?.length || 1)) * 100);
                                return (
                                    <tr key={a._id} className="hover:bg-blue-50/30 transition-colors">
                                        {isHR && (
                                            <td className="px-6 py-5">
                                                <div className="text-sm font-bold text-blue-950">{a.user?.name}</div>
                                                <div className="text-[10px] text-blue-400 uppercase font-semibold">{a.user?.role}</div>
                                            </td>
                                        )}
                                        <td className="px-6 py-5">
                                            <div className="text-sm font-bold text-blue-950">{a.workflow?.name}</div>
                                            <div className="text-[10px] text-blue-400 uppercase font-semibold">{pct}% Complete</div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded border ${a.status === 'completed' ? 'border-green-200 bg-green-50 text-green-700' : 'border-blue-200 bg-blue-50 text-blue-700'}`}>
                                                {a.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-[10px] font-bold text-blue-400 uppercase">
                                            {new Date(a.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <button 
                                                onClick={() => navigate(`/assignments/${a._id}`)}
                                                className="text-[10px] font-bold text-blue-700 uppercase hover:text-blue-900 underline underline-offset-4"
                                            >
                                                Details
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                            {assignments.length === 0 && (
                                <tr>
                                    <td colSpan={isHR ? 5 : 4} className="py-20 text-center text-blue-300 text-[10px] font-bold uppercase tracking-widest">
                                        Records empty.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
