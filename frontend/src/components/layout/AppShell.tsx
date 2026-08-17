import React from 'react';
import Sidebar from './Sidebar';
import BottomTabBar from './BottomTabBar';

interface AppShellProps {
    children: React.ReactNode;
}

const AppShell: React.FC<AppShellProps> = ({ children }) => {
    return (
        <div className="flex h-screen bg-bg-black text-text-on-dark overflow-hidden font-sans selection:bg-card-cyan selection:text-bg-black">
            <Sidebar />
            
            <main className="flex-1 overflow-y-auto pb-24 lg:pb-0 relative z-10 scroll-smooth bg-bg-black">
                <div className="max-w-[1600px] mx-auto p-4 md:p-8 pt-6">
                    {children}
                </div>
            </main>
            
            <BottomTabBar />
        </div>
    );
};

export default AppShell;
