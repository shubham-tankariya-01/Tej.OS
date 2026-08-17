import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { DailyCommitmentFormat } from '../context/AuthContext';
import { fetchApi } from '../lib/api';
import { Check, ArrowRight } from 'lucide-react';

const AVATAR_SEEDS = ['seed1', 'seed2', 'seed3', 'seed4', 'seed5', 'seed6'];

const Onboarding: React.FC = () => {
    const { checkAuth } = useAuth();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    
    const [displayName, setDisplayName] = useState('');
    const [tagline, setTagline] = useState('');
    const [avatarSeed, setAvatarSeed] = useState(AVATAR_SEEDS[0]);
    const [format, setFormat] = useState<DailyCommitmentFormat>('text');

    const handleProfileSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setStep(2);
    };

    const handleFormatSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setStep(3);
    };

    const handleComplete = async () => {
        setIsLoading(true);
        try {
            // Update profile
            await fetchApi('/users/me/onboarding', {
                method: 'PATCH',
                body: JSON.stringify({
                    display_name: displayName,
                    avatar_seed: avatarSeed,
                    tagline: tagline || null,
                    daily_commitment_format: format
                })
            });
            // Accept rules
            await fetchApi('/users/me/accept-rules', {
                method: 'POST'
            });
            
            await checkAuth(); // Refetch user context
            navigate('/'); // Roster or Dashboard
        } catch (error) {
            console.error("Failed to complete onboarding", error);
            alert("Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-bg-black text-surface-white p-6 flex flex-col items-center justify-center">
            
            {/* Step 1: Profile */}
            {step === 1 && (
                <div className="w-full max-w-lg card-dark flex flex-col gap-6 animate-in fade-in zoom-in duration-300">
                    <div>
                        <div className="text-card-mustard font-accent font-bold text-sm mb-2 uppercase">Step 1 of 3</div>
                        <h1 className="font-extrabold text-[28px] tracking-tight uppercase mb-2">Build Your Profile</h1>
                        <p className="text-text-muted">How should the squad identify you?</p>
                    </div>
                    
                    <form onSubmit={handleProfileSubmit} className="flex flex-col gap-5">
                        <div>
                            <label className="block text-xs font-accent font-bold mb-2 uppercase tracking-wide">Display Name</label>
                            <input 
                                type="text" required value={displayName} onChange={e => setDisplayName(e.target.value)}
                                className="w-full bg-[#1C1C1C] border border-[#333] rounded-xl px-4 py-3 text-surface-white font-medium focus:border-surface-white outline-none"
                                placeholder="Your Name"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-accent font-bold mb-2 uppercase tracking-wide">Tagline (Optional)</label>
                            <input 
                                type="text" value={tagline} onChange={e => setTagline(e.target.value)}
                                className="w-full bg-[#1C1C1C] border border-[#333] rounded-xl px-4 py-3 text-surface-white font-medium focus:border-surface-white outline-none"
                                placeholder="e.g. Building the future"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-accent font-bold mb-2 uppercase tracking-wide">Select Avatar Seed</label>
                            <div className="flex gap-3 flex-wrap">
                                {AVATAR_SEEDS.map(seed => (
                                    <div 
                                        key={seed} 
                                        onClick={() => setAvatarSeed(seed)}
                                        className={`w-12 h-12 rounded-full flex items-center justify-center cursor-pointer transition-all ${avatarSeed === seed ? 'border-4 border-card-mint scale-110' : 'border border-[#333] opacity-60 hover:opacity-100'}`}
                                    >
                                        <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${seed}`} alt={seed} className="w-8 h-8 rounded-full" />
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        <button type="submit" className="w-full bg-surface-white text-bg-black rounded-pill py-3 font-accent font-bold flex justify-center items-center gap-2 hover:bg-white/90">
                            Continue <ArrowRight size={18} strokeWidth={3} />
                        </button>
                    </form>
                </div>
            )}

            {/* Step 2: Format */}
            {step === 2 && (
                <div className="w-full max-w-lg card-dark flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div>
                        <div className="text-card-periwinkle font-accent font-bold text-sm mb-2 uppercase">Step 2 of 3</div>
                        <h1 className="font-extrabold text-[28px] tracking-tight uppercase mb-2">Commitment Format</h1>
                        <p className="text-text-muted">How do you want to post your daily proof of work?</p>
                    </div>
                    
                    <form onSubmit={handleFormatSubmit} className="flex flex-col gap-4">
                        {[
                            { id: 'text', title: 'Text Update', desc: 'A simple paragraph of what you did.' },
                            { id: 'voice_note_style_text', title: 'Voice Note Style', desc: 'Raw, stream-of-consciousness brain dump.' },
                            { id: 'checklist', title: 'Checklist', desc: 'Bullet points of items completed.' }
                        ].map(f => (
                            <div 
                                key={f.id}
                                onClick={() => setFormat(f.id as DailyCommitmentFormat)}
                                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${format === f.id ? 'bg-[#1C1C1C] border-card-periwinkle' : 'border-[#333] hover:border-[#444]'}`}
                            >
                                <div className="flex justify-between items-center mb-1">
                                    <div className="font-bold">{f.title}</div>
                                    {format === f.id && <div className="w-5 h-5 rounded-full bg-card-periwinkle flex items-center justify-center text-bg-black"><Check size={12} strokeWidth={4} /></div>}
                                </div>
                                <div className="text-sm text-text-muted">{f.desc}</div>
                            </div>
                        ))}
                        
                        <button type="submit" className="w-full bg-surface-white text-bg-black rounded-pill py-3 font-accent font-bold flex justify-center items-center gap-2 mt-2 hover:bg-white/90">
                            Continue <ArrowRight size={18} strokeWidth={3} />
                        </button>
                    </form>
                </div>
            )}

            {/* Step 3: Rules */}
            {step === 3 && (
                <div className="w-full max-w-lg card-dark flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div>
                        <div className="text-card-coral font-accent font-bold text-sm mb-2 uppercase">Step 3 of 3</div>
                        <h1 className="font-extrabold text-[28px] tracking-tight uppercase mb-2">The Rules</h1>
                        <p className="text-text-muted">Understand the point system before entering.</p>
                    </div>
                    
                    <div className="flex flex-col gap-4">
                        <div className="bg-[#1C1C1C] p-4 rounded-xl border-l-4 border-card-coral">
                            <h3 className="font-bold mb-1 uppercase tracking-tight">The Void</h3>
                            <p className="text-sm text-text-muted">Miss a day, drop to zero. The void is absolute.</p>
                        </div>
                        <div className="bg-[#1C1C1C] p-4 rounded-xl border-l-4 border-card-mustard">
                            <h3 className="font-bold mb-1 uppercase tracking-tight">Comeback Multiplier</h3>
                            <p className="text-sm text-text-muted">Recover from the void with accelerated points for 3 days.</p>
                        </div>
                        <div className="bg-[#1C1C1C] p-4 rounded-xl border-l-4 border-card-mint">
                            <h3 className="font-bold mb-1 uppercase tracking-tight">Vanguard Zone</h3>
                            <p className="text-sm text-text-muted">Hard cap. Once you hit the Vanguard limit, you maintain it. No endless grinding.</p>
                        </div>
                    </div>
                    
                    <button 
                        onClick={handleComplete}
                        disabled={isLoading}
                        className="w-full bg-card-coral text-bg-black rounded-pill py-4 font-extrabold uppercase tracking-widest mt-2 hover:bg-opacity-90 disabled:opacity-50 transition-all"
                    >
                        {isLoading ? 'INITIALIZING...' : 'I UNDERSTAND AND ACCEPT'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default Onboarding;
