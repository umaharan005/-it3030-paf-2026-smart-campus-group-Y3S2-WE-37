import React from 'react';
import PageHeader from '../../components/Common/PageHeader';
import { Mail, Phone, MessageSquare, Clock, Globe, Shield } from 'lucide-react';

const OperationalSupport = () => {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <PageHeader 
                title="Operational Support"
                description="Get in touch with the SmartHub Operations Center for facility assistance, technical support, or emergency maintenance requests."
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-lg transition-all">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                        <Mail className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 mb-2">Email Support</h3>
                    <p className="text-slate-500 text-sm mb-6">For non-urgent inquiries and documentation requests.</p>
                    <a href="mailto:support@smarthub.campus.edu" className="text-blue-600 font-bold hover:underline">
                        support@smarthub.campus.edu
                    </a>
                </div>

                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-lg transition-all">
                    <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-xl flex items-center justify-center mb-6">
                        <Phone className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 mb-2">Hotline</h3>
                    <p className="text-slate-500 text-sm mb-6">24/7 emergency maintenance and incident reporting line.</p>
                    <p className="text-sky-600 font-bold font-mono">+1 (800) SMART-OPS</p>
                </div>

                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-lg transition-all">
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-6">
                        <MessageSquare className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 mb-2">Live Chat</h3>
                    <p className="text-slate-500 text-sm mb-6">Real-time assistance from our campus operation officers.</p>
                    <button className="text-indigo-600 font-bold hover:underline">Start Chat Session</button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-8">
                    <h2 className="text-3xl font-black text-slate-900 italic">Operational Guidelines</h2>
                    <div className="space-y-6">
                        {[
                            { icon: Clock, title: 'Response Times', desc: 'Emergency issues are addressed within 30 minutes. General requests are processed within 24 hours.' },
                            { icon: Globe, title: 'Regional Coverage', desc: 'Full support across all campus sectors, including satellite labs and off-campus housing.' },
                            { icon: Shield, title: 'Privacy & Audit', desc: 'All support calls and chat transcripts are logged for audit compliance and quality assurance.' }
                        ].map((item, i) => (
                            <div key={i} className="flex gap-4">
                                <div className="flex-shrink-0 w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600">
                                    <item.icon className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900">{item.title}</h4>
                                    <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-slate-900 rounded-3xl p-10 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                    <h2 className="text-3xl font-black mb-6 relative">Frequently Asked Questions</h2>
                    <div className="space-y-6 relative">
                        {[
                            { q: 'How do I report a maintenance fault?', a: 'Click the "File Incident" button in the top bar or navigate to the Maintenance Hub to submit a ticket.' },
                            { q: 'Who can book specialized lab equipment?', a: 'Only users with validated Faculty or Researcher roles can reserve specialized infrastructure.' },
                            { q: 'What happens if I miss my booking?', a: 'Unclaimed bookings are automatically released after 15 minutes of non-attendance.' }
                        ].map((faq, i) => (
                            <div key={i} className="border-b border-white/10 pb-6 last:border-0">
                                <h4 className="font-bold text-blue-400 mb-2">{faq.q}</h4>
                                <p className="text-sm text-slate-400 leading-relaxed">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OperationalSupport;
