import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
    ClipboardList, Clock, CheckCircle2, AlertCircle,
    Eye, Filter, Search, ArrowRight
} from 'lucide-react';

const MyTasks = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [assignments, setAssignments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all');
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await api.get('/assignments/my-assignments');
                setAssignments(res.data);
            } catch { toast.error('Failed to load tasks'); }
            finally { setLoading(false); }
        };
        fetch();
    }, []);

    const filtered = assignments.filter(a => {
        const matchesFilter = filter === 'all' || a.status === filter;
        const matchesSearch = a.workflow?.name?.toLowerCase().includes(search.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const stats = {
        pending: assignments.filter(a => a.status === 'pending').length,
        in_progress: assignments.filter(a => a.status === 'in_progress').length,
        completed: assignments.filter(a => a.status === 'completed').length,
    };

    const statusIcon: Record<string, React.ReactNode> = {
        pending: <Clock className="w-4 h-4 text-amber-500" />,
        in_progress: <AlertCircle className="w-4 h-4 text-blue-500" />,
        completed: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
    };
    const statusColor: Record<string, string> = {
        pending: 'text-amber-600 bg-amber-50',
        in_progress: 'text-blue-600 bg-blue-50',
        completed: 'text-emerald-600 bg-emerald-50',
    };

    if (loading) return (
        <div className="animate-pulse space-y-4">
            <div className="pt-skeleton h-8 w-36 mb-2" />
            <div className="grid grid-cols-3 gap-4">{[1,2,3].map(i => <div key={i} className="pt-skeleton h-24 rounded-2xl" />)}</div>
            <div className="pt-skeleton h-64 rounded-2xl" />
        </div>
    );

    return (
        <div className="animate-fade-in-up">
            <div className="pt-page-header">
                <div>
                    <h1 className="pt-page-title">My Tasks</h1>
                    <p className="pt-page-subtitle">Track and complete your assigned workflows</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6 stagger">
                {[
                    { key: 'pending', label: 'Pending', icon: <Clock className="w-5 h-5 text-amber-500" />, color: 'text-amber-600', bg: 'bg-amber-50' },
                    { key: 'in_progress', label: 'In Progress', icon: <AlertCircle className="w-5 h-5 text-blue-500" />, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { key: 'completed', label: 'Completed', icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                ].map(s => (
                    <button key={s.key} onClick={() => setFilter(s.key as any)}
                        className={`pt-card p-4 flex items-center gap-3 text-left transition-all animate-fade-in-up ${filter === s.key ? 'ring-2 ring-blue-500' : 'hover:shadow-md'}`}>
                        <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                            {s.icon}
                        </div>
                        <div>
                            <div className={`text-2xl font-bold ${s.color}`}>{stats[s.key as keyof typeof stats]}</div>
                            <div className="text-xs text-slate-500">{s.label}</div>
                        </div>
                    </button>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-5">
                <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input className="pt-input pl-10" placeholder="Search by workflow name…"
                        value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <div className="flex bg-white rounded-xl border border-slate-200 p-1">
                    {(['all', 'pending', 'in_progress', 'completed'] as const).map(f => (
                        <button key={f} onClick={() => setFilter(f)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize ${filter === f ? 'bg-blue-700 text-white' : 'text-slate-500 hover:text-slate-700'}`}>
                            {f.replace('_', ' ')}
                        </button>
                    ))}
                </div>
            </div>

            {/* Task Cards */}
            {filtered.length === 0 ? (
                <div className="text-center py-16">
                    <ClipboardList className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-400 font-medium">No tasks found</p>
                    <p className="text-slate-300 text-sm mt-1">
                        {filter !== 'all' ? 'Try changing the filter' : 'Your assigned tasks will appear here'}
                    </p>
                </div>
            ) : (
                <div className="space-y-3 stagger">
                    {filtered.map(a => {
                        const done = a.tasks?.filter((t: any) => t.status === 'completed').length || 0;
                        const total = a.tasks?.length || 1;
                        const pct = Math.round((done / total) * 100);
                        return (
                            <div key={a._id}
                                onClick={() => navigate(`/assignments/${a._id}`)}
                                className="pt-card-hover p-5 flex items-center gap-5 animate-fade-in-up">
                                <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${statusColor[a.status]?.split(' ')[1] || 'bg-slate-100'}`}>
                                    {statusIcon[a.status]}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-semibold text-slate-900 text-sm truncate">{a.workflow?.name}</h3>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusColor[a.status]}`}>
                                            {a.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                    {a.workflow?.description && (
                                        <p className="text-sm text-slate-400 truncate mb-2">{a.workflow.description}</p>
                                    )}
                                    <div className="flex items-center gap-3">
                                        <div className="pt-progress-bar w-36">
                                            <div className={`pt-progress-fill ${pct === 100 ? 'bg-emerald-500' : 'bg-blue-500'}`}
                                                style={{ width: `${pct}%` }} />
                                        </div>
                                        <span className="text-xs text-slate-400">{done}/{total} tasks</span>
                                    </div>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <p className="text-xs text-slate-400 mb-2">
                                        {new Date(a.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    </p>
                                    <button className="pt-btn-primary pt-btn-sm">
                                        {a.status === 'completed' ? <Eye className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                                        {a.status === 'completed' ? 'View' : 'Continue'}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default MyTasks;
