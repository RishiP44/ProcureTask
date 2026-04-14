import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
    ArrowLeft, CheckCircle2, Clock, Upload, FileText,
    User, Workflow, Loader2, Check, ExternalLink, AlertTriangle
} from 'lucide-react';

const AssignmentDetail = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [assignment, setAssignment] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState<string | null>(null);
    const isHR = user?.role === 'Admin' || user?.role === 'HR';

    useEffect(() => {
        const fetch = async () => {
            try {
                // Try the direct endpoint first (HR/Admin), fallback to my-assignments
                let found = null;
                if (isHR) {
                    const res = await api.get(`/assignments/${id}`);
                    found = res.data;
                } else {
                    const res = await api.get('/assignments/my-assignments');
                    found = res.data.find((a: any) => a._id === id);
                }
                setAssignment(found);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [id]);

    const handleTaskComplete = async (taskId: string) => {
        try {
            const res = await api.put(`/assignments/${id}/tasks/${taskId}`, { status: 'completed' });
            setAssignment(res.data);
            toast.success('Task completed! ✓');
        } catch { toast.error('Failed to update task'); }
    };

    const handleFileUpload = async (taskId: string, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        setUploading(taskId);

        try {
            const uploadRes = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const documentUrl = uploadRes.data.filePath;
            const res = await api.put(`/assignments/${id}/tasks/${taskId}`, {
                status: 'completed', documentUrl
            });
            setAssignment(res.data);
            toast.success('Document uploaded!');
        } catch { toast.error('Upload failed'); }
        finally { setUploading(null); }
    };

    if (loading) return (
        <div className="animate-pulse max-w-3xl mx-auto space-y-4">
            <div className="pt-skeleton h-6 w-32" />
            <div className="pt-skeleton h-40 rounded-2xl" />
            <div className="pt-skeleton h-72 rounded-2xl" />
        </div>
    );

    if (!assignment) return (
        <div className="text-center py-16">
            <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">Assignment not found</p>
            <button onClick={() => navigate(isHR ? '/dashboard' : '/my-tasks')} className="pt-btn-secondary mt-4">
                <ArrowLeft className="w-4 h-4" /> Go Back
            </button>
        </div>
    );

    const completedCount = assignment.tasks?.filter((t: any) => t.status === 'completed').length || 0;
    const totalCount = assignment.tasks?.length || 0;
    const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    const statusColors: Record<string, string> = {
        completed: 'text-emerald-600 bg-emerald-50',
        in_progress: 'text-blue-600 bg-blue-50',
        pending: 'text-amber-600 bg-amber-50',
    };

    return (
        <div className="animate-fade-in-up max-w-3xl mx-auto">
            {/* Back */}
            <button
                onClick={() => navigate(isHR ? '/dashboard' : '/my-tasks')}
                className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-6 font-medium transition-colors">
                <ArrowLeft className="w-4 h-4" />
                {isHR ? 'Back to Dashboard' : 'Back to My Tasks'}
            </button>

            {/* Header Card */}
            <div className="pt-card p-6 mb-5">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Workflow className="w-5 h-5 text-blue-600" />
                            <h1 className="text-xl font-bold text-slate-900">{assignment.workflow?.name}</h1>
                        </div>
                        {assignment.workflow?.description && (
                            <p className="text-slate-500 text-sm">{assignment.workflow.description}</p>
                        )}
                        {isHR && assignment.user && (
                            <div className="flex items-center gap-2 mt-2">
                                <User className="w-4 h-4 text-slate-400" />
                                <span className="text-sm text-slate-500">Assigned to <strong className="text-slate-700">{assignment.user.name}</strong></span>
                            </div>
                        )}
                        {assignment.assignedBy && (
                            <p className="text-xs text-slate-400 mt-1">
                                Assigned by {assignment.assignedBy.name} · {new Date(assignment.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                            </p>
                        )}
                    </div>
                    <span className={`px-3 py-1.5 rounded-xl text-sm font-semibold self-start flex-shrink-0 ${statusColors[assignment.status] || 'text-slate-600 bg-slate-100'}`}>
                        {assignment.status.replace('_', ' ')}
                    </span>
                </div>

                {/* Progress */}
                <div className="mt-5">
                    <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-500 font-medium">Overall Progress</span>
                        <span className="font-bold text-slate-900">{completedCount}/{totalCount} tasks · {pct}%</span>
                    </div>
                    <div className="pt-progress-bar h-3">
                        <div
                            className={`pt-progress-fill ${pct === 100 ? 'bg-emerald-500' : 'bg-blue-500'}`}
                            style={{ width: `${pct}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Tasks */}
            <div className="pt-card overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100">
                    <h2 className="font-semibold text-slate-900">Tasks</h2>
                </div>
                <div className="divide-y divide-slate-50">
                    {assignment.tasks?.map((task: any, idx: number) => (
                        <div key={task._id}
                            className={`p-5 transition-colors ${task.status === 'completed' ? 'bg-emerald-50/40' : 'hover:bg-slate-50'}`}>
                            <div className="flex items-start gap-4">
                                {/* Status indicator */}
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${task.status === 'completed'
                                    ? 'bg-emerald-100'
                                    : task.type === 'document'
                                    ? 'bg-blue-100'
                                    : 'bg-slate-100'
                                    }`}>
                                    {task.status === 'completed'
                                        ? <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                        : task.type === 'document'
                                        ? <FileText className="w-5 h-5 text-blue-500" />
                                        : <Clock className="w-5 h-5 text-slate-400" />
                                    }
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2 mb-0.5">
                                        <h3 className={`font-semibold text-sm ${task.status === 'completed' ? 'text-slate-500 line-through' : 'text-slate-900'}`}>
                                            {idx + 1}. {task.name}
                                        </h3>
                                        {task.required && (
                                            <span className="pt-badge-red text-[10px] py-0.5 px-1.5">Required</span>
                                        )}
                                        <span className="pt-badge-gray text-[10px] py-0.5 px-1.5">{task.type}</span>
                                    </div>
                                    {task.description && (
                                        <p className="text-sm text-slate-400 mb-2">{task.description}</p>
                                    )}
                                    {task.documentUrl && (
                                        <a href={`http://localhost:5000${task.documentUrl}`} target="_blank" rel="noreferrer"
                                            className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium">
                                            <ExternalLink className="w-3 h-3" /> View uploaded document
                                        </a>
                                    )}
                                    {task.completedAt && (
                                        <p className="text-xs text-slate-400 mt-1">
                                            Completed {new Date(task.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    )}
                                </div>

                                {/* Action */}
                                {task.status !== 'completed' && !isHR && (
                                    <div className="flex-shrink-0">
                                        {task.type === 'checkbox' ? (
                                            <button onClick={() => handleTaskComplete(task._id)}
                                                className="pt-btn-primary pt-btn-sm">
                                                <Check className="w-3.5 h-3.5" /> Mark Done
                                            </button>
                                        ) : (
                                            <>
                                                <input
                                                    type="file"
                                                    id={`file-${task._id}`}
                                                    className="hidden"
                                                    onChange={e => handleFileUpload(task._id, e)}
                                                    accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                                                />
                                                <label htmlFor={`file-${task._id}`}
                                                    className={`pt-btn pt-btn-secondary pt-btn-sm cursor-pointer ${uploading === task._id ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                                    {uploading === task._id
                                                        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                        : <Upload className="w-3.5 h-3.5" />}
                                                    {uploading === task._id ? 'Uploading…' : 'Upload'}
                                                </label>
                                            </>
                                        )}
                                    </div>
                                )}
                                {task.status === 'completed' && (
                                    <span className="flex items-center gap-1 text-xs text-emerald-600 font-semibold flex-shrink-0">
                                        <CheckCircle2 className="w-4 h-4" /> Done
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {assignment.status === 'completed' && (
                <div className="mt-5 p-5 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center gap-3 animate-fade-in">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 flex-shrink-0" />
                    <div>
                        <p className="font-semibold text-emerald-800">All tasks completed!</p>
                        <p className="text-emerald-600 text-sm">Excellent work — this assignment has been fully completed.</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AssignmentDetail;
