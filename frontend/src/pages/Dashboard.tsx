import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { motion } from 'framer-motion';
import { 
    ResponsiveContainer, PieChart, Pie, Cell, Tooltip 
} from 'recharts';
import {
    Users, Clock, Activity, ShieldCheck, SendHorizontal, BarChart3,
    ChevronRight
} from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [assignments, setAssignments] = useState<any[]>([]);
    const [hrStats, setHRStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const isHR = user?.role === 'Admin' || user?.role === 'HR';

    useEffect(() => {
        const fetchData = async () => {
            try {
                const endpoint = isHR ? '/assignments' : '/assignments/my-assignments';
                const res = await api.get(endpoint);
                setAssignments(res.data);

                if (isHR) {
                    const statsRes = await api.get('/users/stats');
                    setHRStats(statsRes.data);
                }
            } catch (err) {
                console.error('Dashboard fetch error', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user, isHR]);

    const pending = assignments.filter(a => a.status === 'pending').length;
    const inProgress = assignments.filter(a => a.status === 'in_progress').length;
    const completed = assignments.filter(a => a.status === 'completed').length;
    const total = assignments.length;

    const chartData = [
        { name: 'Pending', value: pending },
        { name: 'In Progress', value: inProgress },
        { name: 'Completed', value: completed },
    ].filter(d => d.value > 0);

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    if (loading) {
        return (
            <div className="space-y-8">
                <div className="h-20 w-64 pt-skeleton" />
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[1,2,3,4].map(i => <div key={i} className="h-32 pt-skeleton" />)}
                </div>
                <div className="h-96 pt-skeleton" />
            </div>
        );
    }

    return (
        <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-12 pb-20"
        >
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h2 className="text-[10px] font-extrabold text-blue-500 uppercase tracking-[0.3em] mb-2">Systems Overview</h2>
                    <h1 className="text-4xl pt-title-gradient pt-outfit">Performance Dashboard</h1>
                    <p className="text-slate-400 text-sm mt-3 font-medium">Monitoring active onboarding workflows for <span className="text-slate-900 font-bold">{user?.name}</span></p>
                </div>
                {isHR && (
                    <div className="flex items-center gap-3">
                        <Link to="/employees" className="pt-btn-primary">
                            Staff Directory
                        </Link>
                        <Link to="/assign" className="pt-btn-accent">
                            <SendHorizontal className="w-3.5 h-3.5" />
                            Initiate Flow
                        </Link>
                    </div>
                )}
            </div>

            {/* Main Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {isHR && hrStats && (
                    <motion.div variants={itemVariants} className="pt-glass-card p-6 border-l-4 border-l-slate-900">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-slate-50 rounded-lg text-slate-600"><Users className="w-5 h-5" /></div>
                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Total Staff</span>
                        </div>
                        <div className="text-3xl font-black text-slate-900 pt-outfit">{hrStats.total}</div>
                        <p className="text-[10px] font-bold text-emerald-500 uppercase mt-2">{hrStats.active} Active Profiles</p>
                    </motion.div>
                )}
                <motion.div variants={itemVariants} className="pt-glass-card p-6 border-l-4 border-l-amber-400">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-amber-50 rounded-lg text-amber-600"><Clock className="w-5 h-5" /></div>
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Pending</span>
                    </div>
                    <div className="text-3xl font-black text-slate-900 pt-outfit">{pending}</div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-2">Awaiting Action</p>
                </motion.div>
                <motion.div variants={itemVariants} className="pt-glass-card p-6 border-l-4 border-l-blue-500">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><Activity className="w-5 h-5" /></div>
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Active</span>
                    </div>
                    <div className="text-3xl font-black text-slate-900 pt-outfit">{inProgress}</div>
                    <p className="text-[10px] font-bold text-blue-500 uppercase mt-2">In Progress</p>
                </motion.div>
                <motion.div variants={itemVariants} className="pt-glass-card p-6 border-l-4 border-l-emerald-500">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600"><ShieldCheck className="w-5 h-5" /></div>
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Reliability</span>
                    </div>
                    <div className="text-3xl font-black text-slate-900 pt-outfit">{total > 0 ? Math.round((completed/total)*100) : 0}%</div>
                    <p className="text-[10px] font-bold text-emerald-500 uppercase mt-2">Completion Rate</p>
                </motion.div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <motion.div variants={itemVariants} className="lg:col-span-1 pt-glass-card p-8">
                    <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-8 flex items-center gap-2">
                        <BarChart3 className="w-3.5 h-3.5 text-blue-600" />
                        Status Distribution
                    </h3>
                    <div className="h-[240px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={8}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {chartData.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ 
                                        borderRadius: '12px', 
                                        border: 'none', 
                                        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                                        fontSize: '12px',
                                        fontWeight: 'bold'
                                    }} 
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-6 space-y-3">
                        {chartData.map((d, i) => (
                            <div key={d.name} className="flex items-center justify-between border-b border-slate-50 pb-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i] }} />
                                    <span className="text-[10px] font-bold text-slate-500 uppercase">{d.name}</span>
                                </div>
                                <span className="text-[11px] font-black text-slate-900">{d.value}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                <motion.div variants={itemVariants} className="lg:col-span-2 pt-glass-card flex flex-col">
                    <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                        <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                            <Activity className="w-3.5 h-3.5 text-blue-600" />
                            {isHR ? 'Enterprise Activity Feed' : 'My Current Obligations'}
                        </h3>
                    </div>
                    <div className="flex-1 overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-50">
                                    {isHR && <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-left">Staff</th>}
                                    <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-left">Workflow</th>
                                    <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-left">Progress</th>
                                    <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-left text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {assignments.slice(0, 5).map(a => {
                                    const pct = Math.round(((a.tasks?.filter((t: any) => t.status === 'completed').length || 0) / (a.tasks?.length || 1)) * 100);
                                    return (
                                        <tr key={a._id} className="hover:bg-slate-50/50 transition-colors group">
                                            {isHR && (
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-7 h-7 bg-slate-100 rounded-full flex items-center justify-center text-[10px] font-bold text-slate-600">{a.user?.name?.charAt(0)}</div>
                                                        <div>
                                                            <div className="text-xs font-black text-slate-900 uppercase">{a.user?.name}</div>
                                                            <div className="text-[9px] text-slate-400 font-bold uppercase">{a.user?.role}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                            )}
                                            <td className="px-8 py-5">
                                                <div className="text-xs font-bold text-slate-800 uppercase tracking-tight">{a.workflow?.name}</div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden w-24">
                                                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${pct}%` }} />
                                                    </div>
                                                    <span className="text-[10px] font-black text-slate-400 uppercase">{pct}%</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <button 
                                                    onClick={() => navigate(`/assignments/${a._id}`)}
                                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                >
                                                    <ChevronRight className="w-5 h-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {assignments.length === 0 && (
                                    <tr>
                                        <td colSpan={isHR ? 4 : 3} className="py-20 text-center text-slate-300 text-[10px] font-black uppercase tracking-widest">
                                            No active streams detected.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {assignments.length > 5 && (
                        <div className="p-4 border-t border-slate-50 bg-slate-50/10 text-center">
                            <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">View Entire Registry</button>
                        </div>
                    )}
                </motion.div>
            </div>
        </motion.div>
    );
};

export default Dashboard;
