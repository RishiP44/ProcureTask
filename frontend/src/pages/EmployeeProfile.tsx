import { useEffect, useState } from 'react';
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
                </div>
            </div>
        </div>
    );
};

export default EmployeeProfile;
