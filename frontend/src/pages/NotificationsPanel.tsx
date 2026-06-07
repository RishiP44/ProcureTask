import React, { useEffect, useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { 
    Play, RefreshCw, Search, CheckCircle2, XCircle, Clock, 
    Loader2, Send, Database
} from 'lucide-react';

const categoryLabels: Record<string, string> = {
    assignment_alert: 'Assignment Alert',
    overdue_reminder: 'Overdue Reminder',
    missing_document: 'Missing Document',
    task_completed: 'Task Completed'
};

const categoryColors: Record<string, string> = {
    assignment_alert: 'pt-badge-info',
    overdue_reminder: 'pt-badge-red',
    missing_document: 'pt-badge-warning',
    task_completed: 'pt-badge-success'
};

const NotificationsPanel = () => {
    const [assignments, setAssignments] = useState<any[]>([]);
    const [logs, setLogs] = useState<any[]>([]);
    const [selectedAssignment, setSelectedAssignment] = useState('');
    const [selectedScenario, setSelectedScenario] = useState('assignment_alert');
    const [logSearch, setLogSearch] = useState('');
    const [logFilter, setLogFilter] = useState('all');
    
    const [loading, setLoading] = useState(true);
    const [runningScan, setRunningScan] = useState(false);
    const [triggeringScenario, setTriggeringScenario] = useState(false);
    const [scanSummary, setScanSummary] = useState<any>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [assignmentsRes, logsRes] = await Promise.all([
                api.get('/assignments'),
                api.get('/notifications/logs')
            ]);
            setAssignments(assignmentsRes.data);
            setLogs(logsRes.data);
            if (assignmentsRes.data.length > 0 && !selectedAssignment) {
                setSelectedAssignment(assignmentsRes.data[0]._id);
            }
        } catch (err: any) {
            toast.error('Failed to load control panel data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleRunScan = async () => {
        setRunningScan(true);
        setScanSummary(null);
        try {
            const res = await api.post('/notifications/run-reminders');
            setScanSummary(res.data.summary);
            toast.success('Reminder system scan completed!');
            fetchData();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to run scan');
        } finally {
            setRunningScan(false);
        }
    };

    const handleTriggerScenario = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedAssignment) {
            toast.error('Please select an assignment');
            return;
        }
        setTriggeringScenario(true);
        try {
            await api.post('/notifications/test-scenario', {
                scenarioType: selectedScenario,
                assignmentId: selectedAssignment
            });
            toast.success('Test scenario triggered!');
            fetchData();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to trigger test scenario');
        } finally {
            setTriggeringScenario(false);
        }
    };

    const filteredLogs = logs.filter(log => {
        const matchesSearch = 
            log.user?.name?.toLowerCase().includes(logSearch.toLowerCase()) ||
            log.user?.email?.toLowerCase().includes(logSearch.toLowerCase()) ||
            log.title?.toLowerCase().includes(logSearch.toLowerCase()) ||
            log.message?.toLowerCase().includes(logSearch.toLowerCase());
        
        const matchesFilter = logFilter === 'all' || log.category === logFilter;
        return matchesSearch && matchesFilter;
    });

    if (loading && logs.length === 0) {
        return (
            <div className="animate-pulse space-y-6">
                <div className="pt-skeleton h-8 w-64 mb-4" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1 h-64 pt-skeleton rounded-2xl" />
                    <div className="lg:col-span-2 h-64 pt-skeleton rounded-2xl" />
                </div>
                <div className="h-96 pt-skeleton rounded-2xl" />
            </div>
        );
    }

    return (
        <div className="animate-fade-in space-y-10 pb-20 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h2 className="text-[10px] font-extrabold text-blue-500 uppercase tracking-[0.3em] mb-2">System Operations</h2>
                    <h1 className="text-4xl pt-title-gradient pt-outfit">Alerts & Reminders Hub</h1>
                    <p className="text-slate-400 text-sm mt-3 font-medium">
                        Configure notification rules, run simulated checks, and audit outgoing system communication.
                    </p>
                </div>
                <button 
                    onClick={fetchData}
                    disabled={loading}
                    className="pt-btn-secondary self-start md:self-end"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh Data
                </button>
            </div>

            {/* Top Control Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Reminder Engine Scan Controller */}
                <div className="pt-glass-card p-6 flex flex-col justify-between lg:col-span-1 border-l-4 border-l-purple-500">
                    <div>
                        <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider mb-2 flex items-center gap-2">
                            <Clock className="w-4 h-4 text-purple-600" /> Reminder Engine
                        </h3>
                        <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                            Simulate background cron execution. This scans all assignments for past due dates and pending document uploads, and fires alerts.
                        </p>
                    </div>

                    <div>
                        {scanSummary && (
                            <div className="mb-6 p-4 bg-purple-50/50 border border-purple-100 rounded-xl space-y-2 animate-fade-in text-[11px] font-bold text-purple-950">
                                <div className="flex justify-between">
                                    <span>Checked Assignments:</span>
                                    <span>{scanSummary.checkedAssignments}</span>
                                </div>
                                <div className="flex justify-between text-rose-600">
                                    <span>Overdue Reminders:</span>
                                    <span>{scanSummary.overdueRemindersSent}</span>
                                </div>
                                <div className="flex justify-between text-amber-600">
                                    <span>Missing Doc Alerts:</span>
                                    <span>{scanSummary.missingDocumentsSent}</span>
                                </div>
                            </div>
                        )}

                        <button 
                            onClick={handleRunScan}
                            disabled={runningScan}
                            className="pt-btn-primary w-full bg-purple-600 hover:bg-purple-700"
                        >
                            {runningScan ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
                            {runningScan ? 'Scanning Engine…' : 'Run Reminder Scan'}
                        </button>
                    </div>
                </div>

                {/* Scenario testing component */}
                <div className="pt-glass-card p-6 lg:col-span-2 border-l-4 border-l-blue-500">
                    <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider mb-2 flex items-center gap-2">
                        <Send className="w-4 h-4 text-blue-600" /> Scenario Sandbox
                    </h3>
                    <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                        Test individual notification alerts. This bypasses the 24-hour throttle to send alerts immediately.
                    </p>

                    <form onSubmit={handleTriggerScenario} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">1. Target Assignment</label>
                                <select 
                                    className="pt-input text-xs"
                                    value={selectedAssignment}
                                    onChange={e => setSelectedAssignment(e.target.value)}
                                    required
                                >
                                    {assignments.length === 0 && (
                                        <option value="">No Active Assignments</option>
                                    )}
                                    {assignments.map(a => (
                                        <option key={a._id} value={a._id}>
                                            {a.user?.name} — {a.workflow?.name} ({a.status})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">2. Template Scenario</label>
                                <select 
                                    className="pt-input text-xs"
                                    value={selectedScenario}
                                    onChange={e => setSelectedScenario(e.target.value)}
                                >
                                    <option value="assignment_alert">Assignment Alert (New task alert)</option>
                                    <option value="overdue_reminder">Overdue Reminder (Workflow past due)</option>
                                    <option value="missing_document">Missing Document (Pending upload required)</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex justify-end pt-2">
                            <button 
                                type="submit" 
                                disabled={triggeringScenario || assignments.length === 0}
                                className="pt-btn-primary px-8 bg-blue-600 hover:bg-blue-700"
                            >
                                {triggeringScenario ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
                                Trigger Test Scenario
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Audit Logs Table */}
            <div className="pt-glass-card flex flex-col border-t border-slate-100">
                <div className="p-6 border-b border-slate-100 bg-slate-50/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2">
                        <Database className="w-4.5 h-4.5 text-slate-500" /> Alert Delivery Logs
                    </h3>

                    <div className="flex flex-col sm:flex-row gap-3">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input 
                                className="pt-input pl-9 text-xs py-1.5 w-full sm:w-60"
                                placeholder="Search logs…"
                                value={logSearch}
                                onChange={e => setLogSearch(e.target.value)}
                            />
                        </div>

                        {/* Filter dropdown */}
                        <select
                            className="pt-input text-xs py-1.5 w-full sm:w-44"
                            value={logFilter}
                            onChange={e => setLogFilter(e.target.value)}
                        >
                            <option value="all">All Channels</option>
                            <option value="assignment_alert">Assignment Alerts</option>
                            <option value="overdue_reminder">Overdue Reminders</option>
                            <option value="missing_document">Missing Documents</option>
                            <option value="task_completed">Task Completed Alerts</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/20">
                                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-left">Timestamp</th>
                                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-left">Recipient</th>
                                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-left">Category</th>
                                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-left">Type</th>
                                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-left">Content Preview</th>
                                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredLogs.map(log => (
                                <tr key={log._id} className="hover:bg-slate-50/40 transition-colors">
                                    <td className="px-6 py-4 text-xs text-slate-400 whitespace-nowrap">
                                        {new Date(log.sentAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-slate-900">{log.user?.name || 'Unknown Recipient'}</span>
                                            <span className="text-[10px] text-slate-400">{log.user?.email || ''}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`${categoryColors[log.category] || 'pt-badge-gray'} text-[9px]`}>
                                            {categoryLabels[log.category] || log.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500 capitalize">
                                        {log.type}
                                    </td>
                                    <td className="px-6 py-4 max-w-sm">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-slate-800 truncate">{log.title}</span>
                                            <span className="text-[10px] text-slate-400 truncate mt-0.5">{log.message}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center whitespace-nowrap">
                                        {log.status === 'success' ? (
                                            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-600 uppercase tracking-wider">
                                                <CheckCircle2 className="w-3.5 h-3.5" /> Sent
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-rose-600 uppercase tracking-wider" title={log.errorDetail}>
                                                <XCircle className="w-3.5 h-3.5" /> Failed
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {filteredLogs.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="py-16 text-center text-slate-300 text-[10px] font-black uppercase tracking-widest">
                                        No delivery logs found.
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

export default NotificationsPanel;
