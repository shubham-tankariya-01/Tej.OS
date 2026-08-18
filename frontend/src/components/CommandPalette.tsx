import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Command, LayoutDashboard, BookOpen, Users, Trophy, User, Ghost, X, CornerDownLeft } from 'lucide-react';

interface CommandPaletteProps {
    isOpen: boolean;
    onClose: () => void;
}

const COMMANDS = [
    { id: 'dashboard',    label: 'Go to Dashboard',          path: '/',            icon: LayoutDashboard, kbd: '⌘1' },
    { id: 'vault',        label: 'Go to Knowledge Vault',    path: '/vault',       icon: BookOpen,        kbd: '⌘2' },
    { id: 'roster',       label: 'Go to Squad Roster',       path: '/roster',      icon: Users,           kbd: '⌘3' },
    { id: 'leaderboard',  label: 'Go to Leaderboard',        path: '/leaderboard', icon: Trophy,          kbd: '⌘4' },
    { id: 'profile',      label: 'Go to Profile',            path: '/profile',     icon: User,            kbd: '⌘5' },
    { id: 'atonement',    label: 'Ghost Mode / Atonement',   path: '/atonement',   icon: Ghost,           kbd: '' },
];

const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const navigate = useNavigate();
    const inputRef = useRef<HTMLInputElement>(null);

    const filtered = query.trim()
        ? COMMANDS.filter(c => c.label.toLowerCase().includes(query.toLowerCase()))
        : COMMANDS;

    const execute = useCallback((path: string) => {
        navigate(path);
        onClose();
        setQuery('');
    }, [navigate, onClose]);

    useEffect(() => {
        if (isOpen) {
            setQuery('');
            setSelectedIndex(0);
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [isOpen]);

    useEffect(() => {
        setSelectedIndex(0);
    }, [query]);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (!isOpen) return;
            if (e.key === 'Escape') { onClose(); return; }
            if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIndex(i => Math.min(i + 1, filtered.length - 1)); }
            if (e.key === 'ArrowUp')   { e.preventDefault(); setSelectedIndex(i => Math.max(i - 1, 0)); }
            if (e.key === 'Enter' && filtered[selectedIndex]) { execute(filtered[selectedIndex].path); }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [isOpen, filtered, selectedIndex, execute, onClose]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh] px-4"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-bg-black/80 backdrop-blur-sm" />

            {/* Palette panel */}
            <div className="relative w-full max-w-[580px] bg-[#161616] rounded-[20px] border border-[#2a2a2a] overflow-hidden animate-scale-in"
                 style={{ boxShadow: '0 24px 80px rgba(0,0,0,0.7)' }}>

                {/* Search input row */}
                <div className="flex items-center gap-3 px-5 py-4 border-b border-[#222]">
                    <Command size={18} className="text-text-muted shrink-0" strokeWidth={2} />
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Type a command or search…"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        className="flex-1 bg-transparent text-text-on-dark text-[15px] placeholder:text-text-muted outline-none font-medium"
                    />
                    <button onClick={onClose} className="w-7 h-7 rounded-lg bg-[#222] flex items-center justify-center text-text-muted hover:text-text-on-dark transition-colors">
                        <X size={14} />
                    </button>
                </div>

                {/* Results */}
                <div className="py-2 max-h-[360px] overflow-y-auto">
                    {filtered.length === 0 && (
                        <p className="text-text-muted text-sm text-center py-8">No commands found</p>
                    )}
                    {filtered.map((cmd, i) => {
                        const Icon = cmd.icon;
                        const isSelected = i === selectedIndex;
                        return (
                            <button
                                key={cmd.id}
                                onClick={() => execute(cmd.path)}
                                onMouseEnter={() => setSelectedIndex(i)}
                                className={`w-full flex items-center gap-3.5 px-5 py-3 transition-colors text-left ${
                                    isSelected ? 'bg-[#1e1e1e]' : 'hover:bg-[#1a1a1a]'
                                }`}
                            >
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                                    isSelected ? 'bg-card-cyan text-text-on-color' : 'bg-[#222] text-text-muted'
                                }`}>
                                    <Icon size={16} strokeWidth={2} />
                                </div>
                                <span className={`flex-1 text-[14px] font-medium ${isSelected ? 'text-text-on-dark' : 'text-text-muted'}`}>
                                    {cmd.label}
                                </span>
                                {cmd.kbd && (
                                    <kbd className="text-[10px] font-mono text-text-muted bg-[#222] px-2 py-1 rounded-md border border-[#2a2a2a]">
                                        {cmd.kbd}
                                    </kbd>
                                )}
                                {isSelected && (
                                    <CornerDownLeft size={13} className="text-text-muted shrink-0" />
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Footer hint */}
                <div className="flex items-center gap-4 px-5 py-2.5 border-t border-[#222] text-[11px] text-text-muted">
                    <span><kbd className="font-mono">↑↓</kbd> navigate</span>
                    <span><kbd className="font-mono">↵</kbd> select</span>
                    <span><kbd className="font-mono">esc</kbd> close</span>
                </div>
            </div>
        </div>
    );
};

export default CommandPalette;
