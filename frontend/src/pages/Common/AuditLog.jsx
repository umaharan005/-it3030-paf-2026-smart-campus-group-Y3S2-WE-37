import React from 'react';
import PageHeader from '../../components/Common/PageHeader';
import { Shield, Clock, FileText, CheckCircle, AlertTriangle, Eye } from 'lucide-react';

const AuditLog = () => {
    const logs = [
        { id: 'LOG-8821', action: 'Room Reserved', target: 'Lab 402', user: 'technician_01', status: 'Success', time: '2 mins ago' },
        { id: 'LOG-8820', action: 'Maintenance Resolved', target: 'Ticket #442', user: 'admin_user', status: 'Success', time: '15 mins ago' },
        { id: 'LOG-8819', action: 'System Login', target: 'Operations Portal', user: 'manager_smith', status: 'Success', time: '1 hour ago' },
        { id: 'LOG-8818', action: 'New Asset Added', target: 'Smart Projector', user: 'admin_user', status: 'Success', time: '3 hours ago' },
        { id: 'LOG-8817', action: 'Booking Cancellation', target: 'Conference Room B', user: 'student_99', status: 'Success', time: '5 hours ago' },
        { id: 'LOG-8816', action: 'Unauthorized Access', target: 'Server Room', user: 'unknown_ip', status: 'Warning', time: '8 hours ago' },
        { id: 'LOG-8815', action: 'Role Updated', target: 'User #102', user: 'admin_user', status: 'Success', time: 'Yesterday' },
        { id: 'LOG-8814', action: 'Maintenance Reported', target: 'HVAC Unit 4', user: 'technician_05', status: 'Success', time: 'Yesterday' },
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <PageHeader 
                title="Operational Audit Log"
                description="Real-time transparency into campus operations, facility bookings, and maintenance activity for governance and audit compliance."
            />

            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <Shield className="w-5 h-5 text-blue-600" />
                        <span className="font-bold text-slate-900 italic">System Integrity Active</span>
                    </div>
                    <div className="flex gap-2">
                        <button className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-black uppercase tracking-widest text-slate-600 transition-all">
                            Export PDF
                        </button>
                        <button className="px-4 py-2 bg-slate-900 text-white hover:bg-blue-600 rounded-xl text-xs font-black uppercase tracking-widest transition-all">
                            Download CSV
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Log ID</th>
                                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Action/Event</th>
                                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Target Resource</th>
                                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Actor</th>
                                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Timestamp</th>
                                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {logs.map((log) => (
                                <tr key={log.id} className="hover:bg-slate-50 transition-colors group">
                                    <td className="px-8 py-5 text-xs font-mono text-slate-500">{log.id}</td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-2">
                                            <FileText className="w-4 h-4 text-slate-400" />
                                            <span className="font-bold text-slate-900 text-sm">{log.action}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-sm font-medium text-slate-600">{log.target}</td>
                                    <td className="px-8 py-5 text-sm text-slate-500 italic">{log.user}</td>
                                    <td className="px-8 py-5">
                                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                                            log.status === 'Success' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'
                                        }`}>
                                            {log.status === 'Success' ? <CheckCircle className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                                            {log.status}
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-2 text-xs text-slate-400">
                                            <Clock className="w-3 h-3" />
                                            {log.time}
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <button className="p-2 text-slate-300 hover:text-blue-600 transition-colors">
                                            <Eye className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="p-8 bg-slate-50 flex items-center justify-between border-t border-slate-100">
                    <p className="text-xs font-medium text-slate-500 italic">Showing last 24 hours of operation logs. Retention policy: 365 Days.</p>
                    <div className="flex gap-2">
                        <button className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold hover:bg-white transition-all">Previous</button>
                        <button className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold hover:bg-white transition-all">Next</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuditLog;
