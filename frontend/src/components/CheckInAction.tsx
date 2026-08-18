import React, { useState } from 'react';
import { Api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Check, Flame, X, AlertTriangle, Shield } from 'lucide-react';

interface CheckInActionProps {
    commitmentId: string;
    status: 'pending' | 'done' | 'partial' | 'missed';
    onCheckedIn: (updatedCommitment: any) => void;
}

const CheckInAction: React.FC<CheckInActionProps> = ({ commitmentId, status, onCheckedIn }) => {
    const { user } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [confirmMissed, setConfirmMissed] = useState(false);
    const [useFreeze, setUseFreeze] = useState(false);

    if (status !== 'pending') {
        let bgClass = 'bg-card-mint';
        let text = 'DONE';
        if (status === 'partial') { bgClass = 'bg-card-mustard'; text = 'PARTIAL'; }
        if (status === 'missed') { bgClass = 'bg-card-coral'; text = 'MISSED'; }
        
        return (
            <div className={`w-full rounded-2xl p-5 ${bgClass} text-bg-black flex flex-col items-center justify-center min-h-[140px]`}>
                <div className="font-extrabold text-[28px] tracking-tight uppercase leading-none">{text}</div>
                <div className="font-accent font-bold text-sm opacity-70 mt-1 uppercase">Today is Locked</div>
            </div>
        );
    }

    const handleCheckIn = async (checkInStatus: 'done' | 'partial' | 'missed') => {
        if (checkInStatus === 'missed' && !confirmMissed) {
            setConfirmMissed(true);
            return;
        }
        
        setIsSubmitting(true);
        try {
            const res = await Api.checkInCommitment(commitmentId, checkInStatus, useFreeze);
            onCheckedIn(res);
        } catch (err: any) {
            console.error(err);
            alert(err.message || "Failed to check in");
            setIsSubmitting(false);
        }
    };

    const freezeCount = user?.streak_freeze_count || 0;

    return (
        <div className="bg-[#1C1C1C] rounded-[28px] p-6 flex flex-col items-center justify-center min-h-[180px] shadow-soft relative overflow-hidden">
            {confirmMissed ? (
                <div className="flex flex-col items-center animate-in zoom-in duration-200">
                    <div className="w-12 h-12 rounded-full bg-card-coral flex items-center justify-center text-bg-black mb-3">
                        <AlertTriangle size={24} strokeWidth={3} />
                    </div>
                    <h3 className="text-surface-white font-extrabold text-lg uppercase tracking-tight mb-4">Accept The Void?</h3>
                    
                    {freezeCount > 0 && (
                        <div className="mb-4 bg-bg-black/50 p-3 rounded-2xl flex items-center gap-3 w-full border border-bg-black/80 cursor-pointer hover:bg-bg-black/80 transition-colors"
                             onClick={() => setUseFreeze(!useFreeze)}>
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${useFreeze ? 'border-card-mint bg-card-mint text-bg-black' : 'border-text-muted text-transparent'}`}>
                                <Check size={14} strokeWidth={4} />
                            </div>
                            <div className="flex-1">
                                <div className="text-surface-white font-bold text-sm flex items-center gap-1">
                                    <Shield size={14} /> Use Streak Freeze
                                </div>
                                <div className="text-text-muted text-xs font-medium">{freezeCount} token{freezeCount > 1 ? 's' : ''} available</div>
                            </div>
                        </div>
                    )}
                    
                    <div className="flex gap-3 w-full">
                        <button 
                            onClick={() => { setConfirmMissed(false); setUseFreeze(false); }}
                            disabled={isSubmitting}
                            className="flex-1 bg-surface-white/10 hover:bg-surface-white/20 text-surface-white font-bold rounded-pill py-3 text-sm transition-colors"
                        >
                            CANCEL
                        </button>
                        <button 
                            onClick={() => handleCheckIn('missed')}
                            disabled={isSubmitting}
                            className="flex-1 bg-card-coral hover:opacity-90 text-bg-black font-extrabold rounded-pill py-3 text-sm transition-colors"
                        >
                            CONFIRM
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    <div className="flex justify-between w-full items-center mb-6">
                        <h3 className="text-text-muted font-bold text-sm uppercase tracking-widest">End of Day Check-in</h3>
                        {freezeCount > 0 && (
                            <div className="flex items-center gap-1 text-card-mint font-bold text-xs bg-card-mint/10 px-2 py-1 rounded-sm">
                                <Shield size={12} /> {freezeCount} FREEZE{freezeCount > 1 ? 'S' : ''}
                            </div>
                        )}
                    </div>
                    
                    <div className="flex w-full gap-3">
                        <button 
                            onClick={() => handleCheckIn('done')}
                            disabled={isSubmitting}
                            className="flex-1 flex flex-col items-center gap-2 group"
                        >
                            <div className="w-14 h-14 rounded-full bg-surface-white group-hover:bg-card-mint transition-colors flex items-center justify-center text-bg-black">
                                <Check size={24} strokeWidth={3} />
                            </div>
                            <span className="text-xs font-bold text-surface-white">DONE</span>
                        </button>
                        
                        <button 
                            onClick={() => handleCheckIn('partial')}
                            disabled={isSubmitting}
                            className="flex-1 flex flex-col items-center gap-2 group"
                        >
                            <div className="w-14 h-14 rounded-full bg-surface-white group-hover:bg-card-mustard transition-colors flex items-center justify-center text-bg-black">
                                <Flame size={24} strokeWidth={3} />
                            </div>
                            <span className="text-xs font-bold text-surface-white">PARTIAL</span>
                        </button>
                        
                        <button 
                            onClick={() => handleCheckIn('missed')}
                            disabled={isSubmitting}
                            className="flex-1 flex flex-col items-center gap-2 group"
                        >
                            <div className="w-14 h-14 rounded-full bg-surface-white group-hover:bg-card-coral transition-colors flex items-center justify-center text-bg-black">
                                <X size={24} strokeWidth={3} />
                            </div>
                            <span className="text-xs font-bold text-surface-white">MISSED</span>
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default CheckInAction;
