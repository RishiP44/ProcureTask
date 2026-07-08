import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { motion } from 'framer-motion';
import { 
    ResponsiveContainer, PieChart, Pie, Cell, Tooltip,
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    BarChart, Bar
} from 'recharts';
import {
    Users, Clock, Activity, ShieldCheck, BarChart3,
    ChevronRight, ReceiptText, TrendingUp, AlertTriangle, Hourglass, 
    Layers, Search, Building2
} from 'lucide-react';
import toast from 'react-hot-toast';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [assignments, setAssignments] = useState<any[]>([]);
    const [hrStats, setHRStats] = useState<any>(null);
    const [analytics, setAnalytics] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'trends' | 'bottlenecks'>('overview');
    
    // Filtering states
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedWorkflow, setSelectedWorkflow] = useState('all');

    const isHR = user?.role === 'Admin' || user?.role === 'HR';
    const isVendor = user?.role === 'Vendor';

    useEffect(() => {
        const fetchData = async () => {
            try {
                const endpoint = isHR ? '/assignments' : '/assignments/my-assignments';
                const res = await api.get(endpoint);
                setAssignments(res.data);

                if (isHR) {
                    const statsRes = await api.get('/users/stats');
                    setHRStats(statsRes.data);

                    const analyticsRes = await api.get('/analytics');
                    setAnalytics(analyticsRes.data);
                }
            } catch (err) {
                console.error('Dashboard fetch error', err);
                toast.error('Failed to sync dashboard metrics');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user, isHR]);

    // AI Assisted: Calculate basic task status distribution for standard users and fallback
    const pending = assignments.filter(a => a.status === 'pending').length;
    const inProgress = assignments.filter(a => a.status === 'in_progress').length;
    const completed = assignments.filter(a => a.status === 'completed').length;
    const total = assignments.length;

    const chartData = [
        { name: 'Pending', value: pending },
        { name: 'In Progress', value: inProgress },
        { name: 'Completed', value: completed },
    ].filter(d => d.value > 0);

    // AI Assisted: Filter the recent assignments list dynamically based on search query and workflow type
    const filteredAssignments = assignments.filter(a => {
        const matchesSearch = 
            (a.user?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (a.user?.companyName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (a.workflow?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesWorkflow = selectedWorkflow === 'all' || a.workflow?._id === selectedWorkflow;
        
        return matchesSearch && matchesWorkflow;
    });

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.08 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 15 },
        show: { opacity: 1, y: 0 }
    };

    if (loading) {
        return (
            <div className="space-y-8 max-w-7xl mx-auto">
                <div className="h-20 w-64 pt-skeleton rounded-lg animate-pulse" />
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-32 pt-skeleton rounded-xl animate-pulse" />)}
                </div>
                <div className="h-96 pt-skeleton rounded-xl animate-pulse" />
            </div>
        );
    }

    return (
        <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-8 pb-20 max-w-7xl mx-auto animate-fade-in"
        >
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h2 className="text-[10px] font-extrabold text-blue-500 uppercase tracking-[0.3em] mb-2">Systems Overview</h2>
                    <h1 className="text-4xl pt-title-gradient pt-outfit">Dashboard</h1>
                    <p className="text-slate-400 text-sm mt-3 font-medium">
                        Welcome back, <span className="text-slate-900 font-bold">{user?.name}</span>. 
                        {isHR ? ' Here is the enterprise operations report.' : ' Track your assigned onboarding checklists below.'}
                    </p>
                </div>
                
                <div className="flex items-center gap-3">
                    {isHR && (
                        <>
                            <Link to="/employees" className="pt-btn-secondary px-5 py-3 hover:bg-slate-100">
                                Employees
                            </Link>
                            <Link to="/workflows" className="pt-btn-primary px-5 py-3 flex items-center gap-2">
                                <Layers className="w-4 h-4" />
                                Workflows
                            </Link>
                        </>
                    )}
                    {isVendor && (
                        <Link to="/vendor-bills" className="pt-btn-accent px-5 py-3 flex items-center gap-2">
                            <ReceiptText className="w-4 h-4" />
                            Submit Audited Bill
                        </Link>
                    )}
                </div>
            </div>

            {/* AI Assisted: Render enhanced operational KPIs for Admin and HR roles */}
            {isHR && analytics ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <motion.div variants={itemVariants} className="pt-glass-card p-6 border-l-4 border-l-slate-900">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-slate-50 rounded-lg text-slate-600"><Users className="w-4 h-4" /></div>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Staff</span>
                        </div>
                        <div className="text-3xl font-black text-slate-900 pt-outfit">{hrStats?.total || 0}</div>
                        <p className="text-[10px] font-bold text-emerald-500 uppercase mt-2">{hrStats?.active || 0} Active Profiles</p>
                    </motion.div>

                    <motion.div variants={itemVariants} className="pt-glass-card p-6 border-l-4 border-l-rose-500">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-rose-50 rounded-lg text-rose-600"><AlertTriangle className="w-4 h-4" /></div>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Overdue Workflows</span>
                        </div>
                        <div className="text-3xl font-black text-rose-600 pt-outfit">{analytics.kpis.overdueAssignments}</div>
                        <p className="text-[10px] font-bold text-rose-500 uppercase mt-2">Requires Attention</p>
                    </motion.div>

                    <motion.div variants={itemVariants} className="pt-glass-card p-6 border-l-4 border-l-blue-500">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><Hourglass className="w-4 h-4" /></div>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Avg Completion Time</span>
                        </div>
                        <div className="text-3xl font-black text-slate-900 pt-outfit">{analytics.kpis.avgCompletionTime}d</div>
                        <p className="text-[10px] font-bold text-blue-500 uppercase mt-2">Average SLA Rate</p>
                    </motion.div>

                    <motion.div variants={itemVariants} className="pt-glass-card p-6 border-l-4 border-l-emerald-500">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600"><TrendingUp className="w-4 h-4" /></div>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">SLA Compliance</span>
                        </div>
                        <div className="text-3xl font-black text-slate-900 pt-outfit">{analytics.kpis.slaComplianceRate}%</div>
                        <p className="text-[10px] font-bold text-emerald-500 uppercase mt-2">Completed on Time</p>
                    </motion.div>
                </div>
            ) : (
                /* Simple KPI grid fallback for standard users (Employee/Vendor) */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <motion.div variants={itemVariants} className="pt-glass-card p-6 border-l-4 border-l-amber-500">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-amber-50 rounded-lg text-amber-600"><Clock className="w-4 h-4" /></div>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Pending</span>
                        </div>
                        <div className="text-3xl font-black text-slate-900 pt-outfit">{pending}</div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase mt-2">Awaiting Action</p>
                    </motion.div>

                    <motion.div variants={itemVariants} className="pt-glass-card p-6 border-l-4 border-l-blue-500">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><Activity className="w-4 h-4" /></div>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Active</span>
                        </div>
                        <div className="text-3xl font-black text-slate-900 pt-outfit">{inProgress}</div>
                        <p className="text-[10px] font-bold text-blue-500 uppercase mt-2">In Progress</p>
                    </motion.div>

                    <motion.div variants={itemVariants} className="pt-glass-card p-6 border-l-4 border-l-emerald-500">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600"><ShieldCheck className="w-4 h-4" /></div>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Completed</span>
                        </div>
                        <div className="text-3xl font-black text-slate-900 pt-outfit">{total > 0 ? Math.round((completed/total)*100) : 0}%</div>
                        <p className="text-[10px] font-bold text-emerald-500 uppercase mt-2">Completion Rate</p>
                    </motion.div>
                </div>
            )}

            {/* AI Assisted: Navigation Tabs for Admin & HR Analytics Breakdown */}
            {isHR && analytics && (
                <div className="flex border-b border-slate-200 gap-6">
                    <button 
                        onClick={() => setActiveTab('overview')} 
                        className={`pb-3 text-xs font-black uppercase tracking-widest border-b-2 transition-all ${
                            activeTab === 'overview' ? 'border-blue-500 text-blue-600 font-extrabold' : 'border-transparent text-slate-400 hover:text-slate-600'
                        }`}
                    >
                        Overview
                    </button>
                    <button 
                        onClick={() => setActiveTab('trends')} 
                        className={`pb-3 text-xs font-black uppercase tracking-widest border-b-2 transition-all ${
                            activeTab === 'trends' ? 'border-blue-500 text-blue-600 font-extrabold' : 'border-transparent text-slate-400 hover:text-slate-600'
                        }`}
                    >
                        Performance Trends
                    </button>
                    <button 
                        onClick={() => setActiveTab('bottlenecks')} 
                        className={`pb-3 text-xs font-black uppercase tracking-widest border-b-2 transition-all ${
                            activeTab === 'bottlenecks' ? 'border-blue-500 text-blue-600 font-extrabold' : 'border-transparent text-slate-400 hover:text-slate-600'
                        }`}
                    >
                        Process Bottlenecks
                    </button>
                </div>
            )}

            {/* AI Assisted: Render Tab Contents */}
            {activeTab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Status Distribution (Left Card) */}
                    <motion.div variants={itemVariants} className="lg:col-span-1 pt-glass-card p-6 flex flex-col justify-between">
                        <div>
                            <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                                <BarChart3 className="w-3.5 h-3.5 text-blue-600" />
                                Status Distribution
                            </h3>
                            <div className="h-[200px] w-full flex items-center justify-center">
                                {chartData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={chartData}
                                                innerRadius={55}
                                                outerRadius={75}
                                                paddingAngle={6}
                                                dataKey="value"
                                                stroke="none"
                                            >
                                                {chartData.map((_, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip 
                                                contentStyle={{ 
                                                    borderRadius: '8px', 
                                                    border: 'none', 
                                                    boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                                                    fontSize: '11px',
                                                    fontWeight: 'bold'
                                                }} 
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No Active Work</span>
                                )}
                            </div>
                        </div>
                        <div className="mt-4 space-y-2">
                            {chartData.map((d, i) => (
                                <div key={d.name} className="flex items-center justify-between border-b border-slate-50 pb-1.5">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i] }} />
                                        <span className="text-[9px] font-bold text-slate-500 uppercase">{d.name}</span>
                                    </div>
                                    <span className="text-[10px] font-black text-slate-900">{d.value}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Recent Work Table (Right Card) */}
                    <motion.div variants={itemVariants} className="lg:col-span-2 pt-glass-card flex flex-col">
                        <div className="p-6 border-b border-slate-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-50/20">
                            <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                <Activity className="w-3.5 h-3.5 text-blue-600" />
                                {isHR ? 'Onboarding Operations Registry' : 'My Worklist'}
                            </h3>
                            {isHR && (
                                <div className="flex gap-2 w-full sm:w-auto">
                                    <div className="relative flex-1 sm:flex-initial">
                                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                        <input 
                                            value={searchQuery}
                                            onChange={e => setSearchQuery(e.target.value)}
                                            placeholder="Search name/workflow..." 
                                            className="pt-input text-xs pl-8 py-1.5 w-full sm:w-48 bg-white" 
                                        />
                                    </div>
                                    <select 
                                        value={selectedWorkflow}
                                        onChange={e => setSelectedWorkflow(e.target.value)}
                                        className="pt-input text-xs py-1.5 w-32 bg-white"
                                    >
                                        <option value="all">All Workflows</option>
                                        {analytics?.workflowPerformance?.map((w: any) => (
                                            <option key={w._id} value={w._id}>{w.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>
                        <div className="flex-1 overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-50 bg-slate-50/10">
                                        {isHR && <th className="px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-left">Staff Member</th>}
                                        <th className="px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-left">Workflow</th>
                                        <th className="px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-left">Progress</th>
                                        <th className="px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-left text-right">Navigate</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {filteredAssignments.slice(0, 6).map(a => {
                                        const pct = Math.round(((a.tasks?.filter((t: any) => t.status === 'completed').length || 0) / (a.tasks?.length || 1)) * 100);
                                        return (
                                            <tr key={a._id} className="hover:bg-slate-50/50 transition-colors group">
                                                {isHR && (
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-7 h-7 bg-blue-50 rounded-full flex items-center justify-center text-[10px] font-bold text-blue-600">
                                                                {(a.user?.companyName || a.user?.name)?.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <div className="text-xs font-black text-slate-900 uppercase">
                                                                    {a.user?.role === 'Vendor' && a.user?.companyName ? a.user.companyName : a.user?.name}
                                                                </div>
                                                                <div className="text-[9px] text-slate-400 font-bold uppercase">
                                                                    {a.user?.role === 'Vendor' ? `Vendor Partner` : `Employee Profile`}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                )}
                                                <td className="px-6 py-4">
                                                    <div className="text-xs font-bold text-slate-800 uppercase tracking-tight">{a.workflow?.name}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden w-20">
                                                            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${pct}%` }} />
                                                        </div>
                                                        <span className="text-[9px] font-black text-slate-400 uppercase">{pct}%</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button 
                                                        onClick={() => navigate(`/assignments/${a._id}`)}
                                                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                    >
                                                        <ChevronRight className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {filteredAssignments.length === 0 && (
                                        <tr>
                                            <td colSpan={isHR ? 4 : 3} className="py-16 text-center text-slate-300 text-[10px] font-black uppercase tracking-widest">
                                                No workflows detected.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {filteredAssignments.length > 6 && (
                            <div className="p-4 border-t border-slate-50 bg-slate-50/10 text-center">
                                <Link to="/reports" className="text-[9px] font-black text-blue-600 uppercase tracking-widest hover:underline">
                                    View Full Registry Report
                                </Link>
                            </div>
                        )}
                    </motion.div>
                </div>
            )}

            {/* AI Assisted: Trends Tab Rendering */}
            {activeTab === 'trends' && isHR && analytics && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Onboarding starts vs completions over time (AreaChart) */}
                    <motion.div variants={itemVariants} className="pt-glass-card p-6">
                        <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                            <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                            Monthly Volume Trends
                        </h3>
                        <div className="h-[260px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={analytics.monthsTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorStarted" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                        </linearGradient>
                                        <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={9} fontWeight="bold" />
                                    <YAxis stroke="#94a3b8" fontSize={9} fontWeight="bold" />
                                    <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px', border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }} />
                                    <Area type="monotone" name="Started" dataKey="started" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorStarted)" />
                                    <Area type="monotone" name="Completed" dataKey="completed" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorCompleted)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    {/* Average Days to Complete by Template (BarChart) */}
                    <motion.div variants={itemVariants} className="pt-glass-card p-6">
                        <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                            <BarChart3 className="w-3.5 h-3.5 text-blue-600" />
                            Workflow Duration by Template
                        </h3>
                        <div className="h-[260px] w-full">
                            {analytics.workflowPerformance?.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={analytics.workflowPerformance} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} fontWeight="bold" />
                                        <YAxis label={{ value: 'Days', angle: -90, position: 'insideLeft', style: { fontSize: '9px', fontWeight: 'bold', fill: '#94a3b8' } }} stroke="#94a3b8" fontSize={9} fontWeight="bold" />
                                        <Tooltip 
                                            formatter={(value) => [`${Math.round(Number(value) * 10) / 10} Days`, 'Avg Duration']}
                                            contentStyle={{ fontSize: '11px', borderRadius: '8px', border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }} 
                                        />
                                        <Bar dataKey="avgDays" name="Avg Days" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={45}>
                                            {analytics.workflowPerformance.map((_: any, index: number) => (
                                                <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#3b82f6' : '#60a5fa'} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-[10px] font-black text-slate-300 uppercase tracking-widest">No completed data</div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}

            {/* AI Assisted: Bottlenecks Tab Rendering */}
            {activeTab === 'bottlenecks' && isHR && analytics && (
                <div className="grid grid-cols-1 gap-8">
                    {/* Horizontal Task Performance Bottlenecks chart */}
                    <motion.div variants={itemVariants} className="pt-glass-card p-6">
                        <div className="mb-6">
                            <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-1 flex items-center gap-2">
                                <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                                Task SLA & Bottleneck Analysis
                            </h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Shows the tasks taking the longest to complete from assignment start date</p>
                        </div>
                        <div className="h-[350px] w-full">
                            {analytics.taskBottlenecks?.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart 
                                        data={analytics.taskBottlenecks} 
                                        layout="vertical"
                                        margin={{ top: 10, right: 30, left: 60, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                        <XAxis type="number" label={{ value: 'Average Duration (Days)', position: 'insideBottom', offset: -5, style: { fontSize: '9px', fontWeight: 'bold', fill: '#94a3b8' } }} stroke="#94a3b8" fontSize={9} fontWeight="bold" />
                                        <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={9} width={120} fontWeight="bold" />
                                        <Tooltip 
                                            formatter={(value) => [`${Math.round(Number(value) * 10) / 10} Days`, 'Avg Time to Complete']}
                                            contentStyle={{ fontSize: '11px', borderRadius: '8px', border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }} 
                                        />
                                        <Bar dataKey="avgDays" fill="#ef4444" radius={[0, 4, 4, 0]} maxBarSize={25}>
                                            {analytics.taskBottlenecks.map((d: any, index: number) => {
                                                // High-risk bottleneck color coding
                                                const color = d.avgDays > 5 ? '#ef4444' : d.avgDays > 2 ? '#f59e0b' : '#3b82f6';
                                                return <Cell key={`cell-${index}`} fill={color} />;
                                            })}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-[10px] font-black text-slate-300 uppercase tracking-widest">No task records detected</div>
                            )}
                        </div>
                    </motion.div>

                    {/* Department distribution comparison cards */}
                    <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Department Distribution (Employees) */}
                        <div className="pt-glass-card p-6">
                            <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Users className="w-3.5 h-3.5 text-blue-600" />
                                Employee Distribution by Dept
                            </h3>
                            <div className="space-y-3">
                                {analytics.departmentDistribution?.map((d: any) => (
                                    <div key={d.department} className="flex items-center justify-between border-b border-slate-50 pb-2">
                                        <span className="text-[10px] font-bold text-slate-600 uppercase">{d.department}</span>
                                        <span className="text-xs font-black text-slate-900">{d.count}</span>
                                    </div>
                                ))}
                                {analytics.departmentDistribution?.length === 0 && (
                                    <div className="text-center py-6 text-[10px] font-black text-slate-300 uppercase">No active departments</div>
                                )}
                            </div>
                        </div>

                        {/* Vendor Type Distribution */}
                        <div className="pt-glass-card p-6">
                            <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Building2 className="w-3.5 h-3.5 text-blue-600" />
                                Vendor Distribution by Category
                            </h3>
                            <div className="space-y-3">
                                {analytics.vendorTypeDistribution?.map((d: any) => (
                                    <div key={d.type} className="flex items-center justify-between border-b border-slate-50 pb-2">
                                        <span className="text-[10px] font-bold text-slate-600 uppercase">{d.type}</span>
                                        <span className="text-xs font-black text-slate-900">{d.count}</span>
                                    </div>
                                ))}
                                {analytics.vendorTypeDistribution?.length === 0 && (
                                    <div className="text-center py-6 text-[10px] font-black text-slate-300 uppercase">No vendor partners</div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </motion.div>
    );
};

export default Dashboard;
