import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, UserPlus, Grid, List,
    UserCircle, ArrowUpRight
} from 'lucide-react';

const StatusBadge = ({ status }: { status: string }) => {
    const map: Record<string, string> = {
        active: 'pt-badge-success',
        pending: 'pt-badge-warning',
        inactive: 'pt-badge-gray',
    };
    return <span className={map[status] || 'pt-badge'}>{status}</span>;
};

const Employees = () => {
    const navigate = useNavigate();
    const [employees, setEmployees] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');

    useEffect(() => {
        const fetchEmployees = async () => {
            setLoading(true);
            try {
                const res = await api.get('/users', { params: { role: roleFilter || undefined } });
                setEmployees(res.data);
            } catch {
                toast.error('Registry link failed');
            } finally {
                setLoading(false);
            }
        };
        fetchEmployees();
    }, [roleFilter]);

    const filtered = employees.filter(emp => 
        emp.name.toLowerCase().includes(search.toLowerCase()) ||
        emp.email.toLowerCase().includes(search.toLowerCase()) ||
        emp.position?.toLowerCase().includes(search.toLowerCase())
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
                    <h2 className="text-[10px] font-extrabold text-blue-500 uppercase tracking-[0.3em] mb-2">Personnel Network</h2>
                    <h1 className="text-4xl pt-title-gradient pt-outfit">Staff Directory</h1>
                    <p className="text-slate-400 text-sm mt-3 font-medium">Synchronizing <span className="text-slate-900 font-bold">{employees.length}</span> verified organizational identities.</p>
                </div>
                <button className="pt-btn-primary h-12 shadow-xl shadow-blue-600/20">
                    <UserPlus className="w-5 h-5" />
                    Onboard Professional
                </button>
            </div>

            {/* Filters */}
            <div className="pt-glass-card p-4 flex flex-col md:flex-row items-center gap-4">
                <div className="relative flex-1 group w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    <input 
                        className="w-full pl-11 pr-4 py-2 bg-transparent border-none text-xs font-bold placeholder:text-slate-300 focus:ring-0"
                        placeholder="Search personnel by name, email, or functional role..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto border-l border-slate-100 pl-4">
                    <select 
                        className="bg-transparent border-none text-[10px] font-black uppercase tracking-widest text-slate-500 focus:ring-0 cursor-pointer"
                        value={roleFilter}
                        onChange={e => setRoleFilter(e.target.value)}
                    >
                        <option value="">All Roles</option>
                        <option value="Admin">Administrators</option>
                        <option value="HR">HR Specialist</option>
                        <option value="Employee">Standard Staff</option>
                    </select>
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
                                <h3 className="text-lg font-black text-slate-900 pt-outfit uppercase tracking-tight group-hover:text-blue-600 transition-colors">{emp.name}</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 mb-6">{emp.position || 'Strategic Role'}</p>
                                
                                <div className="w-full pt-6 border-t border-slate-50 flex items-center justify-between">
                                    <div className="text-left">
                                        <div className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Status</div>
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
                                                <div className="text-sm font-black text-slate-900 pt-outfit uppercase tracking-tight">{emp.name}</div>
                                                <div className="text-[10px] text-slate-400 font-bold uppercase">{emp.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{emp.position || 'General Staff'}</div>
                                    </td>
                                    <td className="px-8 py-5">
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
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Zero identities identified</h3>
                    <p className="text-slate-300 text-xs font-medium mt-2">Modify personnel filters or search criteria.</p>
                </div>
            )}
        </div>
    );
};

export default Employees;
