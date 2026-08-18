import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Search, Bell } from 'lucide-react';
import type { UserPrivate } from '../../context/AuthContext';

interface TopBarProps {
    user: UserPrivate | null;
    hasPendingAlert: boolean;
    onSearchClick?: () => void;
    onBellClick?: () => void;
}

const ROUTE_LABELS: Record<string, string> = {
    '/':             'Dashboard',
    '/vault':        'Knowledge Vault',
    '/roster':       'Squad Roster',
    '/leaderboard':  'Points & Leaderboard',
    '/profile':      'Profile',
    '/atonement':    'Ghost Mode',
};

const TopBar: React.FC<TopBarProps> = ({ user, hasPendingAlert, onSearchClick }) => {
    const location = useLocation();
    const label = ROUTE_LABELS[location.pathname] ?? 'The Pact';

    return (
        <>
            {/* Mobile Top Bar */}
            <header className="lg:hidden flex items-center justify-between px-5 pt-5 pb-3">
                <div className="flex items-center gap-3">
                    {user ? (
                        <Link to="/profile">
                            <img
                                src={`https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${user.avatar_seed}&backgroundColor=C3E4EC`}
                                alt={user.display_name}
                                className="w-10 h-10 rounded-full bg-card-cyan"
                            />
                        </Link>
                    ) : (
                        <div className="w-10 h-10 rounded-full skeleton" />
                    )}
                    <div>
                        <p className="text-xs text-text-muted font-medium leading-none mb-0.5">Welcome back</p>
                        <p className="text-base font-bold text-text-on-dark leading-none">
                            {user?.display_name ?? '—'}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={onSearchClick} className="btn-icon" aria-label="Search">
                        <Search size={18} strokeWidth={2.5} />
                    </button>
                    <div className="relative">
                        <Link to="/atonement" className="btn-icon" aria-label="Alerts">
                            <Bell size={18} strokeWidth={2.5} />
                        </Link>
                        {hasPendingAlert && (
                            <span className="absolute top-0.5 right-0.5 w-2.5 h-2.5 rounded-full bg-card-coral border-2 border-bg-black" />
                        )}
                    </div>
                </div>
            </header>

            {/* Desktop Top Bar */}
            <header className="hidden lg:flex items-center justify-between px-8 pt-6 pb-2">
                <p className="text-sm text-text-muted font-medium tracking-wide">
                    The Pact
                    <span className="mx-2 opacity-40">/</span>
                    <span className="text-text-on-dark font-semibold">{label}</span>
                </p>
                <div className="flex items-center gap-2">
                    <button onClick={onSearchClick} className="btn-icon" aria-label="Search">
                        <Search size={18} strokeWidth={2.5} />
                    </button>
                    <div className="relative">
                        <Link to="/atonement" className="btn-icon" aria-label="Alerts">
                            <Bell size={18} strokeWidth={2.5} />
                        </Link>
                        {hasPendingAlert && (
                            <span className="absolute top-0.5 right-0.5 w-2.5 h-2.5 rounded-full bg-card-coral border-2 border-bg-black" />
                        )}
                    </div>
                </div>
            </header>
        </>
    );
};

export default TopBar;
