import React, { useMemo, useState, useEffect } from 'react';
import { getAssignedTickets, getAllTickets } from '../../services/ticketingApi';
import { toast } from 'react-hot-toast';
import { ClipboardList, Clock, AlertTriangle, CheckCircle2, MessageSquare, Eye } from 'lucide-react';
import PageHeader from '../../components/Common/PageHeader';
import { useAuth } from '../../context/AuthContext';
import TicketDetailModal from '../../components/Ticketing/TicketDetailModal';

const TicketList = () => {
    const { hasRole, user } = useAuth();
    const isManager = hasRole('MANAGER') && !hasRole('ADMIN');
    const managerDepartment = user?.department || '';
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTicketId, setSelectedTicketId] = useState(null);

    const fetchTickets = async () => {
        try {
            const data = hasRole('ADMIN') ? await getAllTickets() : await getAssignedTickets();
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

    const getStatusIcon = (status) => {
        switch (status) {
            case 'PENDING': return <Clock className="w-5 h-5 text-amber-500" />;
            case 'OPEN': return <Clock className="w-5 h-5 text-blue-500" />;
            case 'IN_PROGRESS': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
            case 'RESOLVED': return <CheckCircle2 className="w-5 h-5 text-green-500" />;
            case 'CLOSED': return <CheckCircle2 className="w-5 h-5 text-slate-500" />;
            default: return <ClipboardList className="w-5 h-5 text-gray-500" />;
        }
    };

    const groupedTickets = useMemo(() => {
        const pending = tickets.filter((ticket) => ticket.status === 'PENDING');
        const open = tickets.filter((ticket) => ticket.status === 'OPEN' || ticket.status === 'IN_PROGRESS');
        const closed = tickets.filter((ticket) => ticket.status === 'CLOSED' || ticket.status === 'RESOLVED');
        return { pending, open, closed, all: tickets };
    }, [tickets]);

    const renderTableSection = (title, list, emptyText) => (
        <section className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <h2 className="text-sm font-black uppercase tracking-wider text-slate-700">{title}</h2>
                <span className="text-xs font-black text-slate-400">{list.length} Tickets</span>
            </div>

            {list.length === 0 ? (
                <div className="px-6 py-10 text-center text-slate-400 font-semibold">{emptyText}</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[760px]">
                        <thead className="bg-slate-100/80 border-b border-slate-200">
                            <tr className="text-left text-[11px] uppercase tracking-wider text-slate-500 font-black">
                                <th className="px-6 py-3">Ticket</th>
                                <th className="px-6 py-3">Owner</th>
                                <th className="px-6 py-3">Department</th>
                                <th className="px-6 py-3">Date</th>
                                <th className="px-6 py-3">Latest Respond</th>
                                <th className="px-6 py-3">Options</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {list.map((ticket) => (
                                <tr key={ticket.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-start gap-3">
                                            <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                                                {getStatusIcon(ticket.status)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-slate-900">{ticket.title || 'Untitled Ticket'}</p>
                                                <p className="text-xs text-slate-500 line-clamp-1 max-w-[300px]">{ticket.description || 'No description'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-semibold text-blue-700">{ticket.studentName || ticket.reporterEmail || '-'}</td>
                                    <td className="px-6 py-4 text-sm font-bold text-indigo-700">{ticket.department || '-'}</td>
                                    <td className="px-6 py-4 text-sm text-slate-500">{ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : '-'}</td>
                                    <td className="px-6 py-4 text-sm text-slate-500">{ticket.comments?.length ? 'Conversation Active' : 'No Messages Yet'}</td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => setSelectedTicketId(ticket.id)}
                                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-600 text-white text-xs font-black uppercase tracking-wider"
                                        >
                                            <Eye className="w-3.5 h-3.5" />
                                            Open
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans">
            <PageHeader 
                title={isManager ? 'Department Operations Hub' : 'Maintenance Hub'}
                description={isManager
                    ? `Manage and respond to incidents for ${managerDepartment || 'your assigned'} department.`
                    : 'Track facility incidents, report infrastructure faults, and monitor resolution updates from campus technicians.'}
                actions={isManager && managerDepartment ? (
                    <span className="px-4 py-2 rounded-xl bg-indigo-100 text-indigo-800 font-black text-xs uppercase tracking-wider">
                        {managerDepartment} Department
                    </span>
                ) : null}
            />

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 italic text-slate-400">
                    <div className="w-8 h-8 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                    Loading incidents...
                </div>
            ) : (
                <div className="space-y-6">
                    {tickets.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200 shadow-sm group">
                            <ClipboardList className="w-16 h-16 text-slate-100 mx-auto mb-4 group-hover:text-blue-50 transition-colors" />
                            <p className="text-slate-500 text-lg font-medium italic">No active incidents found. Campus infrastructure is stable.</p>
                        </div>
                    ) : (
                        <>
                            {renderTableSection('Pending Tickets', groupedTickets.pending, 'No pending tickets right now.')}
                            {renderTableSection('Open Tickets', groupedTickets.open, 'No open tickets right now.')}
                            {renderTableSection('Closed Tickets', groupedTickets.closed, 'No closed tickets yet.')}
                            {renderTableSection('All Tickets', groupedTickets.all, 'No tickets found.')}
                        </>
                    )}
                </div>
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

export default TicketList;
