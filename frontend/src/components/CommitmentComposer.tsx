import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchApi } from '../lib/api';
import { Lock, ArrowRight, Mic } from 'lucide-react';

interface CommitmentComposerProps {
    existingCommitment: any | null;
    onCommitmentSaved: (commitment: any) => void;
}

const CommitmentComposer: React.FC<CommitmentComposerProps> = ({ existingCommitment, onCommitmentSaved }) => {
    const { user } = useAuth();
    const format = existingCommitment?.format || user?.daily_commitment_format || 'text';
    
    // For checklist format
    const [items, setItems] = useState<string[]>(
        existingCommitment && existingCommitment.format === 'checklist' 
            ? existingCommitment.content.split('\n').filter(Boolean) 
            : ['']
    );
    
    // For text / voice_note_style_text
    const [text, setText] = useState<string>(
        existingCommitment && existingCommitment.format !== 'checklist'
            ? existingCommitment.content
            : ''
    );
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const isLocked = existingCommitment && existingCommitment.check_in_status !== 'pending';

    const handleSave = async () => {
        setIsSubmitting(true);
        try {
            let content = '';
            if (format === 'checklist') {
                content = items.filter(i => i.trim() !== '').join('\n');
            } else {
                content = text.trim();
            }
            
            if (!content) return;
            
            const res = await fetchApi('/commitments', {
                method: 'POST',
                body: JSON.stringify({
                    content,
                    format
                })
            });
            onCommitmentSaved(res);
        } catch (err) {
            console.error(err);
            alert("Failed to save commitment");
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderComposer = () => {
        if (format === 'checklist') {
            return (
                <div className="flex flex-col gap-2">
                    {items.map((item, idx) => (
                        <div key={idx} className="flex gap-2 items-center">
                            <div className="w-4 h-4 rounded-sm border-2 border-bg-black/20 shrink-0"></div>
                            <input 
                                type="text" 
                                value={item}
                                disabled={isLocked}
                                onChange={(e) => {
                                    const newItems = [...items];
                                    newItems[idx] = e.target.value;
                                    setItems(newItems);
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !isLocked) {
                                        setItems([...items, '']);
                                    }
                                }}
                                className="flex-1 bg-transparent border-b border-bg-black/10 focus:border-bg-black px-1 py-1 text-sm outline-none"
                                placeholder="Task..."
                            />
                        </div>
                    ))}
                    {!isLocked && (
                        <button onClick={() => setItems([...items, ''])} className="text-xs font-bold text-bg-black/60 mt-2 hover:text-bg-black self-start">
                            + ADD ITEM
                        </button>
                    )}
                </div>
            );
        }
        
        if (format === 'voice_note_style_text') {
            return (
                <div className="relative">
                    <div className="absolute top-3 left-3 text-card-periwinkle/80">
                        <Mic size={18} strokeWidth={2.5} />
                    </div>
                    <textarea 
                        value={text}
                        disabled={isLocked}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Brain dump your plan for today..."
                        className="w-full bg-[#1C1C1C] text-surface-white rounded-2xl pl-10 pr-4 py-3 min-h-[120px] outline-none text-sm font-medium leading-relaxed font-mono"
                    />
                </div>
            );
        }

        // Standard text
        return (
            <textarea 
                value={text}
                disabled={isLocked}
                onChange={(e) => setText(e.target.value)}
                placeholder="What are you committing to today?"
                className="w-full bg-surface-white/50 border border-bg-black/10 text-bg-black focus:bg-surface-white rounded-2xl px-4 py-3 min-h-[100px] outline-none text-sm font-medium leading-relaxed"
            />
        );
    };

    return (
        <div className="card-color bg-card-mustard flex flex-col p-6 rounded-[28px]">
            <div className="flex justify-between items-start mb-4">
                <div className="flex flex-col">
                    <h2 className="font-extrabold text-[22px] tracking-tight uppercase text-bg-black leading-none">Today's Protocol</h2>
                    <p className="text-sm font-medium text-bg-black/70 mt-1">
                        {isLocked ? "Locked in. No edits." : "Declare your intent."}
                    </p>
                </div>
                {isLocked && (
                    <div className="bg-bg-black text-surface-white p-2 rounded-full">
                        <Lock size={16} strokeWidth={2.5} />
                    </div>
                )}
            </div>
            
            <div className="flex-1 mt-2">
                {renderComposer()}
            </div>
            
            {!isLocked && (
                <button 
                    onClick={handleSave} 
                    disabled={isSubmitting}
                    className="mt-6 w-full bg-bg-black text-surface-white rounded-pill py-3 font-accent font-bold flex justify-center items-center gap-2 hover:bg-black/90 transition-colors"
                >
                    {isSubmitting ? 'SAVING...' : 'LOCK IN'} <ArrowRight size={18} strokeWidth={3} />
                </button>
            )}
        </div>
    );
};

export default CommitmentComposer;
