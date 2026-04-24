import React from 'react';
import { ArrowRight, BookOpen, CalendarClock, Shield, Wrench } from 'lucide-react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import ErrorBoundary from './components/Common/ErrorBoundary';
import { Toaster } from 'react-hot-toast';
import AuthPage from './pages/Auth/AuthPage';
import ResourceList from './pages/Catalogue/ResourceList';
import MyBookings from './pages/Booking/MyBookings';
import TicketList from './pages/Ticketing/TicketList';
import ProtectedRoute from './routes/ProtectedRoute';
import RoleGuard from './components/Auth/RoleGuard';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import LandingLayout from './layouts/LandingLayout';
import PageHeader from './components/Common/PageHeader';
import OperationalSupport from './pages/Common/OperationalSupport';
import Documentation from './pages/Common/Documentation';
import AuditLog from './pages/Common/AuditLog';
import Legal from './pages/Common/Legal';
import UserCatalogue from './pages/User/UserCatalogue';
import UserBookings from './pages/User/UserBookings';
import UserSupport from './pages/User/UserSupport';
import AdminPanel from './pages/Admin/AdminPanel';
import { CAMPUS_IMAGES } from './constants/visuals';

const RoleBasedRoute = ({ adminComponent: AdminComp, userComponent: UserComp, adminRoles }) => {
    const { user, loading, hasRole } = useAuth();

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
        );
    }
    
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    const showAdmin = adminRoles.some(role => hasRole(role));

    if (showAdmin) {
        return (
            <MainLayout>
                <AdminComp />
            </MainLayout>
        );
    }

    return (
        <LandingLayout>
            <UserComp />
        </LandingLayout>
    );
};

const Dashboard = () => {
    const { user, hasRole } = useAuth();
    
    const cards = [
        {
            title: 'Infrastructure catalogue',
            description: 'Review rooms, facilities, and equipment from a staff-focused atlas view.',
            to: '/catalogue',
            cta: 'Open atlas',
            accent: 'from-[#f4d9b0] to-[#d48b49]',
            icon: BookOpen,
            roles: ['USER', 'ADMIN', 'MANAGER', 'TECHNICIAN']
        },
        {
            title: 'Booking operations',
            description: 'Track reservations, requests, and live campus scheduling activity.',
            to: '/bookings',
            cta: 'Review bookings',
            accent: 'from-[#b9d7f7] to-[#68a2db]',
            icon: CalendarClock,
            roles: ['USER', 'ADMIN', 'MANAGER']
        },
        {
            title: 'Maintenance radar',
            description: 'Escalate issues and monitor incident resolution across departments.',
            to: '/tickets',
            cta: 'Open radar',
            accent: 'from-[#f0b8a8] to-[#cf6548]',
            icon: Wrench,
            roles: ['USER', 'ADMIN', 'MANAGER', 'TECHNICIAN']
        },
        {
            title: 'Admin governance',
            description: 'Control identities, staff accounts, and system-level access decisions.',
            to: '/admin',
            cta: 'Enter vault',
            accent: 'from-[#d8d6ff] to-[#7d7ad8]',
            icon: Shield,
            roles: ['ADMIN']
        }
    ].filter(card => {
        // If user has no roles yet (e.g. Google login fallback), show all non-admin cards
        const userRoles = user?.roles || [];
        if (userRoles.length === 0) return !card.roles.includes('ADMIN');
        return card.roles.some(role => hasRole(role));
    });

    return (
        <div className="p-6 md:p-8 min-h-[calc(100vh-10rem)] text-white">
            <div className="mx-auto max-w-7xl space-y-8">
                <section className="overflow-hidden rounded-[2rem] border border-white/10">
                    <div className="relative min-h-[280px]">
                        <img src={CAMPUS_IMAGES.skyline} alt="Campus dashboard" className="absolute inset-0 h-full w-full object-cover" />
                        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(9,17,31,0.95),rgba(9,17,31,0.75),rgba(183,128,56,0.16))]" />
                        <div className="relative z-10 grid gap-8 p-8 lg:grid-cols-[1fr_auto] lg:items-end">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.34em] text-cyan-300">Role aware dashboard</p>
                                <h2 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">
                                    {user?.name || 'Authorized User'}
                                </h2>
                                <p className="mt-4 max-w-2xl text-sm font-medium leading-7 text-slate-200">
                                    The control center now separates public browsing from operational work. Use the cards below to move between catalogue, bookings, support, and governance.
                                </p>
                            </div>
                            <div className="glass-panel rounded-[1.8rem] p-5 text-slate-900">
                                <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#b78038]">Current access</p>
                                <p className="mt-2 text-2xl font-black">{(user?.roles || ['MEMBER']).map((role) => role.replace('ROLE_', '')).join(' • ')}</p>
                                <p className="mt-2 text-sm font-semibold text-slate-600">Use the staff lane on the left to reach your active modules.</p>
                            </div>
                        </div>
                    </div>
                </section>

                <PageHeader 
                    title="Mission modules"
                    description="These entry points are filtered to your role and styled to match the new admin or public experience."
                />

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
                {cards.map((card) => (
                    <div key={card.to} className="group overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:border-amber-300/40">
                        <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${card.accent} text-[#13233b] shadow-lg`}>
                            <card.icon className="h-6 w-6" />
                        </div>
                        <h2 className="mt-6 text-2xl font-black tracking-tight text-white">{card.title}</h2>
                        <p className="mt-3 text-sm font-medium leading-7 text-slate-300">{card.description}</p>
                        <Link
                            to={card.to}
                            className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-5 py-3 text-xs font-black uppercase tracking-[0.28em] text-white transition hover:bg-white/14"
                        >
                            {card.cta}
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                ))}
                </div>
            </div>
        </div>
    );
};

