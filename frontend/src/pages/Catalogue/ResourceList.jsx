import React, { useState, useEffect } from 'react';
import { createResource, getResources, updateResource, deleteResource, CAMPUS_BUILDINGS, CAMPUS_FLOORS } from '../../services/catalogueApi';
import ResourceCard from '../../components/Catalogue/ResourceCard';
import { Search, SlidersHorizontal, Loader, Plus, Pencil, Building2, Layers, Clock, Users, Hash, X, Wand2, Image as ImageIcon, MapPin, Settings2, Upload } from 'lucide-react';
import { toast } from 'react-hot-toast';
import PageHeader from '../../components/Common/PageHeader';
import { readFileAsDataUrl } from '../../utils/fileDataUrl';

const RESOURCE_TYPES = [
    'LECTURE_HALL',
    'CLASSROOM',
    'LAB',
    'MEETING_ROOM',
    'AUDITORIUM',
    'EQUIPMENT',
    'SPORTS_FIELD',
];

const RESOURCE_STATUSES = ['ACTIVE', 'OUT_OF_SERVICE', 'MAINTENANCE'];

const BLANK_FORM = {
    name: '',
    description: '',
    building: '',
    floor: '',
    roomCode: '',
    location: '',
    capacity: 1,
    type: 'LECTURE_HALL',
    status: 'ACTIVE',
    availableFrom: '08:00',
    availableTo: '18:00',
    imageUrl: '',
    maxBookingHours: 0,
    minAttendees: 0,
    maxAttendees: 0,
    timeSlots: [],
};

