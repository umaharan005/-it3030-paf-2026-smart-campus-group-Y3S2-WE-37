import React from 'react';
import LandingNavbar from '../components/Landing/LandingNavbar';
import LandingFooter from '../components/Landing/LandingFooter';

const LandingLayout = ({ children }) => {
    return (
        <div className="flex min-h-screen flex-col bg-[#fffaf3] text-slate-900">
            <LandingNavbar />
            <main className="flex-grow">
                {children}
            </main>
            <LandingFooter />
        </div>
    );
};

export default LandingLayout;

