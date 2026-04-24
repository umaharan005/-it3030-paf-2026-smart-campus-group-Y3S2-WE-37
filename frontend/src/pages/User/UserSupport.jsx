import React, { useState, useEffect } from 'react';
import { getMyTickets } from '../../services/ticketingApi';
import TicketForm from '../../components/Ticketing/TicketForm';
import TicketDetailModal from '../../components/Ticketing/TicketDetailModal';
import { toast } from 'react-hot-toast';
import { Activity, Plus, MessageSquare, Clock, CheckCircle2, AlertTriangle, Loader, Eye, Search } from 'lucide-react';
import { CAMPUS_IMAGES } from '../../constants/visuals';

const UserSupport = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [selectedTicketId, setSelectedTicketId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState('ALL');

    const fetchTickets = async () => {
        try {
            const data = await getMyTickets();
            setTickets(data);
        } catch (err) {
            toast.error('Failed to load tickets');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, []);

    const getStatusMeta = (status) => {
        switch (status) {
            case 'PENDING':
                return { label: 'PENDING', badge: 'bg-slate-100 text-slate-700', progress: 0 };
            case 'OPEN':
                return { label: 'OPEN', badge: 'bg-blue-100 text-blue-700', progress: 1 };
            case 'IN_PROGRESS':
                return { label: 'IN PROGRESS', badge: 'bg-amber-100 text-amber-700', progress: 2 };
            case 'RESOLVED':
                return { label: 'RESOLVED', badge: 'bg-emerald-100 text-emerald-700', progress: 3 };
            case 'CLOSED':
                return { label: 'CLOSED', badge: 'bg-emerald-100 text-emerald-700', progress: 3 };
            default:
                return { label: status || 'UNKNOWN', badge: 'bg-slate-100 text-slate-700', progress: 0 };
        }
    };

    const sortedTickets = [...tickets].sort((a, b) => {
        const aTime = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bTime = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bTime - aTime;
    });

    const filteredTickets = sortedTickets.filter((ticket) => {
        const normalizedStatus = (ticket.status || '').toUpperCase();
        const isResolved = normalizedStatus === 'RESOLVED' || normalizedStatus === 'CLOSED';
        const isOngoing = !isResolved;

        if (activeFilter === 'ONGOING' && !isOngoing) return false;
        if (activeFilter === 'RESOLVED' && !isResolved) return false;

        if (!searchTerm.trim()) return true;
        const q = searchTerm.trim().toLowerCase();
        return (
            (ticket.title || '').toLowerCase().includes(q) ||
            (ticket.department || '').toLowerCase().includes(q) ||
            (ticket.id || '').toLowerCase().includes(q) ||
            (ticket.description || '').toLowerCase().includes(q)
        );
    });

    const getStatusIcon = (status) => {
        switch (status) {
            case 'PENDING': return <Clock className="w-6 h-6 text-amber-500" />;
            case 'OPEN': return <AlertTriangle className="w-6 h-6 text-amber-500" />;
            case 'IN_PROGRESS': return <Clock className="w-6 h-6 text-blue-500 animate-pulse" />;
            case 'RESOLVED': return <CheckCircle2 className="w-6 h-6 text-emerald-500" />;
            case 'CLOSED': return <CheckCircle2 className="w-6 h-6 text-slate-400" />;
            default: return <MessageSquare className="w-6 h-6 text-slate-400" />;
        }
    };

    return (
        <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="mb-16 rounded-[2rem] border border-slate-200 bg-white shadow-xl overflow-hidden relative min-h-[230px] flex items-center">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url("${CAMPUS_IMAGES.support}")` }}
                />
                <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(19,35,59,0.94),rgba(19,35,59,0.68),rgba(201,93,58,0.2))]" />

                <div className="relative z-10 w-full p-8 md:p-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div>
                        <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-3">
                            Operations <span className="text-cyan-300">Hub</span>
                        </h1>
                        <p className="text-sm md:text-base text-slate-100 max-w-2xl font-medium leading-relaxed">
                            Report issues with campus facilities, request operational assistance, and track ticket resolution.
                        </p>
                    </div>

                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white/15 border border-white/25 backdrop-blur-sm flex items-center justify-center shrink-0">
                        <Activity className="w-8 h-8 md:w-10 md:h-10 text-cyan-200" />
                    </div>
                </div>
            </div>

            <div className="flex justify-center mb-12">
                <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black tracking-widest uppercase hover:bg-blue-600 transition-all shadow-xl hover:shadow-blue-500/30 transform hover:-translate-y-1"
                >
                    <Plus className="w-6 h-6" /> File Operations Ticket
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                     <Loader className="w-10 h-10 animate-spin text-blue-600" />
                </div>
            ) : tickets.length === 0 ? (
                <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                    <p className="text-xl font-bold text-slate-400">Great! No active operations tickets.</p>
                </div>
            ) : (
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                        <h2 className="text-lg md:text-2xl font-black text-slate-900">Operations Ticket Queue</h2>
                        <span className="text-xs font-black uppercase tracking-wider text-slate-400">{filteredTickets.length} Records</span>
                    </div>

                    <div className="px-6 py-4 border-b border-slate-100 bg-white flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
                        <div className="relative w-full md:max-w-sm">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search by ticket, department, or ID"
                                className="w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setActiveFilter('ONGOING')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-colors ${activeFilter === 'ONGOING' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                            >
                                Ongoing
                            </button>
                            <button
                                onClick={() => setActiveFilter('RESOLVED')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-colors ${activeFilter === 'RESOLVED' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                            >
                                Resolved
                            </button>
                            <button
                                onClick={() => setActiveFilter('ALL')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-colors ${activeFilter === 'ALL' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                            >
                                All
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[980px]">
                            <thead className="bg-slate-100 border-b border-slate-200">
                                <tr className="text-left text-[11px] font-black uppercase tracking-widest text-slate-500">
                                    <th className="px-6 py-4">Ticket</th>
                                    <th className="px-6 py-4">Created</th>
                                    <th className="px-6 py-4">Department</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Progress</th>
                                    <th className="px-6 py-4">Messages</th>
                                    <th className="px-6 py-4">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredTickets.map((ticket) => {
                                    const meta = getStatusMeta(ticket.status);
                                    const progressPercent = Math.round((meta.progress / 3) * 100);

                                    return (
                                        <tr key={ticket.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-start gap-3">
                                                    <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                                                        {getStatusIcon(ticket.status)}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-slate-900">#{ticket.id?.slice(0, 8)} - {ticket.title}</p>
                                                        <p className="text-xs text-slate-500 line-clamp-1 max-w-[280px]">{ticket.description}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600 font-semibold">
                                                {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : '-'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex px-2.5 py-1 rounded-md bg-indigo-100 text-indigo-700 text-xs font-black uppercase tracking-wider">
                                                    {ticket.department || '-'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex px-2.5 py-1 rounded-md text-xs font-black uppercase tracking-wider ${meta.badge}`}>
                                                    {meta.label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-28 h-1.5 rounded-full bg-slate-200 overflow-hidden">
                                                        <div className="h-full bg-blue-600 rounded-full" style={{ width: `${progressPercent}%` }}></div>
                                                    </div>
                                                    <span className="text-xs font-black text-slate-500">{meta.progress}/3</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-bold text-slate-600">
                                                {ticket.comments?.length || 0}
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => setSelectedTicketId(ticket.id)}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-wider rounded-lg"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                    Open
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {filteredTickets.length === 0 && (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-10 text-center text-slate-400 font-semibold">
                                            No tickets match this search/filter.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {showForm && (
                <TicketForm 
                    onClose={() => setShowForm(false)} 
                    onSuccess={() => {
                        setShowForm(false);
                        fetchTickets();
                    }} 
                />
            )}

            {selectedTicketId && (
                <TicketDetailModal 
                    ticketId={selectedTicketId} 
                    onClose={() => setSelectedTicketId(null)} 
                    onUpdate={fetchTickets}
                />
            )}
        </div>
    );
};

export default UserSupport;
