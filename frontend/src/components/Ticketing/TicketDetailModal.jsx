import React, { useState, useEffect } from 'react';
import { getTicketById, addComment, assignTicket, updateTicketStatus } from '../../services/ticketingApi';
import { toast } from 'react-hot-toast';
import { X, Send, Paperclip, User, Phone, MapPin, Loader } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const TicketDetailModal = ({ ticketId, onClose, onUpdate }) => {
    const { user, hasRole, displayName } = useAuth();
    const [ticket, setTicket] = useState(null);
    const [loading, setLoading] = useState(true);
    const [commentText, setCommentText] = useState('');
    const isAdmin = hasRole('ADMIN') || hasRole('TECHNICIAN');
    const isManager = hasRole('MANAGER') && !hasRole('ADMIN');
    const isSuperAdmin = hasRole('ADMIN');
    const [assignEmail, setAssignEmail] = useState('');

    const fetchTicket = async () => {
        try {
            setLoading(true);
            const data = await getTicketById(ticketId);
            setTicket(data);
            setAssignEmail(data.assigneeEmail || '');
        } catch (err) {
            toast.error('Failed to load ticket details');
            onClose();
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (ticketId) fetchTicket();
    }, [ticketId]);

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!commentText.trim()) return;
        try {
            await addComment(ticketId, { content: commentText });
            setCommentText('');
            fetchTicket();
            if (onUpdate) onUpdate();
        } catch (err) {
            const apiMessage = err?.response?.data?.message || err?.response?.data?.error;
            toast.error(apiMessage || 'Failed to add comment');
        }
    };

    const handleAssign = async () => {
        if (!assignEmail.trim()) return;
        try {
            await assignTicket(ticketId, assignEmail);
            toast.success('Ticket assigned successfully!');
            fetchTicket();
            if (onUpdate) onUpdate();
        } catch (err) {
            toast.error('Failed to assign ticket');
        }
    };

    const handleStatusChange = async (e) => {
        const newStatus = e.target.value;
        try {
            await updateTicketStatus(ticketId, newStatus);
            toast.success('Status updated');
            fetchTicket();
            if (onUpdate) onUpdate();
        } catch (err) {
            const apiMessage = err?.response?.data?.message || err?.response?.data?.error;
            toast.error(apiMessage || 'Failed to update status');
        }
    };

    const handleManagerStatus = async (newStatus) => {
        try {
            await updateTicketStatus(ticketId, newStatus);
            toast.success(`Ticket marked as ${newStatus}`);
            fetchTicket();
            if (onUpdate) onUpdate();
        } catch (err) {
            const apiMessage = err?.response?.data?.message || err?.response?.data?.error;
            toast.error(apiMessage || 'Failed to update status');
        }
    };

    if (loading || !ticket) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                <Loader className="w-10 h-10 animate-spin text-white" />
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]">
                <header className="p-6 bg-slate-900 text-white flex justify-between items-center">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <span className="bg-blue-600 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">{ticket.priority}</span>
                            <h2 className="text-xl font-black">{ticket.title}</h2>
                        </div>
                        <p className="text-slate-400 text-sm">Ticket #{ticket.id.substring(0,8)} &bull; Reported {new Date(ticket.createdAt).toLocaleDateString()}</p>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 rounded-full border border-slate-700 flex items-center justify-center hover:bg-slate-800 transition-colors">
                        <X className="w-6 h-6 text-slate-300" />
                    </button>
                </header>

                <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
                    {/* Left Info Panel */}
                    <div className="w-full md:w-1/2 p-6 overflow-y-auto border-r border-slate-100 bg-slate-50">
                        <div className="space-y-6">
                            {/* Student Details */}
                            <section className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Reporter Info</h3>
                                <div className="space-y-3 text-sm">
                                    <div className="flex items-center gap-3"><User className="w-4 h-4 text-slate-400"/> <span className="font-bold">{ticket.studentName || ticket.reporterEmail}</span></div>
                                    {ticket.studentPhone && <div className="flex items-center gap-3"><Phone className="w-4 h-4 text-slate-400"/> {ticket.studentPhone}</div>}
                                    {ticket.department && <div className="flex items-center gap-3"><MapPin className="w-4 h-4 text-blue-500"/> Department: <span className="font-bold text-blue-700">{ticket.department}</span></div>}
                                    <div className="flex items-center gap-3"><MapPin className="w-4 h-4 text-rose-400"/> Issue: <span className="font-bold text-rose-600">{ticket.reason || 'General'}</span></div>
                                </div>
                            </section>

                            <section className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Description</h3>
                                <p className="text-slate-700 whitespace-pre-wrap text-sm leading-relaxed">{ticket.description}</p>
                            </section>

                            {/* Documents */}
                            {ticket.documentUrls && ticket.documentUrls.length > 0 && (
                                <section className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Attachments</h3>
                                    <ul className="space-y-2">
                                        {ticket.documentUrls.map((url, i) => (
                                            <li key={i}>
                                                {url.startsWith('data:image/') ? (
                                                    <a href={url} target="_blank" rel="noreferrer" className="block bg-blue-50 p-2 rounded-xl border border-blue-100">
                                                        <img src={url} alt={`Attachment ${i + 1}`} className="max-h-48 w-auto rounded-lg object-contain" />
                                                    </a>
                                                ) : (
                                                    <a href={url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-blue-600 hover:underline bg-blue-50 px-3 py-2 rounded-xl truncate">
                                                        <Paperclip className="w-4 h-4 shrink-0" />
                                                        {url.startsWith('data:') ? `Uploaded file ${i + 1}` : url}
                                                    </a>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </section>
                            )}

                            {/* Admin Controls */}
                            {(isAdmin || isManager) && (
                                <section className="bg-slate-900 p-5 rounded-2xl shadow-sm text-white">
                                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Management Controls</h3>

                                    {isSuperAdmin ? (
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-300 mb-1">Status</label>
                                                <select
                                                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border-slate-700 text-white focus:ring-blue-500 text-sm"
                                                    value={ticket.status}
                                                    onChange={handleStatusChange}
                                                >
                                                    <option value="PENDING">PENDING</option>
                                                    <option value="OPEN">OPEN</option>
                                                    <option value="IN_PROGRESS">IN PROGRESS</option>
                                                    <option value="RESOLVED">RESOLVED</option>
                                                    <option value="CLOSED">CLOSED</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-300 mb-1">Assign To</label>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="email"
                                                        placeholder="Staff email"
                                                        className="w-full px-3 py-2 rounded-xl bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:ring-blue-500 text-sm"
                                                        value={assignEmail}
                                                        onChange={e => setAssignEmail(e.target.value)}
                                                    />
                                                    <button onClick={handleAssign} className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl text-sm font-bold transition-colors">Assign</button>
                                                </div>
                                            </div>
                                        </div>
                                    ) : isManager ? (
                                        <div className="space-y-3">
                                            <p className="text-xs text-slate-300 bg-slate-800/70 px-3 py-2 rounded-lg">
                                                Managers can open pending tickets and close completed tickets.
                                            </p>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleManagerStatus('OPEN')}
                                                    disabled={ticket.status !== 'PENDING'}
                                                    className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-700 disabled:text-slate-400 px-4 py-2 rounded-xl text-sm font-bold transition-colors"
                                                >
                                                    Open Ticket
                                                </button>
                                                <button
                                                    onClick={() => handleManagerStatus('CLOSED')}
                                                    disabled={ticket.status === 'CLOSED'}
                                                    className="bg-rose-600 hover:bg-rose-700 disabled:bg-slate-700 disabled:text-slate-400 px-4 py-2 rounded-xl text-sm font-bold transition-colors"
                                                >
                                                    Close Ticket
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-xs text-slate-300 bg-slate-800/70 px-3 py-2 rounded-lg">
                                            Only admins can resolve and assign tickets.
                                        </p>
                                    )}
                                </section>
                            )}
                        </div>
                    </div>

                    {/* Right Comments Panel */}
                    <div className="w-full md:w-1/2 flex flex-col bg-white">
                        <div className="p-4 border-b border-slate-100 bg-white">
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Conversation Log</h3>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {ticket.comments && ticket.comments.length > 0 ? (
                                ticket.comments.map((comment, i) => {
                                    const isMe = comment.userEmail === user?.email || comment.userName === user?.name;
                                    
                                    let displayCommentName = comment.userName;
                                    if (isMe && displayName) {
                                        displayCommentName = displayName;
                                    } else if (!displayCommentName || (displayCommentName.length > 50 && displayCommentName.includes('.'))) {
                                        displayCommentName = comment.userEmail ? comment.userEmail.split('@')[0] : 'User';
                                    }
                                    
                                    return (
                                        <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[85%] rounded-2xl p-4 shadow-sm ${isMe ? 'bg-blue-600 text-white rounded-br-none' : 'bg-slate-100 text-slate-800 rounded-bl-none'}`}>
                                                <div className={`text-xs font-bold mb-1 ${isMe ? 'text-blue-200' : 'text-slate-500'}`}>
                                                    {displayCommentName} &bull; {new Date(comment.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                </div>
                                                <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="h-full flex items-center justify-center text-slate-400 italic text-sm">No comments yet. Start the conversation.</div>
                            )}
                        </div>
                        
                        {/* Comment Input */}
                        <div className="p-4 border-t border-slate-100 bg-slate-50">
                            {ticket.status === 'CLOSED' ? (
                                <div className="text-sm font-semibold text-slate-500 bg-slate-100 border border-slate-200 rounded-2xl px-4 py-3">
                                    This ticket is closed. Messaging is disabled.
                                </div>
                            ) : (
                            <form onSubmit={handleAddComment} className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Type a reply..."
                                    className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 focus:border-blue-500 focus:ring-0 transition-all text-sm"
                                    value={commentText}
                                    onChange={e => setCommentText(e.target.value)}
                                />
                                <button type="submit" disabled={!commentText.trim()} className="px-5 py-3 bg-slate-900 text-white rounded-2xl font-bold hover:bg-black disabled:bg-slate-300 transition-all">
                                    <Send className="w-5 h-5" />
                                </button>
                            </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TicketDetailModal;