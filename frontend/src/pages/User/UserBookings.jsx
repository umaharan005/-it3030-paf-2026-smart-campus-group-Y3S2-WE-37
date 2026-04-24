import React, { useState, useEffect } from 'react';
import { getMyBookings, cancelBooking } from '../../services/bookingApi';
import { getResources } from '../../services/catalogueApi';
import { toast } from 'react-hot-toast';
import { Calendar, Clock, Trash2, Loader, Users, AlertCircle, MapPin, Info, Pencil } from 'lucide-react';
import BookingModal from '../../components/Booking/BookingModal';
import { CAMPUS_IMAGES } from '../../constants/visuals';

const UserBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [resourceMap, setResourceMap] = useState({});
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [editingBooking, setEditingBooking] = useState(null);

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const [bookingData, resourceData] = await Promise.all([
                getMyBookings(),
                getResources({ size: 100 })
            ]);
            
            const rMap = {};
            if (resourceData && resourceData.content) {
                resourceData.content.forEach(r => {
                    rMap[r.id] = r;
                });
            }
            
            setResourceMap(rMap);
            setBookings(bookingData);
        } catch (err) {
            toast.error('Failed to load your reservations');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const handleCancel = async (id) => {
        if (!window.confirm('Cancel this reservation?')) return;
        try {
            await cancelBooking(id);
            toast.success('Reservation cancelled');
            fetchBookings();
        } catch (err) {
            toast.error('Cancellation failed');
        }
    };

    const handleEdit = (booking) => {
        setEditingBooking(booking);
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'APPROVED':
                return <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Approved</span>;
            case 'REJECTED':
                return <span className="bg-red-100 text-red-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Rejected</span>;
            case 'CANCELLED':
                return <span className="bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Cancelled</span>;
            case 'PENDING':
                return <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Pending Review</span>;
            case 'CLOSED':
                return <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Completed</span>;
            default:
                return <span className="bg-slate-100 text-slate-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">{status}</span>;
        }
    };

    const STATUSES = ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'CLOSED'];
    const filtered = statusFilter ? bookings.filter(b => b.status === statusFilter) : bookings;

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="relative mb-10 overflow-hidden rounded-[2.4rem] shadow-2xl">
                <img src={CAMPUS_IMAGES.lounge} alt="Reservations" className="absolute inset-0 h-full w-full object-cover" />
                <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(19,35,59,0.95),rgba(19,35,59,0.58),rgba(201,93,58,0.22))]" />
                <div className="relative z-10 flex flex-col gap-4 px-8 py-14 md:flex-row md:items-end md:justify-between">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.34em] text-amber-200">Member reservations</p>
                        <h1 className="mt-4 text-4xl font-black tracking-tight text-white">
                            My booking journey
                        </h1>
                        <p className="mt-3 max-w-2xl text-base font-medium text-slate-200">Track and manage your campus facility reservations from a calmer user-facing workspace.</p>
                    </div>
                    <div className="glass-panel flex items-center gap-2 rounded-[1.4rem] px-6 py-3 font-bold text-[#13233b]">
                        <Calendar className="h-5 w-5" /> {bookings.length} Booking{bookings.length !== 1 ? 's' : ''}
                    </div>
                </div>
            </div>

            {/* Status Filter */}
            <div className="flex flex-wrap gap-2 mb-8">
                <button
                    onClick={() => setStatusFilter('')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${!statusFilter ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                >
                    All
                </button>
                {STATUSES.map(s => (
                    <button
                        key={s}
                        onClick={() => setStatusFilter(s)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${statusFilter === s ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                    >
                        {s}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader className="w-10 h-10 animate-spin text-blue-600" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                    <p className="text-xl font-bold text-slate-400">
                        {statusFilter ? `No ${statusFilter.toLowerCase()} bookings.` : 'No reservations yet.'}
                    </p>
                    <p className="text-slate-400 mt-2 text-sm">Browse the catalogue to book a resource.</p>
                </div>
            ) : (
                <div className="space-y-5">
                    {filtered.map(booking => (
                        <div
                            key={booking.id}
                            className="group bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden"
                        >
                            {/* Decorative bg icon */}
                            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Calendar className="w-24 h-24" />
                            </div>

                            <div className="relative z-10 flex flex-col md:flex-row md:items-start gap-5 justify-between">
                                {/* Left: info */}
                                <div className="flex-1">
                                     <div className="flex flex-wrap items-center gap-3 mb-2">
                                         {getStatusBadge(booking.status)}
                                         {(booking.resourceType || resourceMap[booking.resourceId]?.type) && (
                                             <span className="bg-slate-100 text-slate-500 text-[9px] font-black px-2 py-0.5 rounded border border-slate-200 uppercase tracking-widest">
                                                 {booking.resourceType || resourceMap[booking.resourceId]?.type}
                                             </span>
                                         )}
                                         <h3 className="text-3xl font-black text-slate-900 tracking-tighter italic leading-tight uppercase">
                                             <span className="text-blue-600 block text-[9px] tracking-[0.3em] not-italic mb-1 font-black">Facility</span>
                                             {booking.resourceName || resourceMap[booking.resourceId]?.name || 'Unknown Asset'}
                                         </h3>
                                     </div>

                                     {(booking.resourceLocation || resourceMap[booking.resourceId]?.location) && (
                                         <div className="flex items-center gap-2 text-blue-600 font-bold text-sm mb-4 bg-blue-50/30 w-fit px-4 py-1.5 rounded-xl border border-blue-100/50">
                                             <MapPin className="w-4 h-4" />
                                             {booking.resourceLocation || resourceMap[booking.resourceId]?.location}
                                         </div>
                                     )}

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm font-medium text-slate-600 mb-4">
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-blue-500 flex-shrink-0" />
                                            <span>
                                                {new Date(booking.startTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                            <span>Ends: {new Date(booking.endTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                                        </div>
                                    </div>

                                    {booking.purpose && (
                                        <div className="bg-slate-50 p-5 rounded-3xl text-sm border border-slate-100 flex flex-col gap-1.5 mb-4 relative overflow-hidden group/purpose">
                                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover/purpose:opacity-10 transition-opacity text-slate-900">
                                                <Info className="w-10 h-10" />
                                            </div>
                                            <span className="font-black text-[10px] uppercase tracking-[0.2em] text-blue-600">REASON FOR BOOKING</span>
                                            <span className="font-bold text-slate-800 text-base">{booking.purpose}</span>
                                        </div>
                                    )}

                                    <div className="mt-4 flex flex-wrap gap-4 items-center border-t border-slate-50 pt-4">
                                        <div className="flex items-center gap-2">
                                            <Users className="w-3.5 h-3.5 text-slate-400" />
                                            <div>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5">Reservation</p>
                                                <p className="text-xs font-black text-slate-900">{booking.expectedAttendees} Members</p>
                                            </div>
                                        </div>
                                        <div className="w-px h-6 bg-slate-100"></div>
                                        <div>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5">Capacity</p>
                                            <p className="text-xs font-bold text-slate-600">{booking.resourceCapacity || 'Standard'}</p>
                                        </div>
                                        {(booking.minAttendeesConstraint > 0) && (
                                            <>
                                                <div className="w-px h-6 bg-slate-100"></div>
                                                <div>
                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5">Constraint</p>
                                                    <p className="text-xs font-bold text-slate-600">Min {booking.minAttendeesConstraint}</p>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    {/* Show rejection reason clearly */}
                                    {booking.status === 'REJECTED' && booking.rejectionReason && (
                                        <div className="mt-3 bg-red-50 border border-red-100 rounded-2xl p-3 flex items-start gap-2 text-sm text-red-700">
                                            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                            <span><strong>Reason: </strong>{booking.rejectionReason}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Right: actions */}
                                <div className="flex-shrink-0 flex md:flex-col gap-2">
                                    {booking.status === 'PENDING' && (
                                        <button
                                            onClick={() => handleEdit(booking)}
                                            className="flex items-center gap-2 px-5 py-2.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl font-bold transition-all text-sm"
                                        >
                                            <Pencil className="w-4 h-4" /> Update
                                        </button>
                                    )}
                                    {(booking.status === 'PENDING' || booking.status === 'APPROVED') && (
                                        <button
                                            onClick={() => handleCancel(booking.id)}
                                            className="flex items-center gap-2 px-5 py-2.5 bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white rounded-xl font-bold transition-all text-sm"
                                        >
                                            <Trash2 className="w-4 h-4" /> Cancel
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {editingBooking && (
                <BookingModal
                    resource={resourceMap[editingBooking.resourceId] || { id: editingBooking.resourceId, name: editingBooking.resourceName }}
                    existingBooking={editingBooking}
                    onClose={() => setEditingBooking(null)}
                    onSuccess={() => {
                        setEditingBooking(null);
                        fetchBookings();
                    }}
                />
            )}
        </div>
    );
};

export default UserBookings;
