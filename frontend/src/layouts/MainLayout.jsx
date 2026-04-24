



import React from 'react';
import { Search, Sparkles } from 'lucide-react';
import Navbar from '../components/Navbar';
import NotificationPanel from '../modules/Notifications/NotificationPanel';
import { CAMPUS_IMAGES } from '../constants/visuals';

const MainLayout = ({ children }) => {
    return (
        <div className="min-h-screen bg-[#09111f] text-white lg:flex">
            <Navbar />
            <div className="relative flex-1 overflow-hidden">
                <div
                    className="absolute inset-0 opacity-20"
                    style={{
                        backgroundImage: `linear-gradient(180deg, rgba(9, 17, 31, 0.86), rgba(9, 17, 31, 0.96)), url('${CAMPUS_IMAGES.admin}')`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }}
                />
                <div className="admin-grid absolute inset-0 opacity-30" />

                <header className="sticky top-0 z-30 border-b border-white/10 bg-[#09111f]/82 backdrop-blur-xl">
                    <div className="flex flex-col gap-4 px-4 py-4 md:px-8 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-cyan-300">Campus Command Deck</p>
                            <div className="mt-2 flex items-center gap-3">
                                <Sparkles className="h-5 w-5 text-amber-300" />
                                <h1 className="text-2xl font-black tracking-tight text-white md:text-3xl">Admin and staff operations</h1>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                            <div className="relative min-w-[240px]">
                                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search controls, people, modules"
                                    className="w-full rounded-full border border-white/10 bg-white/6 py-3 pl-11 pr-4 text-sm font-semibold text-white outline-none transition focus:border-cyan-300/40 focus:bg-white/10"
                                />
                            </div>
                            <NotificationPanel />
                        </div>
                    </div>
                </header>

                <main className="relative z-10 h-[calc(100vh-101px)] overflow-y-auto">
                    <div className="pb-10">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default MainLayout;


