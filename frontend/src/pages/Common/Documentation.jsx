import React from 'react';
import PageHeader from '../../components/Common/PageHeader';
import { Book, Code, ShieldCheck, Terminal, HelpCircle, ArrowRight } from 'lucide-react';

const Documentation = () => {
    const sections = [
        {
            icon: Book,
            title: 'User Manuals',
            topics: ['Getting Started', 'Booking Facilities', 'Reporting Incidents', 'Profile Management']
        },
        {
            icon: Code,
            title: 'Administrator Guide',
            topics: ['Role Management', 'Inventory Setup', 'System Configuration', 'Audit Reporting']
        },
        {
            icon: ShieldCheck,
            title: 'Governance & Privacy',
            topics: ['Data Compliance', 'Access Control Policies', 'Encryption Standards', 'Audit Retention']
        },
        {
            icon: Terminal,
            title: 'API Reference',
            topics: ['Authentication', 'Catalogue Endpoints', 'Booking Webhooks', 'Ticketing API']
        }
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <PageHeader 
                title="Knowledge & Docs"
                description="Comprehensive documentation for users, administrators, and developers utilizing the SmartHub Operations platform."
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                {sections.map((section, idx) => (
                    <div key={idx} className="bg-white p-8 rounded-3xl border border-slate-200 hover:border-blue-500 transition-all group flex flex-col h-full">
                        <div className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors">
                            <section.icon className="w-5 h-5" />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 mb-6">{section.title}</h3>
                        <ul className="space-y-3 mb-8 flex-grow">
                            {section.topics.map((topic, i) => (
                                <li key={i} className="flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 cursor-pointer transition-colors">
                                    <ArrowRight className="w-3 h-3" />
                                    {topic}
                                </li>
                            ))}
                        </ul>
                        <button className="w-full py-3 bg-slate-50 text-slate-900 rounded-xl font-bold text-sm hover:bg-slate-900 hover:text-white transition-all">
                            View Guide
                        </button>
                    </div>
                ))}
            </div>

            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-10 text-white relative overflow-hidden flex flex-col lg:flex-row items-center gap-12">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-48 -mt-48"></div>
                
                <div className="max-w-xl relative">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center mb-8">
                        <HelpCircle className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-4xl font-black mb-4">Can't find what you're looking for?</h2>
                    <p className="text-blue-100 leading-relaxed mb-8">
                        Our specialized operational support team is available 24/7 to help you with technical documentation or manual overrides.
                    </p>
                    <button className="bg-white text-blue-600 px-8 py-4 rounded-xl font-bold hover:bg-blue-50 transition-all shadow-xl">
                        Contact Support Center
                    </button>
                </div>

                <div className="hidden lg:grid grid-cols-2 gap-4 relative">
                    <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20">
                        <h4 className="font-bold mb-2">Video Tutorials</h4>
                        <p className="text-xs text-blue-100">Watch walkthroughs for common system operations.</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20">
                        <h4 className="font-bold mb-2">Release Notes</h4>
                        <p className="text-xs text-blue-100">Stay updated with the latest system improvements.</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20">
                        <h4 className="font-bold mb-2">System Status</h4>
                        <p className="text-xs text-blue-100">Real-time uptime and network status tracking.</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20">
                        <h4 className="font-bold mb-2">Community Forum</h4>
                        <p className="text-xs text-blue-100">Discuss issues and workflows with other users.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Documentation;
