import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, UserPlus, Grid, List,
    UserCircle, ArrowUpRight, Loader2, SendHorizontal
} from 'lucide-react';

const StatusBadge = ({ status }: { status: string }) => {
    const map: Record<string, string> = {
        active: 'pt-badge-success',
        pending: 'pt-badge-warning',
        inactive: 'pt-badge-gray',
        invited: 'pt-badge-warning',
    };
    return <span className={map[status.toLowerCase()] || 'pt-badge'}>{status}</span>;
};

const Employees = () => {
    const navigate = useNavigate();
    const [employees, setEmployees] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [search, setSearch] = useState('');
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [inviting, setInviting] = useState(false);
    
    const [inviteForm, setInviteForm] = useState({
        name: '',
        email: '',
        role: 'Employee',
        position: '',
        department: '',
        companyName: '', vendorType: '', taxId: '', website: '', address: ''
    });

    const fetchEmployees = async () => {
        setLoading(true);
        try {
            const [employeesRes, hrRes] = await Promise.all([
                api.get('/users', { params: { role: 'Employee' } }),
                api.get('/users', { params: { role: 'HR' } })
            ]);
            setEmployees([...employeesRes.data, ...hrRes.data]);
        } catch {
            toast.error('Could not load employees');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        setInviting(true);
        try {
            await api.post('/auth/invite', inviteForm);
            toast.success(`Invitation sent to ${inviteForm.email}`);
            setShowInviteModal(false);
            setInviteForm({
                name: '',
                email: '',
                role: 'Employee',
                position: '',
                department: '',
                companyName: '',
                vendorType: '',
                taxId: '',
                website: '',
                address: ''
            });
            fetchEmployees();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Could not invite employee');
        } finally {
            setInviting(false);
        }
    };

    const filtered = employees.filter(emp => 
        (emp.name || '').toLowerCase().includes(search.toLowerCase()) ||
        (emp.email || '').toLowerCase().includes(search.toLowerCase()) ||
        (emp.position || '').toLowerCase().includes(search.toLowerCase()) ||
        (emp.companyName || '').toLowerCase().includes(search.toLowerCase()) ||
        (emp.vendorType || '').toLowerCase().includes(search.toLowerCase())
    );

    if (loading) {
        return (
            <div className="space-y-8 animate-pulse">
                <div className="h-10 w-48 pt-skeleton" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1,2,3,4,5,6].map(i => <div key={i} className="h-48 pt-skeleton rounded-3xl" />)}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-12 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl pt-title-gradient pt-outfit">Employee Directory</h1>
                    <p className="text-slate-400 text-sm mt-3 font-medium"><span className="text-slate-900 font-bold">{employees.length}</span> employees and HR team members. Vendors and administrators are managed separately.</p>
                </div>
                <button 
                    onClick={() => setShowInviteModal(true)} 
                    className="pt-btn-primary h-12 shadow-xl shadow-blue-600/20"
                >
                    <UserPlus className="w-5 h-5" />
                    Invite Employee
                </button>
            </div>

            {/* Filters */}
            <div className="pt-glass-card p-4 flex flex-col md:flex-row items-center gap-4">
                <div className="relative flex-1 group w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    <input 
                        className="w-full pl-11 pr-4 py-2 bg-transparent border-none text-xs font-bold placeholder:text-slate-300 focus:ring-0"
                        placeholder="Search employees by name, email, department, or position..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto border-l border-slate-100 pl-4">
                    <div className="flex bg-slate-50 p-1 rounded-xl ml-4">
                        <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}><Grid className="w-4 h-4" /></button>
                        <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}><List className="w-4 h-4" /></button>
                    </div>
                </div>
            </div>

            {/* Grid/List */}
            {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <AnimatePresence mode="popLayout">
                        {filtered.map((emp, i) => (
                            <motion.div
                                key={emp._id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ delay: i * 0.03 }}
                                onClick={() => navigate(`/employees/${emp._id}`)}
                                className="pt-glass-card-hover group p-8 flex flex-col items-center text-center relative overflow-hidden"
                            >
                                <div className="w-20 h-20 rounded-[32px] bg-slate-50 flex items-center justify-center text-2xl font-black text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 mb-6">
                                    {emp.name?.charAt(0)}
                                </div>
                                <h3 className="text-lg font-black text-slate-900 pt-outfit uppercase tracking-tight group-hover:text-blue-600 transition-colors">
                                    {emp.role === 'Vendor' && emp.companyName ? emp.companyName : emp.name}
                                </h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 mb-6">
                                    {emp.role === 'Vendor' ? `${emp.vendorType || 'Vendor Partner'} • Contact: ${emp.name}` : (emp.position || 'Strategic Role')}
                                </p>
                                
                                <div className="w-full pt-6 border-t border-slate-50 flex items-center justify-between">
                                    <div className="text-left">
                                        <div className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Account</div>
                                        <span className="px-2 py-0.5 bg-slate-100 text-slate-800 text-[8px] font-black rounded uppercase tracking-wider mr-2">{emp.role}</span>
                                        <StatusBadge status={emp.status} />
                                    </div>
                                    <div className="p-3 bg-slate-50 rounded-xl group-hover:bg-slate-900 group-hover:text-white transition-all">
                                        <ArrowUpRight className="w-4 h-4" />
                                    </div>
                                </div>

                                <UserCircle className="absolute right-[-20px] top-[-20px] w-32 h-32 text-slate-50 opacity-50 pointer-events-none group-hover:text-blue-50 transition-colors" />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            ) : (
                <div className="pt-glass-card overflow-hidden">
                    <table className="w-full">
                        <tbody className="divide-y divide-slate-50">
                            {filtered.map(emp => (
                                <tr key={emp._id} onClick={() => navigate(`/employees/${emp._id}`)} className="group cursor-pointer hover:bg-slate-50/50 transition-colors">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-sm font-black text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">{emp.name?.charAt(0)}</div>
                                            <div>
                                                <div className="text-sm font-black text-slate-900 pt-outfit uppercase tracking-tight">
                                                    {emp.role === 'Vendor' && emp.companyName ? `${emp.companyName} (${emp.name})` : emp.name}
                                                </div>
                                                <div className="text-[10px] text-slate-400 font-bold uppercase">{emp.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                            {emp.role === 'Vendor' ? emp.vendorType || 'Vendor Partner' : emp.position || 'General Staff'}
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className="px-2 py-0.5 bg-slate-100 text-slate-800 text-[8px] font-black rounded uppercase tracking-wider mr-2">{emp.role}</span>
                                        <StatusBadge status={emp.status} />
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="p-2 inline-flex bg-slate-50 rounded-lg group-hover:bg-slate-900 group-hover:text-white transition-all">
                                            <ArrowUpRight className="w-4 h-4" />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {filtered.length === 0 && (
                <div className="py-32 text-center pt-glass-card">
                    <UserCircle className="w-12 h-12 text-slate-200 mx-auto mb-6" />
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">No Employees Found</h3>
                    <p className="text-slate-300 text-xs font-medium mt-2">Try a different search.</p>
                </div>
            )}

            {/* Invite Modal */}
            <AnimatePresence>
                {showInviteModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" 
                            onClick={() => setShowInviteModal(false)} 
                        />
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            className="relative bg-white rounded-[40px] shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
                        >
                            <div className="p-12 border-b border-slate-100 bg-slate-50/30 sticky top-0 bg-white z-10">
                                <h3 className="text-3xl font-black text-slate-900 pt-outfit">Invite Employee</h3>
                                <p className="text-slate-400 text-sm mt-3 font-medium">Enter the employee details and send an invitation.</p>
                            </div>
                            <form onSubmit={handleInvite} className="p-12 space-y-8">
                                <div className="space-y-2">
                                    <label className="pt-label">Role</label>
                                    <select 
                                        className="pt-input" 
                                        value={inviteForm.role} 
                                        onChange={e => setInviteForm({ ...inviteForm, role: e.target.value })}
                                        required
                                    >
                                        <option value="Employee">Employee</option>
                                        <option value="HR">HR Specialist</option>
                                    </select>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="pt-label">
                                            {inviteForm.role === 'Vendor' ? 'Contact Name' : 'Full Name'}
                                        </label>
                                        <input 
                                            className="pt-input" 
                                            placeholder="e.g. Sarah Jenkins" 
                                            value={inviteForm.name} 
                                            onChange={e => setInviteForm({ ...inviteForm, name: e.target.value })} 
                                            required 
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="pt-label">Contact Email</label>
                                        <input 
                                            type="email"
                                            className="pt-input" 
                                            placeholder="sarah@organization.com" 
                                            value={inviteForm.email} 
                                            onChange={e => setInviteForm({ ...inviteForm, email: e.target.value })} 
                                            required 
                                        />
                                    </div>
                                </div>

                                {/* Conditional Fields for Employee/Staff */}
                                {(
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="pt-label">Position Title</label>
                                            <input 
                                                className="pt-input" 
                                                placeholder="e.g. Senior Specialist" 
                                                value={inviteForm.position} 
                                                onChange={e => setInviteForm({ ...inviteForm, position: e.target.value })} 
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="pt-label">Department</label>
                                            <input 
                                                className="pt-input" 
                                                placeholder="e.g. Product Engineering" 
                                                value={inviteForm.department} 
                                                onChange={e => setInviteForm({ ...inviteForm, department: e.target.value })} 
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-4 pt-8 border-t border-slate-50">
                                    <button 
                                        type="button" 
                                        onClick={() => setShowInviteModal(false)} 
                                        className="pt-btn-secondary flex-1 py-4"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit" 
                                        disabled={inviting} 
                                        className="pt-btn-primary flex-1 py-4"
                                    >
                                        {inviting ? <Loader2 className="w-5 h-5 animate-spin" /> : <SendHorizontal className="w-5 h-5" />}
                                        {inviting ? 'Sending Invite...' : 'Send Invite'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Employees;
