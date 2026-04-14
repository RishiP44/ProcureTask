import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { ClipboardList, Users, Workflow, Search, Loader2, Check, ArrowRight, CheckCircle2 } from 'lucide-react';

const getInitials = (name: string) =>
    name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

const AssignWorkflow = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const preselectedUser = searchParams.get('userId') || '';

    const [users, setUsers] = useState<any[]>([]);
    const [workflows, setWorkflows] = useState<any[]>([]);
    const [selectedUser, setSelectedUser] = useState(preselectedUser);
    const [selectedWorkflow, setSelectedWorkflow] = useState('');
    const [userSearch, setUserSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [done, setDone] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [usersRes, workflowsRes] = await Promise.all([
                    api.get('/users'),
                    api.get('/workflows'),
                ]);
                setUsers(usersRes.data);
                setWorkflows(workflowsRes.data);
            } catch { toast.error('Failed to load data'); }
            finally { setLoading(false); }
        };
        fetchData();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUser || !selectedWorkflow) {
            toast.error('Please select both a user and a workflow');
            return;
        }
        setSubmitting(true);
        try {
            await api.post('/assignments', { userId: selectedUser, workflowId: selectedWorkflow });
            toast.success('Workflow assigned successfully!');
            setDone(true);
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Assignment failed');
        } finally { setSubmitting(false); }
    };

    const filteredUsers = users.filter(u =>
        u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.department?.toLowerCase().includes(userSearch.toLowerCase())
    );

    const selectedUserData = users.find(u => u._id === selectedUser);
    const selectedWorkflowData = workflows.find(w => w._id === selectedWorkflow);

    if (loading) return (
        <div className="animate-pulse space-y-4">
            <div className="pt-skeleton h-8 w-48 mb-2" /><div className="pt-skeleton h-64 rounded-2xl" />
        </div>
    );

    if (done) return (
        <div className="max-w-md mx-auto text-center py-16 animate-fade-in-up">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Task Assigned!</h2>
            <p className="text-slate-500 mb-2">
                <strong>{selectedUserData?.name}</strong> has been assigned
            </p>
            <p className="text-slate-500 mb-8">
                <strong>"{selectedWorkflowData?.name}"</strong>
            </p>
            <p className="text-sm text-slate-400 mb-6">They'll receive an email notification with a link to their tasks.</p>
            <div className="flex gap-3 justify-center">
                <button onClick={() => { setDone(false); setSelectedUser(''); setSelectedWorkflow(''); }} className="pt-btn-secondary">
                    Assign Another
                </button>
                <button onClick={() => navigate('/employees')} className="pt-btn-primary">
                    View Employees <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );

    return (
        <div className="animate-fade-in-up max-w-4xl mx-auto">
            <div className="pt-page-header">
                <div>
                    <h1 className="pt-page-title">Assign Workflow</h1>
                    <p className="pt-page-subtitle">Select an employee and a workflow to assign</p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Select Employee */}
                    <div className="pt-card overflow-hidden">
                        <div className="px-5 py-4 border-b border-slate-100">
                            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                                <Users className="w-4 h-4 text-blue-600" /> Select Employee
                            </h3>
                        </div>
                        <div className="p-4">
                            <div className="relative mb-3">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input className="pt-input pl-9 text-sm" placeholder="Search employees…"
                                    value={userSearch} onChange={e => setUserSearch(e.target.value)} />
                            </div>
                            <div className="space-y-1 max-h-72 overflow-y-auto">
                                {filteredUsers.map(user => (
                                    <label key={user._id}
                                        className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${selectedUser === user._id ? 'bg-blue-50 border border-blue-200' : 'hover:bg-slate-50 border border-transparent'}`}>
                                        <input type="radio" name="user" value={user._id}
                                            checked={selectedUser === user._id}
                                            onChange={() => setSelectedUser(user._id)} className="sr-only" />
                                        <div className="pt-avatar-sm text-xs flex-shrink-0">{getInitials(user.name)}</div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-semibold text-slate-900 truncate">{user.name}</div>
                                            <div className="text-xs text-slate-400 truncate">{user.role} {user.department ? `· ${user.department}` : ''}</div>
                                        </div>
                                        {selectedUser === user._id && (
                                            <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                        )}
                                    </label>
                                ))}
                                {filteredUsers.length === 0 && (
                                    <p className="text-center text-slate-400 text-sm py-4">No employees found</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Select Workflow */}
                    <div className="pt-card overflow-hidden">
                        <div className="px-5 py-4 border-b border-slate-100">
                            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                                <Workflow className="w-4 h-4 text-purple-600" /> Select Workflow
                            </h3>
                        </div>
                        <div className="p-4">
                            <div className="space-y-2 max-h-80 overflow-y-auto">
                                {workflows.map(wf => (
                                    <label key={wf._id}
                                        className={`flex items-start gap-3 p-4 rounded-xl cursor-pointer transition-all ${selectedWorkflow === wf._id ? 'bg-purple-50 border border-purple-200' : 'hover:bg-slate-50 border border-transparent'}`}>
                                        <input type="radio" name="workflow" value={wf._id}
                                            checked={selectedWorkflow === wf._id}
                                            onChange={() => setSelectedWorkflow(wf._id)} className="sr-only" />
                                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${selectedWorkflow === wf._id ? 'bg-purple-600' : 'bg-slate-100'}`}>
                                            <Workflow className={`w-4.5 h-4.5 ${selectedWorkflow === wf._id ? 'text-white' : 'text-slate-500'}`} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-semibold text-slate-900">{wf.name}</div>
                                            <div className="text-xs text-slate-400 mt-0.5">{wf.description}</div>
                                            <div className="text-xs text-slate-400 mt-1">{wf.tasks?.length || 0} tasks</div>
                                        </div>
                                        {selectedWorkflow === wf._id && (
                                            <Check className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                                        )}
                                    </label>
                                ))}
                                {workflows.length === 0 && (
                                    <div className="text-center py-8">
                                        <p className="text-slate-400 text-sm">No workflows available</p>
                                        <button type="button" onClick={() => navigate('/workflows/create')}
                                            className="pt-btn-primary pt-btn-sm mt-3">Create Workflow</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Summary & Submit */}
                {selectedUser && selectedWorkflow && (
                    <div className="pt-card p-5 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 mb-6 animate-fade-in">
                        <h3 className="font-semibold text-slate-900 mb-3 text-sm">Assignment Summary</h3>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                            <div className="flex items-center gap-2.5">
                                <div className="pt-avatar-md text-sm">{getInitials(selectedUserData?.name || '')}</div>
                                <div>
                                    <div className="font-semibold text-slate-900 text-sm">{selectedUserData?.name}</div>
                                    <div className="text-xs text-slate-400">{selectedUserData?.email}</div>
                                </div>
                            </div>
                            <ArrowRight className="w-5 h-5 text-slate-300 hidden sm:block" />
                            <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 bg-purple-100 rounded-xl flex items-center justify-center">
                                    <Workflow className="w-4 h-4 text-purple-600" />
                                </div>
                                <div>
                                    <div className="font-semibold text-slate-900 text-sm">{selectedWorkflowData?.name}</div>
                                    <div className="text-xs text-slate-400">{selectedWorkflowData?.tasks?.length || 0} tasks</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex justify-end gap-3">
                    <button type="button" onClick={() => navigate('/dashboard')} className="pt-btn-secondary">Cancel</button>
                    <button id="assign-submit" type="submit" disabled={submitting || !selectedUser || !selectedWorkflow}
                        className="pt-btn-primary px-8">
                        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ClipboardList className="w-4 h-4" />}
                        {submitting ? 'Assigning…' : 'Assign Workflow'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AssignWorkflow;
