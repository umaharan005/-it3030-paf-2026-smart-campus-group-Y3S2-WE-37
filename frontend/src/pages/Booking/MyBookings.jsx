import React, { useState, useEffect } from 'react';
import { getMyBookings, getAllBookings, cancelBooking, updateBookingStatus } from '../../services/bookingApi';
import { getResources } from '../../services/catalogueApi';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { Calendar, Clock, Trash2, Info, CheckCircle, XCircle, Loader, Users, Filter, MapPin } from 'lucide-react';
import PageHeader from '../../components/Common/PageHeader';

const MyBookings = () => {
    const { hasRole } = useAuth();
    const isAdmin = hasRole('ADMIN') || hasRole('MANAGER');

    const [bookings, setBookings] = useState([]);
    const [resourceMap, setResourceMap] = useState({});
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');

    // Reject modal state
    const [rejectTarget, setRejectTarget] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    const fetchBookings = async () => {
        setLoading(true);
        try {
            // Fetch bookings and resources in parallel for mapping
            const [bookingData, resourceData] = await Promise.all([
                isAdmin ? getAllBookings() : getMyBookings(),
                getResources({ size: 100 }) // Adjust size as needed
            ]);
            
            // Create a map of resourceId -> resourceObject
            const rMap = {};
            if (resourceData && resourceData.content) {
                resourceData.content.forEach(r => {
                    rMap[r.id] = r;
                });
            }
            
            setResourceMap(rMap);
            setBookings(bookingData);
        } catch (err) {
            toast.error('Failed to load bookings');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const handleCancel = async (id) => {
        if (!window.confirm('Are you sure you want to cancel this booking?')) return;
        try {
            await cancelBooking(id);
            toast.success('Booking cancelled');
            fetchBookings();
        } catch (err) {
            toast.error('Failed to cancel booking');
        }
    };

    const handleApprove = async (id) => {
        setActionLoading(true);
        try {
            await updateBookingStatus(id, 'APPROVED');
            toast.success('Booking approved');
            fetchBookings();
        } catch (err) {
            toast.error('Failed to approve booking');
        } finally {
            setActionLoading(false);
        }
    };

    const handleCloseBooking = async (id) => {
        if (!window.confirm('Mark this booking as CLOSED? This indicates the resource has been used and the session is over.')) return;
        setActionLoading(true);
        try {
            await updateBookingStatus(id, 'CLOSED');
            toast.success('Booking marked as CLOSED');
            fetchBookings();
        } catch (err) {
            toast.error('Failed to close booking');
        } finally {
            setActionLoading(false);
        }
    };

    const openRejectModal = (booking) => {
        setRejectTarget(booking);
        setRejectionReason('');
    };

    const handleRejectConfirm = async () => {
        if (!rejectionReason.trim()) {
            toast.error('Please provide a rejection reason.');
            return;
        }
        setActionLoading(true);
        try {
            await updateBookingStatus(rejectTarget.id, 'REJECTED', rejectionReason);
            toast.success('Booking rejected');
            setRejectTarget(null);
            fetchBookings();
        } catch (err) {
            toast.error('Failed to reject booking');
        } finally {
            setActionLoading(false);
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'APPROVED': return 'text-green-600 bg-green-50 border-green-200';
            case 'REJECTED': return 'text-red-600 bg-red-50 border-red-200';
            case 'PENDING': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            case 'CANCELLED': return 'text-gray-500 bg-gray-50 border-gray-200';
            case 'CLOSED': return 'text-indigo-600 bg-indigo-50 border-indigo-200';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const formatDateTime = (dateTimeStr) =>
        new Date(dateTimeStr).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });

    const filtered = statusFilter ? bookings.filter(b => b.status === statusFilter) : bookings;

    const STATUSES = ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'CLOSED'];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans">
            <PageHeader
                title={isAdmin ? 'All Booking Requests' : 'Operation Reservations'}
                description={
                    isAdmin
                        ? 'Review, approve, or reject facility booking requests from all users.'
                        : 'Manage and track your active facility and equipment bookings.'
                }
                actions={
                    <div className="bg-blue-600/10 px-4 py-2 rounded-xl border border-blue-600/20 flex items-center text-blue-400 text-[10px] font-black uppercase tracking-widest leading-none">
                        <Info className="w-4 h-4 mr-2" />
                        {isAdmin ? 'Admin View' : 'My Bookings'}
                    </div>
                }
            />

            {/* Status Filter */}
            <div className="flex flex-wrap items-center gap-2 mb-6">
                <Filter className="w-4 h-4 text-slate-400" />
                <button
                    onClick={() => setStatusFilter('')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${!statusFilter ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                >
                    All
                </button>
                {STATUSES.map(s => (
                    <button
                        key={s}
                        onClick={() => setStatusFilter(s)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${statusFilter === s ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                    >
                        {s}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 italic text-slate-400">
                    <div className="w-8 h-8 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                    Loading bookings...
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-slate-100">
                    <p className="text-slate-500 font-medium">No bookings found{statusFilter ? ` with status "${statusFilter}"` : ''}.</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {filtered.map((booking) => (
                        <div key={booking.id} className="group bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:border-blue-100 transition-all duration-300">
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                                <div className="flex-1">
                                    <div className="flex flex-wrap items-center gap-3 mb-4">
                                        <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(booking.status)} shadow-sm`}>
                                            {booking.status}
                                        </span>
                                        {booking.resourceType && (
                                            <span className="px-3 py-1 bg-slate-100 text-[9px] font-black uppercase tracking-widest text-slate-500 rounded-lg border border-slate-200">
                                                {booking.resourceType}
                                            </span>
                                        )}
                                        <h3 className="text-3xl font-black text-slate-900 tracking-tighter italic leading-none">
                                            <span className="text-blue-600 block text-[10px] uppercase tracking-[0.4em] not-italic mb-1 font-black">Reserved Facility</span>
                                            {booking.resourceName || resourceMap[booking.resourceId]?.name || 'Unknown Asset'}
                                        </h3>
                                    </div>

                                    {(booking.resourceLocation || resourceMap[booking.resourceId]?.location) && (
                                        <div className="flex items-center gap-2 text-blue-600 font-bold text-sm mb-5 bg-blue-50/50 w-fit px-5 py-2 rounded-2xl border border-blue-100/50 backdrop-blur-sm shadow-sm shadow-blue-500/5">
                                            <MapPin className="w-4 h-4" />
                                            {booking.resourceLocation || resourceMap[booking.resourceId]?.location}
                                        </div>
                                    )}

                                    {isAdmin && (
                                        <p className="text-xs text-slate-500 mb-3 flex items-center gap-1">
                                            <Users className="w-3.5 h-3.5" />
                                            Requested by: <span className="font-bold text-slate-700 ml-1">{booking.userEmail}</span>
                                        </p>
                                    )}

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-3 text-sm font-medium text-slate-500">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-blue-500" />
                                            {formatDateTime(booking.startTime)}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-blue-500" />
                                            Ends: {formatDateTime(booking.endTime)}
                                        </div>
                                    </div>

                                    <div className="mt-6 text-slate-900 bg-slate-50 p-5 rounded-3xl text-sm border border-slate-200 flex flex-col gap-2 relative overflow-hidden group/purpose">
                                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover/purpose:opacity-10 transition-opacity">
                                            <Info className="w-12 h-12" />
                                        </div>
                                        <span className="font-black text-[10px] uppercase tracking-[0.2em] text-blue-600">Booking Purpose / Reason</span>
                                        <span className="font-bold text-lg leading-relaxed">{booking.purpose}</span>
                                    </div>

                                    <div className="mt-4 flex flex-wrap gap-6 items-center border-t border-slate-50 pt-4">
                                        <div className="flex items-center gap-2">
                                            <Users className="w-4 h-4 text-slate-400" />
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Booked For</p>
                                                <p className="text-sm font-black text-slate-900">{booking.expectedAttendees} Members</p>
                                            </div>
                                        </div>
                                        {booking.resourceCapacity > 0 && (
                                            <div className="flex items-center gap-2">
                                                <div className="w-1 h-1 bg-slate-200 rounded-full"></div>
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Max Capacity</p>
                                                    <p className="text-sm font-bold text-slate-600">{booking.resourceCapacity}</p>
                                                </div>
                                            </div>
                                        )}
                                        {booking.minAttendeesConstraint > 0 && (
                                            <div className="flex items-center gap-2">
                                                <div className="w-1 h-1 bg-slate-200 rounded-full"></div>
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Constraint</p>
                                                    <p className="text-sm font-bold text-slate-600">Min {booking.minAttendeesConstraint} users</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {booking.rejectionReason && (
                                        <div className="mt-3 bg-red-50 border border-red-100 rounded-2xl p-3 text-sm text-red-700">
                                            <span className="font-bold">Rejection reason: </span>{booking.rejectionReason}
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-row md:flex-col gap-2 flex-shrink-0">
                                    {/* Admin: Approve / Reject pending bookings */}
                                    {isAdmin && booking.status === 'PENDING' && (
                                        <>
                                            <button
                                                disabled={actionLoading}
                                                onClick={() => handleApprove(booking.id)}
                                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-50 text-green-700 hover:bg-green-600 hover:text-white rounded-2xl transition-all font-black text-xs uppercase tracking-widest border border-green-200 shadow-sm disabled:opacity-50"
                                            >
                                                <CheckCircle className="w-4 h-4" /> Approve
                                            </button>
                                            <button
                                                disabled={actionLoading}
                                                onClick={() => openRejectModal(booking)}
                                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-50 text-red-700 hover:bg-red-600 hover:text-white rounded-2xl transition-all font-black text-xs uppercase tracking-widest border border-red-200 shadow-sm disabled:opacity-50"
                                            >
                                                <XCircle className="w-4 h-4" /> Reject
                                            </button>
                                        </>
                                    )}

                                    {/* User: Cancel pending or approved bookings */}
                                    {!isAdmin && (booking.status === 'PENDING' || booking.status === 'APPROVED') && (
                                        <button
                                            onClick={() => handleCancel(booking.id)}
                                            className="px-6 py-3 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-2xl transition-all flex items-center justify-center font-black text-xs uppercase tracking-widest border border-red-100 shadow-sm"
                                        >
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            Cancel
                                        </button>
                                    )}
                                    {isAdmin && booking.status === 'APPROVED' && (
                                        <button
                                            disabled={actionLoading}
                                            onClick={() => handleCloseBooking(booking.id)}
                                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white rounded-2xl transition-all font-black text-xs uppercase tracking-widest border border-indigo-200 shadow-sm disabled:opacity-50"
                                        >
                                            <CheckCircle className="w-4 h-4" /> Close Booking
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Reject Reason Modal */}
            {rejectTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6">
                        <h2 className="text-xl font-black text-slate-900 mb-2">Reject Booking</h2>
                        <p className="text-sm text-slate-500 mb-5">
                            Please provide a reason for rejecting the booking for resource <strong>{rejectTarget.resourceId}</strong> by <strong>{rejectTarget.userEmail}</strong>.
                        </p>
                        <textarea
                            rows="4"
                            className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-red-400 focus:ring-red-200 text-sm mb-4"
                            placeholder="e.g., Conflicting event, Resource under maintenance..."
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                        />
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setRejectTarget(null)}
                                className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-600 font-bold hover:bg-slate-50"
                            >
                                Cancel
                            </button>
                            <button
                                disabled={actionLoading}
                                onClick={handleRejectConfirm}
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition disabled:opacity-50"
                            >
                                {actionLoading ? <Loader className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                                Confirm Rejection
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyBookings;
