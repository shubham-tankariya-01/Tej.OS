import React from 'react';
import { User } from 'lucide-react';

const Profile: React.FC = () => (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-16 h-16 rounded-full bg-card-periwinkle flex items-center justify-center text-text-on-color">
            <User size={28} strokeWidth={2} />
        </div>
        <p className="text-text-on-dark font-bold text-xl">Profile</p>
        <p className="text-text-muted text-sm">Coming up next in the build sprint</p>
    </div>
);

export default Profile;
