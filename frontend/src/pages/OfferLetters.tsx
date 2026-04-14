import React, { useEffect, useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
    SendHorizonal, Plus, X, Loader2, Mail, Briefcase,
    Building2, Calendar, DollarSign, Check, Clock,
    FileText, Eye, UserPlus
} from 'lucide-react';

const StatusBadge = ({ status }: { status: string }) => {
    const map: Record<string, string> = {
        pending: 'pt-badge-yellow',
        accepted: 'pt-badge-green',
        declined: 'pt-badge-red',
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
        } catch { toast.error('Failed to load offer letters'); }
        finally { setLoading(false); }
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post('/offer-letters', form);
            toast.success(`Offer letter sent to ${form.candidateEmail}!`);
            setShowModal(false);
            setForm({ candidateName: '', candidateEmail: '', position: '', department: '', startDate: '', salary: '', message: '' });
            fetchOffers();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to send offer letter');
        } finally { setSubmitting(false); }
    };

    const stats = {
        total: offers.length,
        pending: offers.filter(o => o.status === 'pending').length,
        accepted: offers.filter(o => o.status === 'accepted').length,
        declined: offers.filter(o => o.status === 'declined').length,
    };

    return (
        <div className="animate-fade-in-up">
            <div className="pt-page-header">
                <div>
                    <h1 className="pt-page-title">Offer Letters</h1>
                    <p className="pt-page-subtitle">Send and track employment offer letters</p>
                </div>
                <button onClick={() => setShowModal(true)} className="pt-btn-primary">
                    <Plus className="w-4 h-4" /> Send Offer Letter
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 stagger">
                {[
                    { label: 'Total Sent', value: stats.total, color: 'text-slate-900', bg: 'bg-slate-100', icon: <FileText className="w-5 h-5 text-slate-500" /> },
                    { label: 'Pending', value: stats.pending, color: 'text-amber-600', bg: 'bg-amber-50', icon: <Clock className="w-5 h-5 text-amber-500" /> },
                    { label: 'Accepted', value: stats.accepted, color: 'text-emerald-600', bg: 'bg-emerald-50', icon: <Check className="w-5 h-5 text-emerald-500" /> },
                    { label: 'Declined', value: stats.declined, color: 'text-red-600', bg: 'bg-red-50', icon: <X className="w-5 h-5 text-red-500" /> },
                ].map(s => (
                    <div key={s.label} className="pt-stat-card animate-fade-in-up">
                        <div className="flex items-center justify-between">
                            <span className="text-slate-500 text-sm font-medium">{s.label}</span>
                            <div className={`w-9 h-9 ${s.bg} rounded-xl flex items-center justify-center`}>{s.icon}</div>
                        </div>
                        <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
                    </div>
                ))}
            </div>

            {/* Table */}
            {loading ? (
                <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="pt-skeleton h-20 rounded-2xl animate-pulse" />)}</div>
            ) : offers.length === 0 ? (
                <div className="text-center py-16">
                    <SendHorizonal className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                    <h3 className="text-slate-500 font-semibold">No offer letters sent yet</h3>
                    <p className="text-slate-400 text-sm mt-1">Send your first offer letter to a candidate</p>
                    <button onClick={() => setShowModal(true)} className="pt-btn-primary mt-6">
                        <Plus className="w-4 h-4" /> Send First Offer
                    </button>
                </div>
            ) : (
                <div className="pt-table-wrapper">
                    <table className="pt-table">
                        <thead>
                            <tr>
                                <th>Candidate</th>
                                <th>Position</th>
                                <th>Department</th>
                                <th>Start Date</th>
                                <th>Status</th>
                                <th>Sent</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {offers.map(o => (
                                <tr key={o._id}>
                                    <td>
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                                {o.candidate?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                                            </div>
                                            <div>
                                                <div className="font-semibold text-slate-900 text-sm">{o.candidate?.name}</div>
                                                <div className="text-xs text-slate-400">{o.candidate?.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="flex items-center gap-1.5 text-slate-700 text-sm">
                                            <Briefcase className="w-3.5 h-3.5 text-slate-400" /> {o.position}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="flex items-center gap-1.5 text-slate-600 text-sm">
                                            <Building2 className="w-3.5 h-3.5 text-slate-400" /> {o.department}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="flex items-center gap-1.5 text-slate-600 text-sm">
                                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                            {new Date(o.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </div>
                                    </td>
                                    <td><StatusBadge status={o.status} /></td>
                                    <td className="text-slate-400 text-xs">
                                        {new Date(o.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        {o.sentBy && <div className="text-slate-300">by {o.sentBy.name}</div>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Send Offer Letter Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto animate-fade-in-up">
                        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 sticky top-0 bg-white rounded-t-2xl z-10">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">Send Offer Letter</h2>
                                <p className="text-sm text-slate-400 mt-0.5">The candidate will receive a beautifully designed email</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-slate-100">
                                <X className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>

                        <form onSubmit={handleSend} className="p-6 space-y-4">
                            {/* Candidate Info */}
                            <div className="pb-3 border-b border-slate-100">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Candidate</p>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="pt-label">Full Name *</label>
                                        <input className="pt-input" placeholder="John Doe"
                                            value={form.candidateName} required
                                            onChange={e => setForm({ ...form, candidateName: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="pt-label">Email Address *</label>
                                        <input type="email" className="pt-input" placeholder="john@example.com"
                                            value={form.candidateEmail} required
                                            onChange={e => setForm({ ...form, candidateEmail: e.target.value })} />
                                    </div>
                                </div>
                            </div>

                            {/* Job Details */}
                            <div className="pb-3 border-b border-slate-100">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Job Details</p>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="pt-label">Position *</label>
                                        <input className="pt-input" placeholder="Software Engineer"
                                            value={form.position} required
                                            onChange={e => setForm({ ...form, position: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="pt-label">Department *</label>
                                        <input className="pt-input" placeholder="Engineering"
                                            value={form.department} required
                                            onChange={e => setForm({ ...form, department: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="pt-label">Start Date *</label>
                                        <input type="date" className="pt-input"
                                            value={form.startDate} required
                                            onChange={e => setForm({ ...form, startDate: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="pt-label">Compensation (Optional)</label>
                                        <input className="pt-input" placeholder="e.g. $85,000/year"
                                            value={form.salary}
                                            onChange={e => setForm({ ...form, salary: e.target.value })} />
                                    </div>
                                </div>
                            </div>

                            {/* Message */}
                            <div>
                                <label className="pt-label">Personal Message (Optional)</label>
                                <textarea rows={3} className="pt-input resize-none"
                                    placeholder="Add a personal note to the candidate…"
                                    value={form.message}
                                    onChange={e => setForm({ ...form, message: e.target.value })} />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowModal(false)} className="pt-btn-secondary flex-1 justify-center">
                                    Cancel
                                </button>
                                <button type="submit" disabled={submitting} className="pt-btn-primary flex-1 justify-center">
                                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <SendHorizonal className="w-4 h-4" />}
                                    {submitting ? 'Sending…' : 'Send Offer Letter'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OfferLetters;
