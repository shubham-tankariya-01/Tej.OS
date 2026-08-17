import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchApi } from '../lib/api';

const Login: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    
    const { checkAuth } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        
        try {
            await fetchApi('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ username, password })
            });
            await checkAuth(); // Trigger AuthContext update to redirect
        } catch (err: any) {
            setError(err.message || 'Login failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-bg-black text-surface-white p-4">
            <div className="card-dark w-full max-w-md border-t-4 border-t-card-coral">
                <div className="text-center mb-8">
                    <h1 className="font-display font-black text-[32px] tracking-tight uppercase mb-2">The Pact</h1>
                    <p className="text-text-muted font-medium">Identify yourself, operator.</p>
                </div>
                
                {error && (
                    <div className="bg-card-coral/10 border border-card-coral/30 text-card-coral p-3 rounded-xl mb-6 text-sm font-bold text-center">
                        {error}
                    </div>
                )}
                
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <label className="block text-xs font-accent font-bold mb-2 uppercase tracking-wide text-text-muted">Codename</label>
                        <input 
                            type="text" 
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full bg-[#1C1C1C] border border-[#333] rounded-pill px-5 py-3 text-surface-white font-medium focus:outline-none focus:border-surface-white transition-colors"
                            placeholder="e.g. member1"
                            required
                        />
                    </div>
                    
                    <div>
                        <label className="block text-xs font-accent font-bold mb-2 uppercase tracking-wide text-text-muted">Clearance Code</label>
                        <input 
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-[#1C1C1C] border border-[#333] rounded-pill px-5 py-3 text-surface-white font-medium focus:outline-none focus:border-surface-white transition-colors"
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    
                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full bg-surface-white text-bg-black rounded-pill px-5 py-3 font-accent font-bold mt-4 hover:bg-white/90 transition-colors disabled:opacity-50"
                    >
                        {isLoading ? 'VERIFYING...' : 'INITIALIZE'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
