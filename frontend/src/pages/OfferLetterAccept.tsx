import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
    Briefcase, Calendar, Building2, DollarSign, CheckCircle2,
    XCircle, Loader2, Lock, User, Clock, ArrowRight
} from 'lucide-react';

const OfferLetterAccept = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [offer, setOffer] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [action, setAction] = useState<'view' | 'accept' | 'decline' | 'done'>('view');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [candidateName, setCandidateName] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState<{ type: 'accepted' | 'declined'; userData?: any } | null>(null);

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await api.get(`/offer-letters/${token}`);
                setOffer(res.data);
                setCandidateName(res.data.candidate?.name || '');
            } catch {
                toast.error('Offer letter not found or expired');
            } finally { setLoading(false); }
        };
        fetch();
    }, [token]);

    const handleRespond = async (responseAction: 'accept' | 'decline') => {
        if (responseAction === 'accept') {
            if (password !== confirmPassword) { toast.error('Passwords do not match'); return; }
            if (password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
        }
        setSubmitting(true);
        try {
            const res = await api.post(`/offer-letters/${token}/respond`, {
                action: responseAction,
                name: candidateName,
                password: responseAction === 'accept' ? password : undefined,
            });
            setResult({ type: responseAction, userData: res.data.user });
            setAction('done');
            if (responseAction === 'accept') {
                toast.success('Offer accepted! Account created 🎉');
            } else {
                toast.success('Offer declined.');
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Something went wrong');
        } finally { setSubmitting(false); }
    };

    if (loading) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="text-center">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-3" />
                <p className="text-slate-500">Loading your offer letter…</p>
            </div>
        </div>
    );

    if (!offer) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="text-center max-w-sm">
                <XCircle className="w-14 h-14 text-red-400 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-slate-900 mb-2">Offer Not Found</h2>
                <p className="text-slate-500">This offer letter link may be invalid or expired.</p>
            </div>
        </div>
    );

    const alreadyResponded = offer.status !== 'pending';

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-800 to-blue-600 text-white py-5 px-6">
                <div className="max-w-3xl mx-auto flex items-center gap-3">
                    <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                        <Briefcase className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="font-bold text-lg">ProcureTask</h1>
                        <p className="text-blue-200 text-xs">HR & Workforce Management</p>
                    </div>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 py-8">
                {/* Already responded */}
                {alreadyResponded && action !== 'done' && (
                    <div className={`pt-card p-8 text-center ${offer.status === 'accepted' ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
                        {offer.status === 'accepted'
                            ? <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto mb-4" />
                            : <XCircle className="w-14 h-14 text-red-400 mx-auto mb-4" />
                        }
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">
                            {offer.status === 'accepted' ? 'Offer Accepted' : 'Offer Declined'}
                        </h2>
                        <p className="text-slate-500">This offer has already been {offer.status}.</p>
                        {offer.status === 'accepted' && (
                            <button onClick={() => navigate('/login')} className="pt-btn-primary mt-6">
                                Sign In to ProcureTask <ArrowRight className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                )}

                {/* Done (just responded) */}
                {action === 'done' && result && (
                    <div className={`pt-card p-8 text-center animate-fade-in-up ${result.type === 'accepted' ? 'bg-emerald-50 border-emerald-200' : ''}`}>
                        {result.type === 'accepted' ? (
                            <>
                                <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                                <h2 className="text-2xl font-bold text-slate-900 mb-2">Welcome to the team! 🎉</h2>
                                <p className="text-slate-500 mb-2">You've successfully accepted the offer.</p>
                                <p className="text-slate-500 mb-6">Your account has been created — sign in to access ProcureTask and your onboarding tasks.</p>
                                <button onClick={() => navigate('/login')} className="pt-btn-primary text-base px-8 py-3">
                                    Sign In to Get Started <ArrowRight className="w-4 h-4" />
                                </button>
                            </>
                        ) : (
                            <>
                                <XCircle className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                                <h2 className="text-2xl font-bold text-slate-900 mb-2">Offer Declined</h2>
                                <p className="text-slate-500">You've declined this offer. If you change your mind, please contact HR.</p>
                            </>
                        )}
                    </div>
                )}

                {/* View / Respond UI */}
                {!alreadyResponded && action !== 'done' && (
                    <>
                        {/* Congratulations header */}
                        <div className="pt-card p-8 mb-5 animate-fade-in-up text-center bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
                            <div className="text-4xl mb-3">🎉</div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-2">Congratulations, {offer.candidate?.name}!</h2>
                            <p className="text-slate-500">You have received an offer of employment. Please review the details below.</p>
                        </div>

                        {/* Offer Details */}
                        <div className="pt-card p-6 mb-5 animate-fade-in-up">
                            <h3 className="font-bold text-slate-900 mb-4">Offer Details</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {[
                                    { icon: <Briefcase className="w-4 h-4" />, label: 'Position', value: offer.position },
                                    { icon: <Building2 className="w-4 h-4" />, label: 'Department', value: offer.department },
                                    { icon: <Calendar className="w-4 h-4" />, label: 'Start Date', value: new Date(offer.startDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) },
                                    ...(offer.salary ? [{ icon: <DollarSign className="w-4 h-4" />, label: 'Compensation', value: offer.salary }] : []),
                                ].map(item => (
                                    <div key={item.label} className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl">
                                        <span className="text-slate-400 mt-0.5">{item.icon}</span>
                                        <div>
                                            <div className="text-xs text-slate-400 mb-0.5">{item.label}</div>
                                            <div className="font-semibold text-slate-900 text-sm">{item.value}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {offer.message && (
                                <div className="mt-4 p-4 bg-blue-50 rounded-xl border-l-4 border-blue-500">
                                    <p className="text-sm text-slate-700 italic">"{offer.message}"</p>
                                    {offer.sentBy && <p className="text-xs text-slate-400 mt-1">— {offer.sentBy.name}</p>}
                                </div>
                            )}
                        </div>

                        {/* Accept Form */}
                        {action === 'accept' && (
                            <div className="pt-card p-6 mb-5 animate-fade-in-up border-blue-200 bg-blue-50/30">
                                <h3 className="font-bold text-slate-900 mb-1">Create Your Account</h3>
                                <p className="text-sm text-slate-500 mb-4">Set a password to access ProcureTask after accepting</p>
                                <div className="space-y-4">
                                    <div>
                                        <label className="pt-label">Your Name</label>
                                        <div className="relative">
                                            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input className="pt-input pl-10" value={candidateName}
                                                onChange={e => setCandidateName(e.target.value)} required />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="pt-label">Password</label>
                                        <div className="relative">
                                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input type="password" className="pt-input pl-10" placeholder="Min. 6 characters"
                                                value={password} onChange={e => setPassword(e.target.value)} required />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="pt-label">Confirm Password</label>
                                        <div className="relative">
                                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input type="password" className="pt-input pl-10" placeholder="Repeat password"
                                                value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-3 mt-5">
                                    <button onClick={() => setAction('view')} className="pt-btn-secondary flex-1 justify-center">Back</button>
                                    <button onClick={() => handleRespond('accept')} disabled={submitting} className="pt-btn-primary flex-1 justify-center">
                                        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                        {submitting ? 'Creating Account…' : 'Accept & Create Account'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        {action === 'view' && (
                            <div className="flex flex-col sm:flex-row gap-3 animate-fade-in-up">
                                <button onClick={() => handleRespond('decline')} disabled={submitting}
                                    className="pt-btn-secondary flex-1 justify-center border-red-200 text-red-600 hover:bg-red-50">
                                    <XCircle className="w-4 h-4" /> Decline Offer
                                </button>
                                <button onClick={() => setAction('accept')} className="pt-btn-primary flex-1 justify-center py-3 text-base">
                                    <CheckCircle2 className="w-4 h-4" /> Accept Offer & Create Account
                                </button>
                            </div>
                        )}

                        <p className="text-center text-xs text-slate-400 mt-4">
                            <Clock className="w-3 h-3 inline mr-1" />
                            This offer link expires after acceptance or in 7 days
                        </p>
                    </>
                )}
            </div>
        </div>
    );
};

export default OfferLetterAccept;
