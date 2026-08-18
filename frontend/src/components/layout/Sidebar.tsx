import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Users, Trophy, User, Plus } from 'lucide-react';
import type { UserPrivate } from '../../context/AuthContext';

interface SidebarProps {
    user: UserPrivate | null;
    hasPendingAlert: boolean;
    onNewPost?: () => void;
}

const NAV_ITEMS = [
    { path: '/',            icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/vault',       icon: BookOpen,         label: 'Vault' },
    { path: '/roster',      icon: Users,            label: 'Roster' },
    { path: '/leaderboard', icon: Trophy,           label: 'Leaderboard' },
];

const Sidebar: React.FC<SidebarProps> = ({ user, onNewPost }) => {
    const location = useLocation();

    return (
        <aside className="hidden lg:flex flex-col items-center py-6 w-[80px] min-h-screen bg-bg-black border-r border-[#1e1e1e] shrink-0">
            {/* Brand avatar */}
            <Link to="/" className="mb-10">
                <div className="w-10 h-10 rounded-full bg-surface-white flex items-center justify-center text-bg-black font-bold text-base select-none hover:scale-105 transition-transform">
                    P
                </div>
            </Link>

            {/* Nav icons */}
            <nav className="flex flex-col items-center gap-3 flex-1">
                {NAV_ITEMS.map(({ path, icon: Icon, label }) => {
                    const isActive = location.pathname === path || 
                        (path !== '/' && location.pathname.startsWith(path));
                    return (
                        <Link
                            key={path}
                            to={path}
                            title={label}
                            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 ${
                                isActive
                                    ? 'bg-card-cyan text-text-on-color scale-105'
                                    : 'text-text-muted hover:text-text-on-dark hover:bg-[#1e1e1e]'
                            }`}
                        >
                            <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                        </Link>
                    );
                })}
            </nav>

            {/* Divider */}
            <div className="w-8 h-px bg-[#222] my-4" />

            {/* FAB + user avatar */}
            <div className="flex flex-col items-center gap-4">
                <button
                    onClick={onNewPost}
                    title="New Post"
                    className="w-11 h-11 rounded-full bg-card-coral text-surface-white flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-none"
                >
                    <Plus size={22} strokeWidth={3} />
                </button>

                <Link to="/profile" title="Profile">
                    {user ? (
                        <img
                            src={`https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${user.avatar_seed}&backgroundColor=C3E4EC`}
                            alt={user.display_name}
                            className="w-9 h-9 rounded-full bg-card-cyan hover:scale-105 transition-transform"
                        />
                    ) : (
                        <div className="w-9 h-9 rounded-full bg-[#1e1e1e] flex items-center justify-center text-text-muted">
                            <User size={16} />
                        </div>
                    )}
                </Link>
            </div>
        </aside>
    );
};

export default Sidebar;
