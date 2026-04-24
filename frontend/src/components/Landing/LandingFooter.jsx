

import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Mail, MapPin, Phone } from 'lucide-react';
import { CAMPUS_IMAGES } from '../../constants/visuals';

const links = [
    { label: 'Catalogue', to: '/catalogue' },
    { label: 'Bookings', to: '/bookings' },
    { label: 'Support', to: '/tickets' },
    { label: 'Documentation', to: '/documentation' },
    { label: 'Audit', to: '/audit' },
    { label: 'Legal', to: '/legal' },
];

const LandingFooter = () => {
    return (
        <footer className="relative overflow-hidden bg-[#13233b] text-white">
            <div className="absolute inset-0 opacity-18">
                <img src={CAMPUS_IMAGES.support} alt="Campus support" className="h-full w-full object-cover" />
            </div>
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(19,35,59,0.98),rgba(19,35,59,0.88),rgba(183,128,56,0.28))]" />

            <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr_0.8fr]">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.34em] text-amber-200">Smart campus hub</p>
                        <h3 className="mt-4 max-w-xl text-4xl font-black leading-tight">
                            A warmer public experience for students, and a sharper operations shell for staff.
                        </h3>
                        <p className="mt-4 max-w-xl text-sm font-medium leading-7 text-slate-300">
                            Browse spaces, manage reservations, and escalate facilities issues with one connected campus platform.
                        </p>
                    </div>

                    <div>
                        <h4 className="text-lg font-black">Quick routes</h4>
                        <div className="mt-5 space-y-3">
                            {links.map((item) => (
                                <Link key={item.to} to={item.to} className="flex items-center gap-3 text-sm font-bold text-slate-300 transition hover:text-white">
                                    <ArrowRight className="h-4 w-4 text-amber-300" />
                                    {item.label}
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 className="text-lg font-black">Operations contact</h4>
                        <div className="mt-5 space-y-4 text-sm font-medium text-slate-300">
                            <div className="flex items-start gap-3">
                                <MapPin className="mt-1 h-4 w-4 text-amber-300" />
                                <span>University Admin Building, Campus Service Wing</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Phone className="h-4 w-4 text-amber-300" />
                                <span>+1 (800) SMART-OPS</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Mail className="h-4 w-4 text-amber-300" />
                                <span>support@smarthub.campus.edu</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-12 border-t border-white/10 pt-6 text-sm text-slate-400">
                    © 2026 SmartHub Operations. Designed for public and administrative campus journeys.
                </div>
            </div>
        </footer>
    );
};

export default LandingFooter;

