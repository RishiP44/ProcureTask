import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ClipboardList, CheckCircle2, Clock, 
    ArrowRight, Calendar, 
    Zap, Activity, Target, Search
} from 'lucide-react';

const StatusBadge = ({ status }: { status: string }) => {
    const map: Record<string, string> = {
        completed: 'pt-badge-success',
        in_progress: 'pt-badge-info',
        pending: 'pt-badge-warning',
    };
    return <span className={map[status] || 'pt-badge-gray'}>{status.replace('_', ' ')}</span>;
};

const MyTasks = () => {
    const navigate = useNavigate();
    const [assignments, setAssignments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all');
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const res = await api.get('/assignments/my-assignments');
                setAssignments(res.data);
            } catch { toast.error('Insecure task link'); }
            finally { setLoading(false); }
        };
        fetchTasks();
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

    const totalTasks = assignments.reduce((acc, a) => acc + (a.tasks?.length || 0), 0);
    const completedTasks = assignments.reduce((acc, a) => acc + (a.tasks?.filter((t: any) => t.status === 'completed').length || 0), 0);
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    if (loading) {
        return (
            <div className="space-y-8 animate-pulse">
                <div className="h-10 w-48 pt-skeleton" />
                <div className="grid grid-cols-3 gap-6">
                    {[1,2,3].map(i => <div key={i} className="h-24 pt-skeleton rounded-2xl" />)}
                </div>
                <div className="space-y-4">
                    {[1,2,3].map(i => <div key={i} className="h-24 pt-skeleton rounded-2xl" />)}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-12 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div>
                    <h2 className="text-[10px] font-extrabold text-blue-500 uppercase tracking-[0.3em] mb-2">Personal Hub</h2>
                    <h1 className="text-4xl pt-title-gradient pt-outfit">My Active Tasks</h1>
                    <p className="text-slate-400 text-sm mt-3 font-medium">Tracking <span className="text-slate-900 font-bold">{totalTasks}</span> operational obligations across all flows.</p>
                </div>
                <div className="pt-glass-card p-4 flex items-center gap-6 min-w-[300px]">
                    <div className="flex-1">
                        <div className="flex justify-between mb-2">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Global Progress</span>
                            <span className="text-[10px] font-black text-blue-600">{progress}%</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                className="h-full bg-blue-500 rounded-full" 
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Filter Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {[
                    { key: 'pending', label: 'Pending', icon: <Clock className="w-5 h-5 text-amber-500" />, color: 'border-amber-400' },
                    { key: 'in_progress', label: 'In Progress', icon: <Activity className="w-5 h-5 text-blue-500" />, color: 'border-blue-400' },
                    { key: 'completed', label: 'Completed', icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />, color: 'border-emerald-400' }
                ].map((s) => (
                    <button 
                        key={s.key} 
                        onClick={() => setFilter(s.key as any)}
                        className={`pt-glass-card p-6 flex items-center justify-between text-left transition-all hover:scale-[1.02] active:scale-95 ${filter === s.key ? `border-2 ${s.color} shadow-lg` : 'border-transparent opacity-70 hover:opacity-100'}`}
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-slate-50 rounded-xl">{s.icon}</div>
                            <div>
                                <div className="text-sm font-black text-slate-900 pt-outfit uppercase tracking-tight">{s.label}</div>
                                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{stats[s.key as keyof typeof stats]} Operations</div>
                            </div>
                        </div>
                    </button>
                ))}
            </div>

            {/* Search & Global Toggle */}
            <div className="pt-glass-card p-4 flex items-center gap-4">
                <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    <input 
                        className="w-full pl-11 pr-4 py-2 bg-transparent border-none text-xs font-bold placeholder:text-slate-300 focus:ring-0"
                        placeholder="Filter assignments by workflow title..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <button 
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === 'all' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-900'}`}
                >
                    View All
                </button>
            </div>

            {/* Task Registry */}
            <div className="space-y-6">
                <AnimatePresence mode="popLayout">
                    {filtered.map((assignment, idx) => (
                        <motion.div
                            key={assignment._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ delay: idx * 0.05 }}
                            onClick={() => navigate(`/assignments/${assignment._id}`)}
                            className="pt-glass-card-hover group p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 overflow-hidden relative"
                        >
                            <div className="flex items-center gap-6 relative z-10">
                                <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                                    <ClipboardList className="w-6 h-6" />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-lg font-black text-slate-900 pt-outfit uppercase tracking-tight group-hover:text-blue-600 transition-colors truncate">
                                        {assignment.workflow?.name}
                                    </h3>
                                    <div className="flex items-center gap-4 mt-2">
                                        <div className="flex items-center gap-1.5">
                                            <Zap className="w-3.5 h-3.5 text-amber-500" />
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                {assignment.tasks?.length || 0} Critical Steps
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="w-3.5 h-3.5 text-slate-300" />
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                Assigned {new Date(assignment.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-8 relative z-10">
                                <div className="text-right hidden md:block">
                                    <div className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Current Status</div>
                                    <StatusBadge status={assignment.status} />
                                </div>
                                <div className="p-3 bg-slate-900 text-white rounded-xl shadow-lg transform group-hover:translate-x-1 transition-transform">
                                    <ArrowRight className="w-5 h-5" />
                                </div>
                            </div>

                            <Target className="absolute right-[-20px] top-[-20px] w-32 h-32 text-slate-50 opacity-50 pointer-events-none group-hover:text-blue-50 transition-colors" />
                        </motion.div>
                    ))}
                </AnimatePresence>

                {filtered.length === 0 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-24 text-center pt-glass-card">
                        <Activity className="w-12 h-12 text-slate-200 mx-auto mb-6" />
                        <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Zero Operational Context Identified</h3>
                        <p className="text-slate-300 text-xs font-medium mt-2">No tasks matching your current filter parameters.</p>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default MyTasks;
