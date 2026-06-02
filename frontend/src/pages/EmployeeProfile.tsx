import { useEffect, useState } from 'react';
<<<<<<< HEAD
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { ArrowLeft, Mail, Calendar, Briefcase, FileText, ChevronRight } from 'lucide-react';

const EmployeeProfile = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [employee, setEmployee] = useState<any>(null);
    const [assignments, setAssignments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfileData = async () => {
            if (!id) return;
            setLoading(true);
            try {
                const [empRes, assignRes] = await Promise.all([
                    api.get(`/users/${id}`),
                    api.get(`/assignments?userId=${id}`).catch(() => ({ data: [] }))
                ]);
                setEmployee(empRes.data);
                setAssignments(Array.isArray(assignRes.data) ? assignRes.data : []);
            } catch (err) {
                console.error(err);
                toast.error('Failed to load employee profile');
            } finally {
                setLoading(false);
            }
        };

        fetchProfileData();
    }, [id]);

    if (loading) {
        return (
            <div className="space-y-8 animate-pulse">
                <div className="h-10 w-48 pt-skeleton" />
                <div className="pt-glass-card h-64 pt-skeleton" />
            </div>
        );
    }

    if (!employee) {
        return (
            <div className="text-center py-20">
                <h2 className="text-xl font-black text-slate-800 uppercase">Employee Not Found</h2>
                <button onClick={() => navigate('/employees')} className="mt-4 pt-btn-secondary">
                    Back to Directory
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-12 animate-fade-in">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button 
                    onClick={() => navigate('/employees')} 
                    className="p-3 bg-white border border-slate-100 hover:bg-slate-50 rounded-2xl transition-all"
                >
                    <ArrowLeft className="w-5 h-5 text-slate-600" />
                </button>
                <div>
                    <h2 className="text-[10px] font-extrabold text-blue-500 uppercase tracking-[0.3em] mb-2">Personnel Network</h2>
                    <h1 className="text-4xl pt-title-gradient pt-outfit">Resource File</h1>
                </div>
            </div>

            {/* Profile Info Card */}
            <div className="pt-glass-card p-10 flex flex-col md:flex-row gap-10 items-start md:items-center">
                <div className="w-24 h-24 rounded-[36px] bg-slate-900 flex items-center justify-center text-3xl font-black text-white shadow-xl shadow-slate-950/20">
                    {employee.name?.charAt(0)}
                </div>
                <div className="flex-1 space-y-4">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 pt-outfit uppercase">{employee.name}</h2>
                        <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mt-1">{employee.role}</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 pt-2 border-t border-slate-50">
                        <div className="flex items-center gap-2.5 text-slate-500">
                            <Mail className="w-4 h-4 text-slate-400" />
                            <span className="text-xs font-bold">{employee.email}</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-slate-500">
                            <Briefcase className="w-4 h-4 text-slate-400" />
                            <span className="text-xs font-bold">{employee.position || 'Standard Role'} • {employee.department || 'General'}</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-slate-500">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            <span className="text-xs font-bold">Joined: {employee.startDate ? new Date(employee.startDate).toLocaleDateString() : 'N/A'}</span>
                        </div>
                    </div>
                </div>
                <div className="w-full md:w-auto px-6 py-3 bg-slate-50 rounded-2xl text-center">
                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-0.5">Status</div>
                    <span className="text-xs font-bold text-slate-800 uppercase">{employee.status || 'Active'}</span>
                </div>
            </div>

            {/* Operations / Onboarding logs */}
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-black text-slate-900 pt-outfit uppercase tracking-tight">Active Workflows</h3>
                    <p className="text-slate-400 text-xs font-medium mt-1">Assigned onboarding lists and progress trackers.</p>
                </div>

                <div className="pt-glass-card overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50 border-b border-slate-50">
                            <tr>
                                <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Workflow</th>
                                <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Progress</th>
                                <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {assignments.map(a => {
                                const pct = Math.round(((a.tasks?.filter((t: any) => t.status === 'completed').length || 0) / (a.tasks?.length || 1)) * 100);
                                return (
                                    <tr key={a._id} className="hover:bg-slate-50/50 transition-colors group cursor-pointer" onClick={() => navigate(`/assignments/${a._id}`)}>
                                        <td className="px-8 py-5">
                                            <div className="text-xs font-bold text-slate-800 uppercase tracking-tight flex items-center gap-2">
                                                <FileText className="w-4 h-4 text-blue-500" />
                                                {a.workflow?.name}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                                                a.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                                            }`}>
                                                {a.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${pct}%` }} />
                                                </div>
                                                <span className="text-[10px] font-black text-slate-400">{pct}%</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <button className="p-2 text-slate-400 hover:text-blue-600 rounded-lg group-hover:translate-x-0.5 transition-all">
                                                <ChevronRight className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                            {assignments.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="py-20 text-center text-slate-300 text-[10px] font-black uppercase tracking-widest">
                                        No active workflows assigned.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
=======
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
    Mail, Phone, Building2, Briefcase, Calendar,
    Shield, Activity, Globe, Zap, Target
} from 'lucide-react';

const EmployeeProfile = () => {
    const { id } = useParams();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await api.get(`/users/${id}`);
                setProfile(res.data);
            } catch { toast.error('Personnel record inaccessible'); }
            finally { setLoading(false); }
        };
        fetch();
    }, [id]);

    if (loading) return (
        <div className="max-w-4xl mx-auto space-y-8 animate-pulse">
            <div className="h-64 pt-skeleton rounded-3xl" />
            <div className="h-96 pt-skeleton rounded-3xl" />
        </div>
    );

    if (!profile) return (
        <div className="pt-glass-card p-20 text-center max-w-xl mx-auto mt-20">
            <Shield className="w-12 h-12 text-slate-200 mx-auto mb-6" />
            <h2 className="text-xl font-black text-slate-900 pt-outfit uppercase tracking-tight">Identity Not Found</h2>
            <p className="text-slate-400 text-sm mt-3 font-medium">The requested personnel record does not exist or has been purged from the registry.</p>
            <Link to="/employees" className="pt-btn-primary mt-8 inline-flex">Return to Directory</Link>
        </div>
    );

    return (
        <div className="animate-fade-in max-w-4xl mx-auto pb-20">
            {/* Header / Banner */}
            <div className="relative mb-32">
                <div className="h-48 w-full bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-950 rounded-[40px] shadow-2xl overflow-hidden">
                    <div className="absolute inset-0 opacity-20 flex flex-wrap gap-4 p-8">
                        {[...Array(20)].map((_, i) => <Globe key={i} className="w-8 h-8 text-white rotate-12" />)}
                    </div>
                </div>

                <div className="absolute -bottom-20 left-12 flex flex-col md:flex-row md:items-end gap-8">
                    <div className="w-40 h-40 rounded-[40px] bg-white p-2 shadow-2xl">
                        <div className="w-full h-full rounded-[32px] bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-5xl font-black pt-outfit ring-4 ring-white/20">
                            {profile.name?.charAt(0)}
                        </div>
                    </div>

                    <div className="pb-4">
                        <h2 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] mb-2 drop-shadow-sm">Personnel Profile</h2>
                        <h1 className="text-4xl font-black text-slate-900 pt-outfit">{profile.name}</h1>
                        <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-1">
                            {profile.position || 'Strategic Member'} • {profile.department || 'Cloud Operations'}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Stats & Identity */}
                <div className="space-y-6">
                    <div className="pt-glass-card p-8">
                        <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-8 flex items-center gap-2">
                            <Activity className="w-3.5 h-3.5 text-blue-600" />
                            Operational Metrics
                        </h3>
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">System Role</span>
                                <span className="px-3 py-1 bg-slate-900 text-white text-[9px] font-black uppercase rounded-lg tracking-widest">{profile.role}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Status</span>
                                <span className={`px-3 py-1 text-[9px] font-black uppercase rounded-lg tracking-widest ${profile.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                    {profile.status}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="pt-glass-card p-8 bg-gradient-to-br from-blue-600 to-indigo-700 border-none">
                        <div className="flex items-center justify-between mb-8">
                            <Zap className="w-6 h-6 text-white" />
                            <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">Network Node</span>
                        </div>
                        <div className="text-white text-xs font-bold leading-relaxed">
                            This identity is verified and active on the global onboarding grid. All metrics are synced in real-time.
                        </div>
                    </div>
                </div>

                {/* Primary Info */}
                <div className="lg:col-span-2 pt-glass-card p-10">
                    <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-10 flex items-center gap-2">
                        <Target className="w-4 h-4 text-blue-600" />
                        Professional Engagement Data
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                        <div className="group">
                            <label className="pt-label text-slate-400 mb-1 block">Full Legal Identity</label>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-blue-50 transition-colors">
                                    <Mail className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-500" />
                                </div>
                                <span className="text-sm font-black text-slate-900 pt-outfit uppercase tracking-tight">{profile.name}</span>
                            </div>
                        </div>

                        <div className="group">
                            <label className="pt-label text-slate-400 mb-1 block">Primary Link</label>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-blue-50 transition-colors">
                                    <Globe className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-500" />
                                </div>
                                <span className="text-sm font-black text-slate-900 pt-outfit tracking-tight">{profile.email}</span>
                            </div>
                        </div>

                        <div className="group">
                            <label className="pt-label text-slate-400 mb-1 block">Departmental Node</label>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-slate-100/50 rounded-lg">
                                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                                </div>
                                <span className="text-sm font-black text-slate-900 pt-outfit uppercase tracking-tight">{profile.department || 'Unassigned'}</span>
                            </div>
                        </div>

                        <div className="group">
                            <label className="pt-label text-slate-400 mb-1 block">Functional Role</label>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-slate-100/50 rounded-lg">
                                    <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                                </div>
                                <span className="text-sm font-black text-slate-900 pt-outfit uppercase tracking-tight">{profile.position || 'General Staff'}</span>
                            </div>
                        </div>

                        <div className="group">
                            <label className="pt-label text-slate-400 mb-1 block">Primary Endpoint</label>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-slate-100/50 rounded-lg">
                                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                                </div>
                                <span className="text-sm font-black text-slate-900 pt-outfit uppercase tracking-tight">{profile.phone || 'Offline'}</span>
                            </div>
                        </div>

                        <div className="group">
                            <label className="pt-label text-slate-400 mb-1 block">Registry Since</label>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-slate-100/50 rounded-lg">
                                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                </div>
                                <span className="text-sm font-black text-slate-900 pt-outfit uppercase tracking-tight">
                                    {new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                </span>
                            </div>
                        </div>
                    </div>
>>>>>>> 48f2eeb33d49eee1602accbfdcc6f9f5d5985909
                </div>
            </div>
        </div>
    );
};

export default EmployeeProfile;
