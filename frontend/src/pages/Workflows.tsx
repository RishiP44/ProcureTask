import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { 
    Workflow, Plus, MoreHorizontal, Trash2, Edit3, 
    Search, LayoutGrid, List, FileText, CheckCircle2,
    Clock, AlertTriangle, Loader2
} from 'lucide-react';

const Workflows = () => {
    const navigate = useNavigate();
    const [workflows, setWorkflows] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [view, setView] = useState<'grid' | 'list'>('grid');
    const [deleting, setDeleting] = useState<string | null>(null);

    useEffect(() => {
        fetchWorkflows();
    }, []);

    const fetchWorkflows = async () => {
        setLoading(true);
        try {
            const res = await api.get('/workflows');
            setWorkflows(res.data);
        } catch { 
            toast.error('Failed to load workflow templates'); 
        } finally { 
            setLoading(false); 
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this workflow template?')) return;
        setDeleting(id);
        try {
            await api.delete(`/workflows/${id}`);
            toast.success('Workflow template deleted');
            setWorkflows(prev => prev.filter(w => w._id !== id));
        } catch {
            toast.error('Failed to delete workflow template');
        } finally {
            setDeleting(null);
        }
    };

    const filtered = workflows.filter(w => 
        w.name?.toLowerCase().includes(search.toLowerCase()) ||
        w.description?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="animate-fade-in-up">
            {/* Page Header */}
            <div className="mb-10 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Workflows</h1>
                    <p className="text-slate-500 text-sm mt-1">Manage and assign task templates</p>
                </div>
                <Link to="/workflows/create" className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-md uppercase tracking-wider">
                    Create Template
                </Link>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <input 
                    className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm" 
                    placeholder="Search templates…" 
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
                <div className="flex bg-slate-50 rounded-md border border-slate-200 p-1">
                    <button onClick={() => setView('grid')} className={`px-4 py-1 text-xs font-bold uppercase ${view === 'grid' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>Grid</button>
                    <button onClick={() => setView('list')} className={`px-4 py-1 text-xs font-bold uppercase ${view === 'list' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>List</button>
                </div>
            </div>

            {/* Content states */}
            {!loading && filtered.length === 0 ? (
                <div className="py-20 text-center border-2 border-dashed border-gray-100 rounded-lg">
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">No templates found.</p>
                </div>
            ) : !loading && view === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.map(w => (
                        <div key={w._id} className="p-6 bg-white border border-gray-100 rounded-lg hover:border-gray-200">
                            <h3 className="text-lg font-bold text-slate-900 mb-2">{w.name}</h3>
                            <p className="text-sm text-slate-500 line-clamp-2 mb-6">{w.description}</p>
                            
                            <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{w.tasks?.length || 0} Steps</span>
                                <div className="flex items-center gap-4">
                                    <button onClick={() => navigate(`/assign?workflowId=${w._id}`)} className="text-[10px] font-bold text-blue-700 uppercase hover:underline">Assign</button>
                                    <button onClick={() => handleDelete(w._id)} className="text-[10px] font-bold text-red-500 uppercase hover:underline">Delete</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : !loading && view === 'list' ? (
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-100 pb-3">
                                <th className="pb-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Template Name</th>
                                <th className="pb-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tasks</th>
                                <th className="pb-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filtered.map(w => (
                                <tr key={w._id}>
                                    <td className="py-4 font-bold text-slate-900 text-sm">{w.name}</td>
                                    <td className="py-4 text-xs font-bold text-slate-400 uppercase">{w.tasks?.length || 0} Steps</td>
                                    <td className="py-4 text-right">
                                        <div className="flex items-center justify-end gap-4">
                                            <button onClick={() => navigate(`/assign?workflowId=${w._id}`)} className="text-[10px] font-bold text-blue-700 uppercase hover:underline">Assign</button>
                                            <button onClick={() => handleDelete(w._id)} className="text-[10px] font-bold text-red-500 uppercase hover:underline">Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : null}
        </div>
    );
};

export default Workflows;
