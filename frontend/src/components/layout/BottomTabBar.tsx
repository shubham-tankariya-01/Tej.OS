import React from 'react';
import { LayoutDashboard, Library, Plus, ListTodo, User } from 'lucide-react';

const BottomTabBar: React.FC = () => {
    return (
        <nav className="lg:hidden fixed bottom-4 left-4 right-4 bg-bg-black rounded-full p-2 flex justify-between items-center z-50 shadow-soft border border-[#1C1C1C]">
            <button className="w-12 h-12 rounded-full bg-card-cyan flex items-center justify-center text-bg-black">
                <LayoutDashboard strokeWidth={2.5} size={20} />
            </button>
            <button className="w-12 h-12 rounded-full flex items-center justify-center text-text-muted hover:text-text-on-dark transition-colors">
                <Library strokeWidth={2.5} size={20} />
            </button>
            
            <button className="btn-fab w-14 h-14 relative -top-4 -mx-2 flex items-center justify-center">
                <Plus strokeWidth={3} size={28} />
            </button>
            
            <button className="w-12 h-12 rounded-full flex items-center justify-center text-text-muted hover:text-text-on-dark transition-colors">
                <ListTodo strokeWidth={2.5} size={20} />
            </button>
            <button className="w-12 h-12 rounded-full flex items-center justify-center text-text-muted hover:text-text-on-dark transition-colors">
                <User strokeWidth={2.5} size={20} />
            </button>
        </nav>
    );
};

export default BottomTabBar;
