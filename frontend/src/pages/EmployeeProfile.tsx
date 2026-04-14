import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
    ArrowLeft, Mail, Phone, Building2, Calendar, Briefcase,
    ClipboardList, Edit2, Check, X, Loader2, UserCheck,
    Shield, Clock, CheckCircle2, AlertCircle, Plus
} from 'lucide-react';

const getInitials = (name: string) =>
    name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

const StatusBadge = ({ status }: { status: string }) => {
    const map: Record<string, string> = {
        completed: 'pt-badge-green', in_progress: 'pt-badge-blue', pending: 'pt-badge-yellow',
        Active: 'pt-badge-green', Invited: 'pt-badge-blue', Inactive: 'pt-badge-gray',
    };
    return <span className={map[status] || 'pt-badge-gray'}>{status.replace('_', ' ')}</span>;
};

const EmployeeProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [employee, setEmployee] = useState<any>(null);
    const [assignments, setAssignments] = useState<any[]>([]);
    const [workflows, setWorkflows] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [editData, setEditData] = useState<any>({});
    const [saving, setSaving] = useState(false);
    const [assigning, setAssigning] = useState(false);
    const [selectedWorkflow, setSelectedWorkflow] = useState('');
    const [showAssignPanel, setShowAssignPanel] = useState(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'activity'>('overview');

    useEffect(() => {
        const load = async () => {
            try {
                const [empRes, assignRes, wfRes] = await Promise.all([
                    api.get(`/users/${id}`),
                    api.get(`/assignments?userId=${id}`),
                    api.get('/workflows'),
                ]);
                setEmployee(empRes.data);
                setEditData(empRes.data);
                setAssignments(assignRes.data);
                setWorkflows(wfRes.data);
            } catch { toast.error('Failed to load employee'); }
            finally { setLoading(false); }
        };
        load();
    }, [id]);

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await api.put(`/users/${id}`, {
                name: editData.name,
                department: editData.department,
                position: editData.position,
                phone: editData.phone,
                role: editData.role,
                status: editData.status,
            });
            setEmployee(res.data);
            setEditMode(false);
            toast.success('Profile updated!');
        } catch { toast.error('Update failed'); }
        finally { setSaving(false); }
    };

    const handleAssign = async () => {
        if (!selectedWorkflow) return;
        setAssigning(true);
        try {
            await api.post('/assignments', { userId: id, workflowId: selectedWorkflow });
            toast.success('Workflow assigned!');
            setShowAssignPanel(false);
            setSelectedWorkflow('');
            // Refresh assignments
            const res = await api.get(`/assignments?userId=${id}`);
            setAssignments(res.data);
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Assignment failed');
        } finally { setAssigning(false); }
    };

    if (loading) {
        return (
            <div className="animate-pulse space-y-4">
                <div className="pt-skeleton h-8 w-32" />
                <div className="pt-skeleton h-64 rounded-2xl" />
                <div className="pt-skeleton h-48 rounded-2xl" />
            </div>
        );
    }

    if (!employee) return (
        <div className="text-center py-16">
            <p className="text-slate-400">Employee not found</p>
            <button onClick={() => navigate('/employees')} className="pt-btn-primary mt-4">Back to Employees</button>
        </div>
    );

    const completedTasks = assignments.filter(a => a.status === 'completed').length;
    const totalTasks = assignments.length;

    return (
        <div className="animate-fade-in-up max-w-5xl mx-auto">
            {/* Back */}
            <button onClick={() => navigate('/employees')}
                className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-6 font-medium transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to Employees
            </button>

            {/* Profile Header Card */}
            <div className="pt-card overflow-hidden mb-6">
                {/* Banner */}
                <div className="h-28 bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-500" />
                <div className="px-6 pb-6">
                    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 -mt-10">
                        {/* Avatar */}
                        <div className="flex items-end gap-4">
                            <div className="w-20 h-20 rounded-2xl ring-4 ring-white bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                                {employee.avatar
                                    ? <img src={employee.avatar} alt="" className="w-full h-full object-cover rounded-2xl" />
                                    : getInitials(employee.name)
                                }
                            </div>
                            <div className="mb-1">
                                {editMode ? (
                                    <input className="pt-input text-xl font-bold"
                                        value={editData.name} onChange={e => setEditData({ ...editData, name: e.target.value })} />
                                ) : (
                                    <h1 className="text-2xl font-bold text-slate-900">{employee.name}</h1>
                                )}
                                <p className="text-slate-500 text-sm mt-0.5">{employee.position || employee.role} {employee.department ? `· ${employee.department}` : ''}</p>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 sm:mb-1">
                            <StatusBadge status={employee.status} />
                            {!editMode ? (
                                <>
                                    <button onClick={() => setShowAssignPanel(!showAssignPanel)} className="pt-btn-primary">
                                        <Plus className="w-4 h-4" /> Assign Task
                                    </button>
                                    <button onClick={() => setEditMode(true)} className="pt-btn-secondary">
                                        <Edit2 className="w-4 h-4" /> Edit
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button onClick={() => setEditMode(false)} className="pt-btn-secondary">
                                        <X className="w-4 h-4" /> Cancel
                                    </button>
                                    <button onClick={handleSave} disabled={saving} className="pt-btn-primary">
                                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                        Save
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Info Row */}
                    <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500">
                        <span className="flex items-center gap-1.5"><Mail className="w-4 h-4 text-slate-400" />{employee.email}</span>
                        {employee.phone && <span className="flex items-center gap-1.5"><Phone className="w-4 h-4 text-slate-400" />{employee.phone}</span>}
                        {employee.department && <span className="flex items-center gap-1.5"><Building2 className="w-4 h-4 text-slate-400" />{employee.department}</span>}
                        {employee.startDate && (
                            <span className="flex items-center gap-1.5">
                                <Calendar className="w-4 h-4 text-slate-400" />
                                Started {new Date(employee.startDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Assign Workflow Panel */}
            {showAssignPanel && (
                <div className="pt-card p-5 mb-6 border-blue-200 bg-blue-50/50 animate-fade-in">
                    <h3 className="font-semibold text-slate-900 mb-3">Assign Workflow to {employee.name}</h3>
                    <div className="flex gap-3">
                        <select className="pt-select flex-1" value={selectedWorkflow}
                            onChange={e => setSelectedWorkflow(e.target.value)}>
                            <option value="">Select a workflow…</option>
                            {workflows.map((w: any) => (
                                <option key={w._id} value={w._id}>{w.name}</option>
                            ))}
                        </select>
                        <button onClick={handleAssign} disabled={!selectedWorkflow || assigning}
                            className="pt-btn-primary flex-shrink-0">
                            {assigning ? <Loader2 className="w-4 h-4 animate-spin" /> : <ClipboardList className="w-4 h-4" />}
                            {assigning ? 'Assigning…' : 'Assign'}
                        </button>
                        <button onClick={() => setShowAssignPanel(false)} className="pt-btn-secondary flex-shrink-0">Cancel</button>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column */}
                <div className="space-y-5">
                    {/* Stats */}
                    <div className="pt-card p-5">
                        <h3 className="font-semibold text-slate-900 mb-4 text-sm">Task Summary</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-slate-500 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Pending</span>
                                <span className="font-bold text-amber-600">{assignments.filter(a => a.status === 'pending').length}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-slate-500 flex items-center gap-1.5"><AlertCircle className="w-3.5 h-3.5" /> In Progress</span>
                                <span className="font-bold text-blue-600">{assignments.filter(a => a.status === 'in_progress').length}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-slate-500 flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> Completed</span>
                                <span className="font-bold text-emerald-600">{completedTasks}</span>
                            </div>
                            {totalTasks > 0 && (
                                <div className="pt-4 border-t border-slate-100">
                                    <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                                        <span>Overall progress</span>
                                        <span>{Math.round((completedTasks / totalTasks) * 100)}%</span>
                                    </div>
                                    <div className="pt-progress-bar">
                                        <div className="pt-progress-fill bg-emerald-500"
                                            style={{ width: `${Math.round((completedTasks / totalTasks) * 100)}%` }} />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Details (edit mode) */}
                    <div className="pt-card p-5">
                        <h3 className="font-semibold text-slate-900 mb-4 text-sm">Employment Details</h3>
                        <div className="space-y-3">
                            {editMode ? (
                                <>
                                    <div>
                                        <label className="pt-label text-xs">Department</label>
                                        <input className="pt-input" placeholder="e.g. Engineering"
                                            value={editData.department || ''} onChange={e => setEditData({ ...editData, department: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="pt-label text-xs">Position</label>
                                        <input className="pt-input" placeholder="e.g. Software Engineer"
                                            value={editData.position || ''} onChange={e => setEditData({ ...editData, position: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="pt-label text-xs">Phone</label>
                                        <input className="pt-input" placeholder="+1 555-0100"
                                            value={editData.phone || ''} onChange={e => setEditData({ ...editData, phone: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="pt-label text-xs">Role</label>
                                        <select className="pt-select" value={editData.role}
                                            onChange={e => setEditData({ ...editData, role: e.target.value })}>
                                            <option value="Employee">Employee</option>
                                            <option value="HR">HR Manager</option>
                                            <option value="Admin">Admin</option>
                                            <option value="Vendor">Vendor</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="pt-label text-xs">Status</label>
                                        <select className="pt-select" value={editData.status}
                                            onChange={e => setEditData({ ...editData, status: e.target.value })}>
                                            <option value="Active">Active</option>
                                            <option value="Inactive">Inactive</option>
                                            <option value="Pending">Pending</option>
                                        </select>
                                    </div>
                                </>
                            ) : (
                                <>
                                    {[
                                        { icon: <Shield className="w-4 h-4" />, label: 'Role', value: employee.role },
                                        { icon: <Building2 className="w-4 h-4" />, label: 'Department', value: employee.department || '—' },
                                        { icon: <Briefcase className="w-4 h-4" />, label: 'Position', value: employee.position || '—' },
                                        { icon: <Phone className="w-4 h-4" />, label: 'Phone', value: employee.phone || '—' },
                                    ].map(item => (
                                        <div key={item.label} className="flex items-center gap-2.5">
                                            <span className="text-slate-400">{item.icon}</span>
                                            <div>
                                                <div className="text-xs text-slate-400">{item.label}</div>
                                                <div className="text-sm font-medium text-slate-900">{item.value}</div>
                                            </div>
                                        </div>
                                    ))}
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column — Tasks */}
                <div className="lg:col-span-2">
                    <div className="pt-card overflow-hidden">
                        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="font-semibold text-slate-900">Assigned Tasks ({assignments.length})</h3>
                            <button onClick={() => setShowAssignPanel(true)} className="pt-btn-primary pt-btn-sm">
                                <Plus className="w-3.5 h-3.5" /> Assign
                            </button>
                        </div>
                        {assignments.length === 0 ? (
                            <div className="py-12 text-center">
                                <ClipboardList className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                                <p className="text-slate-400 text-sm font-medium">No tasks assigned yet</p>
                                <button onClick={() => setShowAssignPanel(true)} className="pt-btn-primary pt-btn-sm mt-3">
                                    Assign first task
                                </button>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-50">
                                {assignments.map((a: any) => {
                                    const done = a.tasks?.filter((t: any) => t.status === 'completed').length || 0;
                                    const total = a.tasks?.length || 1;
                                    const pct = Math.round((done / total) * 100);
                                    return (
                                        <div key={a._id}
                                            onClick={() => navigate(`/assignments/${a._id}`)}
                                            className="px-5 py-4 hover:bg-slate-50 cursor-pointer transition-colors flex items-center gap-4">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-medium text-slate-900 text-sm truncate">{a.workflow?.name}</span>
                                                    <StatusBadge status={a.status} />
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="pt-progress-bar flex-1 max-w-[140px]">
                                                        <div className="pt-progress-fill bg-blue-500" style={{ width: `${pct}%` }} />
                                                    </div>
                                                    <span className="text-xs text-slate-400">{done}/{total} tasks</span>
                                                </div>
                                            </div>
                                            <div className="text-xs text-slate-400 flex-shrink-0">
                                                {new Date(a.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmployeeProfile;
