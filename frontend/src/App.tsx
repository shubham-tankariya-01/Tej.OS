import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Onboarding from './pages/Onboarding';
import Roster from './pages/Roster';
import { AuthProvider, useAuth } from './context/AuthContext';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return <div className="min-h-screen bg-bg-black text-surface-white flex items-center justify-center font-bold">LOADING...</div>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (!user.onboarding_complete) {
        return <Navigate to="/onboarding" replace />;
    }

    return <>{children}</>;
};

const OnboardingRoute = ({ children }: { children: React.ReactNode }) => {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return <div className="min-h-screen bg-bg-black text-surface-white flex items-center justify-center font-bold">LOADING...</div>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }
    
    if (user.onboarding_complete) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
    const { user, isLoading } = useAuth();
    
    if (isLoading) {
        return <div className="min-h-screen bg-bg-black text-surface-white flex items-center justify-center font-bold">LOADING...</div>;
    }
    
    if (user) {
        return <Navigate to="/" replace />;
    }
    
    return <>{children}</>;
}

function App() {
  return (
    <AuthProvider>
        <Router>
            <Routes>
                {/* Public / Auth */}
                <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
                
                {/* Onboarding Flow */}
                <Route path="/onboarding" element={<OnboardingRoute><Onboarding /></OnboardingRoute>} />
                
                {/* Protected Shell */}
                <Route path="/" element={<ProtectedRoute><AppShell><Outlet /></AppShell></ProtectedRoute>}>
                    {/* The root dashboard doesn't exist functionally in Phase 1, so we show the Roster by default */}
                    <Route index element={<Roster />} />
                    
                    {/* Keep Dashboard for reference if needed, but Roster is the Phase 1 goal */}
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="roster" element={<Roster />} />
                </Route>
            </Routes>
        </Router>
    </AuthProvider>
  );
}

export default App;
