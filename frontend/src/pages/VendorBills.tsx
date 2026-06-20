import { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FileUp, ReceiptText } from 'lucide-react';

const money = (value: number, currency = 'CAD') => new Intl.NumberFormat('en-CA', { style: 'currency', currency }).format(value || 0);

const VendorBills = () => {
    const { user } = useAuth();
    const isVendor = user?.role === 'Vendor';
    const [bills, setBills] = useState<any[]>([]);
    const [summary, setSummary] = useState<any>(null);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({ invoiceNumber: '', billDate: '', category: '', description: '', subtotal: '', taxAmount: '', currency: 'CAD' });
    const [file, setFile] = useState<File | null>(null);

    const load = async () => {
        const billsRes = await api.get('/vendor-bills');
        setBills(billsRes.data);
        if (!isVendor) setSummary((await api.get('/vendor-bills/summary')).data);
    };
    useEffect(() => { load().catch(() => toast.error('Failed to load vendor bills')); }, [isVendor]);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return toast.error('Attach the audited bill PDF or image');
        setSaving(true);
        try {
            const data = new FormData();
            data.append('file', file);
            const upload = await api.post('/upload', data, { headers: { 'Content-Type': 'multipart/form-data' } });
            await api.post('/vendor-bills', { ...form, documentUrl: upload.data.filePath });
            toast.success('Audited bill submitted for review');
            setForm({ invoiceNumber: '', billDate: '', category: '', description: '', subtotal: '', taxAmount: '', currency: 'CAD' });
            setFile(null);
            await load();
        } catch (err: any) { toast.error(err.response?.data?.message || 'Bill submission failed'); }
        finally { setSaving(false); }
    };

    const total = useMemo(() => bills.reduce((sum, b) => sum + b.totalAmount, 0), [bills]);
    const updateStatus = async (bill: any, status: string) => {
        await api.put(`/vendor-bills/${bill._id}/status`, { status, auditNotes: bill.auditNotes });
        toast.success(`Invoice marked ${status}`);
        await load();
    };

    return <div className="space-y-10">
        <div><h2 className="text-[10px] font-extrabold text-emerald-500 uppercase tracking-[0.3em] mb-2">Accounts Payable</h2><h1 className="text-4xl pt-title-gradient pt-outfit">{isVendor ? 'My Audited Bills' : 'Vendor Bill Review'}</h1><p className="text-slate-400 text-sm mt-3">{isVendor ? 'Submit invoices for products and services delivered to the company.' : 'Audit vendor submissions, review totals, and track payment status.'}</p></div>
        {!isVendor && <div className="grid md:grid-cols-3 gap-5">
            <div className="pt-glass-card p-6"><p className="pt-label">All submitted value</p><p className="text-3xl font-black mt-2">{money(total)}</p></div>
            <div className="pt-glass-card p-6"><p className="pt-label">Invoices</p><p className="text-3xl font-black mt-2">{bills.length}</p></div>
            <div className="pt-glass-card p-6"><p className="pt-label">Approved / Paid</p><p className="text-3xl font-black mt-2">{bills.filter(b => ['Approved','Paid'].includes(b.status)).length}</p></div>
        </div>}
        {isVendor && <form onSubmit={submit} className="pt-glass-card p-7 space-y-5">
            <div className="flex items-center gap-3"><FileUp className="text-blue-600" /><h2 className="font-black">Submit audited bill</h2></div>
            <div className="grid md:grid-cols-3 gap-4">
                <input required className="pt-input" placeholder="Invoice number" value={form.invoiceNumber} onChange={e => setForm({...form, invoiceNumber:e.target.value})} />
                <input required type="date" className="pt-input" value={form.billDate} onChange={e => setForm({...form, billDate:e.target.value})} />
                <input required className="pt-input" placeholder="Product/service category" value={form.category} onChange={e => setForm({...form, category:e.target.value})} />
                <input required min="0" step="0.01" type="number" className="pt-input" placeholder="Subtotal" value={form.subtotal} onChange={e => setForm({...form, subtotal:e.target.value})} />
                <input required min="0" step="0.01" type="number" className="pt-input" placeholder="Tax amount" value={form.taxAmount} onChange={e => setForm({...form, taxAmount:e.target.value})} />
                <select className="pt-input" value={form.currency} onChange={e => setForm({...form, currency:e.target.value})}><option>CAD</option><option>USD</option></select>
            </div>
            <textarea className="pt-input" placeholder="Description of delivered products or services" value={form.description} onChange={e => setForm({...form, description:e.target.value})} />
            <input required type="file" accept=".pdf,.png,.jpg,.jpeg" className="pt-input" onChange={e => setFile(e.target.files?.[0] || null)} />
            <button disabled={saving} className="pt-btn-primary">{saving ? 'Submitting…' : 'Submit for Audit'}</button>
        </form>}
        <div className="pt-glass-card overflow-x-auto">
            <table className="w-full"><thead><tr className="border-b border-slate-100">{!isVendor && <th className="p-4 text-left pt-label">Vendor</th>}<th className="p-4 text-left pt-label">Invoice</th><th className="p-4 text-left pt-label">Category</th><th className="p-4 text-left pt-label">Total</th><th className="p-4 text-left pt-label">Status</th><th className="p-4 text-left pt-label">Document</th>{!isVendor && <th className="p-4 text-left pt-label">Review</th>}</tr></thead>
            <tbody>{bills.map(b => <tr key={b._id} className="border-b border-slate-50">
                {!isVendor && <td className="p-4 text-sm font-bold">{b.vendor?.companyName || b.vendor?.name}</td>}<td className="p-4 text-sm">{b.invoiceNumber}<div className="text-xs text-slate-400">{new Date(b.billDate).toLocaleDateString()}</div></td><td className="p-4 text-sm">{b.category}</td><td className="p-4 font-black">{money(b.totalAmount, b.currency)}</td><td className="p-4"><span className="pt-badge-info">{b.status}</span></td><td className="p-4"><a className="text-blue-600 text-sm font-bold" target="_blank" rel="noreferrer" href={`http://localhost:5000${b.documentUrl}`}>View bill</a></td>
                {!isVendor && <td className="p-4"><select className="pt-input py-2" value={b.status} onChange={e => updateStatus(b, e.target.value)}><option>Submitted</option><option>Under Review</option><option>Approved</option><option>Rejected</option><option>Paid</option></select></td>}
            </tr>)}</tbody></table>
            {!bills.length && <div className="p-16 text-center text-slate-400"><ReceiptText className="mx-auto mb-3" />No vendor bills submitted.</div>}
        </div>
        {!isVendor && summary?.byVendor?.length > 0 && <div className="pt-glass-card p-7"><h2 className="font-black mb-5">Totals by vendor</h2>{summary.byVendor.map((v:any) => <div key={v.vendorId} className="flex justify-between py-3 border-b border-slate-50"><span>{v.companyName || v.contactName} <small className="text-slate-400">({v.count} invoices)</small></span><strong>{money(v.total)}</strong></div>)}</div>}
    </div>;
};
export default VendorBills;
