import React, { useEffect, useState } from 'react';
import { fetchHealth } from '../lib/api';
import { User, Search, Bell, AlertTriangle, ArrowRight, Bot, Sparkles, Mic, ChevronDown } from 'lucide-react';

const Dashboard: React.FC = () => {
    const [health, setHealth] = useState<{status: string, db: string} | null>(null);

    useEffect(() => {
        fetchHealth().then(setHealth);
    }, []);

    return (
        <div className="space-y-6">
            {/* Top Bar */}
            <header className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3 lg:hidden">
                    <div className="w-10 h-10 rounded-full bg-surface-white flex items-center justify-center text-bg-black">
                        <User size={20} strokeWidth={2.5} />
                    </div>
                    <span className="font-medium text-lg">Hi, User!</span>
                </div>
                <div className="hidden lg:flex items-center text-text-muted text-sm font-medium">
                    Dashboard / Overview
                </div>
                <div className="flex gap-3">
                    <div className="hidden lg:flex bg-surface-white rounded-pill px-5 py-2.5 items-center gap-3 text-bg-black w-64 shadow-soft">
                        <Search size={16} strokeWidth={3} className="text-bg-black" />
                        <span className="text-sm font-bold text-text-muted">Search...</span>
                    </div>
                    <button className="btn-icon lg:hidden">
                        <Search size={18} strokeWidth={2.5} />
                    </button>
                    <button className="btn-icon relative">
                        <Bell size={18} strokeWidth={2.5} />
                        <div className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full bg-card-coral border-2 border-surface-white"></div>
                    </button>
                </div>
            </header>

            {/* Squad Context Pill */}
            <div className="bg-surface-white rounded-pill px-5 py-3 inline-flex items-center gap-3 text-bg-black mb-2 shadow-soft">
                <div className="w-5 h-5 rounded-sm bg-card-coral"></div>
                <span className="font-bold text-sm">Squad Alpha</span>
                <ChevronDown size={16} strokeWidth={3} className="ml-1" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                
                {/* Hero Stat Card (Coral) */}
                <div className="card-color bg-card-coral lg:col-span-8 flex flex-col justify-between min-h-[360px]">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-sm bg-bg-black/20"></div>
                            <h2 className="font-extrabold text-[22px] tracking-tight uppercase">Group Points</h2>
                        </div>
                        <div className="pill bg-surface-white text-bg-black">
                            This Week <span className="ml-2 text-xs">▼</span>
                        </div>
                    </div>
                    
                    <div className="flex-1 flex flex-col justify-end pt-12">
                        <div className="text-[56px] font-display font-black tracking-tighter leading-none mb-4">12,450</div>
                        <div className="flex gap-4">
                            <div className="bg-bg-black/10 rounded-xl p-4 flex-1">
                                <div className="text-sm font-accent font-semibold mb-1">Current Streak</div>
                                <div className="flex items-end gap-2">
                                    <span className="text-3xl font-display font-black leading-none">14d</span>
                                    <span className="bg-bg-black/20 rounded-full px-2 py-0.5 text-[11px] font-accent font-bold">+1d</span>
                                </div>
                            </div>
                            <div className="bg-bg-black/10 rounded-xl p-4 flex-1">
                                <div className="text-sm font-accent font-semibold mb-1">Today's Contr.</div>
                                <div className="flex items-end gap-2">
                                    <span className="text-3xl font-display font-black leading-none">8</span>
                                    <span className="bg-bg-black/20 rounded-full px-2 py-0.5 text-[11px] font-accent font-bold">+2</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Alert Card (Black) */}
                <div className="card-dark lg:col-span-4 flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-card-mustard flex items-center justify-center text-bg-black">
                            <AlertTriangle size={24} strokeWidth={2.5} />
                        </div>
                        <button className="btn-icon w-8 h-8">
                            <ArrowRight size={16} strokeWidth={2.5} />
                        </button>
                    </div>
                    <h2 className="font-extrabold text-[24px] tracking-tight leading-tight mb-2">API Link Status</h2>
                    <p className="text-text-muted text-sm mb-6 flex-1">
                        Monitoring connection to the backend cluster. Ensure database is reachable.
                    </p>
                    
                    <div className="bg-[#1C1C1C] rounded-xl p-4 space-y-3">
                        <div className="flex justify-between items-center text-sm font-bold">
                            <span>Backend</span>
                            <span className={health?.status === 'ok' ? 'text-card-mint' : 'text-card-coral'}>
                                {health?.status === 'ok' ? 'ONLINE' : 'OFFLINE'}
                            </span>
                        </div>
                        <div className="flex justify-between items-center text-sm font-bold">
                            <span>Database</span>
                            <span className={health?.db === 'connected' ? 'text-card-mint' : 'text-card-coral'}>
                                {health?.db === 'connected' ? 'CONNECTED' : 'UNREACHABLE'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Weekly Heatmap (Periwinkle) */}
                <div className="card-color bg-card-periwinkle lg:col-span-5 min-h-[320px] flex flex-col">
                    <div className="flex justify-between items-start mb-8">
                        <h2 className="font-extrabold text-[22px] tracking-tight uppercase">Weekly Flow</h2>
                        <div className="pill bg-surface-white text-bg-black">All <span className="ml-2 text-xs">▼</span></div>
                    </div>
                    
                    <div className="flex justify-between mt-auto">
                        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                            <div key={i} className="flex flex-col items-center gap-2">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${i === 3 ? 'bg-bg-black text-text-on-dark' : 'border-2 border-bg-black/20 text-bg-black/60'}`}>
                                    {Math.floor(Math.random() * 90) + 10}
                                </div>
                                <span className="text-xs font-bold opacity-60">{day}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Radial Gauge (Mint) */}
                <div className="card-color bg-card-mint lg:col-span-3 min-h-[320px] flex flex-col items-center justify-center relative">
                    <div className="absolute top-6 left-6 font-display font-black text-[22px] tracking-tight uppercase">Timing</div>
                    <button className="btn-icon w-8 h-8 absolute top-6 right-6">
                        <ArrowRight size={16} strokeWidth={2.5} />
                    </button>
                    
                    <div className="relative w-40 h-40 mt-6">
                        <div className="absolute inset-0 rounded-full border-[16px] border-bg-black/10"></div>
                        <div className="absolute inset-0 rounded-full border-[16px] border-card-coral" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 50%)' }}></div>
                        
                        {/* Center pointer */}
                        <div className="absolute top-1/2 left-1/2 w-3 h-3 rounded-full bg-bg-black -translate-x-1/2 -translate-y-1/2"></div>
                        <div className="absolute top-1/2 left-1/2 w-1 h-16 bg-bg-black origin-bottom -translate-x-1/2 -translate-y-full rotate-[45deg]"></div>
                    </div>
                    
                    <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-card-coral"></div>
                            <span className="text-xs font-accent font-semibold">Peak</span>
                        </div>
                        <div className="font-display font-black text-2xl">84%</div>
                    </div>
                </div>

                {/* AI Panel (Black) */}
                <div className="card-dark lg:col-span-4 min-h-[320px] flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <h2 className="font-extrabold text-[22px] tracking-tight uppercase">AI Ops</h2>
                            <span className="bg-card-periwinkle text-bg-black text-[10px] font-extrabold px-2 py-0.5 rounded-sm">BETA</span>
                        </div>
                        <div className="w-2 h-2 rounded-full bg-card-coral"></div>
                    </div>
                    
                    <div className="flex-1 flex flex-col">
                        <div className="flex items-start gap-4 mb-4">
                            <div className="w-10 h-10 rounded-full bg-surface-white shrink-0 flex items-center justify-center text-bg-black">
                                <Bot size={20} strokeWidth={2.5} />
                            </div>
                            <p className="text-sm font-medium leading-relaxed">
                                Squad completion is <span className="text-card-mustard font-bold">dropping</span> today. Two members haven't updated their trackers.
                            </p>
                        </div>
                        
                        <div className="flex gap-2 mt-2">
                            <button className="bg-[#1C1C1C] hover:bg-[#2C2C2C] text-sm font-bold px-4 py-2 rounded-full transition-colors">Send Ping</button>
                            <button className="bg-[#1C1C1C] hover:bg-[#2C2C2C] text-sm font-bold px-4 py-2 rounded-full transition-colors">Details</button>
                        </div>
                    </div>
                    
                    <div className="mt-4 flex items-center gap-3">
                        <button className="w-12 h-12 rounded-full bg-card-coral flex items-center justify-center shrink-0">
                            <Sparkles size={20} strokeWidth={2.5} className="text-surface-white" />
                        </button>
                        <div className="flex-1 bg-[#1C1C1C] rounded-full h-12 flex items-center px-4 justify-between">
                            <span className="text-text-muted text-sm font-medium">Ask AI...</span>
                            <Mic size={18} strokeWidth={2.5} className="text-text-muted" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
