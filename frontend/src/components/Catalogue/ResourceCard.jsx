import React, { useState } from 'react';
import { MapPin, Users, Clock3, Pencil, Trash2, PowerOff, Power, Building2, Layers, AlertTriangle } from 'lucide-react';
import BookingModal from '../Booking/BookingModal';
import { useAuth } from '../../context/AuthContext';

const ResourceCard = ({ resource, onEdit, onDelete, onStatusChange }) => {
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const { hasRole } = useAuth();
    const isAdmin = hasRole('ADMIN') || hasRole('MANAGER');

    const getStatusColor = (status) => {
        switch (status) {
            case 'ACTIVE':         return 'bg-green-100 text-green-800';
            case 'OUT_OF_SERVICE': return 'bg-red-100 text-red-800';
            case 'MAINTENANCE':    return 'bg-yellow-100 text-yellow-800';
            default:               return 'bg-gray-100 text-gray-800';
        }
    };

    const getTypeBadge = (type) => {
        const map = {
            LECTURE_HALL: { label: 'Hall',      color: 'bg-violet-50 text-violet-700' },
            CLASSROOM:    { label: 'Classroom',  color: 'bg-sky-50 text-sky-700' },
            LAB:          { label: 'PC Lab',     color: 'bg-cyan-50 text-cyan-700' },
            MEETING_ROOM: { label: 'Meeting Rm', color: 'bg-amber-50 text-amber-700' },
        };
        const t = map[type] || { label: type, color: 'bg-slate-50 text-slate-700' };
        return <span className={`px-2.5 py-0.5 rounded-lg text-xs font-bold uppercase tracking-wide ${t.color}`}>{t.label}</span>;
    };

    const handleStatusToggle = () => {
        if (!onStatusChange) return;
        const next = resource.status === 'ACTIVE' ? 'OUT_OF_SERVICE' : 'ACTIVE';
        onStatusChange(resource.id, next);
    };

    const hasConstraints = resource.maxBookingHours > 0 || resource.minAttendees > 0;

    return (
        <>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex flex-col">
                {/* Image */}
                <div className="h-44 overflow-hidden relative flex-shrink-0">
                    <img
                        src={resource.imageUrl || 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=600'}
                        alt={resource.name}
                        className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                    />
                    {/* Status badge */}
                    <div className="absolute top-3 right-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${getStatusColor(resource.status)} shadow-sm`}>
                            {resource.status}
                        </span>
                    </div>
                    {/* Admin action buttons */}
                    {isAdmin && (
                        <div className="absolute top-3 left-3 flex gap-1.5">
                            <button onClick={() => onEdit && onEdit(resource)} title="Edit"
                                className="p-1.5 rounded-lg bg-white/90 text-slate-700 hover:bg-blue-600 hover:text-white transition-colors shadow">
                                <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={handleStatusToggle}
                                title={resource.status === 'ACTIVE' ? 'Set OUT_OF_SERVICE' : 'Set ACTIVE'}
                                className="p-1.5 rounded-lg bg-white/90 text-slate-700 hover:bg-amber-500 hover:text-white transition-colors shadow">
                                {resource.status === 'ACTIVE' ? <PowerOff className="w-3.5 h-3.5" /> : <Power className="w-3.5 h-3.5" />}
                            </button>
                            <button onClick={() => onDelete && onDelete(resource.id)} title="Delete"
                                className="p-1.5 rounded-lg bg-white/90 text-red-600 hover:bg-red-600 hover:text-white transition-colors shadow">
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    )}
                </div>

                {/* Body */}
                <div className="p-5 flex flex-col flex-1">
                    <div className="flex justify-between items-start mb-1.5">
                        <h3 className="text-lg font-bold text-slate-800 leading-tight line-clamp-1">{resource.name}</h3>
                        {getTypeBadge(resource.type)}
                    </div>

                    {/* Room code */}
                    {resource.roomCode && (
                        <p className="text-xs font-black text-blue-500 tracking-widest mb-2">ID: {resource.roomCode}</p>
                    )}

                    <p className="text-slate-500 text-sm mb-3 line-clamp-2 flex-1">
                        {resource.description}
                    </p>

                    {/* Location info */}
                    <div className="space-y-1.5 mb-4">
                        {resource.building && (
                            <div className="flex items-center text-sm text-slate-600 gap-1.5">
                                <Building2 className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                {resource.building}
                            </div>
                        )}
                        {resource.floor && (
                            <div className="flex items-center text-sm text-slate-600 gap-1.5">
                                <Layers className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                {resource.floor}
                            </div>
                        )}
                        {!resource.building && resource.location && (
                            <div className="flex items-center text-sm text-slate-600 gap-1.5">
                                <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                {resource.location}
                            </div>
                        )}
                        <div className="flex items-center text-sm text-slate-600 gap-1.5">
                            <Users className="w-4 h-4 text-slate-400 flex-shrink-0" />
                            Up to {resource.capacity} people
                        </div>
                        {(resource.availableFrom || resource.availableTo) && (
                            <div className="flex items-center text-sm text-slate-600 gap-1.5">
                                <Clock3 className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                {resource.availableFrom || '--:--'} – {resource.availableTo || '--:--'}
                            </div>
                        )}
                    </div>

                    {/* Constraints badge */}
                    {hasConstraints && (
                        <div className="mb-3 flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
                            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                            <span>
                                {resource.maxBookingHours > 0 && `Max ${resource.maxBookingHours}h`}
                                {resource.maxBookingHours > 0 && resource.minAttendees > 0 && ' · '}
                                {resource.minAttendees > 0 && `${resource.minAttendees}–${resource.maxAttendees} people`}
                            </span>
                        </div>
                    )}

                    {!isAdmin && (
                        <button
                            disabled={resource.status !== 'ACTIVE'}
                            onClick={() => setIsBookingModalOpen(true)}
                            className="w-full py-2.5 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-blue-600 transition-colors shadow-sm disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            {resource.status === 'ACTIVE' ? 'Book Now' : 'Unavailable'}
                        </button>
                    )}
                </div>
            </div>

            {isBookingModalOpen && !isAdmin && (
                <BookingModal
                    resource={resource}
                    onClose={() => setIsBookingModalOpen(false)}
                    onSuccess={() => setIsBookingModalOpen(false)}
                />
            )}
        </>
    );
};

export default ResourceCard;
