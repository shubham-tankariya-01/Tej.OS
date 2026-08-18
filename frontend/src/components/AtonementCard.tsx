import React, { useState } from 'react';
import { Api, type AtonementInstance } from '../lib/api';
import { ShieldAlert, Check } from 'lucide-react';

interface AtonementCardProps {
    instance: AtonementInstance;
    onCompleted: (id: string) => void;
}

const AtonementCard: React.FC<AtonementCardProps> = ({ instance, onCompleted }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleComplete = async () => {
        setIsSubmitting(true);
        try {
            await Api.completeAtonementInstance(instance._id);
            onCompleted(instance._id);
        } catch (err: any) {
            alert(err.message || "Failed to complete atonement");
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-card-coral rounded-[24px] p-5 mb-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-soft relative overflow-hidden text-bg-black">
            <div className="flex items-start gap-4 z-10 relative">
                <div className="w-10 h-10 rounded-full bg-bg-black text-card-coral flex items-center justify-center shrink-0">
                    <ShieldAlert size={20} strokeWidth={2.5} />
                </div>
                <div>
                    <h4 className="font-extrabold text-lg uppercase tracking-tight leading-none mb-1">Atonement Required</h4>
                    <p className="text-sm font-bold opacity-80 leading-snug">
                        {instance.description}
                    </p>
                </div>
            </div>
            
            <button 
                onClick={handleComplete}
                disabled={isSubmitting}
                className="bg-bg-black hover:bg-[#222] text-surface-white rounded-pill px-6 py-3 text-sm font-bold flex items-center justify-center gap-2 transition-colors shrink-0 z-10 relative disabled:opacity-50"
            >
                <Check size={16} strokeWidth={3} />
                MARK DONE
            </button>
            
            {/* Background pattern */}
            <div className="absolute right-0 top-0 bottom-0 w-32 opacity-10 pointer-events-none flex items-center">
                <ShieldAlert size={120} className="-mr-6" />
            </div>
        </div>
    );
};

export default AtonementCard;
