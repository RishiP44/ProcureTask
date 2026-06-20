import { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { jsPDF } from 'jspdf';
import { 
    FileSpreadsheet, FileText, 
    Search, Calendar, BarChart3, ShieldAlert 
} from 'lucide-react';
import toast from 'react-hot-toast';

// Helper to format date strings nicely
const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
};

const Reports = () => {
    const { user } = useAuth();
    const [assignments, setAssignments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Filters State
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [roleFilter, setRoleFilter] = useState('all');

    // Admin/HR role check helper
    const isAdminOrHR = user?.role === 'Admin' || user?.role === 'HR';

    // Fetch assignments when component mounts
    useEffect(() => {
        const fetchReportData = async () => {
            try {
                // Admin/HR sees all assignments, standard users only see theirs
                const endpoint = isAdminOrHR ? '/assignments' : '/assignments/my-assignments';
                const res = await api.get(endpoint);
                setAssignments(res.data);
            } catch (err) {
                console.error('Failed to load report registry:', err);
                toast.error('Could not sync report registry');
            } finally {
                setLoading(false);
            }
        };
        fetchReportData();
    }, [isAdminOrHR]);

    // Apply active filters to the assignments list
    const filteredAssignments = assignments.filter(a => {
        const matchesSearch = 
            (a.workflow?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (a.user?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (a.user?.companyName || '').toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
        
        const matchesRole = roleFilter === 'all' || 
            (roleFilter === 'Vendor' && a.user?.role === 'Vendor') ||
            (roleFilter === 'Employee' && a.user?.role === 'Employee');

        return matchesSearch && matchesStatus && matchesRole;
    });

    // Calculate report statistics based on filtered data
    const totalCount = filteredAssignments.length;
    const pendingCount = filteredAssignments.filter(a => a.status === 'pending').length;
    const inProgressCount = filteredAssignments.filter(a => a.status === 'in_progress').length;
    const completedCount = filteredAssignments.filter(a => a.status === 'completed').length;
    const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    // Export report data as a CSV file
    const exportCSV = () => {
        try {
            // Define CSV column headers
            const headers = ['User / Company', 'Role', 'Workflow Name', 'Progress', 'Due Date', 'Status'];
            
            // Map table rows to comma-separated fields
            const rows = filteredAssignments.map(a => {
                const displayName = a.user?.role === 'Vendor' && a.user?.companyName 
                    ? `"${a.user.companyName} (Contact: ${a.user.name})"`
                    : `"${a.user?.name || 'Unknown'}"`;
                
                const progressPct = Math.round(
                    ((a.tasks?.filter((t: any) => t.status === 'completed').length || 0) / 
                     (a.tasks?.length || 1)) * 100
                );

                return [
                    displayName,
                    a.user?.role || 'N/A',
                    `"${a.workflow?.name || 'N/A'}"`,
                    `"${progressPct}%"`,
                    formatDate(a.dueDate),
                    a.status.toUpperCase()
                ].join(',');
            });

            const csvContent = [headers.join(','), ...rows].join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            
            // Trigger browser download action
            const link = document.createElement('a');
            link.setAttribute('href', url);
            link.setAttribute('download', `ProcureTask_Report_${new Date().toISOString().slice(0, 10)}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            toast.success('CSV Report exported successfully!');
        } catch (err) {
            console.error('CSV export failed', err);
            toast.error('Failed to export CSV');
        }
    };

    // Export report data as a clean PDF document using jsPDF
    const exportPDF = () => {
        try {
            const doc = new jsPDF();
            
            // PDF Document Header styling
            doc.setFillColor(15, 23, 42); // slate-900 background for top banner
            doc.rect(0, 0, 210, 40, 'F');
            
            doc.setTextColor(255, 255, 255);
            doc.setFont('Helvetica', 'bold');
            doc.setFontSize(22);
            doc.text('PROCURETRACK COMPLIANCE REPORT', 15, 25);
            
            doc.setFont('Helvetica', 'normal');
            doc.setFontSize(10);
            doc.text(`Generated on: ${new Date().toLocaleString()}`, 15, 33);
            
            // Executive Summary Grid block
            doc.setFillColor(248, 250, 252); // slate-50 background for metrics block
            doc.rect(15, 48, 180, 25, 'F');
            doc.setDrawColor(226, 232, 240); // slate-200 border
            doc.rect(15, 48, 180, 25, 'S');

            doc.setTextColor(71, 85, 105); // text-slate-600
            doc.setFontSize(9);
            doc.text('TOTAL WORKFLOWS', 20, 56);
            doc.text('COMPLETED FLOWS', 70, 56);
            doc.text('IN PROGRESS', 120, 56);
            doc.text('COMPLETION RATE', 160, 56);

            doc.setTextColor(15, 23, 42); // text-slate-900
            doc.setFont('Helvetica', 'bold');
            doc.setFontSize(14);
            doc.text(String(totalCount), 20, 66);
            doc.text(String(completedCount), 70, 66);
            doc.text(String(inProgressCount), 120, 66);
            doc.text(`${completionRate}%`, 160, 66);

            // Table Header setup
            let yPosition = 85;
            doc.setFillColor(226, 232, 240); // header background
            doc.rect(15, yPosition, 180, 8, 'F');
            
            doc.setTextColor(15, 23, 42);
            doc.setFontSize(9);
            doc.setFont('Helvetica', 'bold');
            doc.text('User / Company', 17, yPosition + 6);
            doc.text('Role', 75, yPosition + 6);
            doc.text('Workflow Name', 95, yPosition + 6);
            doc.text('Progress', 145, yPosition + 6);
            doc.text('Status', 175, yPosition + 6);
            
            yPosition += 8;
            
            // Draw rows of data
            doc.setFont('Helvetica', 'normal');
            doc.setFontSize(8.5);
            
            filteredAssignments.forEach((a, i) => {
                // Handle pagination if content goes beyond page length
                if (yPosition > 270) {
                    doc.addPage();
                    yPosition = 20;
                    
                    // Redraw table header on new page
                    doc.setFillColor(226, 232, 240);
                    doc.rect(15, yPosition, 180, 8, 'F');
                    doc.setTextColor(15, 23, 42);
                    doc.setFont('Helvetica', 'bold');
                    doc.text('User / Company', 17, yPosition + 6);
                    doc.text('Role', 75, yPosition + 6);
                    doc.text('Workflow Name', 95, yPosition + 6);
                    doc.text('Progress', 145, yPosition + 6);
                    doc.text('Status', 175, yPosition + 6);
                    yPosition += 8;
                    doc.setFont('Helvetica', 'normal');
                }

                // Alternate row background coloring
                if (i % 2 === 0) {
                    doc.setFillColor(248, 250, 252);
                    doc.rect(15, yPosition, 180, 7, 'F');
                }
                
                doc.setDrawColor(241, 245, 249); // slate-100 cell separator lines
                doc.line(15, yPosition + 7, 195, yPosition + 7);

                const nameVal = a.user?.role === 'Vendor' && a.user?.companyName
                    ? `${a.user.companyName} (${a.user.name})`
                    : (a.user?.name || 'Unknown');
                
                const progressPct = Math.round(
                    ((a.tasks?.filter((t: any) => t.status === 'completed').length || 0) / 
                     (a.tasks?.length || 1)) * 100
                );

                // Draw cells
                doc.setTextColor(15, 23, 42);
                doc.text(nameVal.substring(0, 30), 17, yPosition + 5);
                doc.text(a.user?.role || 'N/A', 75, yPosition + 5);
                doc.text((a.workflow?.name || 'N/A').substring(0, 26), 95, yPosition + 5);
                doc.text(`${progressPct}%`, 145, yPosition + 5);
                doc.text(a.status.toUpperCase(), 175, yPosition + 5);
                
                yPosition += 7;
            });

            // Save generated PDF file
            doc.save(`ProcureTask_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
            toast.success('PDF Report exported successfully!');
        } catch (err) {
            console.error('PDF export failed', err);
            toast.error('Failed to export PDF');
        }
    };

    if (loading) return (
        <div className="animate-pulse space-y-6 max-w-6xl mx-auto">
            <div className="pt-skeleton h-12 w-64" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[1,2,3,4].map(i => <div key={i} className="pt-skeleton h-28 rounded-2xl" />)}
            </div>
            <div className="pt-skeleton h-96 rounded-2xl" />
        </div>
    );

    return (
        <div className="animate-fade-in max-w-6xl mx-auto space-y-8 pb-20">
            {/* Header Block */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h2 className="text-[10px] font-extrabold text-blue-500 uppercase tracking-[0.35em] mb-2">Reports Hub</h2>
                    <h1 className="text-4xl pt-title-gradient pt-outfit">Logistical Analytics</h1>
                    <p className="text-slate-400 text-sm mt-2 font-medium">
                        Analyze and export progress details for {isAdminOrHR ? 'all personnel and vendor processes' : 'your assigned tasks'}.
                    </p>
                </div>
                
                {/* Export Control Buttons */}
                <div className="flex gap-3">
                    <button 
                        onClick={exportCSV} 
                        className="pt-btn-secondary px-5 py-3 hover:bg-slate-100 flex items-center gap-2"
                        disabled={totalCount === 0}
                    >
                        <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                        CSV Export
                    </button>
                    <button 
                        onClick={exportPDF} 
                        className="pt-btn-primary px-6 py-3 flex items-center gap-2 shadow-xl shadow-blue-500/10"
                        disabled={totalCount === 0}
                    >
                        <FileText className="w-4 h-4" />
                        PDF Export
                    </button>
                </div>
            </div>

            {/* Overview Stats Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="pt-glass-card p-6 border-l-4 border-l-slate-900">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Active Streams</span>
                        <BarChart3 className="w-4 h-4 text-slate-400" />
                    </div>
                    <div className="text-3xl font-black text-slate-900 pt-outfit">{totalCount}</div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-2">Filtered Total</p>
                </div>

                <div className="pt-glass-card p-6 border-l-4 border-l-amber-500">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Awaiting Action</span>
                        <Calendar className="w-4 h-4 text-amber-500" />
                    </div>
                    <div className="text-3xl font-black text-slate-900 pt-outfit">{pendingCount + inProgressCount}</div>
                    <p className="text-[10px] font-bold text-amber-500 uppercase mt-2">{pendingCount} Pending · {inProgressCount} Active</p>
                </div>

                <div className="pt-glass-card p-6 border-l-4 border-l-emerald-500">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Fully Completed</span>
                        <FileText className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div className="text-3xl font-black text-slate-900 pt-outfit">{completedCount}</div>
                    <p className="text-[10px] font-bold text-emerald-500 uppercase mt-2">Archived Streams</p>
                </div>

                <div className="pt-glass-card p-6 border-l-4 border-l-blue-500">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Uptime Score</span>
                        <BarChart3 className="w-4 h-4 text-blue-500" />
                    </div>
                    <div className="text-3xl font-black text-slate-900 pt-outfit">{completionRate}%</div>
                    <p className="text-[10px] font-bold text-blue-500 uppercase mt-2">Reliability Rate</p>
                </div>
            </div>

            {/* Filter controls panel */}
            <div className="pt-glass-card p-6 flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-50/50">
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                        className="pt-input pl-9 text-xs" 
                        placeholder={isAdminOrHR ? "Search users, companies, or flows..." : "Search workflows..."}
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>
                
                <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
                    {/* Role Filter dropdown (Restricted to Admin/HR roles) */}
                    {isAdminOrHR && (
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Role</span>
                            <select 
                                className="pt-input text-xs !py-2 !w-32 bg-white"
                                value={roleFilter}
                                onChange={e => setRoleFilter(e.target.value)}
                            >
                                <option value="all">All Registry</option>
                                <option value="Employee">Employees</option>
                                <option value="Vendor">Vendors</option>
                            </select>
                        </div>
                    )}

                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Status</span>
                        <select 
                            className="pt-input text-xs !py-2 !w-36 bg-white"
                            value={statusFilter}
                            onChange={e => setStatusFilter(e.target.value)}
                        >
                            <option value="all">All States</option>
                            <option value="pending">Pending</option>
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Data Table */}
            <div className="pt-glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/40">
                                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">User / Company</th>
                                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Role</th>
                                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Workflow Name</th>
                                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Tasks Complete</th>
                                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Due Date</th>
                                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredAssignments.map(a => {
                                const completedTasks = a.tasks?.filter((t: any) => t.status === 'completed').length || 0;
                                const totalTasks = a.tasks?.length || 0;
                                const pct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
                                
                                return (
                                    <tr key={a._id} className="hover:bg-slate-50/40 transition-colors">
                                        <td className="px-6 py-4">
                                            {a.user?.role === 'Vendor' && a.user?.companyName ? (
                                                <div>
                                                    <div className="text-xs font-black text-slate-900 uppercase">{a.user.companyName}</div>
                                                    <div className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Contact: {a.user.name}</div>
                                                </div>
                                            ) : (
                                                <div className="text-xs font-black text-slate-900 uppercase">{a.user?.name || 'Unknown'}</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-lg ${a.user?.role === 'Vendor' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>
                                                {a.user?.role || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-xs font-bold text-slate-700 uppercase">{a.workflow?.name || 'N/A'}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <span className="text-[10px] font-black text-slate-500">{completedTasks}/{totalTasks} ({pct}%)</span>
                                                <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${pct}%` }} />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-xs font-bold text-slate-500">{formatDate(a.dueDate)}</td>
                                        <td className="px-6 py-4">
                                            <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-xl ${
                                                a.status === 'completed' ? 'bg-emerald-50 text-emerald-600' :
                                                a.status === 'in_progress' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'
                                            }`}>
                                                {a.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                            
                            {filteredAssignments.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="py-16 text-center">
                                        <ShieldAlert className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                                        <p className="text-slate-400 text-xs font-black uppercase tracking-widest">No matching report streams detected</p>
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

export default Reports;
