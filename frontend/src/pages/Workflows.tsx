import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Workflow, Plus, ChevronRight, Activity, 
    Layers, ShieldCheck, Zap,
    Trash2, Edit3, Search
} from 'lucide-react';

const Workflows = () => {
    const [workflows, setWorkflows] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchWorkflows();
    }, []);

    const fetchWorkflows = async () => {
        setLoading(true);
        try {
            const res = await api.get('/workflows');
            setWorkflows(res.data);
        } catch {
            toast.error('Registry link failed');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        if (!window.confirm('Executing permanent deletion of this logic stream. Proceed?')) return;
        try {
            await api.delete(`/workflows/${id}`);
            toast.success('Workflow Stream Terminated');
            fetchWorkflows();
        } catch {
            toast.error('Termination sequence interrupted');
        }
    };

    const filtered = workflows.filter(wf => 
        wf.name?.toLowerCase().includes(search.toLowerCase()) ||
        wf.description?.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) {
        return (
            <div className="space-y-8 animate-pulse">
                <div className="h-10 w-48 pt-skeleton" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[1,2,3,4].map(i => <div key={i} className="h-48 pt-skeleton rounded-3xl" />)}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-12 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h2 className="text-[10px] font-extrabold text-blue-500 uppercase tracking-[0.3em] mb-2">Process Architecture</h2>
                    <h1 className="text-4xl pt-title-gradient pt-outfit">Active Workflows</h1>
                    <p className="text-slate-400 text-sm mt-3 font-medium">Managing <span className="text-slate-900 font-bold">{workflows.length}</span> standardized logic sequences.</p>
                </div>
                <Link to="/workflows/create" className="pt-btn-primary h-12 shadow-xl shadow-blue-600/20">
                    <Plus className="w-5 h-5" />
                    Engineer New Stream
                </Link>
            </div>

            {/* Filter */}
            <div className="pt-glass-card p-4 flex items-center gap-4">
                <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    <input 
                        className="w-full pl-11 pr-4 py-2 bg-transparent border-none text-xs font-bold placeholder:text-slate-300 focus:ring-0"
                        placeholder="Search process repository by name or definition..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <AnimatePresence mode="popLayout">
                    {filtered.map((wf, i) => (
                        <motion.div
                            key={wf._id}
                            layout
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ delay: i * 0.05 }}
                            className="pt-glass-card-hover group relative overflow-hidden"
                        >
                            <div className="p-8">
                                <div className="flex items-start justify-between relative z-10">
                                    <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                                        <Layers className="w-6 h-6" />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button className="p-2 text-slate-300 hover:text-slate-900 transition-colors">
                                            <Edit3 className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={(e) => handleDelete(wf._id, e)}
                                            className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-8 relative z-10">
                                    <h3 className="text-xl font-black text-slate-900 pt-outfit group-hover:text-blue-600 transition-colors">{wf.name}</h3>
                                    <p className="text-slate-400 text-sm mt-3 font-medium line-clamp-2 min-h-[40px]">{wf.description || 'No system documentation available for this workflow.'}</p>
                                </div>

                                <div className="mt-10 flex items-center justify-between relative z-10">
                                    <div className="flex items-center gap-6">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Complexity</span>
                                            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                                                <Zap className="w-3.5 h-3.5 text-amber-500" />
                                                {wf.tasks?.length || 0} Steps
                                            </span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Validation</span>
                                            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                                                Active
                                            </span>
                                        </div>
                                    </div>
                                    <Link 
                                        to={`/assign?workflowId=${wf._id}`}
                                        className="p-3 bg-slate-900 text-white rounded-xl hover:scale-105 transition-all shadow-lg"
                                    >
                                        <ChevronRight className="w-5 h-5" />
                                    </Link>
                                </div>
                            </div>

                            {/* Decorative Background Icon */}
                            <Workflow className="absolute bottom-[-20px] right-[-20px] w-48 h-48 text-slate-50 opacity-50 pointer-events-none group-hover:text-blue-50 group-hover:opacity-100 transition-colors duration-500" />
                        </motion.div>
                    ))}
                </AnimatePresence>

                {filtered.length === 0 && (
                    <div className="col-span-full py-32 text-center pt-glass-card">
                        <Activity className="w-12 h-12 text-slate-200 mx-auto mb-6" />
                        <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Zero architectural streams identified</h3>
                        <p className="text-slate-300 text-xs font-medium mt-2">Modify search parameters or execute a new deployment.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Workflows;
