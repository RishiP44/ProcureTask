import React, { useEffect, useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
    SendHorizontal, Plus, Loader2, Mail,
    Check, Clock, FileText, TrendingUp
} from 'lucide-react';

const StatusBadge = ({ status }: { status: string }) => {
    const map: Record<string, string> = {
        pending: 'pt-badge-warning',
        accepted: 'pt-badge-success',
        declined: 'pt-badge-danger',
        expired: 'pt-badge-gray',
    };
    return <span className={map[status] || 'pt-badge-gray'}>{status}</span>;
};

const OfferLetters = () => {
    const [offers, setOffers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [form, setForm] = useState({
        candidateName: '',
        candidateEmail: '',
        position: '',
        department: '',
        startDate: '',
        salary: '',
        message: '',
    });

    useEffect(() => {
        fetchOffers();
    }, []);

    const fetchOffers = async () => {
        try {
            const res = await api.get('/offer-letters');
            setOffers(res.data);
        } catch { toast.error('Security handshake failed'); }
        finally { setLoading(false); }
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post('/offer-letters', form);
            toast.success(`Proposal transmission success: ${form.candidateEmail}`);
            setShowModal(false);
            setForm({ candidateName: '', candidateEmail: '', position: '', department: '', startDate: '', salary: '', message: '' });
            fetchOffers();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Transmission Interrupted');
        } finally { setSubmitting(false); }
    };

    const stats = {
        total: offers.length,
        pending: offers.filter(o => o.status === 'pending').length,
        accepted: offers.filter(o => o.status === 'accepted').length,
        conversion: offers.length > 0 ? Math.round((offers.filter(o => o.status === 'accepted').length / offers.length) * 100) : 0,
    };

    if (loading) {
        return (
            <div className="space-y-10">
                <div className="h-10 w-64 pt-skeleton" />
                <div className="grid grid-cols-4 gap-6">
                    {[1,2,3,4].map(i => <div key={i} className="h-32 pt-skeleton" />)}
                </div>
                <div className="h-96 pt-skeleton" />
            </div>
        );
    }

    return (
        <div className="space-y-12 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h2 className="text-[10px] font-extrabold text-blue-500 uppercase tracking-[0.3em] mb-2">Talent Acquisition</h2>
                    <h1 className="text-4xl pt-title-gradient pt-outfit">Employment Proposals</h1>
                    <p className="text-slate-400 text-sm mt-3 font-medium">Tracking <span className="text-slate-900 font-bold">{offers.length}</span> active candidate engagements.</p>
                </div>
                <button 
                    onClick={() => setShowModal(true)} 
                    className="pt-btn-primary h-12 shadow-xl shadow-blue-600/20"
                >
                    <Plus className="w-5 h-5" />
                    Generate Offer
                </button>
            </div>

            {/* Premium Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="pt-glass-card p-6 border-b-2 border-b-slate-900">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-slate-50 text-slate-600 rounded-xl"><FileText className="w-5 h-5" /></div>
                        <TrendingUp className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div className="text-3xl font-black text-slate-900 pt-outfit">{stats.total}</div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Total Dispatched</p>
                </div>
                <div className="pt-glass-card p-6 border-b-2 border-b-amber-400">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-amber-50 text-amber-600 rounded-xl"><Clock className="w-5 h-5" /></div>
                        <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                    </div>
                    <div className="text-3xl font-black text-slate-900 pt-outfit">{stats.pending}</div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Awaiting Signature</p>
                </div>
                <div className="pt-glass-card p-6 border-b-2 border-b-emerald-500">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl"><Check className="w-5 h-5" /></div>
                        <div className="text-[10px] font-bold text-emerald-600">+12%</div>
                    </div>
                    <div className="text-3xl font-black text-slate-900 pt-outfit">{stats.accepted}</div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Secured Talent</p>
                </div>
                <div className="pt-glass-card p-6 border-b-2 border-b-blue-500">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-xl"><TrendingUp className="w-5 h-5" /></div>
                        <span className="text-[10px] font-bold text-blue-500">Target 85%</span>
                    </div>
                    <div className="text-3xl font-black text-slate-900 pt-outfit">{stats.conversion}%</div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Close Rate</p>
                </div>
            </div>

            {/* List */}
            <div className="pt-glass-card overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50/50 border-b border-slate-50">
                        <tr>
                            <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Candidate Priority</th>
                            <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Target Role</th>
                            <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Deployment Date</th>
                            <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {offers.map(o => (
                            <tr key={o._id} className="hover:bg-slate-50/50 transition-colors group cursor-pointer">
                                <td className="px-8 py-5">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-black ring-4 ring-white shadow-lg">
                                            {o.candidate?.name?.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="text-sm font-black text-slate-900 uppercase group-hover:text-blue-600 transition-colors">{o.candidate?.name}</div>
                                            <div className="text-[10px] text-slate-400 font-bold">{o.candidate?.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-5">
                                    <div className="text-xs font-bold text-slate-800 uppercase tracking-tight">{o.position}</div>
                                    <div className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-0.5">{o.department}</div>
                                </td>
                                <td className="px-8 py-5 text-xs font-bold text-slate-600">
                                    {new Date(o.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </td>
                                <td className="px-8 py-5 text-right"><StatusBadge status={o.status} /></td>
                            </tr>
                        ))}
                        {offers.length === 0 && (
                            <tr>
                                <td colSpan={4} className="py-20 text-center">
                                    <Mail className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Zero outbound engagement detected</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" 
                            onClick={() => setShowModal(false)} 
                        />
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            className="relative bg-white rounded-[40px] shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
                        >
                            <div className="p-12 border-b border-slate-100 bg-slate-50/30 sticky top-0 bg-white z-10">
                                <h3 className="text-3xl font-black text-slate-900 pt-outfit">Generate Proposal</h3>
                                <p className="text-slate-400 text-sm mt-3 font-medium">Configure candidate parameters for automated delivery.</p>
                            </div>
                            <form onSubmit={handleSend} className="p-12 space-y-10">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="pt-label">Target Name</label>
                                        <input className="pt-input" placeholder="e.g. Alex Rivera" value={form.candidateName} onChange={e => setForm({ ...form, candidateName: e.target.value })} required />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="pt-label">Contact Endpoint</label>
                                        <input className="pt-input" placeholder="alex@future.com" value={form.candidateEmail} onChange={e => setForm({ ...form, candidateEmail: e.target.value })} required />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="pt-label">Strategic Role</label>
                                        <input className="pt-input" placeholder="Senior Architect" value={form.position} onChange={e => setForm({ ...form, position: e.target.value })} required />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="pt-label">Operational Hub</label>
                                        <input className="pt-input" placeholder="Engineering / R&D" value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} required />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="pt-label">Activation Date</label>
                                        <input type="date" className="pt-input" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} required />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="pt-label">Annual Allocation ($)</label>
                                        <input className="pt-input" placeholder="120,500" value={form.salary} onChange={e => setForm({ ...form, salary: e.target.value })} />
                                    </div>
                                </div>
                                
                                <div className="flex gap-4 pt-10">
                                    <button type="button" onClick={() => setShowModal(false)} className="pt-btn-secondary flex-1 py-4">Cancel Execution</button>
                                    <button type="submit" disabled={submitting} className="pt-btn-primary flex-1 py-4">
                                        {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <SendHorizontal className="w-5 h-5" />}
                                        {submitting ? 'Dispatching...' : 'Initiate Delivery'}
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

export default OfferLetters;