const App = () => {
    return (
        <AuthProvider>
            <ErrorBoundary>
                <NotificationProvider>
                <Router>
                    <Toaster position="top-right" />
                    <Routes>
                        <Route path="/login" element={<AuthPage />} />
                        <Route path="/dashboard" element={
                            <ProtectedRoute>
                                <MainLayout><Dashboard /></MainLayout>
                            </ProtectedRoute>
                        } />
                        <Route path="/catalogue" element={<RoleBasedRoute adminComponent={ResourceList} userComponent={UserCatalogue} adminRoles={['ADMIN', 'MANAGER']} />} />
                        <Route path="/bookings" element={<RoleBasedRoute adminComponent={MyBookings} userComponent={UserBookings} adminRoles={['ADMIN', 'MANAGER']} />} />
                        <Route path="/tickets" element={<RoleBasedRoute adminComponent={TicketList} userComponent={UserSupport} adminRoles={['ADMIN', 'MANAGER', 'TECHNICIAN']} />} />
                        <Route path="/admin" element={
                            <RoleGuard allowedRoles={['ADMIN', 'MANAGER']}>
                                <MainLayout><AdminPanel /></MainLayout>
                            </RoleGuard>
                        } />
                        <Route path="/" element={<LandingLayout><Home /></LandingLayout>} />
                        <Route path="/operational" element={<LandingLayout><OperationalSupport /></LandingLayout>} />
                        <Route path="/documentation" element={<LandingLayout><Documentation /></LandingLayout>} />
                        <Route path="/audit" element={<LandingLayout><AuditLog /></LandingLayout>} />
                        <Route path="/legal" element={<LandingLayout><Legal /></LandingLayout>} />
                        <Route path="/unauthorized" element={<div>Unauthorized Access</div>} />
                        <Route path="*" element={<div>404 Not Found</div>} />
                    </Routes>
                                </Router>
                </NotificationProvider>
            </ErrorBoundary>
        </AuthProvider>
    );
};

export default App;
