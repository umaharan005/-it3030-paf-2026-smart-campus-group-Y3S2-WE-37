import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    BookOpen,
    Calendar,
    Edit3,
    ImagePlus,
    LayoutDashboard,
    LogOut,
    Shield,
    Ticket,
    User,
    X,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { CAMPUS_IMAGES } from '../constants/visuals';
import { readFileAsDataUrl } from '../utils/fileDataUrl';

const Navbar = () => {
    const { user, logout, displayName, displayPicture, updateProfile } = useAuth();
    const [showProfileEditor, setShowProfileEditor] = useState(false);
    const [savingProfile, setSavingProfile] = useState(false);
    const [profileForm, setProfileForm] = useState({
        name: '',
        department: '',
        picture: ''
    });

    const elevatedAccess = user.roles?.some((role) => ['ADMIN', 'MANAGER', 'TECHNICIAN'].includes(role.replace('ROLE_', ''))) || false;
    const adminOnly = user.roles?.some((role) => role.replace('ROLE_', '') === 'ADMIN') || false;

    const navItems = [
        ...(elevatedAccess ? [{ to: '/dashboard', label: 'Control room', icon: LayoutDashboard }] : []),
        { to: '/catalogue', label: 'Resource atlas', icon: BookOpen },
        { to: '/bookings', label: 'Booking desk', icon: Calendar },
        { to: '/tickets', label: 'Issue radar', icon: Ticket },
        ...(adminOnly ? [{ to: '/admin', label: 'Identity vault', icon: Shield }] : []),
    ];

    const rawRole = user?.roles?.[0];
    const displayRole = typeof rawRole === 'string' ? rawRole.replace('ROLE_', '') : 'MEMBER';

    const openProfileEditor = () => {
        setProfileForm({
            name: user?.name || '',
            department: user?.department || '',
            picture: user?.picture || ''
        });
        setShowProfileEditor(true);
    };

    const handleProfileChange = (event) => {
        const { name, value } = event.target;
        setProfileForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleProfileImageUpload = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            const picture = await readFileAsDataUrl(file);
            setProfileForm((prev) => ({ ...prev, picture }));
        } catch (err) {
            toast.error('Failed to read the selected image.');
        } finally {
            event.target.value = '';
        }
    };

    const handleProfileSave = async (event) => {
        event.preventDefault();
        setSavingProfile(true);
        try {
            await updateProfile({
                name: profileForm.name,
                department: profileForm.department,
                picture: profileForm.picture
            });
            toast.success('Profile updated successfully.');
            setShowProfileEditor(false);
        } catch (err) {
            const apiMessage = err?.response?.data?.error || err?.response?.data;
            toast.error(typeof apiMessage === 'string' ? apiMessage : 'Failed to update profile.');
        } finally {
            setSavingProfile(false);
        }
    };

    return (
        <>
            <aside className="relative z-40 flex w-full shrink-0 flex-col overflow-hidden border-b border-white/10 bg-[#060d18] lg:h-screen lg:w-80 lg:border-b-0 lg:border-r">
                <div
                    className="absolute inset-0 opacity-35"
                    style={{
                        backgroundImage: `linear-gradient(180deg, rgba(6, 13, 24, 0.3), rgba(6, 13, 24, 0.95)), url('${CAMPUS_IMAGES.skyline}')`,
                        backgroundPosition: 'center',
                        backgroundSize: 'cover',
                    }}
                />

                <div className="relative z-10 p-6">
                    <div className="rounded-[2rem] border border-white/10 bg-white/6 p-5 backdrop-blur-xl">
                        <p className="text-[10px] font-black uppercase tracking-[0.35em] text-cyan-300">Smart campus hub</p>
                        <h2 className="mt-3 text-3xl font-black tracking-tight text-white">Command lane</h2>
                        <p className="mt-2 text-sm font-medium leading-relaxed text-slate-300">
                            A different workspace for staff who manage infrastructure, bookings, and incident flow.
                        </p>
                    </div>
                </div>

                <div className="relative z-10 px-6">
                    <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/8 backdrop-blur-xl">
                        <div className="relative h-24 overflow-hidden">
                            <img src={CAMPUS_IMAGES.admin} alt="Admin workspace" className="h-full w-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-r from-[#10243d]/90 via-[#10243d]/55 to-transparent" />
                        </div>
                        <div className="relative -mt-8 px-5 pb-5">
                            <div className="flex items-end gap-4">
                                <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-3xl border-4 border-[#08111f] bg-slate-800 text-3xl font-black text-white shadow-2xl">
                                    {displayPicture ? (
                                        <img src={displayPicture} alt={displayName} className="h-full w-full object-cover" />
                                    ) : (
                                        displayName?.[0]?.toUpperCase() || <User className="h-8 w-8" />
                                    )}
                                </div>
                                <div className="pb-2">
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-300">{displayRole}</p>
                                    <h3 className="mt-1 text-xl font-black text-white">{displayName}</h3>
                                </div>
                            </div>
                            <p className="mt-4 truncate text-xs font-bold uppercase tracking-[0.24em] text-slate-400">{user?.email}</p>
                            <button
                                onClick={openProfileEditor}
                                className="mt-5 inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.25em] text-cyan-100 transition hover:bg-cyan-300/20"
                            >
                                <Edit3 className="h-3.5 w-3.5" />
                                Tune profile
                            </button>
                        </div>
                    </div>
                </div>

                <nav className="relative z-10 flex-1 px-4 py-6">
                    <div className="space-y-2">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                className={({ isActive }) =>
                                    `group flex items-center justify-between rounded-2xl px-4 py-4 transition ${
                                        isActive
                                            ? 'bg-[linear-gradient(90deg,#f6e8d4,#f0bf76)] text-[#162536] shadow-xl'
                                            : 'text-slate-300 hover:bg-white/8 hover:text-white'
                                    }`
                                }
                            >
                                {({ isActive }) => (
                                    <>
                                        <div className="flex items-center gap-3">
                                            <div className={`rounded-2xl p-3 ${isActive ? 'bg-white/45' : 'bg-white/6 group-hover:bg-white/10'}`}>
                                                <item.icon className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <p className="text-[11px] font-black uppercase tracking-[0.25em]">{item.label}</p>
                                            </div>
                                        </div>
                                        <div className={`h-2.5 w-2.5 rounded-full ${isActive ? 'bg-[#162536]' : 'bg-transparent border border-white/20'}`} />
                                    </>
                                )}
                            </NavLink>
                        ))}
                    </div>
                </nav>

                <div className="relative z-10 p-6">
                    <button
                        onClick={logout}
                        className="flex w-full items-center justify-between rounded-[1.5rem] border border-rose-400/20 bg-rose-500/10 px-5 py-4 text-left text-rose-100 transition hover:bg-rose-500/18"
                    >
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em]">Exit session</p>
                            <p className="mt-1 text-sm font-semibold text-rose-50">Sign out from the control room</p>
                        </div>
                        <LogOut className="h-5 w-5" />
                    </button>
                </div>
            </aside>

            {showProfileEditor && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 px-4 backdrop-blur-sm">
                    <div className="w-full max-w-lg overflow-hidden rounded-[2rem] border border-white/10 bg-[#09111f] shadow-2xl">
                        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-300">Profile workshop</p>
                                <h3 className="mt-2 text-2xl font-black text-white">Update your control card</h3>
                            </div>
                            <button
                                onClick={() => !savingProfile && setShowProfileEditor(false)}
                                disabled={savingProfile}
                                className="rounded-2xl p-2 text-slate-300 transition hover:bg-white/8 hover:text-white disabled:opacity-50"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <form onSubmit={handleProfileSave} className="space-y-5 p-6">
                            <div>
                                <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={profileForm.name}
                                    onChange={handleProfileChange}
                                    className="w-full rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm font-semibold text-white outline-none transition focus:border-cyan-300/40"
                                    placeholder="Your name"
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Department</label>
                                <input
                                    type="text"
                                    name="department"
                                    value={profileForm.department}
                                    onChange={handleProfileChange}
                                    className="w-full rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm font-semibold text-white outline-none transition focus:border-cyan-300/40"
                                    placeholder="IT"
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Profile Picture</label>
                                <div className="rounded-2xl border border-white/10 bg-white/6 p-4">
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-slate-800 text-white">
                                            {profileForm.picture ? (
                                                <img src={profileForm.picture} alt="Profile preview" className="h-full w-full object-cover" />
                                            ) : (
                                                <User className="h-6 w-6" />
                                            )}
                                        </div>
                                        <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.25em] text-cyan-100 transition hover:bg-cyan-300/20">
                                            <ImagePlus className="h-3.5 w-3.5" />
                                            Upload Image
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleProfileImageUpload}
                                                className="hidden"
                                            />
                                        </label>
                                    </div>
                                    {profileForm.picture && (
                                        <button
                                            type="button"
                                            onClick={() => setProfileForm((prev) => ({ ...prev, picture: '' }))}
                                            className="mt-3 text-xs font-bold text-rose-300 transition hover:text-rose-200"
                                        >
                                            Remove picture
                                        </button>
                                    )}
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={savingProfile}
                                className="w-full rounded-2xl bg-[linear-gradient(90deg,#f4e1c3,#d69246)] px-4 py-3 text-xs font-black uppercase tracking-[0.28em] text-[#162536] transition hover:brightness-105 disabled:opacity-70"
                            >
                                {savingProfile ? 'Saving...' : 'Save changes'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default Navbar;