const ResourceList = () => {
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [filters, setFilters] = useState({
        search: '',
        type: '',
        minCapacity: '',
        location: '',
        status: '',
    });

    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState(BLANK_FORM);
    const [customSlot, setCustomSlot] = useState('');

    const fetchResources = async (targetPage = page) => {
        setLoading(true);
        try {
            const params = {
                page: targetPage,
                size: 9,
                search: filters.search || undefined,
                type: filters.type || undefined,
                minCapacity: filters.minCapacity || undefined,
                location: filters.location || undefined,
                status: filters.status || undefined,
            };
            const data = await getResources(params);
            setResources(data.content);
            setTotalPages(data.totalPages);
        } catch (err) {
            toast.error('Failed to load resources');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchResources(page);
    }, [page, filters]);

    const handleFilterChange = (field, value) => {
        setFilters((prev) => ({ ...prev, [field]: value }));
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(0);
        fetchResources(0);
    };

    const clearFilters = () => {
        setFilters({ search: '', type: '', minCapacity: '', location: '', status: '' });
        setPage(0);
    };

    const handleFormChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleResourceImageUpload = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            const imageUrl = await readFileAsDataUrl(file);
            setFormData((prev) => ({ ...prev, imageUrl }));
        } catch (err) {
            toast.error('Failed to read the selected image.');
        } finally {
            event.target.value = '';
        }
    };

    const openCreateForm = () => {
        setEditingId(null);
        setFormData(BLANK_FORM);
        setShowForm(true);
    };

    const openEditForm = (resource) => {
        setEditingId(resource.id);
        setFormData({
            ...resource,
            timeSlots: resource.timeSlots || [],
        });
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const generateTwoHourSlots = () => {
        const slots = ["08:30-10:30", "10:30-12:30", "13:30-15:30", "15:30-17:30"];
        const updated = [...new Set([...formData.timeSlots, ...slots])];
        handleFormChange('timeSlots', updated);
        toast.success("Generated 2h slots within 8:30-17:30");
    };

    const addCustomSlot = () => {
        if (!customSlot.match(/^\d{2}:\d{2}-\d{2}:\d{2}$/)) {
            toast.error("Format: HH:mm-HH:mm");
            return;
        }
        handleFormChange('timeSlots', [...formData.timeSlots, customSlot]);
        setCustomSlot('');
    };

    const removeSlot = (index) => {
        const updated = formData.timeSlots.filter((_, i) => i !== index);
        handleFormChange('timeSlots', updated);
    };

    const handleSaveResource = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.type) {
            toast.error('Name and Type are required');
            return;
        }

        setSubmitting(true);
        try {
            let location = formData.location;
            if (formData.building && formData.floor && formData.roomCode) {
                location = `${formData.building} · ${formData.floor} · ${formData.roomCode}`;
            }

            const payload = { 
                ...formData, 
                capacity: Number(formData.capacity) || 1,
                maxBookingHours: Number(formData.maxBookingHours) || 0,
                minAttendees: Number(formData.minAttendees) || 0,
                maxAttendees: Number(formData.maxAttendees) || 0,
                location,
                timeSlots: formData.timeSlots && formData.timeSlots.length > 0 ? formData.timeSlots : []
            };

            if (editingId) {
                await updateResource(editingId, payload);
                toast.success('Resource updated');
            } else {
                await createResource(payload);
                toast.success('Resource provisioned');
            }
            setShowForm(false);
            setEditingId(null);
            setFormData(BLANK_FORM);
            setPage(0);
            fetchResources(0);
        } catch (err) {
            toast.error('Operation failed');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this resource?')) return;
        try {
            await deleteResource(id);
            toast.success('Deleted');
            fetchResources(page);
        } catch {
            toast.error('Delete failed');
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            const resource = resources.find(r => r.id === id);
            await updateResource(id, { ...resource, status: newStatus });
            toast.success(`Resource is now ${newStatus}`);
            fetchResources(page);
        } catch {
            toast.error('Status update failed');
        }
    };

    const availableFloors = formData.building ? (CAMPUS_FLOORS[formData.building] || []) : [];

    return (
        <div className="min-h-screen bg-slate-50 py-12 font-sans">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <PageHeader 
                    title="Campus Infrastructure Management"
                    description="Configure university lecture halls, computer labs, and library resources with smart scheduling constraints."
                    actions={
                        <button onClick={openCreateForm} className="bg-blue-600 text-white px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-900 transition-all shadow-xl shadow-blue-500/20 flex items-center gap-3">
                            <Plus className="w-5 h-5" /> Provision New Asset
                        </button>
                    }
                />

                {showForm && (
                    <form onSubmit={handleSaveResource} className="mb-12 bg-white border border-slate-200 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-50 rounded-full -mr-48 -mt-48 blur-3xl opacity-50"></div>
                        
                        <div className="relative z-10">
                            <div className="flex items-center gap-4 mb-10">
                                <div className="p-4 bg-slate-900 rounded-3xl shadow-xl">
                                    <Settings2 className="w-6 h-6 text-blue-500" />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-black text-slate-900 italic tracking-tighter">
                                        {editingId ? 'Configure Facility' : 'New Resource Provisioning'}
                                    </h2>
                                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Administrative Management Console</p>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                                {/* Section 1: Identity */}
                                <div className="lg:col-span-2 space-y-8">
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-blue-600 border-b border-blue-100 pb-2">1. Identity & Classification</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Asset Name</label>
                                            <input className="form-field-light w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50 font-bold focus:bg-white focus:border-blue-600 outline-none transition-all" value={formData.name} onChange={(e) => handleFormChange('name', e.target.value)} required placeholder="e.g. F1303 Lab" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Resource Category</label>
                                            <select className="form-field-light w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50 font-bold focus:bg-white focus:border-blue-600 outline-none transition-all" value={formData.type} onChange={(e) => handleFormChange('type', e.target.value)}>
                                                {RESOURCE_TYPES.map((t) => <option key={t} value={t}>{t.replaceAll('_', ' ')}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Facility Description</label>
                                        <textarea rows="3" className="form-field-light w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50 font-bold focus:bg-white focus:border-blue-600 outline-none transition-all resize-none" value={formData.description} onChange={(e) => handleFormChange('description', e.target.value)} placeholder="Hardware specs, seating arrangement, etc." />
                                    </div>
                                </div>

                                {/* Section 2: Visuals & Status */}
                                <div className="space-y-8">
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-blue-600 border-b border-blue-100 pb-2">2. Visibility & State</h3>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Current Status</label>
                                        <select className="form-field-light w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50 font-bold focus:bg-white focus:border-blue-600 outline-none transition-all" value={formData.status} onChange={(e) => handleFormChange('status', e.target.value)}>
                                            {RESOURCE_STATUSES.map((s) => <option key={s} value={s}>{s.replaceAll('_', ' ')}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-1.5"><ImageIcon className="w-3 h-3" /> Cover Image</label>
                                        <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                                            <div className="flex items-center gap-4">
                                                <div className="flex h-20 w-24 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-sm">
                                                    {formData.imageUrl ? (
                                                        <img src={formData.imageUrl} alt="Resource preview" className="h-full w-full object-cover" />
                                                    ) : (
                                                        <ImageIcon className="h-6 w-6 text-slate-300" />
                                                    )}
                                                </div>
                                                <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-white transition hover:bg-slate-900">
                                                    <Upload className="h-4 w-4" />
                                                    Upload Image
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handleResourceImageUpload}
                                                        className="hidden"
                                                    />
                                                </label>
                                            </div>
                                            {formData.imageUrl && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleFormChange('imageUrl', '')}
                                                    className="mt-3 text-xs font-bold text-rose-500 transition hover:text-rose-700"
                                                >
                                                    Remove image
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Section 3: Physical Location */}
                                <div className="lg:col-span-3 bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-slate-900/40 translate-y-2">
                                    <div className="flex items-center gap-3 mb-8">
                                        <MapPin className="w-5 h-5 text-blue-500" />
                                        <h3 className="text-xs font-black uppercase tracking-widest">3. Geolocational Placement</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                                        <div className="md:col-span-1 space-y-2">
                                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Building</label>
                                            <select className="form-field-dark w-full px-5 py-4 rounded-2xl bg-slate-800 border-none font-bold outline-none ring-1 ring-slate-700 focus:ring-blue-500 transition-all" value={formData.building} onChange={(e) => setFormData(p => ({...p, building: e.target.value, floor: ''}))}>
                                                <option value="">Select Building</option>
                                                {CAMPUS_BUILDINGS.map(b => <option key={b} value={b}>{b}</option>)}
                                            </select>
                                        </div>
                                        <div className="md:col-span-1 space-y-2">
                                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Floor / Level</label>
                                            <select className="form-field-dark w-full px-5 py-4 rounded-2xl bg-slate-800 border-none font-bold outline-none ring-1 ring-slate-700 focus:ring-blue-500 transition-all disabled:opacity-30" value={formData.floor} onChange={(e) => handleFormChange('floor', e.target.value)} disabled={!formData.building}>
                                                <option value="">Select Floor</option>
                                                {availableFloors.map(f => <option key={f} value={f}>{f}</option>)}
                                            </select>
                                        </div>
                                        <div className="md:col-span-1 space-y-2">
                                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Room Code</label>
                                            <input className="form-field-dark w-full px-5 py-4 rounded-2xl bg-slate-800 border-none font-bold outline-none ring-1 ring-slate-700 focus:ring-blue-500 transition-all uppercase placeholder:text-slate-600" value={formData.roomCode} onChange={(e) => handleFormChange('roomCode', e.target.value)} placeholder="e.g. F1303" />
                                        </div>
                                        <div className="md:col-span-1 space-y-1 group">
                                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Reference Address</label>
                                            <div className="px-5 py-4 rounded-2xl bg-slate-800/50 border border-slate-700 text-slate-400 font-bold text-xs line-clamp-1 italic group-hover:text-slate-200 transition-colors">
                                                {formData.building || formData.location ? (formData.building ? `${formData.building} · ${formData.floor} · ${formData.roomCode}` : formData.location) : "No location defined"}
                                            </div>
                                            <p className="text-[8px] text-slate-600 font-black uppercase tracking-widest mt-1 ml-1">Auto-generated for catalog</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Section 4: Operating Hours & Capacity */}
                                <div className="lg:col-span-2 space-y-8 mt-4">
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-blue-600 border-b border-blue-100 pb-2">4. Resource Utilization Limits</h3>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Capacity</label>
                                            <input type="number" className="form-field-light w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50 font-bold" value={formData.capacity} onChange={(e) => handleFormChange('capacity', e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Max Booking (H)</label>
                                            <input type="number" className="form-field-light w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50 font-bold" value={formData.maxBookingHours} onChange={(e) => handleFormChange('maxBookingHours', e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Min Team</label>
                                            <input type="number" className="form-field-light w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50 font-bold" value={formData.minAttendees} onChange={(e) => handleFormChange('minAttendees', e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Max Team</label>
                                            <input type="number" className="form-field-light w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50 font-bold" value={formData.maxAttendees} onChange={(e) => handleFormChange('maxAttendees', e.target.value)} />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-6 p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5"><Clock className="w-3 h-3 text-blue-500" /> Operational From</label>
                                            <input type="time" className="form-field-light w-full px-5 py-4 rounded-2xl border border-slate-200 bg-white font-bold" value={formData.availableFrom} onChange={(e) => handleFormChange('availableFrom', e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5"><Clock className="w-3 h-3 text-red-500" /> Operational To</label>
                                            <input type="time" className="form-field-light w-full px-5 py-4 rounded-2xl border border-slate-200 bg-white font-bold" value={formData.availableTo} onChange={(e) => handleFormChange('availableTo', e.target.value)} />
                                        </div>
                                    </div>
                                </div>

                                {/* Section 5: Admin Defined Slots */}
                                <div className="space-y-8 mt-4">
                                    <div className="flex justify-between items-center border-b border-blue-100 pb-2">
                                        <h3 className="text-[10px] font-black uppercase tracking-widest text-blue-600">5. Managed Time Slots</h3>
                                        <button type="button" onClick={generateTwoHourSlots} className="flex items-center gap-1 text-[8px] font-black uppercase tracking-[0.2em] bg-blue-600 text-white px-3 py-1.5 rounded-full hover:bg-slate-900 transition-all">
                                            <Wand2 className="w-3 h-3" /> Auto-Generate
                                        </button>
                                    </div>
                                    
                                    <div className="p-6 bg-white border border-slate-200 rounded-[2rem] shadow-inner space-y-6">
                                        <div className="flex flex-wrap gap-2 min-h-[100px] align-content-start">
                                            {formData.timeSlots.length === 0 && (
                                                <div className="w-full flex flex-col items-center justify-center py-6 text-slate-300">
                                                    <Clock className="w-8 h-8 mb-2 opacity-20" />
                                                    <p className="text-[9px] font-black uppercase tracking-widest">No Fixed Slots Defined</p>
                                                </div>
                                            )}
                                            {formData.timeSlots.map((slot, idx) => (
                                                <div key={idx} className="bg-slate-900 text-white pl-4 pr-2 py-2 rounded-xl flex items-center gap-3 group animate-in zoom-in-50 duration-300">
                                                    <span className="text-xs font-black italic tracking-tighter">{slot}</span>
                                                    <button type="button" onClick={() => removeSlot(idx)} className="p-1 hover:bg-white/20 rounded-lg transition-colors text-slate-400 hover:text-red-400">
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="flex gap-2">
                                            <input className="form-field-light flex-1 px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold outline-none placeholder:text-slate-300" placeholder="HH:mm-HH:mm" value={customSlot} onChange={e => setCustomSlot(e.target.value)} />
                                            <button type="button" onClick={addCustomSlot} className="bg-slate-900 text-white px-4 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-colors">Add</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 flex justify-end gap-4 border-t border-slate-100 pt-10 relative z-10">
                            <button type="button" onClick={() => { setShowForm(false); setEditingId(null); setFormData(BLANK_FORM); }} className="px-8 py-4 rounded-2xl text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-slate-900 transition-colors">
                                Discard Definition
                            </button>
                            <button disabled={submitting} className="bg-blue-600 text-white px-12 py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-slate-900 transition-all shadow-2xl shadow-blue-600/20 disabled:opacity-50">
                                {submitting ? 'Authenticating...' : (editingId ? 'Update Asset' : 'Commit New Facility')}
                            </button>
                        </div>
                    </form>
                )}

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {loading ? (
                        <div className="col-span-full py-32 text-center">
                            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                            <p className="font-black italic text-slate-400 uppercase tracking-widest text-xs">Synchronizing Multi-Campus Infrastructure</p>
                        </div>
                    ) : resources.map(resource => (
                        <ResourceCard
                            key={resource.id}
                            resource={resource}
                            onEdit={openEditForm}
                            onDelete={handleDelete}
                            onStatusChange={handleStatusChange}
                        />
                    ))}
                </div>

                {totalPages > 1 && (
                    <div className="mt-16 flex justify-center gap-4">
                        {[...Array(totalPages)].map((_, i) => (
                            <button key={i} onClick={() => setPage(i)} className={`w-14 h-14 rounded-2xl font-black italic tracking-tighter transition-all ${page === i ? 'bg-slate-900 text-white shadow-2xl' : 'bg-white border border-slate-200 text-slate-400 hover:border-blue-600 hover:text-blue-600'}`}>
                                {i + 1}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResourceList;
