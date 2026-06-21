import React, { useEffect, useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { 
    Search, RefreshCw, FileSpreadsheet,
    ChevronDown, ChevronUp, Clock, ShieldAlert,
    CheckCircle2, DollarSign, Layers
} from 'lucide-react';

const actionLabels: Record<string, string> = {
    workflow_created: 'Workflow Created',
    workflow_updated: 'Workflow Updated',
    workflow_archived: 'Workflow Archived',
    assignment_created: 'Workflow Assigned',
    task_completed: 'Task Completed',
    document_uploaded: 'Document Uploaded',
    workflow_completed: 'Workflow Completed',
    offer_letter_created: 'Offer Letter Sent',
    offer_letter_accepted: 'Offer Accepted',
    offer_letter_rejected: 'Offer Declined',
    offer_letter_revoked: 'Offer Revoked',
    vendor_bill_submitted: 'Vendor Bill Submitted',
    vendor_bill_status_changed: 'Vendor Bill Reviewed'
};

const actionBadges: Record<string, string> = {
    workflow_created: 'bg-blue-50 text-blue-600 border-blue-100',
    workflow_updated: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    workflow_archived: 'bg-rose-50 text-rose-600 border-rose-100',
    assignment_created: 'bg-violet-50 text-violet-600 border-violet-100',
    task_completed: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    document_uploaded: 'bg-cyan-50 text-cyan-600 border-cyan-100',
    workflow_completed: 'bg-teal-50 text-teal-600 border-teal-100',
    offer_letter_created: 'bg-amber-50 text-amber-600 border-amber-100',
    offer_letter_accepted: 'bg-green-50 text-green-600 border-green-100',
    offer_letter_rejected: 'bg-rose-50 text-rose-600 border-rose-100',
    offer_letter_revoked: 'bg-red-50 text-red-600 border-red-100',
    vendor_bill_submitted: 'bg-purple-50 text-purple-600 border-purple-100',
    vendor_bill_status_changed: 'bg-pink-50 text-pink-600 border-pink-100'
};

const AuditLogs = () => {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

    // Filters
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const params: any = {};
            if (startDate) params.startDate = startDate;
            if (endDate) params.endDate = endDate;
            if (search) params.search = search;
            if (categoryFilter !== 'all') {
                params.targetType = categoryFilter; // e.g. Workflow, Assignment, VendorBill, OfferLetter
            }

            const res = await api.get('/audit-logs', { params });
            setLogs(res.data);
        } catch (err: any) {
            toast.error('Failed to sync system audit logs');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, [categoryFilter, startDate, endDate]);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        fetchLogs();
    };

    const toggleExpandLog = (id: string) => {
        setExpandedLogId(expandedLogId === id ? null : id);
    };

    // Calculate metrics
    const totalCount = logs.length;
    const workflowEvents = logs.filter(l => l.targetType === 'Workflow').length;
    const taskCompletions = logs.filter(l => l.action === 'task_completed').length;
    const documentUploads = logs.filter(l => l.action === 'document_uploaded').length;
    const financialsAndBills = logs.filter(l => l.targetType === 'VendorBill').length;

    // Export current logs list to CSV
    const exportLogsToCSV = () => {
        try {
            const headers = ['Timestamp', 'Actor Name', 'Actor Email', 'Actor Role', 'Category', 'Action Type', 'Details', 'IP Address'];
            
            const rows = logs.map(l => {
                const actorName = l.actor?.name || 'Public / System';
                const actorEmail = l.actor?.email || 'N/A';
                const actorRole = l.actor?.role || 'N/A';
                const timestamp = new Date(l.createdAt).toLocaleString();
                const category = l.targetType;
                const actionName = actionLabels[l.action] || l.action;
                const details = `"${l.details.replace(/"/g, '""')}"`;
                const ip = l.ipAddress || 'N/A';

                return [timestamp, actorName, actorEmail, actorRole, category, actionName, details, ip].join(',');
            });

            const csvContent = [headers.join(','), ...rows].join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.setAttribute('href', url);
            link.setAttribute('download', `ProcureTrack_AuditLog_${new Date().toISOString().slice(0, 10)}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast.success('Audit trail logs exported as CSV!');
        } catch (err) {
            toast.error('Failed to export logs');
        }
    };

    return (
        <div className="animate-fade-in space-y-10 pb-20 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h2 className="text-[10px] font-extrabold text-blue-500 uppercase tracking-[0.3em] mb-2 font-black">Audit Trail</h2>
                    <h1 className="text-4xl pt-title-gradient pt-outfit">Security & Activity Logs</h1>
                    <p className="text-slate-400 text-sm mt-3 font-medium">
                        Access real-time compliance records of administrative actions, task completions, and status changes.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={exportLogsToCSV}
                        className="pt-btn-secondary py-3 px-5 flex items-center gap-2 hover:bg-slate-100"
                        disabled={logs.length === 0}
                    >
                        <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Export CSV
                    </button>
                    <button 
                        onClick={fetchLogs}
                        disabled={loading}
                        className="pt-btn-primary py-3 px-5"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
                    </button>
                </div>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="pt-glass-card p-6 border-l-4 border-l-slate-900">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Events</span>
                        <Clock className="w-4 h-4 text-slate-400" />
                    </div>
                    <div className="text-3xl font-black text-slate-900 pt-outfit">{totalCount}</div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-2">Active Streams</p>
                </div>

                <div className="pt-glass-card p-6 border-l-4 border-l-blue-500">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Workflow Updates</span>
                        <Layers className="w-4 h-4 text-blue-500" />
                    </div>
                    <div className="text-3xl font-black text-slate-900 pt-outfit">{workflowEvents}</div>
                    <p className="text-[10px] font-bold text-blue-500 uppercase mt-2">Templates Altered</p>
                </div>

                <div className="pt-glass-card p-6 border-l-4 border-l-emerald-500">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Task Completions</span>
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div className="text-3xl font-black text-slate-900 pt-outfit">{taskCompletions}</div>
                    <p className="text-[10px] font-bold text-emerald-500 uppercase mt-2">{documentUploads} Document Uploads</p>
                </div>

                <div className="pt-glass-card p-6 border-l-4 border-l-purple-500">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Financial Audits</span>
                        <DollarSign className="w-4 h-4 text-purple-500" />
                    </div>
                    <div className="text-3xl font-black text-slate-900 pt-outfit">{financialsAndBills}</div>
                    <p className="text-[10px] font-bold text-purple-500 uppercase mt-2">Vendor Bills Logged</p>
                </div>
            </div>

            {/* Filter and Search controls */}
            <div className="pt-glass-card p-6 space-y-4 bg-slate-50/50">
                <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                            className="pt-input pl-9 text-xs py-2.5 w-full"
                            placeholder="Search logs by actor name, email, details or target ID..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    
                    <button type="submit" className="pt-btn-primary py-2.5 px-6 self-stretch md:self-auto text-xs">
                        Find Records
                    </button>
                </form>

                <div className="flex flex-wrap gap-4 items-center justify-between border-t border-slate-100/50 pt-4">
                    {/* Category tabs */}
                    <div className="flex flex-wrap gap-2">
                        {[
                            { key: 'all', label: 'All Log Streams' },
                            { key: 'Workflow', label: 'Workflows' },
                            { key: 'Assignment', label: 'Tasks & Onboarding' },
                            { key: 'VendorBill', label: 'Vendor Bills' },
                            { key: 'OfferLetter', label: 'Offer Letters' }
                        ].map(category => (
                            <button
                                key={category.key}
                                onClick={() => setCategoryFilter(category.key)}
                                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                                    categoryFilter === category.key 
                                        ? 'bg-slate-900 text-white shadow-md' 
                                        : 'text-slate-500 hover:text-slate-900 hover:bg-white/70'
                                }`}
                            >
                                {category.label}
                            </button>
                        ))}
                    </div>

                    {/* Date Filters */}
                    <div className="flex items-center gap-2 flex-wrap text-xs">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Date range</span>
                        <input 
                            type="date"
                            className="pt-input text-xs !py-1.5 !px-3 bg-white w-36"
                            value={startDate}
                            onChange={e => setStartDate(e.target.value)}
                        />
                        <span className="text-slate-400 font-bold">—</span>
                        <input 
                            type="date"
                            className="pt-input text-xs !py-1.5 !px-3 bg-white w-36"
                            value={endDate}
                            onChange={e => setEndDate(e.target.value)}
                        />
                        {(startDate || endDate) && (
                            <button 
                                onClick={() => { setStartDate(''); setEndDate(''); }}
                                className="text-[10px] font-black text-rose-500 hover:text-rose-600 uppercase tracking-widest pl-2"
                            >
                                Reset Range
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Logs Table */}
            <div className="pt-glass-card flex flex-col">
                {loading && logs.length === 0 ? (
                    <div className="p-20 text-center space-y-4">
                        <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mx-auto" />
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Querying audit database…</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/20">
                                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Timestamp</th>
                                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Actor</th>
                                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Event Type</th>
                                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Details</th>
                                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Inspect</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {logs.map(log => {
                                    const isExpanded = expandedLogId === log._id;
                                    const badgeClass = actionBadges[log.action] || 'bg-slate-50 text-slate-500 border-slate-100';
                                    const badgeText = actionLabels[log.action] || log.action;
                                    
                                    return (
                                        <React.Fragment key={log._id}>
                                            <tr className="hover:bg-slate-50/30 transition-colors">
                                                <td className="px-6 py-4 text-xs text-slate-400 whitespace-nowrap">
                                                    {new Date(log.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {log.actor ? (
                                                        <div className="flex flex-col">
                                                            <span className="text-xs font-black text-slate-900 uppercase">
                                                                {log.actor.role === 'Vendor' && log.actor.companyName 
                                                                    ? log.actor.companyName 
                                                                    : log.actor.name}
                                                            </span>
                                                            <span className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">
                                                                {log.actor.role} · {log.actor.email}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-col">
                                                            <span className="text-xs font-black text-slate-500 uppercase">Public Candidate / System</span>
                                                            <span className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">anonymous action</span>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`pt-badge ${badgeClass} text-[9px]`}>
                                                        {badgeText}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-xs font-medium text-slate-700 max-w-md">
                                                    <div className="line-clamp-2" title={log.details}>
                                                        {log.details}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <button 
                                                        onClick={() => toggleExpandLog(log._id)}
                                                        className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-900 transition-all inline-flex"
                                                    >
                                                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                                    </button>
                                                </td>
                                            </tr>

                                            {/* Expandable JSON detail block */}
                                            {isExpanded && (
                                                <tr className="bg-slate-50/40">
                                                    <td colSpan={5} className="px-8 py-5 border-b border-slate-100">
                                                        <div className="space-y-4 animate-fade-in">
                                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-3">
                                                                <div>
                                                                    <span>Event ID:</span>
                                                                    <div className="text-slate-800 font-black mt-1 font-mono text-[9px]">{log._id}</div>
                                                                </div>
                                                                <div>
                                                                    <span>Target Resource:</span>
                                                                    <div className="text-slate-800 font-black mt-1 font-mono text-[9px]">{log.targetType} ({log.targetId})</div>
                                                                </div>
                                                                <div>
                                                                    <span>IP Location:</span>
                                                                    <div className="text-slate-800 font-black mt-1">{log.ipAddress || 'Internal Network'}</div>
                                                                </div>
                                                                <div>
                                                                    <span>Operation Mode:</span>
                                                                    <div className="text-slate-800 font-black mt-1">REST API TRIGGER</div>
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Structured Event Metadata</h4>
                                                                <pre className="p-4 bg-slate-900 text-slate-200 rounded-xl text-[10px] font-semibold font-mono overflow-x-auto shadow-inner leading-relaxed">
                                                                    {JSON.stringify(log.metadata || {}, null, 4)}
                                                                </pre>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    );
                                })}

                                {logs.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="py-24 text-center">
                                            <ShieldAlert className="w-10 h-10 text-slate-200 mx-auto mb-4" />
                                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.25em]">No Log Streams Detected</h3>
                                            <p className="text-slate-300 text-[10px] font-bold mt-1 uppercase">Adjust search queries or trigger events to view entries.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AuditLogs;
