import React from 'react';
import PageHeader from '../../components/Common/PageHeader';
import { Gavel, ShieldCheck, Scale, FileText } from 'lucide-react';

const Legal = () => {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <PageHeader 
                title="Legal & Compliance"
                description="Regulatory framework, terms of service, and data privacy policies governing the use of the SmartHub Operations platform."
            />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-1 space-y-2">
                    {['Terms of Service', 'Privacy Policy', 'Cookie Policy', 'Audit Standards', 'GDPR Compliance'].map((item, i) => (
                        <button key={i} className={`w-full text-left px-6 py-4 rounded-xl text-sm font-bold transition-all ${
                            i === 0 ? 'bg-slate-900 text-white' : 'bg-white text-slate-500 hover:bg-slate-50'
                        }`}>
                            {item}
                        </button>
                    ))}
                </div>

                <div className="lg:col-span-3 bg-white rounded-3xl border border-slate-200 p-10 shadow-sm">
                    <div className="max-w-3xl space-y-10">
                        <section>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                                    <Gavel className="w-5 h-5" />
                                </div>
                                <h2 className="text-2xl font-black text-slate-900 italic">Terms of Service</h2>
                            </div>
                            <div className="space-y-4 text-slate-500 text-sm leading-relaxed">
                                <p>
                                    By accessing the SmartHub Operations Center, you agree to comply with the university's Acceptable Use Policy and all local regulations regarding infrastructure management.
                                </p>
                                <p>
                                    All activities performed within this portal are logged and subject to audit. Unauthorized access or attempt to override role-based constraints will result in immediate termination of access and disciplinary action.
                                </p>
                            </div>
                        </section>

                        <section>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-sky-50 text-sky-600 rounded-lg flex items-center justify-center">
                                    <ShieldCheck className="w-5 h-5" />
                                </div>
                                <h2 className="text-2xl font-black text-slate-900 italic">Data Privacy & Security</h2>
                            </div>
                            <div className="space-y-4 text-slate-500 text-sm leading-relaxed">
                                <p>
                                    SmartHub employs industry-standard AES-256 encryption for all data at rest and TLS 1.3 for data in transit. We prioritize the security of campus personnel data and operational logs.
                                </p>
                                <p>
                                    We do not share operational data with third parties unless required by law or for maintenance activities directly requested by the campus administration.
                                </p>
                            </div>
                        </section>

                        <section>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
                                    <Scale className="w-5 h-5" />
                                </div>
                                <h2 className="text-2xl font-black text-slate-900 italic">Governance Standards</h2>
                            </div>
                            <div className="space-y-4 text-slate-500 text-sm leading-relaxed">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 italic font-bold text-slate-900">
                                        ISO 27001 Compliant
                                    </div>
                                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 italic font-bold text-slate-900">
                                        NIST Cybersecurity Framework
                                    </div>
                                </div>
                                <p className="pt-4">
                                    Our platform undergoes quarterly security audits and penetration testing to ensure the highest standards of system integrity and availability.
                                </p>
                            </div>
                        </section>

                        <div className="pt-10 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex items-center gap-3">
                                <FileText className="w-5 h-5 text-slate-400" />
                                <span className="text-xs font-medium text-slate-400">Last updated: April 09, 2026</span>
                            </div>
                            <button className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-600 transition-all text-sm">
                                Download Legal Framework (PDF)
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Legal;
