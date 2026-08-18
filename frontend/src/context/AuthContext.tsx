import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { fetchApi } from '../lib/api';

export type DailyCommitmentFormat = "text" | "voice_note_style_text" | "checklist";

export interface UserPrivate {
    _id: string;
    display_name: string;
    avatar_seed: string;
    tagline: string | null;
    onboarding_complete: boolean;
    username: string;
    daily_commitment_format: DailyCommitmentFormat;
    points_rules_accepted: boolean;
    current_streak: number;
    longest_streak: number;
    last_check_in_date: string | null;
    points_total: number;
    
    // Phase 3 Points Engine State
    ghost_mode: boolean;
    streak_freeze_count: number;
    recovery_day: number;
    active_atonement_ids: string[];
}

interface AuthContextType {
    user: UserPrivate | null;
    isLoading: boolean;
    error: string | null;
    checkAuth: () => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{children: ReactNode}> = ({ children }) => {
    const [user, setUser] = useState<UserPrivate | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const checkAuth = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await fetchApi<UserPrivate>('/users/me');
            setUser(data);
        } catch (err: any) {
            setUser(null);
            if (err.status !== 401) {
                setError(err.message || "Failed to check authentication");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        try {
            await fetchApi('/auth/logout', { method: 'POST' });
        } catch (err) {
            console.error("Logout failed", err);
        } finally {
            setUser(null);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    return (
        <AuthContext.Provider value={{ user, isLoading, error, checkAuth, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
