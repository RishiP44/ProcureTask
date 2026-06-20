import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Building2, Plus, Search, X } from 'lucide-react';

const Vendors = () => {
    const navigate = useNavigate();
    const [vendors, setVendors] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [showInvite, setShowInvite] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({ name: '', email: '', companyName: '', vendorType: '', taxId: '', website: '', address: '', role: 'Vendor' });

    const load = async () => {
        const res = await api.get('/users', { params: { role: 'Vendor' } });
        setVendors(res.data);
    };
    useEffect(() => { load().catch(() => toast.error('Failed to load vendors')); }, []);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.post('/auth/invite', form);
            toast.success('Vendor invitation sent');
            setShowInvite(false);
            setForm({ name: '', email: '', companyName: '', vendorType: '', taxId: '', website: '', address: '', role: 'Vendor' });
            await load();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Could not invite vendor');
        } finally { setSaving(false); }
    };

    const filtered = vendors.filter(v => [v.companyName, v.name, v.email, v.vendorType].join(' ').toLowerCase().includes(search.toLowerCase()));

    return <div className="space-y-10">
        <div className="flex items-end justify-between gap-6">
            <div>
                <h2 className="text-[10px] font-extrabold text-amber-500 uppercase tracking-[0.3em] mb-2">Supply Network</h2>
                <h1 className="text-4xl pt-title-gradient pt-outfit">Vendor Directory</h1>
                <p className="text-slate-400 text-sm mt-3">External product and service providers are managed independently from employees.</p>
            </div>
            <button className="pt-btn-primary" onClick={() => setShowInvite(true)}><Plus className="w-4 h-4" /> Invite Vendor</button>
        </div>
        <div className="pt-glass-card p-4 relative">
            <Search className="absolute left-8 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input className="w-full pl-11 border-none bg-transparent text-sm" placeholder="Search company, contact, category, or email" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filtered.map(v => <button key={v._id} onClick={() => navigate(`/vendors/${v._id}`)} className="pt-glass-card-hover p-7 text-left">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl"><Building2 className="w-6 h-6" /></div>
                    <div>
                        <h3 className="font-black text-slate-900">{v.companyName || v.name}</h3>
                        <p className="text-xs text-slate-500 mt-1">{v.vendorType || 'Vendor partner'}</p>
                        <p className="text-[10px] uppercase tracking-wider text-slate-400 mt-4">Contact: {v.name} · {v.email}</p>
                    </div>
                </div>
            </button>)}
        </div>
        {showInvite && <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4">
            <form onSubmit={submit} className="bg-white rounded-3xl p-8 w-full max-w-2xl space-y-5 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between"><div><h2 className="text-2xl font-black">Invite Vendor</h2><p className="text-sm text-slate-400">Create an external supplier or service-provider account.</p></div><button type="button" onClick={() => setShowInvite(false)}><X /></button></div>
                <div className="grid md:grid-cols-2 gap-4">
                    <input required className="pt-input" placeholder="Company name" value={form.companyName} onChange={e => setForm({...form, companyName:e.target.value})} />
                    <input required className="pt-input" placeholder="Vendor category" value={form.vendorType} onChange={e => setForm({...form, vendorType:e.target.value})} />
                    <input required className="pt-input" placeholder="Contact name" value={form.name} onChange={e => setForm({...form, name:e.target.value})} />
                    <input required type="email" className="pt-input" placeholder="Contact email" value={form.email} onChange={e => setForm({...form, email:e.target.value})} />
                    <input required className="pt-input" placeholder="Tax ID / business number" value={form.taxId} onChange={e => setForm({...form, taxId:e.target.value})} />
                    <input className="pt-input" placeholder="Website" value={form.website} onChange={e => setForm({...form, website:e.target.value})} />
                </div>
                <input required className="pt-input" placeholder="Business address" value={form.address} onChange={e => setForm({...form, address:e.target.value})} />
                <div className="flex justify-end gap-3"><button type="button" className="pt-btn-secondary" onClick={() => setShowInvite(false)}>Cancel</button><button disabled={saving} className="pt-btn-primary">{saving ? 'Sending…' : 'Send Vendor Invite'}</button></div>
            </form>
        </div>}
    </div>;
};

export default Vendors;
