import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { ArrowLeft, Mail, Calendar, Briefcase, FileText, ChevronRight, ReceiptText, ExternalLink } from 'lucide-react';

const EmployeeProfile = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [employee, setEmployee] = useState<any>(null);
    const [assignments, setAssignments] = useState<any[]>([]);
    const [documents, setDocuments] = useState<any[]>([]);
    const [bills, setBills] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const updateBillStatus = async (billId: string, status: string) => {
        try {
            const response = await api.put(`/vendor-bills/${billId}/status`, { status });
            setBills(current => current.map(bill => bill._id === billId ? response.data : bill));
            toast.success(`Bill marked ${status}`);
        } catch {
            toast.error('Could not update bill status');
        }
    };

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
                if (empRes.data.role === 'Vendor') {
                    const billRes = await api.get('/vendor-bills', { params: { vendorId: id } }).catch(() => ({ data: [] }));
                    setBills(Array.isArray(billRes.data) ? billRes.data : []);
                    setDocuments([]);
                } else {
                    const documentRes = await api.get('/documents', { params: { userId: id } }).catch(() => ({ data: [] }));
                    setDocuments(Array.isArray(documentRes.data) ? documentRes.data : []);
                    setBills([]);
                }
            } catch (err) {
                console.error(err);
                toast.error('Failed to load profile');
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
                <h2 className="text-xl font-black text-slate-800 uppercase">Profile Not Found</h2>
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
                    onClick={() => navigate(employee?.role === 'Vendor' ? '/vendors' : '/employees')}
                    className="p-3 bg-white border border-slate-100 hover:bg-slate-50 rounded-2xl transition-all"
                >
                    <ArrowLeft className="w-5 h-5 text-slate-600" />
                </button>
                <div>
                    <h1 className="text-4xl pt-title-gradient pt-outfit">{employee.role === 'Vendor' ? 'Vendor Record' : 'Employee Record'}</h1>
                </div>
            </div>

            {/* Profile Info Card */}
            <div className="pt-glass-card p-10 flex flex-col md:flex-row gap-10 items-start md:items-center">
                <div className="w-24 h-24 rounded-[36px] bg-slate-900 flex items-center justify-center text-3xl font-black text-white shadow-xl shadow-slate-950/20">
                    {employee.companyName?.charAt(0) || employee.name?.charAt(0)}
                </div>
                <div className="flex-1 space-y-4">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 pt-outfit uppercase">
                            {employee.role === 'Vendor' && employee.companyName ? employee.companyName : employee.name}
                        </h2>
                        <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mt-1">
                            {employee.role} {employee.role === 'Vendor' && employee.vendorType ? `(${employee.vendorType})` : ''}
                        </p>
                    </div>
                    {employee.role === 'Vendor' ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 pt-2 border-t border-slate-50">
                            <div className="flex items-center gap-2.5 text-slate-500">
                                <Mail className="w-4 h-4 text-slate-400" />
                                <span className="text-xs font-bold">{employee.email} (Contact: {employee.name})</span>
                            </div>
                            {employee.taxId && (
                                <div className="flex items-center gap-2.5 text-slate-500">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tax ID:</span>
                                    <span className="text-xs font-bold">{employee.taxId}</span>
                                </div>
                            )}
                            {employee.website && (
                                <div className="flex items-center gap-2.5 text-slate-500">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Website:</span>
                                    <span className="text-xs font-bold">
                                        <a href={employee.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{employee.website}</a>
                                    </span>
                                </div>
                            )}
                            {employee.address && (
                                <div className="col-span-1 sm:col-span-2 md:col-span-3 flex items-center gap-2.5 text-slate-500">
                                    <span className="text-xs font-bold text-slate-400 text-[9px] uppercase tracking-wider">Address:</span>
                                    <span className="text-xs font-bold">{employee.address}</span>
                                </div>
                            )}
                        </div>
                    ) : (
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
                    )}
                </div>
                <div className="w-full md:w-auto px-6 py-3 bg-slate-50 rounded-2xl text-center">
                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-0.5">Status</div>
                    <span className="text-xs font-bold text-slate-800 uppercase">{employee.status || 'Active'}</span>
                </div>
            </div>

            {employee.role === 'Vendor' ? (
                <div className="space-y-6">
                    <div className="flex items-end justify-between gap-4">
                        <div>
                            <h3 className="text-lg font-black text-slate-900 pt-outfit uppercase tracking-tight">Submitted Bills</h3>
                            <p className="text-slate-400 text-xs font-medium mt-1">Audited invoices submitted by this vendor.</p>
                        </div>
                        <div className="text-right">
                            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total submitted</div>
                            <div className="text-2xl font-black text-slate-900">
                                {new Intl.NumberFormat('en-CA', { style: 'currency', currency: bills[0]?.currency || 'CAD' }).format(bills.reduce((sum, bill) => sum + (bill.totalAmount || 0), 0))}
                            </div>
                        </div>
                    </div>
                    <div className="pt-glass-card overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50"><tr>
                                <th className="px-6 py-4 pt-label">Invoice</th><th className="px-6 py-4 pt-label">Service / Product</th>
                                <th className="px-6 py-4 pt-label">Total</th><th className="px-6 py-4 pt-label">Review status</th><th className="px-6 py-4 pt-label">Bill</th>
                            </tr></thead>
                            <tbody className="divide-y divide-slate-50">
                                {bills.map(bill => <tr key={bill._id}>
                                    <td className="px-6 py-4 text-sm font-bold">{bill.invoiceNumber}<div className="text-xs text-slate-400">{new Date(bill.billDate).toLocaleDateString()}</div></td>
                                    <td className="px-6 py-4 text-sm">{bill.category}</td>
                                    <td className="px-6 py-4 text-sm font-black">{new Intl.NumberFormat('en-CA', { style: 'currency', currency: bill.currency || 'CAD' }).format(bill.totalAmount || 0)}</td>
                                    <td className="px-6 py-4">
                                        <select className="pt-input py-2 min-w-36" value={bill.status} onChange={event => updateBillStatus(bill._id, event.target.value)}>
                                            <option>Submitted</option><option>Under Review</option><option>Approved</option><option>Rejected</option><option>Paid</option>
                                        </select>
                                    </td>
                                    <td className="px-6 py-4"><a href={`http://localhost:5000${bill.documentUrl}`} target="_blank" rel="noreferrer" className="text-blue-600 font-bold text-xs inline-flex items-center gap-1"><ReceiptText className="w-4 h-4" /> View <ExternalLink className="w-3 h-3" /></a></td>
                                </tr>)}
                                {!bills.length && <tr><td colSpan={5} className="py-16 text-center text-slate-300 text-[10px] font-black uppercase tracking-widest">No bills submitted by this vendor.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    <div>
                        <h3 className="text-lg font-black text-slate-900 pt-outfit uppercase tracking-tight">Uploaded Documents</h3>
                        <p className="text-slate-400 text-xs font-medium mt-1">Files uploaded by this employee while completing assigned workflows.</p>
                    </div>
                    <div className="pt-glass-card overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50"><tr><th className="px-6 py-4 pt-label">Document</th><th className="px-6 py-4 pt-label">Workflow</th><th className="px-6 py-4 pt-label">Uploaded</th><th className="px-6 py-4 pt-label">Action</th></tr></thead>
                            <tbody className="divide-y divide-slate-50">
                                {documents.map(doc => <tr key={doc._id}><td className="px-6 py-4 text-sm font-bold flex items-center gap-2"><FileText className="w-4 h-4 text-blue-500" />{doc.fileName}</td><td className="px-6 py-4 text-sm">{doc.workflowName}</td><td className="px-6 py-4 text-sm text-slate-500">{new Date(doc.date).toLocaleDateString()}</td><td className="px-6 py-4"><a href={`http://localhost:5000${doc.url}`} target="_blank" rel="noreferrer" className="text-blue-600 font-bold text-xs">View document</a></td></tr>)}
                                {!documents.length && <tr><td colSpan={4} className="py-16 text-center text-slate-300 text-[10px] font-black uppercase tracking-widest">No documents uploaded by this employee.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

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
                </div>
            </div>
        </div>
    );
};

export default EmployeeProfile;
