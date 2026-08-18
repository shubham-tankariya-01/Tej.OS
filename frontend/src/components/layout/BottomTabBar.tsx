import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Users, Trophy, User } from 'lucide-react';

const NAV_ITEMS = [
    { path: '/',            icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/vault',       icon: BookOpen,         label: 'Vault' },
    { path: '/roster',      icon: Users,            label: 'Roster' },
    { path: '/leaderboard', icon: Trophy,           label: 'Leaderboard' },
    { path: '/profile',     icon: User,             label: 'Profile' },
];

const BottomTabBar: React.FC = () => {
    const location = useLocation();

    return (
        <nav className="lg:hidden fixed bottom-4 left-4 right-4 z-40 flex items-center justify-around
                        bg-bg-black rounded-pill px-4 py-2.5 border border-[#1e1e1e]"
             style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
            {NAV_ITEMS.map(({ path, icon: Icon, label }) => {
                const isActive = path === '/'
                    ? location.pathname === '/'
                    : location.pathname.startsWith(path);

                return (
                    <Link
                        key={path}
                        to={path}
                        aria-label={label}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
                            isActive
                                ? 'bg-card-cyan text-text-on-color scale-105'
                                : 'text-text-muted hover:text-text-on-dark'
                        }`}
                    >
                        <Icon size={19} strokeWidth={isActive ? 2.5 : 2} />
                    </Link>
                );
            })}
        </nav>
    );
};

export default BottomTabBar;
