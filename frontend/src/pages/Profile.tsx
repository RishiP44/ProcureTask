import { useEffect, useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Edit2, Check, Loader2, Camera, Shield, 
    Fingerprint, Activity
} from 'lucide-react';

const Profile = () => {
    const [profile, setProfile] = useState<any>(null);
    const [editMode, setEditMode] = useState(false);
    const [editData, setEditData] = useState<any>({});
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await api.get('/auth/me');
                setProfile(res.data);
                setEditData(res.data);
            } catch { toast.error('Encrypted channel handshake failed'); }
            finally { setLoading(false); }
        };
        fetch();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await api.put(`/users/${profile._id}`, {
                name: editData.name,
                phone: editData.phone,
                department: editData.department,
                position: editData.position,
            });
            setProfile(res.data);
            setEditMode(false);
            toast.success('Registry record updated');
        } catch { toast.error('Biometric update rejected'); }
        finally { setSaving(false); }
    };

    if (loading) return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="h-64 pt-skeleton rounded-3xl" />
            <div className="h-96 pt-skeleton rounded-3xl" />
        </div>
    );

    if (!profile) return null;

    return (
        <div className="animate-fade-in max-w-4xl mx-auto pb-20">
            {/* Header & Coverage */}
            <div className="relative mb-32">
                <div className="h-48 w-full bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-950 rounded-[40px] shadow-2xl overflow-hidden">
                    <div className="absolute inset-0 opacity-20 flex flex-wrap gap-4 p-8">
                        {[...Array(20)].map((_, i) => <Shield key={i} className="w-8 h-8 text-white rotate-12" />)}
                    </div>
                </div>

                <div className="absolute -bottom-20 left-12 flex flex-col md:flex-row md:items-end gap-8">
                    <div className="relative group">
                        <div className="w-40 h-40 rounded-[40px] bg-white p-2 shadow-2xl">
                            <div className="w-full h-full rounded-[32px] bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-5xl font-black pt-outfit ring-4 ring-white/20">
                                {profile.name?.charAt(0)}
                            </div>
                        </div>
                        <button className="absolute bottom-2 right-2 p-3 bg-white text-slate-900 rounded-2xl shadow-xl hover:bg-slate-50 transition-all">
                            <Camera className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="pb-4">
                        <h2 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] mb-2 drop-shadow-sm">Personal Identity Hub</h2>
                        <h1 className="text-4xl font-black text-slate-900 pt-outfit">{profile.name}</h1>
                        <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-1">
                            {profile.position || 'Strategic Operations'} • {profile.department || 'Global Hub'}
                        </p>
                    </div>
                </div>

                <div className="absolute -bottom-10 right-12">
                    <AnimatePresence mode="wait">
                        {!editMode ? (
                            <motion.button 
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                onClick={() => setEditMode(true)} 
                                className="pt-btn-primary px-8 py-4 shadow-xl shadow-blue-600/20"
                            >
                                <Edit2 className="w-4 h-4" />
                                Modify Identity
                            </motion.button>
                        ) : (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex gap-3">
                                <button onClick={() => { setEditMode(false); setEditData(profile); }} className="pt-btn-secondary px-6">Cancel</button>
                                <button onClick={handleSave} disabled={saving} className="pt-btn-accent px-8 shadow-xl shadow-blue-400/20">
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                    Commite Changes
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Quick Stats */}
                <div className="space-y-6">
                    <div className="pt-glass-card p-8">
                        <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-8 flex items-center gap-2">
                            <Shield className="w-3.5 h-3.5 text-blue-600" />
                            Security Clearance
                        </h3>
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">System Role</span>
                                <span className="px-3 py-1 bg-slate-900 text-white text-[9px] font-black uppercase rounded-lg tracking-widest">{profile.role}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Registry Status</span>
                                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[9px] font-black uppercase rounded-lg tracking-widest">{profile.status}</span>
                            </div>
                            <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Identity ID</span>
                                <span className="text-[10px] font-black text-slate-900 uppercase font-mono">{profile._id.slice(-8)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="pt-glass-card p-8 bg-gradient-to-br from-blue-600 to-indigo-700 border-none">
                        <div className="flex items-center justify-between mb-8">
                            <Activity className="w-6 h-6 text-white" />
                            <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">Live Uptime</span>
                        </div>
                        <div className="text-white text-xs font-bold leading-relaxed">
                            Your account is synchronized with the global ProcureTrack network. All actions are logged and verified.
                        </div>
                    </div>
                </div>

                {/* Right: Info Form */}
                <div className="lg:col-span-2 pt-glass-card p-10">
                    <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-10 flex items-center gap-2">
                        <Fingerprint className="w-4 h-4 text-blue-600" />
                        Biometric Data & Identity Settings
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                        <div className="space-y-2">
                            <label className="pt-label text-slate-400">Full Legal Name</label>
                            {editMode ? (
                                <input className="pt-input" value={editData.name || ''} onChange={e => setEditData({ ...editData, name: e.target.value })} />
                            ) : (
                                <div className="text-sm font-black text-slate-900 pt-outfit uppercase tracking-tight py-2 border-b border-transparent">{profile.name}</div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="pt-label text-slate-400">System Link (Email)</label>
                            <div className="text-sm font-black text-slate-400 pt-outfit uppercase tracking-tight py-2 border-b border-transparent opacity-60 flex items-center gap-2">
                                {profile.email}
                                <Shield className="w-3 h-3" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="pt-label text-slate-400">Primary Endpoint (Phone)</label>
                            {editMode ? (
                                <input className="pt-input" value={editData.phone || ''} onChange={e => setEditData({ ...editData, phone: e.target.value })} />
                            ) : (
                                <div className="text-sm font-black text-slate-900 pt-outfit uppercase tracking-tight py-2 border-b border-transparent">{profile.phone || 'Not Configured'}</div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="pt-label text-slate-400">Departmental Node</label>
                            {editMode ? (
                                <input className="pt-input" value={editData.department || ''} onChange={e => setEditData({ ...editData, department: e.target.value })} />
                            ) : (
                                <div className="text-sm font-black text-slate-900 pt-outfit uppercase tracking-tight py-2 border-b border-transparent">{profile.department || 'General Cloud'}</div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="pt-label text-slate-400">Registry Activation</label>
                            <div className="text-sm font-black text-slate-900 pt-outfit uppercase tracking-tight py-2 border-b border-transparent">
                                {new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="pt-label text-slate-400">Functional Positioning</label>
                            {editMode ? (
                                <input className="pt-input" value={editData.position || ''} onChange={e => setEditData({ ...editData, position: e.target.value })} />
                            ) : (
                                <div className="text-sm font-black text-slate-900 pt-outfit uppercase tracking-tight py-2 border-b border-transparent">{profile.position || 'Executive Member'}</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
