import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import { AuthProvider, useAuth } from './context/AuthContext';

// Lazy-load all pages for performance
const Dashboard      = lazy(() => import('./pages/Dashboard'));
const Login          = lazy(() => import('./pages/Login'));
const Onboarding     = lazy(() => import('./pages/Onboarding'));
const Roster         = lazy(() => import('./pages/Roster'));
const KnowledgeVault = lazy(() => import('./pages/KnowledgeVault'));
const PostDetail     = lazy(() => import('./pages/PostDetail'));

// Placeholder screens — will be built next
const Leaderboard    = lazy(() => import('./pages/Leaderboard'));
const Profile        = lazy(() => import('./pages/Profile'));
const Atonement      = lazy(() => import('./pages/Atonement'));

const PageLoader = () => (
    <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="flex gap-1.5">
            {[0,1,2].map(i => (
                <span key={i} className="w-2 h-2 rounded-full bg-card-cyan animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
        </div>
    </div>
);


const LoadingScreen = () => (
    <div className="min-h-screen bg-bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-card-coral flex items-center justify-center text-surface-white font-bold text-lg">P</div>
            <div className="flex gap-1.5">
                {[0,1,2].map(i => (
                    <span key={i} className="w-2 h-2 rounded-full bg-card-cyan animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
            </div>
        </div>
    </div>
);

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { user, isLoading } = useAuth();
    if (isLoading) return <LoadingScreen />;
    if (!user) return <Navigate to="/login" replace />;
    if (!user.onboarding_complete) return <Navigate to="/onboarding" replace />;
    return <>{children}</>;
};

const OnboardingRoute = ({ children }: { children: React.ReactNode }) => {
    const { user, isLoading } = useAuth();
    if (isLoading) return <LoadingScreen />;
    if (!user) return <Navigate to="/login" replace />;
    if (user.onboarding_complete) return <Navigate to="/" replace />;
    return <>{children}</>;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
    const { user, isLoading } = useAuth();
    if (isLoading) return <LoadingScreen />;
    if (user) return <Navigate to="/" replace />;
    return <>{children}</>;
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <Suspense fallback={<LoadingScreen />}>
                    <Routes>
                        {/* Public */}
                        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />

                        {/* Onboarding */}
                        <Route path="/onboarding" element={<OnboardingRoute><Onboarding /></OnboardingRoute>} />

                        {/* Protected shell */}
                        <Route path="/" element={
                            <ProtectedRoute>
                                <AppShell>
                                    <Suspense fallback={<PageLoader />}>
                                        <Outlet />
                                    </Suspense>
                                </AppShell>
                            </ProtectedRoute>
                        }>
                            <Route index             element={<Dashboard />} />
                            <Route path="dashboard"  element={<Dashboard />} />
                            <Route path="roster"     element={<Roster />} />
                            <Route path="vault"      element={<KnowledgeVault />} />
                            <Route path="vault/:id"  element={<PostDetail />} />
                            <Route path="leaderboard" element={<Leaderboard />} />
                            <Route path="profile"    element={<Profile />} />
                            <Route path="atonement"  element={<Atonement />} />
                        </Route>
                    </Routes>
                </Suspense>
            </Router>
        </AuthProvider>
    );
}

export default App;
