import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Edit2, Check, Loader2, Camera, Shield, 
    UserRound, Activity, ArrowLeft
} from 'lucide-react';

const Profile = () => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState<any>(null);
    const [editMode, setEditMode] = useState(false);
    const [editData, setEditData] = useState<any>({});
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const photoInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await api.get('/auth/me');
                setProfile(res.data);
                setEditData(res.data);
            } catch { toast.error('Could not load your profile'); }
            finally { setLoading(false); }
        };
        fetch();
    }, []);

    // Sends an API update with both standard and vendor-specific fields (Company, Category, Tax ID, Website, Address)
    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await api.put(`/users/${profile._id}`, {
                name: editData.name,
                phone: editData.phone,
                department: editData.department,
                position: editData.position,
                companyName: editData.companyName,
                vendorType: editData.vendorType,
                taxId: editData.taxId,
                website: editData.website,
                address: editData.address,
            });
            setProfile(res.data);
            setEditMode(false);
            toast.success('Profile updated');
        } catch { toast.error('Could not update your profile'); }
        finally { setSaving(false); }
    };

    const handlePhotoChange = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            toast.error('Please choose an image file');
            return;
        }
        setUploadingPhoto(true);
        try {
            const data = new FormData();
            data.append('file', file);
            const upload = await api.post('/upload', data, { headers: { 'Content-Type': 'multipart/form-data' } });
            const updated = await api.put(`/users/${profile._id}`, {
                name: profile.name,
                phone: profile.phone,
                avatar: upload.data.filePath
            });
            setProfile(updated.data);
            setEditData(updated.data);
            toast.success('Profile photo updated');
        } catch {
            toast.error('Could not upload the photo');
        } finally {
            setUploadingPhoto(false);
            event.target.value = '';
        }
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
            <div className="mb-6">
                <button
                    type="button"
                    onClick={() => navigate('/dashboard')}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-black uppercase tracking-widest hover:bg-slate-50 hover:text-slate-900 transition-all shadow-sm"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Dashboard
                </button>
            </div>

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
                            {profile.avatar ? (
                                <img src={`http://localhost:5000${profile.avatar}`} alt={profile.name} className="w-full h-full rounded-[32px] object-cover ring-4 ring-white/20" />
                            ) : (
                                <div className="w-full h-full rounded-[32px] bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-5xl font-black pt-outfit ring-4 ring-white/20">
                                    {(profile.companyName || profile.name)?.charAt(0)}
                                </div>
                            )}
                        </div>
                        <input ref={photoInputRef} type="file" accept=".jpg,.jpeg,.png,.webp" className="hidden" onChange={handlePhotoChange} />
                        <button type="button" disabled={uploadingPhoto} onClick={() => photoInputRef.current?.click()} aria-label="Change profile photo" className="absolute bottom-2 right-2 p-3 bg-white text-slate-900 rounded-2xl shadow-xl hover:bg-slate-50 transition-all disabled:opacity-60">
                            {uploadingPhoto ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
                        </button>
                    </div>

                    <div className="pb-4">
                        <h1 className="text-4xl font-black text-slate-900 pt-outfit">
                            {profile.role === 'Vendor' && profile.companyName ? profile.companyName : profile.name}
                        </h1>
                        <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-1">
                            {profile.role === 'Vendor' ? `${profile.vendorType || 'Vendor'} • Contact: ${profile.name}` : `${profile.position || 'Team Member'} • ${profile.department || 'General'}`}
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
                                Edit Profile
                            </motion.button>
                        ) : (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex gap-3">
                                <button onClick={() => { setEditMode(false); setEditData(profile); }} className="pt-btn-secondary px-6">Cancel</button>
                                <button onClick={handleSave} disabled={saving} className="pt-btn-accent px-8 shadow-xl shadow-blue-400/20">
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                    Save Changes
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Security Information Card */}
                <div className="space-y-6">
                    <div className="pt-glass-card p-8">
                        <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-8">Account Details</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Role</span>
                                <span className="text-[10px] font-black text-blue-600 uppercase tracking-wider">{profile.role}</span>
                            </div>
                            <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Account Status</span>
                                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-wider">{profile.status || 'Active'}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Account ID</span>
                                <span className="text-[10px] font-black text-slate-900 uppercase font-mono">{profile._id.slice(-8)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="pt-glass-card p-8 bg-gradient-to-br from-blue-600 to-indigo-700 border-none">
                        <div className="flex items-center justify-between mb-8">
                            <Activity className="w-6 h-6 text-white" />
                            <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">Account Activity</span>
                        </div>
                        <div className="text-white text-xs font-bold leading-relaxed">
                            Your account is active. Important changes and actions are recorded for security.
                        </div>
                    </div>
                </div>

                {/* Right: Info Form */}
                <div className="lg:col-span-2 pt-glass-card p-10">
                    <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-10 flex items-center gap-2">
                        <UserRound className="w-4 h-4 text-blue-600" />
                        Profile Information
                    </h3>
                                       <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                        {/* Renders vendor fields if user role is Vendor, otherwise renders standard employee fields */}
                        {profile.role === 'Vendor' ? (
                            <>
                                <div className="space-y-2">
                                    <label className="pt-label text-slate-400">Company Name</label>
                                    {editMode ? (
                                        <input className="pt-input" value={editData.companyName || ''} onChange={e => setEditData({ ...editData, companyName: e.target.value })} required />
                                    ) : (
                                        <div className="text-sm font-black text-slate-900 pt-outfit uppercase tracking-tight py-2 border-b border-transparent">{profile.companyName || 'N/A'}</div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="pt-label text-slate-400">Contact Person Name</label>
                                    {editMode ? (
                                        <input className="pt-input" value={editData.name || ''} onChange={e => setEditData({ ...editData, name: e.target.value })} required />
                                    ) : (
                                        <div className="text-sm font-black text-slate-900 pt-outfit uppercase tracking-tight py-2 border-b border-transparent">{profile.name}</div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="pt-label text-slate-400">Vendor Type / Category</label>
                                    {editMode ? (
                                        <input className="pt-input" value={editData.vendorType || ''} onChange={e => setEditData({ ...editData, vendorType: e.target.value })} required />
                                    ) : (
                                        <div className="text-sm font-black text-slate-900 pt-outfit uppercase tracking-tight py-2 border-b border-transparent">{profile.vendorType || 'N/A'}</div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="pt-label text-slate-400">Tax ID / EIN</label>
                                    {editMode ? (
                                        <input className="pt-input" value={editData.taxId || ''} onChange={e => setEditData({ ...editData, taxId: e.target.value })} required />
                                    ) : (
                                        <div className="text-sm font-black text-slate-900 pt-outfit uppercase tracking-tight py-2 border-b border-transparent">{profile.taxId || 'N/A'}</div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="pt-label text-slate-400">Company Website</label>
                                    {editMode ? (
                                        <input className="pt-input" value={editData.website || ''} onChange={e => setEditData({ ...editData, website: e.target.value })} />
                                    ) : (
                                        <div className="text-sm font-black text-slate-900 pt-outfit uppercase tracking-tight py-2 border-b border-transparent">
                                            {profile.website ? (
                                                <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{profile.website}</a>
                                            ) : 'None'}
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="pt-label text-slate-400">Corporate Address</label>
                                    {editMode ? (
                                        <input className="pt-input" value={editData.address || ''} onChange={e => setEditData({ ...editData, address: e.target.value })} required />
                                    ) : (
                                        <div className="text-sm font-black text-slate-900 pt-outfit uppercase tracking-tight py-2 border-b border-transparent">{profile.address || 'N/A'}</div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="pt-label text-slate-400">Contact Email</label>
                                    <div className="text-sm font-black text-slate-400 pt-outfit uppercase tracking-tight py-2 border-b border-transparent opacity-60 flex items-center gap-2">
                                        {profile.email}
                                        <Shield className="w-3 h-3" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="pt-label text-slate-400">Contact Phone</label>
                                    {editMode ? (
                                        <input className="pt-input" value={editData.phone || ''} onChange={e => setEditData({ ...editData, phone: e.target.value })} />
                                    ) : (
                                        <div className="text-sm font-black text-slate-900 pt-outfit uppercase tracking-tight py-2 border-b border-transparent">{profile.phone || 'Not Configured'}</div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="pt-label text-slate-400">Member Since</label>
                                    <div className="text-sm font-black text-slate-900 pt-outfit uppercase tracking-tight py-2 border-b border-transparent">
                                        {new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="space-y-2">
                                    <label className="pt-label text-slate-400">Full Name</label>
                                    {editMode ? (
                                        <input className="pt-input" value={editData.name || ''} onChange={e => setEditData({ ...editData, name: e.target.value })} />
                                    ) : (
                                        <div className="text-sm font-black text-slate-900 pt-outfit uppercase tracking-tight py-2 border-b border-transparent">{profile.name}</div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="pt-label text-slate-400">Email</label>
                                    <div className="text-sm font-black text-slate-400 pt-outfit uppercase tracking-tight py-2 border-b border-transparent opacity-60 flex items-center gap-2">
                                        {profile.email}
                                        <Shield className="w-3 h-3" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="pt-label text-slate-400">Phone</label>
                                    {editMode ? (
                                        <input className="pt-input" value={editData.phone || ''} onChange={e => setEditData({ ...editData, phone: e.target.value })} />
                                    ) : (
                                        <div className="text-sm font-black text-slate-900 pt-outfit uppercase tracking-tight py-2 border-b border-transparent">{profile.phone || 'Not Configured'}</div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="pt-label text-slate-400">Department</label>
                                    {editMode ? (
                                        <input className="pt-input" value={editData.department || ''} onChange={e => setEditData({ ...editData, department: e.target.value })} />
                                    ) : (
                                        <div className="text-sm font-black text-slate-900 pt-outfit uppercase tracking-tight py-2 border-b border-transparent">{profile.department || 'General'}</div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="pt-label text-slate-400">Member Since</label>
                                    <div className="text-sm font-black text-slate-900 pt-outfit uppercase tracking-tight py-2 border-b border-transparent">
                                        {new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="pt-label text-slate-400">Position</label>
                                    {editMode ? (
                                        <input className="pt-input" value={editData.position || ''} onChange={e => setEditData({ ...editData, position: e.target.value })} />
                                    ) : (
                                        <div className="text-sm font-black text-slate-900 pt-outfit uppercase tracking-tight py-2 border-b border-transparent">{profile.position || 'Team Member'}</div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
