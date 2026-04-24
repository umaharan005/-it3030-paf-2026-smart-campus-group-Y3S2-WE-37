import React, { useState, useEffect, useCallback } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { createBooking, updateBooking, getBookingSlots } from '../../services/bookingApi';
import { toast } from 'react-hot-toast';
import { X, Clock, FileText, Users, Calendar as CalIcon, AlertTriangle, Info, CheckCircle2, Lock } from 'lucide-react';
import { format } from 'date-fns';

const BookingModal = ({ resource, onClose, onSuccess, existingBooking }) => {
    const isEdit = !!existingBooking;
    const [step, setStep] = useState(isEdit ? 2 : 1); // If edit, go straight to details or keep at 1 to change time? Actually 2 is better if they just want to change purpose/attendees, but they might want to change time too. Let's start at 1 if they want to change time.
    // Actually, if they are editing, they might want to see the current time.
    const initialDate = isEdit ? format(new Date(existingBooking.startTime), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd');
    const [selectedDate, setSelectedDate] = useState(initialDate);
    const [busyEvents, setBusyEvents] = useState([]);
    const [calendarLoading, setCalendarLoading] = useState(false);

    const [formData, setFormData] = useState({
        startTime: isEdit ? existingBooking.startTime : '',
        endTime: isEdit ? existingBooking.endTime : '',
        purpose: isEdit ? existingBooking.purpose : '',
        expectedAttendees: isEdit ? existingBooking.expectedAttendees : (resource.minAttendees || 1),
    });
    const [submitting, setSubmitting] = useState(false);

    // Constraints
    const maxHours = resource.maxBookingHours || 0;
    const minAtt   = resource.minAttendees || 0;
    const maxAtt   = resource.maxAttendees || resource.capacity || 100;
    const adminSlots = resource.timeSlots || []; 

    // Fetch busy slots for the selected resource + date
    const loadSlots = useCallback(async (date) => {
        setCalendarLoading(true);
        try {
            const slots = await getBookingSlots(resource.id, date);
            const events = slots.map(b => ({
                id: b.id,
                start: b.startTime,
                end: b.endTime,
                status: b.status,
            }));
            setBusyEvents(events);
        } catch {
            toast.error('Could not sync availability.');
        } finally {
            setCalendarLoading(false);
        }
    }, [resource.id]);

    useEffect(() => {
        loadSlots(selectedDate);
    }, [selectedDate, loadSlots]);

    // Check if a specific time window overlaps with any existing booking
    const isSlotBooked = (slotRange) => {
        if (!slotRange) return false;
        const [startStr, endStr] = slotRange.split('-').map(s => s.trim());
        const targetStart = new Date(`${selectedDate}T${startStr}`);
        const targetEnd   = new Date(`${selectedDate}T${endStr}`);

        return busyEvents.some(event => {
            const eventS = new Date(event.start);
            const eventE = new Date(event.end);
            // Overlap logic: (StartA < EndB) and (EndA > StartB)
            return (targetStart < eventE && targetEnd > eventS);
        });
    };

    const handleFixedSlotSelect = (slotRange) => {
        if (isSlotBooked(slotRange)) {
            toast.error('This time slot has already been reserved.');
            return;
        }

        const [startStr, endStr] = slotRange.split('-').map(s => s.trim());
        setFormData(prev => ({
            ...prev,
            startTime: `${selectedDate}T${startStr}`,
            endTime:   `${selectedDate}T${endStr}`,
        }));
        setStep(2);
    };

    const handleCalendarSelect = (info) => {
        if (maxHours > 0) {
            const diffH = (info.end - info.start) / 3600000;
            if (diffH > maxHours) {
                toast.error(`Maximum allowed booking duration is ${maxHours} hour(s).`);
                return;
            }
        }
        setFormData(prev => ({
            ...prev,
            startTime: format(info.start, "yyyy-MM-dd'T'HH:mm"),
            endTime:   format(info.end,   "yyyy-MM-dd'T'HH:mm"),
        }));
        setStep(2);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const att = Number(formData.expectedAttendees);
        if (minAtt > 0 && att < minAtt) return toast.error(`Min ${minAtt} attendees required.`);
        if (maxAtt > 0 && att > maxAtt) return toast.error(`Max ${maxAtt} attendees allowed.`);

        setSubmitting(true);
        try {
            const payload = {
                resourceId: resource.id,
                startTime: formData.startTime,
                endTime: formData.endTime,
                purpose: formData.purpose,
                expectedAttendees: att,
            };

            if (isEdit) {
                await updateBooking(existingBooking.id, payload);
                toast.success('Reservation updated successfully');
            } else {
                await createBooking(payload);
                toast.success('Booking request submitted! Check "My Bookings" for status.');
            }
            onSuccess();
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.error || (isEdit ? 'Update failed.' : 'Booking failed.'));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="bg-white rounded-[3rem] w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] border border-white/20">

                {/* Top Banner */}
                <div className="bg-slate-900 px-10 py-10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/20 rounded-full -mr-40 -mt-40 blur-[100px]"></div>
                    <div className="relative z-10 flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <span className="px-3 py-1 bg-blue-600 text-[10px] font-black uppercase tracking-widest text-white rounded-full">
                                    {isEdit ? 'Modify Reservation' : 'Secure Reservation'}
                                </span>
                                <span className="px-3 py-1 bg-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-400 rounded-full">{resource.type}</span>
                            </div>
                            <h2 className="text-4xl font-black text-white italic tracking-tighter mb-2">{resource.name}</h2>
                            <p className="text-slate-400 text-sm font-bold flex items-center gap-2 uppercase tracking-widest">
                                <Clock className="w-4 h-4 text-blue-500" /> {resource.building} · {resource.floor} · {resource.roomCode || "MAIN"}
                            </p>
                        </div>
                        <button onClick={onClose} className="p-3 bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 rounded-2xl transition-all">
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto bg-slate-50">
                    {/* Constraints Bar */}
                    <div className="px-10 py-6 border-b border-slate-200 bg-white shadow-sm flex flex-wrap gap-8 items-center">
                        <div className="flex items-center gap-2.5">
                            <div className="p-2 bg-blue-50 rounded-lg"><Users className="w-4 h-4 text-blue-600" /></div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Capacity</p>
                                <p className="text-sm font-black text-slate-900">{resource.capacity} Seats</p>
                            </div>
                        </div>
                        {minAtt > 0 && (
                            <div className="flex items-center gap-2.5">
                                <div className="p-2 bg-amber-50 rounded-lg"><AlertTriangle className="w-4 h-4 text-amber-600" /></div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Team Size</p>
                                    <p className="text-sm font-black text-slate-900">{minAtt}-{maxAtt} Members</p>
                                </div>
                            </div>
                        )}
                        {maxHours > 0 && (
                            <div className="flex items-center gap-2.5">
                                <div className="p-2 bg-rose-50 rounded-lg"><Clock className="w-4 h-4 text-rose-600" /></div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Max Duration</p>
                                    <p className="text-sm font-black text-slate-900">{maxHours} Hours</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="p-10">
                        {step === 1 && (
                            <div className="space-y-10">
                                {/* Date Picker */}
                                <div className="max-w-md">
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">1. Choose Booking Date</label>
                                    <div className="relative">
                                        <CalIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-blue-600 w-5 h-5" />
                                        <input
                                            type="date"
                                            value={selectedDate}
                                            min={format(new Date(), 'yyyy-MM-dd')}
                                            onChange={e => setSelectedDate(e.target.value)}
                                            className="form-field-light w-full pl-14 pr-6 py-5 rounded-3xl border border-slate-200 bg-white font-black italic text-lg shadow-sm focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                {/* Slot Selection Wrapper */}
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-5 ml-1">
                                        {adminSlots.length > 0 ? "2. Pick an Available Time Window" : "2. Click & Drag to Select Time"}
                                    </label>

                                    {calendarLoading ? (
                                        <div className="flex items-center gap-4 py-10 px-6 bg-white rounded-3xl border border-slate-100">
                                            <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                            <p className="font-black italic text-slate-400 uppercase tracking-widest text-xs">Authenticating Availability...</p>
                                        </div>
                                    ) : adminSlots.length > 0 ? (
                                        /* EXCLUSIVE ADMIN SLOTS VIEW */
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {adminSlots.map((slot, idx) => {
                                                const booked = isSlotBooked(slot);
                                                return (
                                                    <button
                                                        key={idx}
                                                        disabled={booked}
                                                        onClick={() => handleFixedSlotSelect(slot)}
                                                        className={`group relative p-8 rounded-[2rem] border-2 text-left transition-all duration-300 overflow-hidden ${
                                                            booked 
                                                            ? 'bg-slate-100 border-slate-100 cursor-not-allowed opacity-60' 
                                                            : 'bg-white border-transparent shadow-xl shadow-slate-200/50 hover:border-blue-600 hover:scale-[1.02] hover:-translate-y-1'
                                                        }`}
                                                    >
                                                        {booked ? (
                                                            <div className="space-y-2">
                                                                <div className="flex items-center gap-2 text-slate-400">
                                                                    <Lock className="w-4 h-4" />
                                                                    <span className="text-[10px] font-black uppercase tracking-widest">Reserved</span>
                                                                </div>
                                                                <p className="text-2xl font-black italic text-slate-300 line-through tracking-tighter">{slot}</p>
                                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Not Available on this date</p>
                                                            </div>
                                                        ) : (
                                                            <div className="space-y-2">
                                                                <div className="flex items-center gap-2 text-blue-600">
                                                                    <CheckCircle2 className="w-4 h-4" />
                                                                    <span className="text-[10px] font-black uppercase tracking-widest">Available</span>
                                                                </div>
                                                                <p className="text-2xl font-black italic text-slate-900 tracking-tighter">{slot}</p>
                                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest group-hover:text-blue-600 transition-colors">Confirm selection</p>
                                                            </div>
                                                        )}
                                                        {!booked && <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/5 rounded-full -mr-12 -mt-12 transition-all group-hover:scale-150"></div>}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        /* FALLBACK FLEXIBLE CALENDAR (If no admin slots defined) */
                                        <div className="bg-white rounded-[2.5rem] border border-slate-200 p-6 shadow-inner">
                                            <FullCalendar
                                                plugins={[timeGridPlugin, interactionPlugin]}
                                                initialView="timeGridDay"
                                                initialDate={selectedDate}
                                                key={selectedDate}
                                                headerToolbar={false}
                                                allDaySlot={false}
                                                selectable={true}
                                                height={500}
                                                slotMinTime={resource.availableFrom || '08:00'}
                                                slotMaxTime={resource.availableTo || '21:00'}
                                                events={busyEvents.map(e => ({
                                                    start: e.start,
                                                    end: e.end,
                                                    display: 'background',
                                                    color: '#ef4444'
                                                }))}
                                                select={handleCalendarSelect}
                                                selectConstraint={{ start: new Date().toISOString() }}
                                                eventOverlap={false}
                                                selectOverlap={false}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <form onSubmit={handleSubmit} className="max-w-xl mx-auto space-y-10 animate-in slide-in-from-bottom-10 duration-700">
                                <div className="text-center p-8 bg-blue-600 rounded-[2.5rem] text-white shadow-2xl shadow-blue-500/20">
                                    <h3 className="text-xs font-black uppercase tracking-[0.3em] mb-4 opacity-70">Confirm Schedule</h3>
                                    <div className="flex flex-col items-center gap-2">
                                        <p className="text-3xl font-black italic italic tracking-tighter">
                                            {format(new Date(formData.startTime), 'EEEE, MMM do')}
                                        </p>
                                        <div className="flex items-center gap-3 bg-white/20 px-4 py-2 rounded-2xl font-black italic">
                                            <Clock className="w-5 h-5" />
                                            {format(new Date(formData.startTime), 'HH:mm')} — {format(new Date(formData.endTime), 'HH:mm')}
                                        </div>
                                    </div>
                                    <button type="button" onClick={() => setStep(1)} className="mt-6 text-[10px] font-black uppercase tracking-widest text-blue-200 hover:text-white transition-colors">Change Slot</button>
                                </div>

                                <div className="space-y-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-2">
                                            <Users className="w-4 h-4" /> Guest/Attendee Count
                                        </label>
                                        <input
                                            type="number"
                                            min={minAtt || 1}
                                            max={maxAtt || resource.capacity}
                                            required
                                            className="form-field-light w-full px-6 py-5 rounded-[1.5rem] border border-slate-200 bg-white font-black italic focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 outline-none transition-all"
                                            value={formData.expectedAttendees}
                                            onChange={e => setFormData(p => ({ ...p, expectedAttendees: e.target.value }))}
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-2">
                                            <FileText className="w-4 h-4" /> Purpose of Session
                                        </label>
                                        <textarea
                                            required
                                            rows={4}
                                            placeholder="e.g. Workshop on Cloud Architecture..."
                                            className="form-field-light w-full px-6 py-5 rounded-[1.5rem] border border-slate-200 bg-white font-black italic focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 outline-none transition-all resize-none"
                                            value={formData.purpose}
                                            onChange={e => setFormData(p => ({ ...p, purpose: e.target.value }))}
                                        ></textarea>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full py-6 bg-slate-900 text-white rounded-[1.5rem] font-black text-sm uppercase tracking-widest hover:bg-blue-600 hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-slate-900/10 disabled:opacity-50 flex items-center justify-center gap-4"
                                >
                                    {submitting ? (
                                        <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        isEdit ? "Update Reservation" : "Confirm & Submit Request"
                                    )}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingModal;
