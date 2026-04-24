import React from 'react';
import {
    ArrowRight,
    BookOpenText,
    CalendarRange,
    MapPin,
    ShieldCheck,
    Sparkles,
    Wrench,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { CAMPUS_IMAGES } from '../constants/visuals';

const featureCards = [
    {
        title: 'Find the right space',
        description: 'Search lecture rooms, labs, study areas, and meeting zones through a clearer public catalogue.',
        icon: MapPin,
    },
    {
        title: 'Book without friction',
        description: 'Reserve facilities through a member-first booking flow that feels separate from staff operations.',
        icon: CalendarRange,
    },
    {
        title: 'Get support quickly',
        description: 'Raise issues and follow service updates through a cleaner support journey.',
        icon: Wrench,
    },
];

const Home = () => {
    return (
        <div className="overflow-hidden bg-[#fffaf3]">
            <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
                <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                    <div className="relative overflow-hidden rounded-[2.5rem] bg-[#13233b] text-white shadow-2xl">
                        <img src={CAMPUS_IMAGES.hero} alt="Campus operations" className="absolute inset-0 h-full w-full object-cover opacity-35" />
                        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(19,35,59,0.95),rgba(19,35,59,0.88),rgba(201,93,58,0.25))]" />
                        <div className="relative z-10 px-8 py-10 md:px-10 md:py-12">
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-200">Different home experience</p>
                            <h1 className="mt-5 max-w-3xl text-5xl font-black leading-[0.92] md:text-7xl">
                                Campus services,
                                <span className="block text-[#ffd8af]">without the admin feel.</span>
                            </h1>
                            <p className="mt-6 max-w-2xl text-base font-medium leading-8 text-slate-200 md:text-lg">
                                This home screen now behaves like a public-facing campus guide, while the admin side stays inside its own control-room interface.
                            </p>
                            <div className="mt-8 flex flex-wrap gap-4">
                                <Link
                                    to="/catalogue"
                                    className="inline-flex items-center gap-2 rounded-[1.2rem] bg-[linear-gradient(90deg,#f4d7af,#d78c4d)] px-7 py-4 text-sm font-black uppercase tracking-[0.26em] text-[#13233b] shadow-2xl transition hover:brightness-105"
                                >
                                    Explore spaces
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                                <Link
                                    to="/login"
                                    className="inline-flex items-center gap-2 rounded-[1.2rem] border border-white/18 bg-white/10 px-7 py-4 text-sm font-black uppercase tracking-[0.26em] text-white backdrop-blur-sm transition hover:bg-white/16"
                                >
                                    Sign in
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-6">
                        <div className="glass-panel rounded-[2.2rem] p-5">
                            <div className="grid gap-4 md:grid-cols-[0.9fr_1.1fr]">
                                <div className="overflow-hidden rounded-[1.6rem]">
                                    <img src={CAMPUS_IMAGES.about} alt="Study space" className="h-56 w-full object-cover" />
                                </div>
                                <div className="flex flex-col justify-center">
                                    <p className="text-[10px] font-black uppercase tracking-[0.34em] text-[#b78038]">Public shell</p>
                                    <h2 className="mt-3 text-3xl font-black text-[#13233b]">A friendlier first impression</h2>
                                    <p className="mt-3 text-sm font-medium leading-7 text-slate-600">
                                        The public side now feels more like a curated campus portal than a generic software dashboard.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="overflow-hidden rounded-[2rem] shadow-xl">
                                <img src={CAMPUS_IMAGES.lounge} alt="Campus lounge" className="h-56 w-full object-cover" />
                            </div>
                            <div className="rounded-[2rem] bg-[#c95d3a] p-6 text-white shadow-xl">
                                <Sparkles className="h-8 w-8 text-[#ffe1cb]" />
                                <h3 className="mt-5 text-3xl font-black leading-tight">Public navigation, admin separation.</h3>
                                <p className="mt-3 text-sm font-medium leading-7 text-orange-50/90">
                                    Regular users no longer land inside a staff-oriented atmosphere.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="grid gap-5 md:grid-cols-3">
                    {featureCards.map((item) => (
                        <div key={item.title} className="glass-panel rounded-[2rem] p-6">
                            <div className="flex h-14 w-14 items-center justify-center rounded-[1.2rem] bg-[#13233b] text-amber-200 shadow-lg">
                                <item.icon className="h-6 w-6" />
                            </div>
                            <h3 className="mt-5 text-2xl font-black text-[#13233b]">{item.title}</h3>
                            <p className="mt-3 text-sm font-medium leading-7 text-slate-600">{item.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-4 pb-20 pt-8 sm:px-6 lg:px-8">
                <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
                    <div className="rounded-[2.3rem] bg-[#13233b] p-8 text-white shadow-2xl">
                        <p className="text-[10px] font-black uppercase tracking-[0.34em] text-amber-200">Role separation</p>
                        <h2 className="mt-4 text-4xl font-black leading-tight">The home page now belongs to users, not admins.</h2>
                        <div className="mt-8 space-y-5">
                            <div className="flex gap-4">
                                <ShieldCheck className="mt-1 h-5 w-5 text-amber-300" />
                                <p className="text-sm font-medium leading-7 text-slate-200">
                                    Admins and technicians still get their dedicated darker shell once they move into staff modules.
                                </p>
                            </div>
                            <div className="flex gap-4">
                                <BookOpenText className="mt-1 h-5 w-5 text-amber-300" />
                                <p className="text-sm font-medium leading-7 text-slate-200">
                                    Public users see a brighter, image-led homepage with simpler calls to action and a clearly different navbar style.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-6 md:grid-cols-[1.05fr_0.95fr]">
                        <div className="overflow-hidden rounded-[2rem] shadow-xl">
                            <img src={CAMPUS_IMAGES.skyline} alt="Campus skyline" className="h-full w-full object-cover" />
                        </div>
                        <div className="grid gap-6">
                            <div className="glass-panel rounded-[2rem] p-6">
                                <p className="text-[10px] font-black uppercase tracking-[0.34em] text-[#b78038]">Still connected</p>
                                <h3 className="mt-3 text-3xl font-black text-[#13233b]">Same backend, fresher surface.</h3>
                                <p className="mt-3 text-sm font-medium leading-7 text-slate-600">
                                    Catalogue, booking, and support flows still use your current backend APIs.
                                </p>
                            </div>
                            <div className="overflow-hidden rounded-[2rem] shadow-xl">
                                <img src={CAMPUS_IMAGES.support} alt="Operations support" className="h-56 w-full object-cover" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
