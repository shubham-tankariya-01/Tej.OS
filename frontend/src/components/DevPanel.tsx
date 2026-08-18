import React, { useState } from 'react';
import { fetchApi } from '../lib/api';

const DevPanel: React.FC = () => {
    const [loading, setLoading] = useState(false);

    const callDebug = async (endpoint: string) => {
        setLoading(true);
        try {
            await fetchApi(`/debug/${endpoint}`, { method: 'POST' });
            window.location.reload(); // Hard reload to see state changes immediately
        } catch (err) {
            console.error(err);
            alert("Failed debug call");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-[#2D0A14] border border-card-coral/30 rounded-2xl p-4 mb-6 relative overflow-hidden">
            <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 bg-card-coral rounded-full animate-pulse"></div>
                <h3 className="text-card-coral font-bold text-xs tracking-widest uppercase">Dev Tools</h3>
            </div>
            <div className="flex flex-wrap gap-2 relative z-10">
                <button 
                    disabled={loading}
                    onClick={() => callDebug('setup-atonement-test')}
                    className="bg-bg-black hover:bg-[#222] text-surface-white text-xs font-bold py-2 px-4 rounded-md border border-white/10 transition-colors"
                >
                    Setup Atonement Test (Streak=120)
                </button>
                <button 
                    disabled={loading}
                    onClick={() => callDebug('setup-ghost-test')}
                    className="bg-bg-black hover:bg-[#222] text-surface-white text-xs font-bold py-2 px-4 rounded-md border border-white/10 transition-colors"
                >
                    Setup Ghost Test (-350 Pts)
                </button>
                <button 
                    disabled={loading}
                    onClick={() => callDebug('give-freeze')}
                    className="bg-bg-black hover:bg-[#222] text-card-mint text-xs font-bold py-2 px-4 rounded-md border border-card-mint/30 transition-colors"
                >
                    +1 Freeze Token
                </button>
                <button 
                    disabled={loading}
                    onClick={() => callDebug('reset-me')}
                    className="bg-bg-black hover:bg-[#222] text-text-muted text-xs font-bold py-2 px-4 rounded-md border border-white/10 transition-colors"
                >
                    Hard Reset User State
                </button>
            </div>
            
            <p className="text-text-muted text-[10px] mt-3">
                Instructions: Click a "Setup" button, then click "MISSED" on the Dashboard's End-of-Day Check-in to trigger the penalties and see the UI states.
            </p>
        </div>
    );
};

export default DevPanel;
