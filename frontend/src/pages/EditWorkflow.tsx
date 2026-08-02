import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, MoveUp, MoveDown, Trash2 } from 'lucide-react';

const EditWorkflow = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [audience, setAudience] = useState<'Employee' | 'Vendor'>('Employee');
    const [tasks, setTasks] = useState<{ _id?: string; name: string; type: string; required: boolean }[]>([]);
    const [loading, setLoading] = useState(true);
    const [version, setVersion] = useState(1);
    
    // Warning modal state
    const [warningOpen, setWarningOpen] = useState(false);
    const [activeAssignmentsCount, setActiveAssignmentsCount] = useState(0);

    useEffect(() => {
        fetchWorkflowDetails();
    }, [id]);

    const fetchWorkflowDetails = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/workflows/${id}`);
            setName(res.data.name);
            setDescription(res.data.description);
            setAudience(res.data.audience || 'Employee');
            setTasks(res.data.tasks || []);
            setVersion(res.data.version || 1);
        } catch {
            toast.error('Failed to load workflow details');
            navigate('/workflows');
        } finally {
            setLoading(false);
        }
    };

    const addTask = () => {
        setTasks([...tasks, { name: '', type: 'checkbox', required: true }]);
    };

    const removeTask = (index: number) => {
        const newTasks = [...tasks];
        newTasks.splice(index, 1);
        setTasks(newTasks);
    };

    const updateTask = (index: number, field: string, value: any) => {
        const newTasks = [...tasks];
        (newTasks[index] as any)[field] = value;
        setTasks(newTasks);
    };

    // AI Assisted: Versioning logic - Reorder tasks in list
    const moveTask = (index: number, direction: number) => {
        if (index + direction < 0 || index + direction >= tasks.length) return;
        const newTasks = [...tasks];
        const temp = newTasks[index];
        newTasks[index] = newTasks[index + direction];
        newTasks[index + direction] = temp;
        setTasks(newTasks);
    };

    const handlePreSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (tasks.length === 0) {
            toast.error('Workflow must have at least one task');
            return;
        }

        try {
            // Check if there are active assignments using this workflow version
            const res = await api.get(`/workflows/${id}/assignments-check`);
            const activeCount = res.data.activeCount;
            
            if (activeCount > 0) {
                setActiveAssignmentsCount(activeCount);
                setWarningOpen(true);
            } else {
                // No active assignments, save directly
                await saveWorkflowChanges();
            }
        } catch {
            toast.error('Failed validation checks');
        }
    };

    // AI Assisted: Versioning logic & Historical workflow preservation
    const saveWorkflowChanges = async () => {
        try {
            await api.put(`/workflows/${id}`, { name, description, audience, tasks });
            toast.success('New workflow version deployed successfully');
            navigate('/workflows');
        } catch (error: any) {
            const msg = error.response?.data?.message || 'Failed to save workflow adjustments';
            toast.error(msg);
        }
    };

    if (loading) {
        return (
            <div className="space-y-8 animate-pulse max-w-3xl mx-auto">
                <div className="h-6 w-32 pt-skeleton rounded" />
                <div className="h-10 w-64 pt-skeleton rounded" />
                <div className="h-48 pt-skeleton rounded-3xl" />
                <div className="h-64 pt-skeleton rounded-3xl" />
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto animate-fade-in pb-20">
            {/* Header & Back */}
            <div className="mb-8">
                <button 
                    onClick={() => navigate('/workflows')} 
                    className="flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors text-xs font-bold uppercase tracking-wider mb-4"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Workflows
                </button>
                <div className="flex items-center gap-4">
                    <h1 className="text-4xl pt-title-gradient pt-outfit">Edit Workflow</h1>
                    <span className="px-3 py-1 text-xs font-black bg-blue-50 text-blue-600 border border-blue-100 rounded-full">Active: v{version}</span>
                </div>
                <p className="text-slate-400 text-sm mt-2 font-medium">Update the workflow details and tasks.</p>
            </div>

            <form onSubmit={handlePreSubmit} className="space-y-8">
                {/* Information Card */}
                <div className="pt-glass-card p-8 space-y-6">
                    <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3">Workflow Details</h2>
                    
                    <div className="space-y-2">
                        <label className="block text-xs font-extrabold text-slate-400 uppercase tracking-widest">Workflow Name</label>
                        <input
                            type="text"
                            required
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <label className="block text-xs font-extrabold text-slate-400 uppercase tracking-widest">Workflow Audience</label>
                        <div className="grid grid-cols-2 gap-3">
                            {([
                                { value: 'Employee' as const, label: 'Employee', hint: 'Internal staff onboarding' },
                                { value: 'Vendor' as const, label: 'Vendor', hint: 'Supplier / procurement' },
                            ]).map(opt => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => setAudience(opt.value)}
                                    className={`text-left p-4 rounded-xl border-2 transition-all ${
                                        audience === opt.value
                                            ? opt.value === 'Vendor'
                                                ? 'border-amber-500 bg-amber-50'
                                                : 'border-emerald-500 bg-emerald-50'
                                            : 'border-slate-200 bg-white hover:border-slate-300'
                                    }`}
                                >
                                    <div className="text-sm font-black text-slate-900">{opt.label}</div>
                                    <div className="text-xs text-slate-500 mt-1">{opt.hint}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-xs font-extrabold text-slate-400 uppercase tracking-widest">Definition / Purpose</label>
                        <textarea
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                            rows={3}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>
                </div>

                {/* Tasks List Card */}
                <div className="pt-glass-card p-8">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-6">
                        <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">Tasks</h2>
                        <button
                            type="button"
                            onClick={addTask}
                            className="pt-btn-primary py-2 px-4 text-xs h-9 shadow-lg shadow-blue-600/10"
                        >
                            <Plus className="w-4 h-4" />
                            Add Step
                        </button>
                    </div>

                    <div className="space-y-4">
                        {tasks.map((task, index) => (
                            <div key={index} className="flex gap-4 items-center bg-slate-50/50 border border-slate-100 p-5 rounded-2xl group hover:border-slate-200 transition-all duration-300">
                                {/* Order Controls */}
                                <div className="flex flex-col gap-1.5">
                                    <button
                                        type="button"
                                        onClick={() => moveTask(index, -1)}
                                        disabled={index === 0}
                                        className="p-1.5 text-slate-300 hover:text-slate-900 disabled:opacity-30 disabled:pointer-events-none transition-colors rounded-lg hover:bg-white"
                                        title="Move Up"
                                    >
                                        <MoveUp className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => moveTask(index, 1)}
                                        disabled={index === tasks.length - 1}
                                        className="p-1.5 text-slate-300 hover:text-slate-900 disabled:opacity-30 disabled:pointer-events-none transition-colors rounded-lg hover:bg-white"
                                        title="Move Down"
                                    >
                                        <MoveDown className="w-3.5 h-3.5" />
                                    </button>
                                </div>

                                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input
                                        type="text"
                                        placeholder="Step Identifier / Task Name"
                                        required
                                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                                        value={task.name}
                                        onChange={(e) => updateTask(index, 'name', e.target.value)}
                                    />
                                    
                                    <div className="flex gap-4 items-center">
                                        <select
                                            className="w-1/2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                                            value={task.type}
                                            onChange={(e) => updateTask(index, 'type', e.target.value)}
                                        >
                                            <option value="checkbox">Verification Box</option>
                                            <option value="document">Document Attachment</option>
                                        </select>
                                        
                                        <label className="flex items-center space-x-2.5 text-xs font-bold text-slate-500 select-none cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={task.required}
                                                onChange={(e) => updateTask(index, 'required', e.target.checked)}
                                                className="rounded border-slate-200 text-blue-600 focus:ring-blue-500/20 w-4 h-4"
                                            />
                                            <span>Obligatory</span>
                                        </label>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => removeTask(index)}
                                    className="p-2 text-slate-300 hover:text-rose-500 transition-colors rounded-xl hover:bg-rose-50"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                        {tasks.length === 0 && (
                            <p className="text-xs text-slate-400 text-center py-8 font-semibold">No tasks added yet.</p>
                        )}
                    </div>
                </div>

                {/* Form Submissions */}
                <div className="flex justify-end gap-4">
                    <button
                        type="button"
                        onClick={() => navigate('/workflows')}
                        className="px-6 py-3 text-xs font-extrabold text-slate-500 uppercase bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                    >
                        Cancel Adjustments
                    </button>
                    <button
                        type="submit"
                        className="px-6 py-3 text-xs font-extrabold text-white uppercase bg-slate-900 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-slate-950/10"
                    >
                        Publish Sequence
                    </button>
                </div>
            </form>

            {/* Warning Assignment Modal */}
            <AnimatePresence>
                {warningOpen && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
                    >
                        <motion.div 
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-100"
                        >
                            <h3 className="text-xl font-black text-slate-900 pt-outfit">Active Assignment Warning</h3>
                            <p className="text-slate-500 text-sm mt-3 leading-relaxed">
                                There are currently <span className="text-blue-600 font-bold">{activeAssignmentsCount}</span> active candidate onboardings using the current version of this workflow.
                            </p>
                            <p className="text-slate-400 text-xs mt-3 leading-relaxed">
                                Proceeding will freeze their onboarding process on version <strong>v{version}</strong>, and register your adjustments as a new version <strong>v{version + 1}</strong>. Future assignments will receive the new version.
                            </p>

                            <div className="flex justify-end gap-3 mt-8">
                                <button
                                    type="button"
                                    onClick={() => setWarningOpen(false)}
                                    className="px-4 py-2.5 text-xs font-extrabold uppercase text-slate-400 hover:text-slate-900 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={async () => {
                                        setWarningOpen(false);
                                        await saveWorkflowChanges();
                                    }}
                                    className="px-5 py-2.5 text-xs font-extrabold uppercase text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20"
                                >
                                    Deploy New Version
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default EditWorkflow;
