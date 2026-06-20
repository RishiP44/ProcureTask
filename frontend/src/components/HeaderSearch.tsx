import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
    Search, Workflow, Mail, FileText, 
    ChevronRight, Loader2, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const HeaderSearch: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any>({
        users: [],
        workflows: [],
        offerLetters: [],
        assignments: []
    });
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Close dropdown on Escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setIsOpen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Fetch search results (debounced)
    useEffect(() => {
        if (!query.trim()) {
            setResults({ users: [], workflows: [], offerLetters: [], assignments: [] });
            return;
        }

        const delayDebounce = setTimeout(async () => {
            setLoading(true);
            try {
                const res = await api.get(`/search?q=${encodeURIComponent(query)}`);
                setResults(res.data);
            } catch (err) {
                console.error('Header search error', err);
            } finally {
                setLoading(false);
            }
        }, 300);

        return () => clearTimeout(delayDebounce);
    }, [query]);

    const handleSelect = (path: string) => {
        setIsOpen(false);
        setQuery('');
        navigate(path);
    };

    const isEmployee = user?.role === 'Employee' || user?.role === 'Vendor';

    // Filter assignments if employee/vendor
    const filteredAssignments = isEmployee
        ? results.assignments.filter((item: any) => item.user?._id === user?._id)
        : results.assignments;

    // Filter out sections for employee
    const showUsers = !isEmployee && results.users.length > 0;
    const showWorkflows = !isEmployee && results.workflows.length > 0;
    const showOfferLetters = !isEmployee && results.offerLetters.length > 0;
    const showAssignments = filteredAssignments.length > 0;

    const hasResults = showUsers || showWorkflows || showOfferLetters || showAssignments;

    return (
        <div ref={containerRef} className="relative w-48 sm:w-60 md:w-64 lg:w-80">
            {/* Search Input Bar */}
            <div className="relative flex items-center">
                <Search className="absolute left-3 w-4 h-4 text-slate-400" />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    placeholder={isEmployee ? "Search your tasks..." : "Search Ledger..."}
                    className="w-full pl-9 pr-8 py-2 text-xs font-semibold bg-slate-50/50 hover:bg-slate-50 border border-slate-200/80 focus:border-blue-500 rounded-xl outline-none transition-all text-slate-800 placeholder-slate-400 shadow-inner"
                />
                {query && (
                    <button 
                        onClick={() => {
                            setQuery('');
                            setResults({ users: [], workflows: [], offerLetters: [], assignments: [] });
                        }}
                        className="absolute right-3 p-0.5 hover:bg-slate-200/50 rounded-full transition-colors"
                    >
                        <X className="w-3 h-3 text-slate-400" />
                    </button>
                )}
            </div>

            {/* Dropdown Results */}
            <AnimatePresence>
                {isOpen && (query || loading) && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.98 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full mt-2 right-0 w-80 sm:w-96 lg:w-[480px] bg-white/95 backdrop-blur-xl border border-slate-200/80 rounded-2xl shadow-2xl z-50 overflow-hidden max-h-[420px] flex flex-col"
                    >
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {loading ? (
                                <div className="flex items-center justify-center py-8 gap-2">
                                    <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Searching Ledger...</span>
                                </div>
                            ) : !hasResults ? (
                                <div className="text-center py-8">
                                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">No Matches Found</span>
                                    <p className="text-[10px] text-slate-400 mt-1">We couldn't find matches for "{query}"</p>
                                </div>
                            ) : (
                                <>
                                    {/* Group: Staff Directory */}
                                    {showUsers && (
                                        <div className="space-y-1.5">
                                            <h3 className="text-[9px] font-extrabold text-slate-400 uppercase tracking-[0.2em] px-1">Staff Directory</h3>
                                            <div className="space-y-0.5">
                                                {results.users.map((item: any) => (
                                                    <div 
                                                        key={item._id}
                                                        onClick={() => handleSelect(`/employees/${item._id}`)}
                                                        className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 cursor-pointer transition-all group"
                                                    >
                                                        <div className="flex items-center gap-2.5">
                                                            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                                                                {item.name.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <div className="text-[11px] font-black text-slate-800 uppercase">{item.name}</div>
                                                                <div className="text-[9px] text-slate-400 font-bold uppercase">{item.role} • {item.department || 'No Dept'}</div>
                                                            </div>
                                                        </div>
                                                        <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all" />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Group: Active Assignments */}
                                    {showAssignments && (
                                        <div className="space-y-1.5">
                                            <h3 className="text-[9px] font-extrabold text-slate-400 uppercase tracking-[0.2em] px-1">
                                                {isEmployee ? "Your Active Tasks" : "Active Onboardings"}
                                            </h3>
                                            <div className="space-y-0.5">
                                                {filteredAssignments.map((item: any) => (
                                                    <div 
                                                        key={item._id}
                                                        onClick={() => handleSelect(`/assignments/${item._id}`)}
                                                        className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 cursor-pointer transition-all group"
                                                    >
                                                        <div className="flex items-center gap-2.5">
                                                            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                                                <FileText className="w-4 h-4" />
                                                            </div>
                                                            <div>
                                                                <div className="text-[11px] font-black text-slate-800 uppercase">{item.workflow?.name || 'Onboarding Flow'}</div>
                                                                <div className="text-[9px] text-slate-400 font-bold uppercase">
                                                                    {isEmployee ? `Status: ${item.status}` : `Assignee: ${item.user?.name} (${item.status})`}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all" />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Group: Employment Proposals */}
                                    {showOfferLetters && (
                                        <div className="space-y-1.5">
                                            <h3 className="text-[9px] font-extrabold text-slate-400 uppercase tracking-[0.2em] px-1">Employment Proposals</h3>
                                            <div className="space-y-0.5">
                                                {results.offerLetters.map((item: any) => (
                                                    <div 
                                                        key={item._id}
                                                        onClick={() => handleSelect(`/offer-letters`)}
                                                        className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 cursor-pointer transition-all group"
                                                    >
                                                        <div className="flex items-center gap-2.5">
                                                            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                                                                <Mail className="w-4 h-4" />
                                                            </div>
                                                            <div>
                                                                <div className="text-[11px] font-black text-slate-800 uppercase">Offer: {item.candidate?.name}</div>
                                                                <div className="text-[9px] text-slate-400 font-bold uppercase">
                                                                    {item.position} • {item.department} • ${item.salary?.toLocaleString() || '0'} ({item.status})
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all" />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Group: Workflows */}
                                    {showWorkflows && (
                                        <div className="space-y-1.5">
                                            <h3 className="text-[9px] font-extrabold text-slate-400 uppercase tracking-[0.2em] px-1">Standard Workflows</h3>
                                            <div className="space-y-0.5">
                                                {results.workflows.map((item: any) => (
                                                    <div 
                                                        key={item._id}
                                                        onClick={() => handleSelect(`/workflows`)}
                                                        className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 cursor-pointer transition-all group"
                                                    >
                                                        <div className="flex items-center gap-2.5">
                                                            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                                                                <Workflow className="w-4 h-4" />
                                                            </div>
                                                            <div>
                                                                <div className="text-[11px] font-black text-slate-800 uppercase">{item.name}</div>
                                                                <div className="text-[9px] text-slate-400 font-bold uppercase">{item.tasks?.length || 0} Defined tasks</div>
                                                            </div>
                                                        </div>
                                                        <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all" />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                        {/* Footer Tips */}
                        <div className="px-4 py-2 bg-slate-50/80 border-t border-slate-100 flex justify-between items-center text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">
                            <span>Navigation: Click to jump</span>
                            <span>Powered by ProcureTask</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default HeaderSearch;
