import React from 'react';
import { LayoutDashboard, Library, ListTodo, Plus, User } from 'lucide-react';

const Sidebar: React.FC = () => {
    return (
        <aside className="hidden lg:flex flex-col items-center py-6 w-20 bg-bg-black h-screen border-r border-[#1C1C1C]">
            {/* Top Logo / Avatar */}
            <div className="w-10 h-10 rounded-full bg-surface-white flex items-center justify-center text-bg-black font-extrabold text-lg mb-12">
                P
            </div>

            {/* Nav Icons */}
            <nav className="flex flex-col gap-6 flex-1 w-full items-center">
                {/* Active Icon (Cyan Circle) */}
                <button className="w-12 h-12 rounded-full bg-card-cyan flex items-center justify-center text-bg-black transition-transform hover:scale-105 active:scale-95">
                    <LayoutDashboard strokeWidth={2.5} size={20} />
                </button>
                {/* Inactive Icons */}
                <button className="w-12 h-12 rounded-full flex items-center justify-center text-text-muted hover:text-text-on-dark transition-colors">
                    <Library strokeWidth={2.5} size={20} />
                </button>
                <button className="w-12 h-12 rounded-full flex items-center justify-center text-text-muted hover:text-text-on-dark transition-colors">
                    <ListTodo strokeWidth={2.5} size={20} />
                </button>
            </nav>

            <div className="w-8 h-[1px] bg-[#2C2C2C] my-6"></div>

            <div className="flex flex-col gap-6 items-center">
                <button className="btn-fab w-12 h-12 flex items-center justify-center">
                    <Plus strokeWidth={3} size={24} />
                </button>
                <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-surface-white flex items-center justify-center text-bg-black">
                        <User strokeWidth={2.5} size={20} />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-card-cyan border-2 border-bg-black"></div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
