import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
    User, Mail, Phone, Building2, Briefcase, Calendar,
    Edit2, Check, X, Loader2, Camera, Shield
} from 'lucide-react';

const getInitials = (name: string) =>
    name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

const Profile = () => {
    const { user, login } = useAuth();
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
            } catch { toast.error('Failed to load profile'); }
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
            toast.success('Profile updated!');
        } catch { toast.error('Update failed'); }
        finally { setSaving(false); }
    };

    if (loading) return (
        <div className="animate-pulse max-w-2xl mx-auto space-y-4">
            <div className="pt-skeleton h-48 rounded-2xl" />
            <div className="pt-skeleton h-64 rounded-2xl" />
        </div>
    );

    if (!profile) return null;

    return (
        <div className="animate-fade-in-up max-w-2xl mx-auto">
            <div className="mb-10 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">My Profile</h1>
                    <p className="text-slate-500 text-sm mt-1">Information and account settings</p>
                </div>
                {!editMode ? (
                    <button onClick={() => setEditMode(true)} className="px-4 py-2 border border-slate-200 text-slate-900 text-xs font-bold rounded-md uppercase tracking-wider">
                        Edit Profile
                    </button>
                ) : (
                    <div className="flex gap-2">
                        <button onClick={() => { setEditMode(false); setEditData(profile); }} className="px-4 py-2 border border-slate-200 text-slate-900 text-xs font-bold rounded-md uppercase tracking-wider">
                            Cancel
                        </button>
                        <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-md uppercase tracking-wider">
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                )}
            </div>

            {/* Basic Info */}
            <div className="p-8 bg-white border border-gray-100 rounded-lg mb-6">
                <div className="text-2xl font-bold text-slate-900 mb-1">{profile.name}</div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{profile.position || profile.role}</div>
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Email Address</span>
                        <div className="text-sm font-medium text-slate-900">{profile.email}</div>
                    </div>
                    <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Phone Number</span>
                        {editMode ? (
                            <input className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-sm" 
                                value={editData.phone || ''} onChange={e => setEditData({ ...editData, phone: e.target.value })} />
                        ) : (
                            <div className="text-sm font-medium text-slate-900">{profile.phone || '—'}</div>
                        )}
                    </div>
                    <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Department</span>
                        {editMode ? (
                            <input className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-sm" 
                                value={editData.department || ''} onChange={e => setEditData({ ...editData, department: e.target.value })} />
                        ) : (
                            <div className="text-sm font-medium text-slate-900">{profile.department || '—'}</div>
                        )}
                    </div>
                    <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Member Since</span>
                        <div className="text-sm font-medium text-slate-900">
                            {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : '—'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Role/Status */}
            <div className="p-8 bg-white border border-gray-100 rounded-lg">
                <div className="flex items-center gap-12">
                    <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">System Role</span>
                        <div className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded uppercase tracking-wider inline-block">
                            {profile.role}
                        </div>
                    </div>
                    <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Account Status</span>
                        <div className="text-xs font-bold text-green-700 bg-green-50 px-2 py-1 rounded uppercase tracking-wider inline-block">
                            {profile.status}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
