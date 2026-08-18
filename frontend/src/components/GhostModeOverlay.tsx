import React, { useEffect, useState } from 'react';
import { Api, type RedemptionTask } from '../lib/api';
import { Ghost, ShieldAlert, Users } from 'lucide-react';

const GhostModeOverlay: React.FC = () => {
    const [task, setTask] = useState<RedemptionTask | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [description, setDescription] = useState('');
    const [link, setLink] = useState('');

    useEffect(() => {
        const load = async () => {
            try {
                const status = await Api.getGhostModeStatus();
                setTask(status.pending_task);
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        load();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const newTask = await Api.submitRedemptionTask(description, link);
            setTask(newTask);
        } catch (err: any) {
            alert(err.message || "Failed to submit");
        }
    };

    if (isLoading) {
        return <div className="fixed inset-0 bg-bg-black/90 z-50 flex items-center justify-center text-surface-white">Loading...</div>;
    }

    return (
        <div className="fixed inset-0 bg-bg-black/95 z-50 flex items-center justify-center overflow-y-auto p-4 backdrop-blur-sm">
            <div className="bg-[#1C1C1C] max-w-lg w-full rounded-[32px] p-8 border border-card-coral/30 relative overflow-hidden shadow-2xl">
                
                {/* Background graphic */}
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Ghost size={200} />
                </div>
                
                <div className="relative z-10">
                    <div className="w-16 h-16 rounded-2xl bg-card-coral/10 text-card-coral flex items-center justify-center mb-6">
                        <Ghost size={32} strokeWidth={2.5} />
                    </div>
                    
                    <h2 className="text-3xl font-black font-display text-surface-white uppercase tracking-tight leading-none mb-2">
                        Ghost Mode
                    </h2>
                    <p className="text-text-muted font-medium mb-8">
                        You have crossed the event horizon (-400 points). You cannot post protocols until you complete a redemption task and the squad cosigns it.
                    </p>

                    {task ? (
                        <div className="bg-bg-black rounded-2xl p-6 border border-white/10">
                            <h3 className="text-surface-white font-bold uppercase tracking-widest text-xs mb-4 flex items-center gap-2">
                                <ShieldAlert size={14} /> Active Redemption
                            </h3>
                            <p className="text-surface-white font-medium text-sm mb-4">
                                {task.description}
                            </p>
                            {task.link && (
                                <a href={task.link} target="_blank" rel="noreferrer" className="text-card-periwinkle text-sm font-bold block mb-4 hover:underline">
                                    View Link
                                </a>
                            )}
                            
                            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                                <div className="text-text-muted text-xs font-bold uppercase">
                                    Cosigns needed: {Math.max(0, 3 - task.cosigns.length)}
                                </div>
                                <div className="flex -space-x-2">
                                    {task.cosigns.map((_, i) => (
                                        <div key={i} className="w-8 h-8 rounded-full bg-surface-white border-2 border-[#1C1C1C] flex items-center justify-center text-bg-black">
                                            <Users size={12} />
                                        </div>
                                    ))}
                                    {Array.from({ length: Math.max(0, 3 - task.cosigns.length) }).map((_, i) => (
                                        <div key={`empty-${i}`} className="w-8 h-8 rounded-full bg-bg-black border-2 border-[#1C1C1C] border-dashed"></div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-surface-white text-sm font-bold mb-2">What did you do?</label>
                                <textarea 
                                    className="w-full bg-bg-black border border-white/10 rounded-2xl p-4 text-surface-white text-sm placeholder:text-text-muted/50 focus:outline-none focus:border-card-mint resize-none min-h-[100px]"
                                    placeholder="Describe your redemption task..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-surface-white text-sm font-bold mb-2">Link (Optional)</label>
                                <input 
                                    type="url"
                                    className="w-full bg-bg-black border border-white/10 rounded-xl p-4 text-surface-white text-sm placeholder:text-text-muted/50 focus:outline-none focus:border-card-mint"
                                    placeholder="https://..."
                                    value={link}
                                    onChange={(e) => setLink(e.target.value)}
                                />
                            </div>
                            <button 
                                type="submit" 
                                className="w-full bg-card-coral text-bg-black font-extrabold rounded-pill py-4 text-sm mt-2 hover:opacity-90 transition-opacity uppercase tracking-wide"
                            >
                                Submit to Squad
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GhostModeOverlay;
