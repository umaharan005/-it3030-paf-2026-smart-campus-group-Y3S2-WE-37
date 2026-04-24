import React from 'react';
import { Compass, LayoutDashboard, LogOut, Menu, Sparkles } from 'lucide-react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NotificationPanel from '../../modules/Notifications/NotificationPanel';
import { CAMPUS_IMAGES } from '../../constants/visuals';

const navItems = [
    { label: 'Spaces', to: '/catalogue' },
    { label: 'Bookings', to: '/bookings' },
    { label: 'Support', to: '/tickets' },
];

const LandingNavbar = () => {
    const { user, logout, displayName, displayPicture } = useAuth();
    const navigate = useNavigate();
    const isLoggedIn = Boolean(user);
    const elevatedAccess = user?.roles?.some((role) => ['ADMIN', 'MANAGER', 'TECHNICIAN'].includes(role.replace('ROLE_', '')));

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <header className="sticky top-0 z-50">
            <div className="border-b border-[#18314f] bg-[#13233b] text-white">
                <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 text-[10px] font-black uppercase tracking-[0.34em] sm:px-6 lg:px-8">
                    <div className="flex items-center gap-3">
                        <Compass className="h-4 w-4 text-amber-300" />
                        Campus concierge interface
                    </div>
                    <div className="hidden items-center gap-6 md:flex">
                        <span>Spaces live</span>
                        <span>Booking ready</span>
                        <span>Service desk active</span>
                    </div>
                </div>
            </div>

            <div className="border-b border-slate-200/70 bg-[#fffaf3]/92 backdrop-blur-xl">
                <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4 px-6 py-4 sm:px-8 xl:px-12">
                    <Link to="/" className="justify-self-start flex shrink-0 items-center gap-4">
                        <div className="relative h-14 w-14 overflow-hidden rounded-[1.4rem] shadow-lg ring-1 ring-slate-200">
                            <img src={CAMPUS_IMAGES.lounge} alt="Campus" className="h-full w-full object-cover" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.34em] text-[#b78038]">Smart campus hub</p>
                            <p className="mt-1 text-2xl font-black tracking-tight text-[#13233b]">Public Portal</p>
                        </div>
                    </Link>

                    <div className="hidden justify-center lg:flex">
                        <div className="flex items-center gap-3">
                            {navItems.map((item) => (
                                <NavLink
                                    key={item.to}
                                    to={item.to}
                                    className={({ isActive }) =>
                                        `inline-flex items-center justify-center rounded-[1.2rem] border px-5 py-3 text-xs font-black uppercase tracking-[0.28em] transition ${
                                            isActive
                                                ? 'border-[#13233b] bg-[#13233b] !text-white shadow-sm'
                                                : 'border-slate-200 bg-white !text-slate-600 hover:border-[#b78038] hover:!text-[#13233b]'
                                        }`
                                    }
                                >
                                    {item.label}
                                </NavLink>
                            ))}
                        </div>
                    </div>

                    <div className="justify-self-end flex items-center gap-3">
                        {isLoggedIn ? (
                            <>
                                <div className="flex items-center gap-2">
                                    <NotificationPanel />
                                </div>

                                {elevatedAccess && (
                                    <Link
                                        to="/dashboard"
                                        className="hidden items-center gap-2 rounded-[1rem] bg-[linear-gradient(90deg,#d47f4b,#bb5334)] px-4 py-3 text-xs font-black uppercase tracking-[0.24em] text-white shadow-lg transition hover:brightness-105 md:flex"
                                    >
                                        <LayoutDashboard className="h-4 w-4" />
                                        Dashboard
                                    </Link>
                                )}

                                <div className="hidden items-center gap-3 rounded-[1.3rem] border border-slate-200 bg-white px-3 py-2 shadow-sm md:flex">
                                    <div className="text-right">
                                        <p className="text-xs font-black uppercase tracking-[0.18em] text-[#13233b]">{displayName}</p>
                                        <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">
                                            {user?.roles?.[0]?.replace('ROLE_', '') || 'MEMBER'}
                                        </p>
                                    </div>
                                    <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-[#13233b] text-sm font-black text-white">
                                        {displayPicture ? (
                                            <img src={displayPicture} alt={displayName} className="h-full w-full object-cover" />
                                        ) : (
                                            displayName?.[0]?.toUpperCase() || 'U'
                                        )}
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="rounded-xl p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-500"
                                    >
                                        <LogOut className="h-4 w-4" />
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="hidden items-center gap-3 md:flex">
                                <Link
                                    to="/login"
                                    className="rounded-[1rem] border border-[#13233b]/12 bg-white px-5 py-3 text-xs font-black uppercase tracking-[0.26em] text-[#13233b] transition hover:border-[#b78038] hover:text-[#b78038]"
                                >
                                    Member login
                                </Link>
                                <Link
                                    to="/tickets"
                                    className="inline-flex items-center gap-2 rounded-[1rem] bg-[linear-gradient(90deg,#d27b48,#b94b30)] px-5 py-3 text-xs font-black uppercase tracking-[0.26em] text-white shadow-lg transition hover:brightness-105"
                                >
                                    <Sparkles className="h-4 w-4" />
                                    Report issue
                                </Link>
                            </div>
                        )}

                        <button className="rounded-[1rem] border border-slate-200 bg-white p-3 text-slate-600 shadow-sm lg:hidden">
                            <Menu className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default LandingNavbar;
