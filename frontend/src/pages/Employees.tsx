import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
    Users, Search, Filter, UserPlus, Mail, Briefcase,
    ChevronRight, MoreHorizontal, Check, X, Loader2,
    Phone, Building2, Calendar, Shield
} from 'lucide-react';

const getInitials = (name: string) =>
    name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

const StatusBadge = ({ status }: { status: string }) => {
    const map: Record<string, string> = {
        Active: 'pt-badge-green',
        Invited: 'pt-badge-blue',
        Inactive: 'pt-badge-gray',
        Pending: 'pt-badge-yellow',
    };
    return <span className={map[status] || 'pt-badge-gray'}>{status}</span>;
};

const RoleBadge = ({ role }: { role: string }) => {
    const map: Record<string, string> = {
        Admin: 'pt-badge-purple',
        HR: 'pt-badge-blue',
        Employee: 'pt-badge-gray',
        Vendor: 'pt-badge-yellow',
    };
    return <span className={map[role] || 'pt-badge-gray'}>{role}</span>;
};

const Employees = () => {
    const navigate = useNavigate();
    const [employees, setEmployees] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [view, setView] = useState<'grid' | 'table'>('grid');

    // Invite Modal
    const [inviteOpen, setInviteOpen] = useState(false);
    const [inviteForm, setInviteForm] = useState({
        name: '', email: '', role: 'Employee', department: '', position: ''
    });
    const [inviteLoading, setInviteLoading] = useState(false);

    useEffect(() => {
        fetchEmployees();
    }, [roleFilter, statusFilter]);

    const fetchEmployees = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (roleFilter) params.append('role', roleFilter);
            if (statusFilter) params.append('status', statusFilter);
            const res = await api.get(`/users?${params.toString()}`);
            setEmployees(res.data);
        } catch { toast.error('Failed to load employees'); }
        finally { setLoading(false); }
    };

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        setInviteLoading(true);
        try {
            await api.post('/auth/invite', inviteForm);
            toast.success(`Invite sent to ${inviteForm.email}!`);
            setInviteOpen(false);
            setInviteForm({ name: '', email: '', role: 'Employee', department: '', position: '' });
            fetchEmployees();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to send invite');
        } finally { setInviteLoading(false); }
    };

    const filtered = employees.filter(emp =>
        emp.name?.toLowerCase().includes(search.toLowerCase()) ||
        emp.email?.toLowerCase().includes(search.toLowerCase()) ||
        emp.department?.toLowerCase().includes(search.toLowerCase()) ||
        emp.position?.toLowerCase().includes(search.toLowerCase())
    );

    const DEPARTMENTS = [...new Set(employees.map(e => e.department).filter(Boolean))];

    return (
        <div className="animate-fade-in-up">
            {/* Page Header */}
            <div className="mb-10 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Employees</h1>
                    <p className="text-slate-500 text-sm mt-1">{employees.length} team members</p>
                </div>
                <button onClick={() => setInviteOpen(true)} className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-md uppercase tracking-wider">
                    Invite Employee
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <input
                    className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm"
                    placeholder="Search name, email, department…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
                <select className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
                    <option value="">All Roles</option>
                    <option value="Employee">Employee</option>
                    <option value="HR">HR</option>
                    <option value="Admin">Admin</option>
                </select>
                <div className="flex bg-slate-50 rounded-md border border-slate-200 p-1">
                    <button onClick={() => setView('grid')} className={`px-3 py-1 text-xs font-bold uppercase ${view === 'grid' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>Grid</button>
                    <button onClick={() => setView('table')} className={`px-3 py-1 text-xs font-bold uppercase ${view === 'table' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>Table</button>
                </div>
            </div>

            {/* Grid View */}
            {!loading && view === 'grid' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {filtered.map(emp => (
                        <div key={emp._id}
                            onClick={() => navigate(`/employees/${emp._id}`)}
                            className="p-6 bg-white border border-gray-100 rounded-lg hover:border-gray-300 cursor-pointer transition-colors">
                            <div className="text-lg font-bold text-slate-900">{emp.name}</div>
                            <div className="text-xs text-slate-500 mt-1 uppercase font-bold tracking-tight">{emp.position || emp.role}</div>
                            <div className="text-[10px] text-slate-400 mt-3 truncate">{emp.email}</div>
                            
                            <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{emp.status}</span>
                                <button onClick={e => { e.stopPropagation(); navigate(`/assign?userId=${emp._id}`); }}
                                    className="text-[10px] font-bold text-slate-900 uppercase hover:underline">
                                    Assign Task
                                </button>
                            </div>
                        </div>
                    ))}
                    {filtered.length === 0 && (
                        <div className="col-span-full py-16 text-center text-slate-400 text-sm font-bold uppercase tracking-widest">
                            No employees found.
                        </div>
                    )}
                </div>
            )}

            {/* Table View */}
            {!loading && view === 'table' && (
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-100 pb-3">
                                <th className="pb-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Employee</th>
                                <th className="pb-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Department</th>
                                <th className="pb-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                                <th className="pb-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filtered.map(emp => (
                                <tr key={emp._id} onClick={() => navigate(`/employees/${emp._id}`)} className="cursor-pointer group">
                                    <td className="py-4">
                                        <div className="text-sm font-bold text-slate-900">{emp.name}</div>
                                        <div className="text-[10px] text-slate-400 truncate w-40">{emp.email}</div>
                                    </td>
                                    <td className="py-4 text-sm text-slate-600 font-medium">{emp.department || '—'}</td>
                                    <td className="py-4">
                                        <span className="text-[10px] font-bold uppercase text-slate-400">{emp.status}</span>
                                    </td>
                                    <td className="py-4 text-right">
                                        <button onClick={e => { e.stopPropagation(); navigate(`/assign?userId=${emp._id}`); }}
                                            className="text-[10px] font-bold text-slate-900 uppercase hover:underline">Assign</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Invite Modal */}
            {inviteOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setInviteOpen(false)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md animate-fade-in-up overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">Invite Employee</h2>
                                <p className="text-sm text-slate-400 mt-0.5">They'll receive an email to set up their account</p>
                            </div>
                            <button onClick={() => setInviteOpen(false)} className="p-2 rounded-lg hover:bg-slate-100">
                                <X className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>
                        <form onSubmit={handleInvite} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="pt-label">Full Name</label>
                                    <input className="pt-input" placeholder="Jane Doe"
                                        value={inviteForm.name} onChange={e => setInviteForm({ ...inviteForm, name: e.target.value })} />
                                </div>
                                <div>
                                    <label className="pt-label">Role</label>
                                    <select className="pt-select" value={inviteForm.role}
                                        onChange={e => setInviteForm({ ...inviteForm, role: e.target.value })}>
                                        <option value="Employee">Employee</option>
                                        <option value="HR">HR Manager</option>
                                        <option value="Vendor">Vendor</option>
                                        <option value="Admin">Admin</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="pt-label">Email Address *</label>
                                <input type="email" className="pt-input" placeholder="jane@company.com"
                                    value={inviteForm.email} onChange={e => setInviteForm({ ...inviteForm, email: e.target.value })} required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="pt-label">Department</label>
                                    <input className="pt-input" placeholder="e.g. Engineering"
                                        value={inviteForm.department} onChange={e => setInviteForm({ ...inviteForm, department: e.target.value })} />
                                </div>
                                <div>
                                    <label className="pt-label">Position</label>
                                    <input className="pt-input" placeholder="e.g. Software Engineer"
                                        value={inviteForm.position} onChange={e => setInviteForm({ ...inviteForm, position: e.target.value })} />
                                </div>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setInviteOpen(false)} className="pt-btn-secondary flex-1 justify-center">Cancel</button>
                                <button type="submit" disabled={inviteLoading} className="pt-btn-primary flex-1 justify-center">
                                    {inviteLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                                    {inviteLoading ? 'Sending…' : 'Send Invite'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Employees;
