import React, { useState, useEffect } from 'react';
import { createTicket } from '../../services/ticketingApi';
import { toast } from 'react-hot-toast';
import { X, Paperclip, Upload } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { DEPARTMENTS } from '../../constants/departments';

const TICKET_REASONS = [
    'Hardware Malfunction',
    'Software Issue',
    'Facility Maintenance',
    'Access & Permissions',
    'Other'
];

const TicketForm = ({ resourceId, onClose, onSuccess }) => {
    const { displayName, user } = useAuth();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priority: 'MEDIUM',
        resourceId: resourceId || '',
        studentName: displayName || user?.name || '',
        studentPhone: '',
        department: '',
        reason: 'Hardware Malfunction',
        documentUrls: []
    });
    const [documentInput, setDocumentInput] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (displayName || user) {
            setFormData(prev => ({
                ...prev,
                studentName: displayName || user?.name || prev.studentName,
            }));
        }
    }, [displayName, user]);

    const handleAddDocument = (e) => {
        e.preventDefault();
        if (documentInput.trim()) {
            setFormData(prev => ({
                ...prev,
                documentUrls: [...prev.documentUrls, documentInput.trim()]
            }));
            setDocumentInput('');
        }
    };

    const readFileAsDataUrl = (file) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error(`Failed to read file: ${file.name}`));
        reader.readAsDataURL(file);
    });

    const handleFileUpload = async (e) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;

        setUploading(true);
        try {
            const encodedFiles = await Promise.all(files.map(readFileAsDataUrl));
            setFormData((prev) => ({
                ...prev,
                documentUrls: [...prev.documentUrls, ...encodedFiles]
            }));
            toast.success(`${files.length} attachment${files.length > 1 ? 's' : ''} added`);
        } catch (err) {
            toast.error('Failed to add one or more attachments');
        } finally {
            setUploading(false);
            e.target.value = '';
        }
    };

    const handleRemoveDocument = (index) => {
        setFormData(prev => ({
            ...prev,
            documentUrls: prev.documentUrls.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await createTicket(formData);
            toast.success('Ticket submitted successfully!');
            if (onSuccess) onSuccess();
            if (onClose) onClose();
        } catch (err) {
            toast.error('Failed to submit ticket');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md">
            <div className="bg-white rounded-[2rem] w-full max-w-5xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col animate-in fade-in zoom-in duration-300">
                <header className="p-6 md:p-8 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">New Maintenance Report</h2>
                        <p className="text-slate-500 font-medium mt-1 text-sm md:text-base">Provide details to help our team resolve the issue.</p>
                    </div>
                    <button onClick={onClose} className="w-12 h-12 rounded-full bg-white shadow-sm border border-slate-200 flex items-center justify-center hover:bg-slate-100 focus:ring-4 focus:ring-slate-100 transition-all transform hover:scale-105 active:scale-95">
                        <X className="w-6 h-6 text-slate-500" />
                    </button>
                </header>

                <form onSubmit={handleSubmit} className="flex flex-col md:flex-row bg-white">
                    {/* Left Column (Landscape View) - Primary Info */}
                    <div className="w-full md:w-1/2 p-6 md:p-8 border-b md:border-b-0 md:border-r border-slate-100 space-y-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Issue Title</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Brief summary of the issue..."
                                    className="form-field-light w-full px-5 py-4 rounded-2xl border-2 border-slate-100 bg-slate-50 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 shadow-sm transition-all font-medium"
                                    value={formData.title}
                                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Reporter Name</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Your full name"
                                        className="form-field-light w-full px-5 py-3 rounded-2xl border-2 border-slate-100 bg-slate-50 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 shadow-sm transition-all font-medium"
                                        value={formData.studentName}
                                        onChange={(e) => setFormData({...formData, studentName: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Phone Number</label>
                                    <input
                                        type="tel"
                                        required
                                        placeholder="Contact number"
                                        className="form-field-light w-full px-5 py-3 rounded-2xl border-2 border-slate-100 bg-slate-50 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 shadow-sm transition-all font-medium"
                                        value={formData.studentPhone}
                                        onChange={(e) => setFormData({...formData, studentPhone: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Department</label>
                                <select
                                    required
                                    className="form-field-light w-full px-5 py-4 rounded-2xl border-2 border-slate-100 bg-slate-50 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 shadow-sm transition-all font-medium cursor-pointer"
                                    value={formData.department}
                                    onChange={(e) => setFormData({...formData, department: e.target.value})}
                                >
                                    <option value="">Select department</option>
                                    {DEPARTMENTS.map((department) => (
                                        <option key={department} value={department}>{department}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Category / Reason</label>
                                <select
                                    className="form-field-light w-full px-5 py-4 rounded-2xl border-2 border-slate-100 bg-slate-50 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 shadow-sm transition-all font-medium cursor-pointer"
                                    value={formData.reason}
                                    onChange={(e) => setFormData({...formData, reason: e.target.value})}
                                >
                                    {TICKET_REASONS.map(r => (
                                        <option key={r} value={r}>{r}</option>
                                    ))}
                                </select>
                            </div>

                            {!resourceId && (
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Affected Resource ID <span className="text-slate-300 normal-case font-medium">(Optional)</span></label>
                                    <input
                                        type="text"
                                        placeholder="E.g., LH-101"
                                        className="form-field-light w-full px-5 py-4 rounded-2xl border-2 border-slate-100 bg-slate-50 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 shadow-sm transition-all font-medium"
                                        value={formData.resourceId}
                                        onChange={(e) => setFormData({...formData, resourceId: e.target.value})}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column (Landscape View) - Details & Priority */}
                    <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col space-y-6">
                        <div className="space-y-4 flex-1">
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Severity & Priority</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {['LOW', 'MEDIUM', 'HIGH', 'URGENT'].map((priority) => (
                                        <button
                                            key={priority}
                                            type="button"
                                            onClick={() => setFormData({...formData, priority})}
                                            className={`py-3 rounded-xl font-bold text-xs tracking-widest border-2 transition-all shadow-sm flex items-center justify-center ${
                                                formData.priority === priority 
                                                ? 'border-transparent bg-slate-900 text-white shadow-md transform scale-[1.02]' 
                                                : 'border-transparent bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                                            }`}
                                        >
                                            {priority}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex-1 flex flex-col">
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Full Description</label>
                                <textarea
                                    required
                                    rows="5"
                                    placeholder="Tell us exactly what happened... What went wrong? How can we reproduce it?"
                                    className="form-field-light flex-1 min-h-[140px] w-full px-5 py-4 rounded-2xl border-2 border-slate-100 bg-slate-50 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 shadow-sm transition-all font-medium resize-none"
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Attachments / Links</label>
                                <div className="flex gap-2 relative">
                                    <input
                                        type="text"
                                        placeholder="Paste a document/image link"
                                        className="form-field-light flex-1 px-5 py-3 rounded-xl border-2 border-slate-100 bg-slate-50 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 shadow-sm transition-all text-sm font-medium"
                                        value={documentInput}
                                        onChange={(e) => setDocumentInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleAddDocument(e);
                                        }}
                                    />
                                    <button type="button" onClick={handleAddDocument} className="px-5 py-3 bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-100 font-bold rounded-xl flex items-center transition-colors">
                                        <Paperclip className="w-5 h-5 md:mr-1" /> <span className="hidden md:inline">Add</span>
                                    </button>
                                </div>
                                <div className="mt-3">
                                    <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 font-bold text-xs cursor-pointer hover:bg-emerald-100 transition-colors">
                                        <Upload className="w-4 h-4" />
                                        {uploading ? 'Uploading...' : 'Upload File'}
                                        <input
                                            type="file"
                                            multiple
                                            accept="image/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt"
                                            onChange={handleFileUpload}
                                            className="hidden"
                                            disabled={uploading}
                                        />
                                    </label>
                                </div>
                                {formData.documentUrls.length > 0 && (
                                    <ul className="mt-3 space-y-2 max-h-24 overflow-y-auto pr-2 custom-scrollbar">
                                        {formData.documentUrls.map((url, i) => (
                                            <li key={i} className="flex justify-between items-center bg-blue-50/50 border border-blue-100/50 px-4 py-2.5 rounded-xl text-sm shadow-sm group">
                                                <a href={url} target="_blank" rel="noreferrer" className="text-blue-700 font-medium truncate mr-3 flex-1" title={url}>
                                                    {url.startsWith('data:') ? `Uploaded file ${i + 1}` : url}
                                                </a>
                                                <button type="button" onClick={() => handleRemoveDocument(i)} className="text-slate-400 hover:text-red-500 transition-colors p-1 bg-white rounded-lg opacity-80 group-hover:opacity-100 shadow-sm">
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>

                        {/* Submit Button anchored to bottom right */}
                        <div className="pt-4 border-t border-slate-100 flex justify-end mt-auto">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full md:w-auto px-8 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 disabled:bg-slate-300 disabled:shadow-none transform hover:-translate-y-0.5 active:translate-y-0"
                            >
                                {submitting ? 'Sending...' : 'Submit Support Ticket'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TicketForm;
