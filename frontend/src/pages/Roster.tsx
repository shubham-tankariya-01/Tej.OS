import React, { useEffect, useState } from 'react';
import { fetchApi } from '../lib/api';

import { Bot, LogOut, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface RosterUser {
    _id: string;
    display_name: string;
    avatar_seed: string;
    tagline: string | null;
    onboarding_complete: boolean;
}

const Roster: React.FC = () => {
    const { user, logout } = useAuth();
    const [members, setMembers] = useState<RosterUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadRoster = async () => {
            try {
                const data = await fetchApi<RosterUser[]>('/users/roster');
                setMembers(data);
            } catch (err) {
                console.error("Failed to load roster", err);
            } finally {
                setIsLoading(false);
            }
        };
        loadRoster();
    }, []);

    const colors = ['bg-card-coral', 'bg-card-periwinkle', 'bg-card-mustard', 'bg-card-mint'];

    return (
        <div className="space-y-6">
            <header className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="font-extrabold text-[28px] tracking-tight uppercase">Squad Roster</h1>
                    <p className="text-text-muted font-medium">The inner circle.</p>
                </div>
                
                <div className="flex gap-3">
                    <button onClick={logout} className="btn-icon" title="Logout">
                        <LogOut size={18} strokeWidth={2.5} />
                    </button>
                </div>
            </header>

            {isLoading ? (
                <div className="text-text-muted font-bold animate-pulse">Loading Roster...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
                    {members.map((member, i) => (
                        <div key={member._id} className={`card-color ${colors[i % colors.length]} flex flex-col justify-between min-h-[300px]`}>
                            <div className="flex justify-between items-start">
                                <div className="w-16 h-16 rounded-2xl bg-surface-white flex items-center justify-center p-1 shadow-soft">
                                    <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${member.avatar_seed}`} alt={member.display_name} className="w-full h-full" />
                                </div>
                                {member._id === user?._id && (
                                    <div className="bg-bg-black text-surface-white text-[10px] font-extrabold px-2 py-1 rounded-sm">YOU</div>
                                )}
                            </div>
                            
                            <div className="mt-6 flex-1">
                                <h2 className="font-extrabold text-[24px] tracking-tight leading-none mb-2">{member.display_name}</h2>
                                {member.tagline && (
                                    <p className="text-bg-black/70 font-medium text-sm">{member.tagline}</p>
                                )}
                            </div>
                            
                            <div className="mt-6 pt-4 border-t border-bg-black/10 flex items-center gap-2">
                                {member.onboarding_complete ? (
                                    <>
                                        <CheckCircle2 size={16} strokeWidth={3} className="text-bg-black" />
                                        <span className="text-xs font-accent font-bold uppercase tracking-wide">Ready</span>
                                    </>
                                ) : (
                                    <>
                                        <Bot size={16} strokeWidth={3} className="text-bg-black/50" />
                                        <span className="text-xs font-accent font-bold uppercase tracking-wide opacity-50">Setting Up</span>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Roster;
