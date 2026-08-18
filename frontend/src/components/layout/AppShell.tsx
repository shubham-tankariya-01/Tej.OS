import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import BottomTabBar from './BottomTabBar';
import TopBar from './TopBar';
import CommandPalette from '../CommandPalette';
import { useAuth } from '../../context/AuthContext';
import { Api } from '../../lib/api';
import type { GhostModeStatus, AtonementInstance } from '../../lib/api';

interface AppShellProps {
    children: React.ReactNode;
}

const AppShell: React.FC<AppShellProps> = ({ children }) => {
    const { user } = useAuth();
    const location = useLocation();

    const [cmdOpen, setCmdOpen] = useState(false);
    const [hasPendingAlert, setHasPendingAlert] = useState(false);

    // Derive notification dot from real data — no fake hardcoded badge
    useEffect(() => {
        let cancelled = false;
        const checkAlerts = async () => {
            try {
                const [ghostStatus, atonements] = await Promise.all([
                    Api.getGhostModeStatus(),
                    Api.getMyAtonementInstances(),
                ]);
                if (cancelled) return;
                const pendingCosign = (ghostStatus as GhostModeStatus).pending_task?.status === 'pending';
                const pendingAtonement = (atonements as AtonementInstance[]).some(a => a.status === 'pending');
                setHasPendingAlert(pendingCosign || pendingAtonement);
            } catch {
                // Silently fail — badge just stays off
            }
        };
        checkAlerts();
        return () => { cancelled = true; };
    }, [location.pathname]); // Re-check on every route change

    // Global Cmd/Ctrl + K listener
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setCmdOpen(v => !v);
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    const handleNewPost = useCallback(() => {
        // Will be routed to vault with composer open
        window.location.href = '/vault?new=1';
    }, []);

    return (
        <div className="flex h-screen bg-bg-black text-text-on-dark overflow-hidden font-sans selection:bg-card-cyan selection:text-bg-black">
            {/* Desktop Sidebar */}
            <Sidebar user={user} hasPendingAlert={hasPendingAlert} onNewPost={handleNewPost} />

            {/* Main content area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Top Bar */}
                <TopBar
                    user={user}
                    hasPendingAlert={hasPendingAlert}
                    onSearchClick={() => setCmdOpen(true)}
                />

                {/* Scrollable page area — page transition fade */}
                <main
                    key={location.pathname}
                    className="flex-1 overflow-y-auto pb-24 lg:pb-8 animate-fade-in"
                >
                    <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 py-4">
                        {children}
                    </div>
                </main>
            </div>

            {/* Mobile Bottom Tab Bar */}
            <BottomTabBar />

            {/* Global Command Palette */}
            <CommandPalette isOpen={cmdOpen} onClose={() => setCmdOpen(false)} />
        </div>
    );
};

export default AppShell;
