import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Workflow, Plus, ChevronRight, Activity, 
    Layers, ShieldCheck, Zap,
    Trash2, Edit3, Search, History
} from 'lucide-react';
import AssignWorkflow from './AssignWorkflow';

const Workflows = () => {
    const [workflows, setWorkflows] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = searchParams.get('tab') === 'assign' ? 'assign' : 'templates';
    
    // State for managing version history modal
    const [historyModalOpen, setHistoryModalOpen] = useState(false);
    const [selectedHistory, setSelectedHistory] = useState<any[]>([]);
    const [selectedWorkflowName, setSelectedWorkflowName] = useState('');

    useEffect(() => {
        fetchWorkflows();
    }, []);

    const fetchWorkflows = async () => {
        setLoading(true);
        try {
            const res = await api.get('/workflows');
            setWorkflows(res.data);
        } catch {
            toast.error('Could not load workflows');
        } finally {
            setLoading(false);
        }
    };

    // AI Assisted: Soft archival logic
    const handleArchive = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        if (!window.confirm('Archive this workflow template? It will not disrupt existing assignments.')) return;
        try {
            await api.delete(`/workflows/${id}`);
            toast.success('Workflow archived');
            fetchWorkflows();
        } catch {
            toast.error('Could not archive workflow');
        }
    };

    // AI Assisted: Historical workflow preservation - view version history
    const handleOpenHistory = async (wf: any, e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        try {
            setSelectedWorkflowName(wf.name);
            const res = await api.get(`/workflows/${wf._id}/history`);
            setSelectedHistory(res.data);
            setHistoryModalOpen(true);
        } catch {
            toast.error('Failed to retrieve version history');
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

    if (activeTab === 'assign') {
        return (
            <div className="space-y-8 animate-fade-in">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h2 className="text-[10px] font-extrabold text-purple-500 uppercase tracking-[0.3em] mb-2">Assign Work</h2>
                        <h1 className="text-4xl pt-title-gradient pt-outfit">Workflows & Assignments</h1>
                        <p className="text-slate-400 text-sm mt-3">Choose an audience, person, and matching workflow in one guided flow.</p>
                    </div>
                </div>
                <div className="pt-glass-card p-2 inline-flex gap-2">
                    <button onClick={() => setSearchParams({})} className="px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider text-slate-500">Templates</button>
                    <button className="px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-slate-900 text-white">Assign workflow</button>
                </div>
                <AssignWorkflow embedded />
            </div>
        );
    }

    return (
        <div className="space-y-12 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h2 className="text-[10px] font-extrabold text-blue-500 uppercase tracking-[0.3em] mb-2">Manage Work</h2>
                    <h1 className="text-4xl pt-title-gradient pt-outfit">Workflows & Assignments</h1>
                    <p className="text-slate-400 text-sm mt-3 font-medium">Design role-specific templates, then assign them without leaving this workspace.</p>
                </div>
                <Link to="/workflows/create" className="pt-btn-primary h-12 shadow-xl shadow-blue-600/20">
                    <Plus className="w-5 h-5" />
                    Create Workflow
                </Link>
            </div>
            <div className="pt-glass-card p-2 inline-flex gap-2">
                <button className="px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-slate-900 text-white">Templates</button>
                <button onClick={() => setSearchParams({ tab: 'assign' })} className="px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider text-slate-500">Assign workflow</button>
            </div>

            {/* Filter */}
            <div className="pt-glass-card p-4 flex items-center gap-4">
                <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    <input 
                        className="w-full pl-11 pr-4 py-2 bg-transparent border-none text-xs font-bold placeholder:text-slate-300 focus:ring-0"
                        placeholder="Search workflows by name or description..."
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
                                        <button 
                                            onClick={(e) => handleOpenHistory(wf, e)}
                                            className="p-2 text-slate-300 hover:text-slate-900 transition-colors"
                                            title="Version History"
                                        >
                                            <History className="w-4 h-4" />
                                        </button>
                                        <Link 
                                            to={`/workflows/${wf._id}/edit`} 
                                            className="p-2 text-slate-300 hover:text-slate-900 transition-colors"
                                            onClick={(e) => e.stopPropagation()}
                                            title="Edit Workflow"
                                        >
                                            <Edit3 className="w-4 h-4" />
                                        </Link>
                                        <button 
                                            onClick={(e) => handleArchive(wf._id, e)}
                                            className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                                            title="Archive Workflow"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-8 relative z-10">
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-xl font-black text-slate-900 pt-outfit group-hover:text-blue-600 transition-colors">{wf.name}</h3>
                                        <span className="px-2 py-0.5 text-[9px] font-black bg-blue-50 text-blue-600 border border-blue-100 rounded-full">v{wf.version || 1}</span>
                                        <span className={`px-2 py-0.5 text-[9px] font-black rounded-full ${wf.audience === 'Vendor' ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'}`}>{wf.audience || 'Employee'}</span>
                                    </div>
                                    <p className="text-slate-400 text-sm mt-3 font-medium line-clamp-2 min-h-[40px]">{wf.description || 'No system documentation available for this workflow.'}</p>
                                </div>

                                <div className="mt-10 flex items-center justify-between relative z-10">
                                    <div className="flex items-center gap-6">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Tasks</span>
                                            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                                                <Zap className="w-3.5 h-3.5 text-amber-500" />
                                                {wf.tasks?.length || 0} Steps
                                            </span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Status</span>
                                            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                                                Active
                                            </span>
                                        </div>
                                    </div>
                                    <Link 
                                        to={`/workflows?tab=assign&workflowId=${wf._id}`}
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
                        <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">No Workflows Found</h3>
                        <p className="text-slate-300 text-xs font-medium mt-2">Try a different search or create a workflow.</p>
                    </div>
                )}
            </div>

            {/* Version History Modal */}
            <AnimatePresence>
                {historyModalOpen && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
                        onClick={() => setHistoryModalOpen(false)}
                    >
                        <motion.div 
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl border border-slate-100"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h2 className="text-[10px] font-extrabold text-blue-500 uppercase tracking-[0.3em] mb-1 font-black">Audit Trail</h2>
                                    <h3 className="text-2xl font-black text-slate-900 pt-outfit">Version History</h3>
                                    <p className="text-slate-400 text-xs font-semibold mt-1">Showing historical records for "{selectedWorkflowName}"</p>
                                </div>
                                <button 
                                    onClick={() => setHistoryModalOpen(false)}
                                    className="p-2 text-slate-400 hover:text-slate-900 rounded-full hover:bg-slate-50 transition-colors font-bold text-sm"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="space-y-4">
                                {selectedHistory.map((item) => (
                                    <div key={item._id} className="p-5 border border-slate-100 rounded-2xl bg-slate-50 flex justify-between items-center">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-bold text-slate-900">{item.name}</span>
                                                <span className={`px-2 py-0.5 text-[9px] font-black uppercase rounded-full ${item.isLatest ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-200/60 text-slate-500 border border-slate-200'}`}>
                                                    v{item.version || 1} {item.isLatest && '(Latest)'}
                                                </span>
                                                {item.isArchived && (
                                                    <span className="px-2 py-0.5 text-[9px] font-black bg-rose-50 text-rose-600 border border-rose-100 rounded-full uppercase">
                                                        Archived
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-slate-400 text-xs mt-1.5 line-clamp-1">{item.description || 'No description provided.'}</p>
                                            <div className="text-[10px] font-bold text-slate-400 mt-2 flex gap-4">
                                                <span>Modified: {new Date(item.updatedAt).toLocaleDateString()}</span>
                                                <span>Steps: {item.tasks?.length || 0}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Workflows;
