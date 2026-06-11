import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { 
    Search, Workflow, Mail, FileText, 
    ChevronRight, Loader2, Sparkles, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SpotlightSearchProps {
    isOpen: boolean;
    onClose: () => void;
}

const SpotlightSearch: React.FC<SpotlightSearchProps> = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any>({
        users: [],
        workflows: [],
        offerLetters: [],
        assignments: []
    });
    const [loading, setLoading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setQuery('');
            setResults({ users: [], workflows: [], offerLetters: [], assignments: [] });
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

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
                console.error('Spotlight search error', err);
            } finally {
                setLoading(false);
            }
        }, 300);

        return () => clearTimeout(delayDebounce);
    }, [query]);

    const handleSelect = (path: string) => {
        onClose();
        navigate(path);
    };

    const hasResults = 
        results.users.length > 0 || 
        results.workflows.length > 0 || 
        results.offerLetters.length > 0 || 
        results.assignments.length > 0;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4">
                    {/* Backdrop */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-950/40 backdrop-blur-md"
                    />

                    {/* Search Dialog */}
                    <motion.div 
                        initial={{ scale: 0.97, opacity: 0, y: -10 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.97, opacity: 0, y: -10 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                        className="relative bg-white/90 backdrop-blur-xl border border-slate-200/80 rounded-[24px] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[75vh]"
                    >
                        {/* Search Input Box */}
                        <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                            <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
                            <input 
                                ref={inputRef}
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search anything (names, workflows, letters, numbers, salaries...)"
                                className="w-full bg-transparent border-none text-slate-800 text-sm font-medium focus:outline-none placeholder-slate-400"
                            />
                            {loading ? (
                                <Loader2 className="w-4 h-4 text-blue-500 animate-spin flex-shrink-0" />
                            ) : query ? (
                                <button onClick={() => setQuery('')} className="p-1 hover:bg-slate-200/50 rounded-full transition-colors">
                                    <X className="w-4 h-4 text-slate-400" />
                                </button>
                            ) : (
                                <span className="text-[10px] font-black text-slate-400 bg-slate-200/50 px-2 py-0.5 rounded uppercase tracking-wider">ESC</span>
                            )}
                        </div>

                        {/* Results / Help View */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 max-h-[50vh]">
                            {!query && (
                                <div className="text-center py-10 space-y-3">
                                    <Sparkles className="w-8 h-8 text-blue-500 mx-auto opacity-75" />
                                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest">Advanced Procurement Search</h4>
                                    <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                                        Type a candidate name, workflow name, salary amount (number), status (e.g. pending), or department to instantly filter the entire ledger.
                                    </p>
                                </div>
                            )}

                            {query && !loading && !hasResults && (
                                <div className="text-center py-10 space-y-2">
                                    <span className="text-xs font-bold text-slate-400 uppercase">No Matches Found</span>
                                    <p className="text-xs text-slate-300">We couldn't find any resources matching "{query}"</p>
                                </div>
                            )}

                            {/* Group: Staff Directory */}
                            {results.users.length > 0 && (
                                <div className="space-y-2">
                                    <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em] px-2">Staff Directory</h3>
                                    <div className="space-y-1">
                                        {results.users.map((item: any) => (
                                            <div 
                                                key={item._id}
                                                onClick={() => handleSelect(`/employees/${item._id}`)}
                                                className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 cursor-pointer transition-all group"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                                                        {item.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="text-xs font-black text-slate-800 uppercase">{item.name}</div>
                                                        <div className="text-[10px] text-slate-400 font-bold uppercase">{item.role} • {item.department || 'No Dept'}</div>
                                                    </div>
                                                </div>
                                                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Group: Active Onboarding Assignments */}
                            {results.assignments.length > 0 && (
                                <div className="space-y-2">
                                    <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em] px-2">Active Onboardings</h3>
                                    <div className="space-y-1">
                                        {results.assignments.map((item: any) => (
                                            <div 
                                                key={item._id}
                                                onClick={() => handleSelect(`/assignments/${item._id}`)}
                                                className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 cursor-pointer transition-all group"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                                        <FileText className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <div className="text-xs font-black text-slate-800 uppercase">{item.workflow?.name || 'Onboarding Flow'}</div>
                                                        <div className="text-[10px] text-slate-400 font-bold uppercase">Assignee: {item.user?.name} ({item.status})</div>
                                                    </div>
                                                </div>
                                                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Group: Employment Proposals */}
                            {results.offerLetters.length > 0 && (
                                <div className="space-y-2">
                                    <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em] px-2">Employment Proposals</h3>
                                    <div className="space-y-1">
                                        {results.offerLetters.map((item: any) => (
                                            <div 
                                                key={item._id}
                                                onClick={() => handleSelect(`/offer-letters`)}
                                                className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 cursor-pointer transition-all group"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                                                        <Mail className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <div className="text-xs font-black text-slate-800 uppercase">Offer: {item.candidate?.name}</div>
                                                        <div className="text-[10px] text-slate-400 font-bold uppercase">
                                                            {item.position} • {item.department} • ${item.salary?.toLocaleString() || '0'} ({item.status})
                                                        </div>
                                                    </div>
                                                </div>
                                                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Group: Workflows templates */}
                            {results.workflows.length > 0 && (
                                <div className="space-y-2">
                                    <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em] px-2">Standard Workflows</h3>
                                    <div className="space-y-1">
                                        {results.workflows.map((item: any) => (
                                            <div 
                                                key={item._id}
                                                onClick={() => handleSelect(`/workflows`)}
                                                className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 cursor-pointer transition-all group"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                                                        <Workflow className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <div className="text-xs font-black text-slate-800 uppercase">{item.name}</div>
                                                        <div className="text-[10px] text-slate-400 font-bold uppercase">{item.tasks?.length || 0} Defined tasks</div>
                                                    </div>
                                                </div>
                                                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer Tips */}
                        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-between items-center text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                            <span>Navigation: Click to jump</span>
                            <span>Powered by ProcureTrack</span>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default SpotlightSearch;
