import { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { jsPDF } from 'jspdf';
import { 
    FileSpreadsheet, FileText, Search, Calendar, 
    BarChart3, ShieldAlert, Award, AlertTriangle, CheckCircle2,
    Users, Briefcase, DollarSign, ArrowUpRight
} from 'lucide-react';
import toast from 'react-hot-toast';

// Helper to format date strings nicely
const formatDate = (dateString?: string | Date) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
};

// Helper to format currency in CAD
const formatCAD = (amount: number) => {
    return new Intl.NumberFormat('en-CA', {
        style: 'currency',
        currency: 'CAD',
        minimumFractionDigits: 2
    }).format(amount);
};

const Reports = () => {
    const { user } = useAuth();
    const [assignments, setAssignments] = useState<any[]>([]);
    const [vendors, setVendors] = useState<any[]>([]);
    const [vendorBills, setVendorBills] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Active Tab State: 'onboarding' | 'compliance' | 'vendors'
    const [activeTab, setActiveTab] = useState<'onboarding' | 'compliance' | 'vendors'>('onboarding');

    // Filters State
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [roleFilter, setRoleFilter] = useState('all');
    
    // Compliance specific filters
    const [complianceFilter, setComplianceFilter] = useState('all'); // 'all' | 'compliant' | 'pending' | 'non_compliant'
    
    // Vendor specific filters
    const [vendorTypeFilter, setVendorTypeFilter] = useState('all');
    const [billingActivityFilter, setBillingActivityFilter] = useState('all'); // 'all' | 'has_bills' | 'no_bills'

    // Admin/HR role check helper
    const isAdminOrHR = user?.role === 'Admin' || user?.role === 'HR';

    // Fetch all necessary reporting datasets
    useEffect(() => {
        const fetchReportData = async () => {
            try {
                // Admin/HR sees all assignments, standard users only see theirs
                const endpoint = isAdminOrHR ? '/assignments' : '/assignments/my-assignments';
                const assignmentsRes = await api.get(endpoint);
                setAssignments(assignmentsRes.data);

                if (isAdminOrHR) {
                    // Fetch vendors and vendor bills in parallel
                    const [vendorsRes, billsRes] = await Promise.all([
                        api.get('/users?role=Vendor'),
                        api.get('/vendor-bills')
                    ]);
                    setVendors(vendorsRes.data);
                    setVendorBills(billsRes.data);
                }
            } catch (err) {
                console.error('Failed to load reporting registry:', err);
                toast.error('Could not sync report registry');
            } finally {
                setLoading(false);
            }
        };
        fetchReportData();
    }, [isAdminOrHR]);

    // Navigation Tabs definition based on permissions
    const tabs = [
        { id: 'onboarding', name: 'Onboarding Progress', icon: BarChart3 },
        ...(isAdminOrHR ? [
            { id: 'compliance', name: 'Compliance Tracking', icon: ShieldAlert },
            { id: 'vendors', name: 'Vendor Summaries', icon: Users }
        ] : [])
    ];

    // ==========================================
    // 1. ONBOARDING REPORT LOGIC
    // ==========================================
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

    const onboardingStats = {
        total: filteredAssignments.length,
        pending: filteredAssignments.filter(a => a.status === 'pending').length,
        inProgress: filteredAssignments.filter(a => a.status === 'in_progress').length,
        completed: filteredAssignments.filter(a => a.status === 'completed').length,
        rate: filteredAssignments.length > 0 
            ? Math.round((filteredAssignments.filter(a => a.status === 'completed').length / filteredAssignments.length) * 100) 
            : 0
    };

    // ==========================================
    // 2. COMPLIANCE REPORT LOGIC
    // ==========================================
    const getComplianceDetails = (a: any) => {
        const requiredTasks = a.tasks?.filter((t: any) => t.required) || [];
        const requiredDocs = requiredTasks.filter((t: any) => t.type === 'document');
        const uploadedDocsCount = requiredDocs.filter((t: any) => t.status === 'completed' && t.documentUrl).length;
        const totalDocsCount = requiredDocs.length;
        
        const missingDocsCount = totalDocsCount - uploadedDocsCount;

        // Check if assignment or any required task is overdue
        const isOverdue = a.status !== 'completed' && a.dueDate && new Date(a.dueDate) < new Date();
        const overdueTasksCount = a.status !== 'completed' && isOverdue 
            ? a.tasks?.filter((t: any) => t.status === 'pending').length 
            : 0;

        let complianceStatus: 'Fully Compliant' | 'Pending Actions' | 'Non-Compliant' = 'Fully Compliant';
        if (isOverdue || overdueTasksCount > 0 || (a.status === 'completed' && missingDocsCount > 0)) {
            complianceStatus = 'Non-Compliant';
        } else if (a.status !== 'completed') {
            complianceStatus = 'Pending Actions';
        }

        return {
            totalDocsCount,
            uploadedDocsCount,
            missingDocsCount,
            overdueTasksCount,
            isOverdue,
            complianceStatus
        };
    };

    const complianceList = assignments.map(a => {
        const details = getComplianceDetails(a);
        return {
            ...a,
            compliance: details
        };
    }).filter(a => {
        const matchesSearch = 
            (a.workflow?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (a.user?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (a.user?.companyName || '').toLowerCase().includes(searchQuery.toLowerCase());

        let matchesStatus = true;
        if (complianceFilter === 'compliant') matchesStatus = a.compliance.complianceStatus === 'Fully Compliant';
        else if (complianceFilter === 'pending') matchesStatus = a.compliance.complianceStatus === 'Pending Actions';
        else if (complianceFilter === 'non_compliant') matchesStatus = a.compliance.complianceStatus === 'Non-Compliant';

        return matchesSearch && matchesStatus;
    });

    const complianceStats = {
        total: complianceList.length,
        compliant: complianceList.filter(c => c.compliance.complianceStatus === 'Fully Compliant').length,
        pendingActions: complianceList.filter(c => c.compliance.complianceStatus === 'Pending Actions').length,
        nonCompliant: complianceList.filter(c => c.compliance.complianceStatus === 'Non-Compliant').length,
        requiredDocs: complianceList.reduce((sum, c) => sum + c.compliance.totalDocsCount, 0),
        uploadedDocs: complianceList.reduce((sum, c) => sum + c.compliance.uploadedDocsCount, 0),
        missingDocs: complianceList.reduce((sum, c) => sum + c.compliance.missingDocsCount, 0),
        score: complianceList.length > 0 
            ? Math.round((complianceList.filter(c => c.compliance.complianceStatus !== 'Non-Compliant').length / complianceList.length) * 100)
            : 100
    };

    // ==========================================
    // 3. VENDOR SUMMARIES LOGIC
    // ==========================================
    const vendorList = vendors.map(v => {
        // Find assigned workflows
        const vAssignments = assignments.filter(a => a.user?._id === v._id);
        const activeWorkflows = vAssignments.filter(a => a.status === 'in_progress' || a.status === 'pending').length;
        const completedWorkflows = vAssignments.filter(a => a.status === 'completed').length;
        
        // Count documents uploaded
        const totalDocsUploaded = vAssignments.reduce((sum, a) => {
            const uploaded = a.tasks?.filter((t: any) => t.type === 'document' && t.status === 'completed' && t.documentUrl).length || 0;
            return sum + uploaded;
        }, 0);

        // Find bills
        const vBills = vendorBills.filter(b => b.vendor?._id === v._id || b.vendor === v._id);
        const totalBillsCount = vBills.length;
        const totalInvoiced = vBills.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
        const totalPaidApproved = vBills
            .filter(b => b.status === 'Approved' || b.status === 'Paid')
            .reduce((sum, b) => sum + (b.totalAmount || 0), 0);
        const latestBillStatus = vBills[0]?.status || 'N/A';

        return {
            ...v,
            stats: {
                activeWorkflows,
                completedWorkflows,
                totalWorkflows: vAssignments.length,
                totalDocsUploaded,
                totalBillsCount,
                totalInvoiced,
                totalPaidApproved,
                latestBillStatus
            }
        };
    }).filter(v => {
        const matchesSearch = 
            (v.companyName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (v.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (v.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (v.vendorType || '').toLowerCase().includes(searchQuery.toLowerCase());

        const matchesType = vendorTypeFilter === 'all' || v.vendorType === vendorTypeFilter;
        
        let matchesBilling = true;
        if (billingActivityFilter === 'has_bills') matchesBilling = v.stats.totalBillsCount > 0;
        else if (billingActivityFilter === 'no_bills') matchesBilling = v.stats.totalBillsCount === 0;

        return matchesSearch && matchesType && matchesBilling;
    });

    const vendorStats = {
        totalVendors: vendorList.length,
        activeOnboardings: vendorList.reduce((sum, v) => sum + v.stats.activeWorkflows, 0),
        totalBillsSubmitted: vendorList.reduce((sum, v) => sum + v.stats.totalBillsCount, 0),
        totalInvoicedValue: vendorList.reduce((sum, v) => sum + v.stats.totalInvoiced, 0),
        totalPaidValue: vendorList.reduce((sum, v) => sum + v.stats.totalPaidApproved, 0)
    };

    // Extract unique vendor types for the filter dropdown
    const uniqueVendorTypes = Array.from(
        new Set(vendors.map(v => v.vendorType).filter(Boolean))
    ) as string[];

    // ==========================================
    // EXPORT FUNCTIONS
    // ==========================================
    
    // CSV Exporter
    const exportCSV = () => {
        try {
            let headers: string[] = [];
            let rows: string[][] = [];
            let filename = '';

            if (activeTab === 'onboarding') {
                headers = ['User / Company', 'Role', 'Workflow Name', 'Progress', 'Due Date', 'Status'];
                rows = filteredAssignments.map(a => {
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
                    ];
                });
                filename = 'Onboarding_Progress_Report';
            } 
            else if (activeTab === 'compliance') {
                headers = ['User / Company', 'Workflow Name', 'Required Docs Count', 'Docs Uploaded', 'Missing Docs', 'Overdue Tasks', 'Compliance Status'];
                rows = complianceList.map(a => {
                    const displayName = a.user?.role === 'Vendor' && a.user?.companyName 
                        ? `"${a.user.companyName} (Contact: ${a.user.name})"`
                        : `"${a.user?.name || 'Unknown'}"`;

                    return [
                        displayName,
                        `"${a.workflow?.name || 'N/A'}"`,
                        String(a.compliance.totalDocsCount),
                        String(a.compliance.uploadedDocsCount),
                        String(a.compliance.missingDocsCount),
                        String(a.compliance.overdueTasksCount),
                        a.compliance.complianceStatus
                    ];
                });
                filename = 'Compliance_Tracking_Report';
            } 
            else if (activeTab === 'vendors') {
                headers = ['Company Name', 'Contact Name', 'Email', 'Vendor Type', 'Total Workflows', 'Completed Workflows', 'Docs Submitted', 'Bills Submitted', 'Total Invoiced (CAD)', 'Paid/Approved (CAD)', 'Latest Bill Status'];
                rows = vendorList.map(v => [
                    `"${v.companyName || 'N/A'}"`,
                    `"${v.name}"`,
                    v.email,
                    `"${v.vendorType || 'N/A'}"`,
                    String(v.stats.totalWorkflows),
                    String(v.stats.completedWorkflows),
                    String(v.stats.totalDocsUploaded),
                    String(v.stats.totalBillsCount),
                    String(v.stats.totalInvoiced.toFixed(2)),
                    String(v.stats.totalPaidApproved.toFixed(2)),
                    v.stats.latestBillStatus
                ]);
                filename = 'Vendor_Summaries_Report';
            }

            const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.setAttribute('href', url);
            link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            toast.success('CSV Report exported successfully!');
        } catch (err) {
            console.error('CSV export failed', err);
            toast.error('Failed to export CSV');
        }
    };

    // PDF Exporter using jsPDF
    const exportPDF = () => {
        try {
            const doc = new jsPDF('p', 'mm', 'a4');
            const pageWidth = doc.internal.pageSize.getWidth();
            
            // Header Styling
            doc.setFillColor(15, 23, 42); // slate-900
            doc.rect(0, 0, pageWidth, 42, 'F');
            
            doc.setTextColor(255, 255, 255);
            doc.setFont('Helvetica', 'bold');
            doc.setFontSize(20);
            
            let title = 'PROCURETRACK REPORT';
            if (activeTab === 'onboarding') title = 'ONBOARDING PROGRESS REPORT';
            else if (activeTab === 'compliance') title = 'COMPLIANCE AUDIT REPORT';
            else if (activeTab === 'vendors') title = 'VENDOR ACCOUNT SUMMARIES';

            doc.text(title, 15, 22);
            
            doc.setFont('Helvetica', 'normal');
            doc.setFontSize(9);
            doc.text(`Generated on: ${new Date().toLocaleString()}  |  Scope: internal audits`, 15, 30);
            doc.text(`Issuer: ${user?.name || 'HR/Admin'} (${user?.role || 'N/A'})`, 15, 35);

            let yPosition = 52;

            if (activeTab === 'onboarding') {
                // EXECUTIVE SUMMARY BLOCK
                doc.setFillColor(248, 250, 252); // slate-50
                doc.rect(15, yPosition, pageWidth - 30, 24, 'F');
                doc.setDrawColor(226, 232, 240); // border
                doc.rect(15, yPosition, pageWidth - 30, 24, 'S');

                doc.setTextColor(100, 116, 139); // text-slate-500
                doc.setFontSize(8);
                doc.setFont('Helvetica', 'bold');
                doc.text('TOTAL ACTIVE FLOWS', 20, yPosition + 8);
                doc.text('COMPLETED FLOWS', 65, yPosition + 8);
                doc.text('IN PROGRESS', 110, yPosition + 8);
                doc.text('COMPLETION RATE', 155, yPosition + 8);

                doc.setTextColor(15, 23, 42);
                doc.setFontSize(14);
                doc.text(String(onboardingStats.total), 20, yPosition + 17);
                doc.text(String(onboardingStats.completed), 65, yPosition + 17);
                doc.text(String(onboardingStats.inProgress), 110, yPosition + 17);
                doc.text(`${onboardingStats.rate}%`, 155, yPosition + 17);

                yPosition += 36;

                // Table Headers
                doc.setFillColor(226, 232, 240);
                doc.rect(15, yPosition, pageWidth - 30, 8, 'F');
                doc.setFontSize(8.5);
                doc.setTextColor(15, 23, 42);
                doc.setFont('Helvetica', 'bold');
                doc.text('User / Company', 17, yPosition + 6);
                doc.text('Role', 70, yPosition + 6);
                doc.text('Workflow Name', 90, yPosition + 6);
                doc.text('Progress', 145, yPosition + 6);
                doc.text('Status', 175, yPosition + 6);
                
                yPosition += 8;

                // Rows
                doc.setFont('Helvetica', 'normal');
                doc.setFontSize(8);
                
                filteredAssignments.forEach((a, i) => {
                    if (yPosition > 275) {
                        doc.addPage();
                        yPosition = 20;
                        // Redraw headers
                        doc.setFillColor(226, 232, 240);
                        doc.rect(15, yPosition, pageWidth - 30, 8, 'F');
                        doc.setTextColor(15, 23, 42);
                        doc.setFont('Helvetica', 'bold');
                        doc.text('User / Company', 17, yPosition + 6);
                        doc.text('Role', 70, yPosition + 6);
                        doc.text('Workflow Name', 90, yPosition + 6);
                        doc.text('Progress', 145, yPosition + 6);
                        doc.text('Status', 175, yPosition + 6);
                        yPosition += 8;
                        doc.setFont('Helvetica', 'normal');
                    }

                    if (i % 2 === 0) {
                        doc.setFillColor(248, 250, 252);
                        doc.rect(15, yPosition, pageWidth - 30, 7, 'F');
                    }

                    const nameVal = a.user?.role === 'Vendor' && a.user?.companyName
                        ? `${a.user.companyName}`
                        : (a.user?.name || 'Unknown');
                    
                    const progressPct = Math.round(
                        ((a.tasks?.filter((t: any) => t.status === 'completed').length || 0) / 
                         (a.tasks?.length || 1)) * 100
                    );

                    doc.setTextColor(15, 23, 42);
                    doc.text(nameVal.substring(0, 28), 17, yPosition + 5);
                    doc.text(a.user?.role || 'N/A', 70, yPosition + 5);
                    doc.text((a.workflow?.name || 'N/A').substring(0, 28), 90, yPosition + 5);
                    doc.text(`${progressPct}%`, 145, yPosition + 5);
                    doc.text(a.status.toUpperCase(), 175, yPosition + 5);

                    yPosition += 7;
                });
            } 
            else if (activeTab === 'compliance') {
                // EXECUTIVE SUMMARY BLOCK
                doc.setFillColor(248, 250, 252);
                doc.rect(15, yPosition, pageWidth - 30, 24, 'F');
                doc.setDrawColor(226, 232, 240);
                doc.rect(15, yPosition, pageWidth - 30, 24, 'S');

                doc.setTextColor(100, 116, 139);
                doc.setFontSize(8);
                doc.setFont('Helvetica', 'bold');
                doc.text('GLOBAL COMPLIANCE SCORE', 20, yPosition + 8);
                doc.text('COMPLIANT CASES', 68, yPosition + 8);
                doc.text('NON-COMPLIANT CASES', 110, yPosition + 8);
                doc.text('MISSING DOCUMENTS', 155, yPosition + 8);

                doc.setTextColor(15, 23, 42);
                doc.setFontSize(14);
                doc.text(`${complianceStats.score}%`, 20, yPosition + 17);
                doc.text(String(complianceStats.compliant), 68, yPosition + 17);
                doc.text(String(complianceStats.nonCompliant), 110, yPosition + 17);
                doc.text(String(complianceStats.missingDocs), 155, yPosition + 17);

                yPosition += 36;

                // Table Headers
                doc.setFillColor(226, 232, 240);
                doc.rect(15, yPosition, pageWidth - 30, 8, 'F');
                doc.setFontSize(8.5);
                doc.setTextColor(15, 23, 42);
                doc.setFont('Helvetica', 'bold');
                doc.text('User / Company', 17, yPosition + 6);
                doc.text('Workflow Name', 65, yPosition + 6);
                doc.text('Req. Docs', 115, yPosition + 6);
                doc.text('Missing', 135, yPosition + 6);
                doc.text('Overdue Tasks', 153, yPosition + 6);
                doc.text('Compliance Status', 175, yPosition + 6);
                
                yPosition += 8;

                // Rows
                doc.setFont('Helvetica', 'normal');
                doc.setFontSize(7.5);
                
                complianceList.forEach((a, i) => {
                    if (yPosition > 275) {
                        doc.addPage();
                        yPosition = 20;
                        // Redraw headers
                        doc.setFillColor(226, 232, 240);
                        doc.rect(15, yPosition, pageWidth - 30, 8, 'F');
                        doc.setTextColor(15, 23, 42);
                        doc.setFont('Helvetica', 'bold');
                        doc.text('User / Company', 17, yPosition + 6);
                        doc.text('Workflow Name', 65, yPosition + 6);
                        doc.text('Req. Docs', 115, yPosition + 6);
                        doc.text('Missing', 135, yPosition + 6);
                        doc.text('Overdue Tasks', 153, yPosition + 6);
                        doc.text('Compliance Status', 175, yPosition + 6);
                        yPosition += 8;
                        doc.setFont('Helvetica', 'normal');
                    }

                    if (i % 2 === 0) {
                        doc.setFillColor(248, 250, 252);
                        doc.rect(15, yPosition, pageWidth - 30, 7, 'F');
                    }

                    const nameVal = a.user?.role === 'Vendor' && a.user?.companyName
                        ? `${a.user.companyName}`
                        : (a.user?.name || 'Unknown');

                    doc.setTextColor(15, 23, 42);
                    doc.text(nameVal.substring(0, 24), 17, yPosition + 5);
                    doc.text((a.workflow?.name || 'N/A').substring(0, 26), 65, yPosition + 5);
                    doc.text(`${a.compliance.uploadedDocsCount}/${a.compliance.totalDocsCount}`, 115, yPosition + 5);
                    doc.text(String(a.compliance.missingDocsCount), 135, yPosition + 5);
                    doc.text(String(a.compliance.overdueTasksCount), 153, yPosition + 5);
                    
                    const statusText = a.compliance.complianceStatus;
                    doc.text(statusText, 175, yPosition + 5);

                    yPosition += 7;
                });
            } 
            else if (activeTab === 'vendors') {
                // EXECUTIVE SUMMARY BLOCK
                doc.setFillColor(248, 250, 252);
                doc.rect(15, yPosition, pageWidth - 30, 24, 'F');
                doc.setDrawColor(226, 232, 240);
                doc.rect(15, yPosition, pageWidth - 30, 24, 'S');

                doc.setTextColor(100, 116, 139);
                doc.setFontSize(8);
                doc.setFont('Helvetica', 'bold');
                doc.text('TOTAL REGISTERED VENDORS', 20, yPosition + 8);
                doc.text('ONGOING ONBOARDINGS', 68, yPosition + 8);
                doc.text('TOTAL BILLS SUBMITTED', 110, yPosition + 8);
                doc.text('TOTAL BILLS VALUE', 155, yPosition + 8);

                doc.setTextColor(15, 23, 42);
                doc.setFontSize(12);
                doc.text(String(vendorStats.totalVendors), 20, yPosition + 17);
                doc.text(String(vendorStats.activeOnboardings), 68, yPosition + 17);
                doc.text(String(vendorStats.totalBillsSubmitted), 110, yPosition + 17);
                doc.text(formatCAD(vendorStats.totalInvoicedValue), 155, yPosition + 17);

                yPosition += 36;

                // Table Headers
                doc.setFillColor(226, 232, 240);
                doc.rect(15, yPosition, pageWidth - 30, 8, 'F');
                doc.setFontSize(8.5);
                doc.setTextColor(15, 23, 42);
                doc.setFont('Helvetica', 'bold');
                doc.text('Company Name', 17, yPosition + 6);
                doc.text('Type', 65, yPosition + 6);
                doc.text('Workflows (Act/Comp)', 85, yPosition + 6);
                doc.text('Docs Uploaded', 120, yPosition + 6);
                doc.text('Bills Value', 145, yPosition + 6);
                doc.text('Latest Bill Status', 175, yPosition + 6);
                
                yPosition += 8;

                // Rows
                doc.setFont('Helvetica', 'normal');
                doc.setFontSize(7.5);
                
                vendorList.forEach((v, i) => {
                    if (yPosition > 275) {
                        doc.addPage();
                        yPosition = 20;
                        // Redraw headers
                        doc.setFillColor(226, 232, 240);
                        doc.rect(15, yPosition, pageWidth - 30, 8, 'F');
                        doc.setTextColor(15, 23, 42);
                        doc.setFont('Helvetica', 'bold');
                        doc.text('Company Name', 17, yPosition + 6);
                        doc.text('Type', 65, yPosition + 6);
                        doc.text('Workflows (Act/Comp)', 85, yPosition + 6);
                        doc.text('Docs Uploaded', 120, yPosition + 6);
                        doc.text('Bills Value', 145, yPosition + 6);
                        doc.text('Latest Bill Status', 175, yPosition + 6);
                        yPosition += 8;
                        doc.setFont('Helvetica', 'normal');
                    }

                    if (i % 2 === 0) {
                        doc.setFillColor(248, 250, 252);
                        doc.rect(15, yPosition, pageWidth - 30, 7, 'F');
                    }

                    doc.setTextColor(15, 23, 42);
                    doc.text((v.companyName || 'N/A').substring(0, 22), 17, yPosition + 5);
                    doc.text((v.vendorType || 'N/A').substring(0, 10), 65, yPosition + 5);
                    doc.text(`${v.stats.activeWorkflows}/${v.stats.completedWorkflows}`, 85, yPosition + 5);
                    doc.text(String(v.stats.totalDocsUploaded), 120, yPosition + 5);
                    doc.text(formatCAD(v.stats.totalInvoiced), 145, yPosition + 5);
                    doc.text(v.stats.latestBillStatus, 175, yPosition + 5);

                    yPosition += 7;
                });
            }

            doc.save(`${title.replace(/ /g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`);
            toast.success('PDF Report exported successfully!');
        } catch (err) {
            console.error('PDF export failed', err);
            toast.error('Failed to export PDF');
        }
    };

    if (loading) return (
        <div className="animate-pulse space-y-6 max-w-7xl mx-auto">
            <div className="pt-skeleton h-12 w-64" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[1,2,3,4].map(i => <div key={i} className="pt-skeleton h-28 rounded-2xl" />)}
            </div>
            <div className="pt-skeleton h-96 rounded-2xl" />
        </div>
    );

    return (
        <div className="animate-fade-in max-w-7xl mx-auto space-y-8 pb-20">
            {/* Header Block */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h2 className="text-[10px] font-extrabold text-blue-500 uppercase tracking-[0.35em] mb-2">Reports Hub</h2>
                    <h1 className="text-4xl pt-title-gradient pt-outfit">Logistical Analytics</h1>
                    <p className="text-slate-400 text-sm mt-2 font-medium">
                        Analyze and export reports for onboarding checklists, organizational compliance status, and vendor activity.
                    </p>
                </div>
                
                {/* Export Control Buttons */}
                <div className="flex gap-3">
                    <button 
                        onClick={exportCSV} 
                        className="pt-btn-secondary px-5 py-3 hover:bg-slate-100 flex items-center gap-2"
                        disabled={
                            (activeTab === 'onboarding' && onboardingStats.total === 0) ||
                            (activeTab === 'compliance' && complianceStats.total === 0) ||
                            (activeTab === 'vendors' && vendorStats.totalVendors === 0)
                        }
                    >
                        <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                        CSV Export
                    </button>
                    <button 
                        onClick={exportPDF} 
                        className="pt-btn-primary px-6 py-3 flex items-center gap-2 shadow-xl shadow-blue-500/10"
                        disabled={
                            (activeTab === 'onboarding' && onboardingStats.total === 0) ||
                            (activeTab === 'compliance' && complianceStats.total === 0) ||
                            (activeTab === 'vendors' && vendorStats.totalVendors === 0)
                        }
                    >
                        <FileText className="w-4 h-4" />
                        PDF Export
                    </button>
                </div>
            </div>

            {/* TAB CONTAINER */}
            <div className="flex border-b border-slate-200 gap-6">
                {tabs.map(tab => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => {
                                setActiveTab(tab.id as any);
                                setSearchQuery(''); // clear search when swapping reports
                            }}
                            className={`flex items-center gap-2.5 pb-4 px-1 text-sm font-bold uppercase tracking-wider transition-all border-b-2 relative ${
                                isActive ? 'border-blue-600 text-blue-600 font-extrabold' : 'border-transparent text-slate-400 hover:text-slate-600'
                            }`}
                        >
                            <Icon className="w-4 h-4" />
                            {tab.name}
                        </button>
                    );
                })}
            </div>

            {/* ==========================================
                1. METRICS OVERVIEW CARDS GRID (TAB CONDITIONAL)
               ========================================== */}
            {activeTab === 'onboarding' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="pt-glass-card p-6 border-l-4 border-l-slate-900">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Active Streams</span>
                            <Briefcase className="w-4 h-4 text-slate-400" />
                        </div>
                        <div className="text-3xl font-black text-slate-900 pt-outfit">{onboardingStats.total}</div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase mt-2">Filtered Assignments</p>
                    </div>

                    <div className="pt-glass-card p-6 border-l-4 border-l-amber-500">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Awaiting Action</span>
                            <Calendar className="w-4 h-4 text-amber-500" />
                        </div>
                        <div className="text-3xl font-black text-slate-900 pt-outfit">{onboardingStats.pending + onboardingStats.inProgress}</div>
                        <p className="text-[10px] font-bold text-amber-500 uppercase mt-2">{onboardingStats.pending} Pending · {onboardingStats.inProgress} Active</p>
                    </div>

                    <div className="pt-glass-card p-6 border-l-4 border-l-emerald-500">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Fully Completed</span>
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        </div>
                        <div className="text-3xl font-black text-slate-900 pt-outfit">{onboardingStats.completed}</div>
                        <p className="text-[10px] font-bold text-emerald-500 uppercase mt-2">Archived Streams</p>
                    </div>

                    <div className="pt-glass-card p-6 border-l-4 border-l-blue-500">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Uptime Score</span>
                            <Award className="w-4 h-4 text-blue-500" />
                        </div>
                        <div className="text-3xl font-black text-slate-900 pt-outfit">{onboardingStats.rate}%</div>
                        <p className="text-[10px] font-bold text-blue-500 uppercase mt-2">Completion Rate</p>
                    </div>
                </div>
            )}

            {activeTab === 'compliance' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="pt-glass-card p-6 border-l-4 border-l-blue-600">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Compliance Rating</span>
                            <Award className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="text-3xl font-black text-slate-900 pt-outfit">{complianceStats.score}%</div>
                        <p className="text-[10px] font-bold text-blue-600 uppercase mt-2">Non-Overdue Success</p>
                    </div>

                    <div className="pt-glass-card p-6 border-l-4 border-l-emerald-500">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Required Documents</span>
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        </div>
                        <div className="text-3xl font-black text-slate-900 pt-outfit">{complianceStats.uploadedDocs}/{complianceStats.requiredDocs}</div>
                        <p className="text-[10px] font-bold text-emerald-500 uppercase mt-2">{complianceStats.missingDocs} Missing Attachment(s)</p>
                    </div>

                    <div className="pt-glass-card p-6 border-l-4 border-l-red-500">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Compliance Alerts</span>
                            <ShieldAlert className="w-4 h-4 text-red-500" />
                        </div>
                        <div className="text-3xl font-black text-slate-900 pt-outfit">{complianceStats.nonCompliant}</div>
                        <p className="text-[10px] font-bold text-red-500 uppercase mt-2">Overdue or Missing files</p>
                    </div>

                    <div className="pt-glass-card p-6 border-l-4 border-l-slate-400">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Compliance Coverage</span>
                            <BarChart3 className="w-4 h-4 text-slate-400" />
                        </div>
                        <div className="text-3xl font-black text-slate-900 pt-outfit">{complianceStats.compliant}</div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase mt-2">Fully Compliant Runs</p>
                    </div>
                </div>
            )}

            {activeTab === 'vendors' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="pt-glass-card p-6 border-l-4 border-l-slate-900">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Active Vendors</span>
                            <Users className="w-4 h-4 text-slate-400" />
                        </div>
                        <div className="text-3xl font-black text-slate-900 pt-outfit">{vendorStats.totalVendors}</div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase mt-2">Registered Accounts</p>
                    </div>

                    <div className="pt-glass-card p-6 border-l-4 border-l-amber-500">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Vendor Onboarding</span>
                            <Briefcase className="w-4 h-4 text-amber-500" />
                        </div>
                        <div className="text-3xl font-black text-slate-900 pt-outfit">{vendorStats.activeOnboardings}</div>
                        <p className="text-[10px] font-bold text-amber-500 uppercase mt-2">Ongoing Workflows</p>
                    </div>

                    <div className="pt-glass-card p-6 border-l-4 border-l-blue-600">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Invoice Value</span>
                            <DollarSign className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="text-2xl font-black text-slate-900 pt-outfit">{formatCAD(vendorStats.totalInvoicedValue)}</div>
                        <p className="text-[10px] font-bold text-blue-600 uppercase mt-2">{vendorStats.totalBillsSubmitted} Invoice(s) Uploaded</p>
                    </div>

                    <div className="pt-glass-card p-6 border-l-4 border-l-emerald-500">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Paid / Approved Invoice Value</span>
                            <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                        </div>
                        <div className="text-2xl font-black text-slate-900 pt-outfit">{formatCAD(vendorStats.totalPaidValue)}</div>
                        <p className="text-[10px] font-bold text-emerald-500 uppercase mt-2">Cleared Disbursements</p>
                    </div>
                </div>
            )}

            {/* ==========================================
                2. FILTER CONTROLS HUB (TAB CONDITIONAL)
               ========================================== */}
            <div className="pt-glass-card p-6 flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-50/50">
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                        className="pt-input pl-9 text-xs" 
                        placeholder={
                            activeTab === 'vendors' 
                                ? "Search vendor name, email, type..." 
                                : "Search user, company, or workflow..."
                        }
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>
                
                <div className="flex flex-wrap items-center gap-4 w-full md:w-auto justify-end">
                    
                    {/* Filters for ONBOARDING PROGRESS */}
                    {activeTab === 'onboarding' && (
                        <>
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
                        </>
                    )}

                    {/* Filters for COMPLIANCE TRACKING */}
                    {activeTab === 'compliance' && (
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Compliance Status</span>
                            <select 
                                className="pt-input text-xs !py-2 !w-44 bg-white"
                                value={complianceFilter}
                                onChange={e => setComplianceFilter(e.target.value)}
                            >
                                <option value="all">All Compliance</option>
                                <option value="compliant">Fully Compliant</option>
                                <option value="pending">Pending Actions</option>
                                <option value="non_compliant">Non-Compliant</option>
                            </select>
                        </div>
                    )}

                    {/* Filters for VENDOR SUMMARIES */}
                    {activeTab === 'vendors' && (
                        <>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Vendor Category</span>
                                <select 
                                    className="pt-input text-xs !py-2 !w-40 bg-white"
                                    value={vendorTypeFilter}
                                    onChange={e => setVendorTypeFilter(e.target.value)}
                                >
                                    <option value="all">All Categories</option>
                                    {uniqueVendorTypes.map(type => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Invoice History</span>
                                <select 
                                    className="pt-input text-xs !py-2 !w-40 bg-white"
                                    value={billingActivityFilter}
                                    onChange={e => setBillingActivityFilter(e.target.value)}
                                >
                                    <option value="all">All Billings</option>
                                    <option value="has_bills">Has Bills Submitted</option>
                                    <option value="no_bills">No Billings Yet</option>
                                </select>
                            </div>
                        </>
                    )}

                </div>
            </div>

            {/* ==========================================
                3. DATA GRID / TABLE HUB
               ========================================== */}
            <div className="pt-glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    
                    {/* TABLE 1: ONBOARDING PROGRESS */}
                    {activeTab === 'onboarding' && (
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
                                            <p className="text-slate-400 text-xs font-black uppercase tracking-widest">No matching onboarding streams detected</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}

                    {/* TABLE 2: COMPLIANCE TRACKING */}
                    {activeTab === 'compliance' && (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/40">
                                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">User / Company</th>
                                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Workflow Target</th>
                                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Required Docs Uploaded</th>
                                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Missing Uploads</th>
                                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Overdue Tasks</th>
                                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Compliance Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {complianceList.map(a => (
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
                                        <td className="px-6 py-4 text-xs font-bold text-slate-700 uppercase">{a.workflow?.name || 'N/A'}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2.5">
                                                <span className="text-xs font-bold text-slate-700">
                                                    {a.compliance.uploadedDocsCount} of {a.compliance.totalDocsCount}
                                                </span>
                                                <div className="w-12 h-1 bg-slate-100 rounded-full overflow-hidden">
                                                    <div 
                                                        className="h-full bg-emerald-500" 
                                                        style={{ 
                                                            width: `${a.compliance.totalDocsCount > 0 ? (a.compliance.uploadedDocsCount / a.compliance.totalDocsCount) * 100 : 100}%` 
                                                        }} 
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-[10px] font-black ${a.compliance.missingDocsCount > 0 ? 'text-amber-600 bg-amber-50 px-2 py-0.5 rounded' : 'text-slate-400'}`}>
                                                {a.compliance.missingDocsCount} Missing
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-[10px] font-black ${a.compliance.overdueTasksCount > 0 ? 'text-rose-600 bg-rose-50 px-2 py-0.5 rounded font-black' : 'text-slate-400'}`}>
                                                {a.compliance.overdueTasksCount} Overdue
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-xl flex items-center gap-1.5 w-max ${
                                                a.compliance.complianceStatus === 'Fully Compliant' ? 'bg-emerald-50 text-emerald-700' :
                                                a.compliance.complianceStatus === 'Pending Actions' ? 'bg-blue-50 text-blue-700' : 'bg-red-50 text-red-700 font-extrabold border border-red-100'
                                            }`}>
                                                {a.compliance.complianceStatus === 'Fully Compliant' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                                                {a.compliance.complianceStatus === 'Pending Actions' && <Calendar className="w-3 h-3 text-blue-600" />}
                                                {a.compliance.complianceStatus === 'Non-Compliant' && <AlertTriangle className="w-3 h-3 text-red-600" />}
                                                {a.compliance.complianceStatus}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                
                                {complianceList.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="py-16 text-center">
                                            <ShieldAlert className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                                            <p className="text-slate-400 text-xs font-black uppercase tracking-widest">No matching compliance cases detected</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}

                    {/* TABLE 3: VENDOR SUMMARIES */}
                    {activeTab === 'vendors' && (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/40">
                                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Company / contact</th>
                                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Vendor Type</th>
                                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Workflows (Active/Comp)</th>
                                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Documents Uploaded</th>
                                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Invoiced (CAD)</th>
                                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Latest Bill status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {vendorList.map(v => (
                                    <tr key={v._id} className="hover:bg-slate-50/40 transition-colors">
                                        <td className="px-6 py-4">
                                            <div>
                                                <div className="text-xs font-black text-slate-900 uppercase">{v.companyName || 'Unknown Vendor'}</div>
                                                <div className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">{v.name} · {v.email}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                                                {v.vendorType || 'General'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-xs font-bold text-slate-700">
                                            {v.stats.totalWorkflows > 0 ? (
                                                <span className="text-xs font-bold text-slate-900">
                                                    {v.stats.totalWorkflows} assigned ({v.stats.activeWorkflows} active / {v.stats.completedWorkflows} done)
                                                </span>
                                            ) : (
                                                <span className="text-slate-400 text-xs">No workflows</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-xs font-bold text-slate-600">
                                            {v.stats.totalDocsUploaded} document(s)
                                        </td>
                                        <td className="px-6 py-4 text-xs font-extrabold text-slate-900">
                                            {v.stats.totalBillsCount > 0 ? (
                                                <div>
                                                    <div>{formatCAD(v.stats.totalInvoiced)}</div>
                                                    <div className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">{v.stats.totalBillsCount} bill(s) submitted</div>
                                                </div>
                                            ) : (
                                                <span className="text-slate-400 font-bold">$0.00 CAD</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {v.stats.latestBillStatus !== 'N/A' ? (
                                                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                                                    v.stats.latestBillStatus === 'Paid' || v.stats.latestBillStatus === 'Approved' ? 'bg-emerald-50 text-emerald-600' :
                                                    v.stats.latestBillStatus === 'Rejected' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                                                }`}>
                                                    {v.stats.latestBillStatus}
                                                </span>
                                            ) : (
                                                <span className="text-slate-400 text-xs">—</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                
                                {vendorList.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="py-16 text-center">
                                            <ShieldAlert className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                                            <p className="text-slate-400 text-xs font-black uppercase tracking-widest">No matching vendor summaries detected</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}

                </div>
            </div>
        </div>
    );
};

export default Reports;
