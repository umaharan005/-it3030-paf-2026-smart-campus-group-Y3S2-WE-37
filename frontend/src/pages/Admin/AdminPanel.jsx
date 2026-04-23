import React, { useEffect, useMemo, useState } from 'react';
import { UserPlus, Shield, Briefcase, Loader, Users, Search, Ticket, Wrench, Mail, Lock, User } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { createStaffAccount, getAdminOverview, getAllUsersForAdmin, setUserAccountStatus } from '../../services/authAdminApi';
import { useAuth } from '../../context/AuthContext';
import { DEPARTMENTS } from '../../constants/departments';
import { CAMPUS_IMAGES } from '../../constants/visuals';

const AdminPanel = () => {
    const { user, hasRole } = useAuth();
    const isAdmin = hasRole('ADMIN');
    const isManagerOnly = hasRole('MANAGER') && !hasRole('ADMIN');
    const managerDepartment = (user?.department || '').toUpperCase();
    const currentUserEmail = (user?.email || '').toLowerCase();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'TECHNICIAN',
        department: ''
    });
    const [saving, setSaving] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [users, setUsers] = useState([]);
    const [overview, setOverview] = useState({
        totalUsers: 0,
        staffUsers: 0,
        totalTickets: 0,
        openTickets: 0,
        inProgressTickets: 0
    });
    const [query, setQuery] = useState('');
    const [updatingUserId, setUpdatingUserId] = useState(null);

    const loadAdminData = async () => {
        setLoadingData(true);
        try {
            const [overviewData, userData] = await Promise.all([
                getAdminOverview(),
                getAllUsersForAdmin()
            ]);
            setOverview(overviewData);
            setUsers(Array.isArray(userData) ? userData : []);
        } catch (err) {
            toast.error('Failed to load admin controls.');
        } finally {
            setLoadingData(false);
        }
    };

    useEffect(() => {
        loadAdminData();
    }, []);

    useEffect(() => {
        if (isManagerOnly) {
            setFormData((prev) => ({
                ...prev,
                role: 'TECHNICIAN',
                department: managerDepartment
            }));
        }
    }, [isManagerOnly, managerDepartment]);

    const filteredUsers = useMemo(() => {
        const needle = query.trim().toLowerCase();
        if (!needle) return users;

        return users.filter((user) => {
            const roleText = (user.roles || []).join(' ').toLowerCase();
            return (
                (user.name || '').toLowerCase().includes(needle) ||
                (user.email || '').toLowerCase().includes(needle) ||
                (user.department || '').toLowerCase().includes(needle) ||
                roleText.includes(needle)
            );
        });
    }, [users, query]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const payload = {
                ...formData,
                role: isManagerOnly ? 'TECHNICIAN' : formData.role,
                department: (isManagerOnly ? managerDepartment : formData.department).trim().toUpperCase()
            };

            await createStaffAccount(payload);
            toast.success('Staff member account created.');
            setFormData({
                name: '',
                email: '',
                password: '',
                role: 'TECHNICIAN',
                department: isManagerOnly ? managerDepartment : ''
            });
            loadAdminData();
        } catch (err) {
            const apiMessage = err?.response?.data?.error;
            toast.error(apiMessage || 'Failed to create staff account.');
        } finally {
            setSaving(false);
        }
    };

    const isUserActive = (targetUser) => targetUser?.active !== false;

    const handleToggleUserStatus = async (targetUser) => {
        if (!isAdmin) return;
        setUpdatingUserId(targetUser.id);
        try {
            const nextActive = !isUserActive(targetUser);
            const updatedUser = await setUserAccountStatus(targetUser.id, nextActive);

            setUsers((prev) => prev.map((entry) => (
                entry.id === targetUser.id ? { ...entry, ...updatedUser } : entry
            )));

            toast.success(nextActive ? 'Account activated.' : 'Account deactivated.');
        } catch (err) {
            const apiMessage = err?.response?.data?.error || err?.response?.data;
            toast.error(typeof apiMessage === 'string' ? apiMessage : 'Failed to update account status.');
        } finally {
            setUpdatingUserId(null);
        }
    };

    return (
        <div className="p-6 md:p-8 min-h-[calc(100vh-5rem)] text-white">
            <div className="max-w-7xl mx-auto space-y-6">
                <div 
                    className="rounded-[2rem] border border-white/10 shadow-xl overflow-hidden relative min-h-[210px] flex flex-col justify-center"
                    style={{ backgroundImage: `url("${CAMPUS_IMAGES.admin}")`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                >
                    <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(9,17,31,0.95),rgba(9,17,31,0.76),rgba(183,128,56,0.12))] z-0"></div>
                    <div className="relative z-10 px-8 py-8 text-white">
                        <p className="text-[10px] font-black uppercase tracking-[0.34em] text-cyan-300">Identity and access workspace</p>
                        <div className="mt-3 flex items-center gap-3 mb-2">
                            <Shield className="w-8 h-8 text-amber-300 drop-shadow-md" />
                            <h1 className="text-3xl md:text-4xl font-black tracking-tight drop-shadow-lg">Admin Control Center</h1>
                        </div>
                        <p className="text-slate-200 text-sm font-medium drop-shadow-md max-w-2xl">
                            Manage users, monitor operations, and create staff accounts from a dedicated staff-only shell that now looks and feels distinct from the public user experience.
                        </p>
                    </div>
                </div>

                <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
                    <div className="rounded-2xl border border-white/10 bg-white/6 p-5 shadow-sm backdrop-blur-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-black uppercase tracking-wider text-slate-300">Users</span>
                            <Users className="w-4 h-4 text-cyan-300" />
                        </div>
                        <p className="mt-3 text-3xl font-black text-white">{overview.totalUsers}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/6 p-5 shadow-sm backdrop-blur-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-black uppercase tracking-wider text-slate-300">Staff</span>
                            <Wrench className="w-4 h-4 text-cyan-300" />
                        </div>
                        <p className="mt-3 text-3xl font-black text-white">{overview.staffUsers}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/6 p-5 shadow-sm backdrop-blur-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-black uppercase tracking-wider text-slate-300">Tickets</span>
                            <Ticket className="w-4 h-4 text-cyan-300" />
                        </div>
                        <p className="mt-3 text-3xl font-black text-white">{overview.totalTickets}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/6 p-5 shadow-sm backdrop-blur-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-black uppercase tracking-wider text-slate-300">Open</span>
                            <Ticket className="w-4 h-4 text-amber-300" />
                        </div>
                        <p className="mt-3 text-3xl font-black text-white">{overview.openTickets}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/6 p-5 shadow-sm backdrop-blur-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-black uppercase tracking-wider text-slate-300">In Progress</span>
                            <Loader className="w-4 h-4 text-cyan-300" />
                        </div>
                        <p className="mt-3 text-3xl font-black text-white">{overview.inProgressTickets}</p>
                    </div>
                </section>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    <div className="xl:col-span-1 rounded-[2rem] border border-slate-200 bg-white shadow-xl shadow-slate-200/50 overflow-hidden flex flex-col relative">
                        {/* Decorative background accent */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>

                        <div className="px-8 py-7 border-b border-slate-100 bg-white relative z-10">
                            <div className="flex items-center gap-3 mb-1">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-100 shadow-sm">
                                    <UserPlus className="w-5 h-5" />
                                </div>
                                <h2 className="text-xl font-black text-slate-900 tracking-tight italic">Onboard Staff</h2>
                            </div>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-3 ml-1">Provision Elevated Access</p>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-6 flex-1 flex flex-col relative z-10 bg-slate-50/30">
                            <div className="space-y-5 flex-1">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-1">Full Legal Name</label>
                                    <div className="relative group">
                                        <User className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-blue-500 transition-colors" />
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            className="form-field-light w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 bg-white shadow-sm font-bold text-sm placeholder:text-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-1">Campus Email</label>
                                    <div className="relative group">
                                        <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-blue-500 transition-colors" />
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            className="form-field-light w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 bg-white shadow-sm font-bold text-sm placeholder:text-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                                            placeholder="staff@campus.edu"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-1">Initial Password</label>
                                    <div className="relative group">
                                        <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-blue-500 transition-colors" />
                                        <input
                                            type="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            required
                                            minLength={6}
                                            className="form-field-light w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 bg-white shadow-sm font-bold text-sm placeholder:text-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-1">System Role</label>
                                    <div className="relative group">
                                        <Briefcase className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-blue-500 shadow-sm transition-colors z-10" />
                                        <select
                                            name="role"
                                            value={formData.role}
                                            onChange={handleChange}
                                            disabled={isManagerOnly}
                                            className="form-field-light w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 bg-white shadow-sm font-black text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none appearance-none tracking-widest cursor-pointer"
                                        >
                                            <option value="TECHNICIAN">TECHNICIAN</option>
                                            <option value="MANAGER">MANAGER</option>
                                        </select>
                                        {/* Custom dropdown arrow */}
                                        <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none">
                                            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"></path></svg>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-1">Department</label>
                                    <div className="relative group">
                                        <Briefcase className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-blue-500 shadow-sm transition-colors z-10" />
                                        <select
                                            name="department"
                                            value={isManagerOnly ? managerDepartment : formData.department}
                                            onChange={handleChange}
                                            required
                                            disabled={isManagerOnly}
                                            className="form-field-light w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 bg-white shadow-sm font-black text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none appearance-none tracking-widest cursor-pointer"
                                        >
                                            {!isManagerOnly && <option value="">SELECT DEPARTMENT</option>}
                                            {DEPARTMENTS.map((department) => (
                                                <option key={department} value={department}>{department}</option>
                                            ))}
                                        </select>
                                        <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none">
                                            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"></path></svg>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 mt-auto">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="w-full relative group overflow-hidden inline-flex items-center justify-center gap-3 px-7 py-4 rounded-2xl bg-blue-600 text-white font-black text-xs uppercase tracking-widest hover:bg-slate-900 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-300 shadow-xl shadow-blue-500/20 hover:shadow-slate-900/20"
                                >
                                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-400/0 via-white/20 to-blue-400/0 -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out pointer-events-none"></div>
                                    {saving ? <Loader className="w-5 h-5 animate-spin relative z-10 text-white" /> : <Shield className="w-5 h-5 relative z-10 text-white" />}
                                    <span className="relative z-10 drop-shadow-sm">{saving ? 'Authenticating...' : 'Provision Account'}</span>
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="xl:col-span-2 flex flex-col">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                            <div>
                                <h2 className="text-xl font-black text-slate-900 tracking-tight italic">User & Staff Directory</h2>
                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1 ml-1">Current Staff & Members</p>
                            </div>
                            <div className="relative w-full sm:w-72">
                                <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Search directory..."
                                    className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 bg-white text-xs font-bold focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none shadow-sm transition-all text-slate-700 placeholder:text-slate-300"
                                />
                            </div>
                        </div>

                        {loadingData ? (
                            <div className="flex-1 flex items-center justify-center py-20">
                                <Loader className="w-8 h-8 animate-spin text-blue-600" />
                            </div>
                        ) : (() => {
                            const staffMembers = filteredUsers.filter(user => {
                                const role = (user.roles || [])[0]?.replace('ROLE_', '') || 'MEMBER';
                                return ['ADMIN', 'MANAGER', 'TECHNICIAN'].includes(role);
                            });
                            
                            const normalUsers = filteredUsers.filter(user => {
                                const role = (user.roles || [])[0]?.replace('ROLE_', '') || 'MEMBER';
                                return !['ADMIN', 'MANAGER', 'TECHNICIAN'].includes(role);
                            });

                            return (
                                <div className="flex-1 overflow-y-auto max-h-[850px] pr-2 pb-10 pt-2 custom-scrollbar space-y-12">
                                    {/* STAFF DIRECTORY (CARDS) */}
                                    <div>
                                        <div className="flex items-center gap-3 mb-6 border-b border-slate-200/60 pb-3">
                                            <Shield className="w-4 h-4 text-blue-500" />
                                            <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">Administrative Staff</h3>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
                                            {staffMembers.map((user) => {
                                                const primaryRole = (user.roles || [])[0]?.replace('ROLE_', '') || 'MEMBER';
                                                const active = isUserActive(user);
                                                
                                                return (
                                                    <div key={user.id} className="bg-[#0f172a]/80 backdrop-blur-3xl rounded-[2rem] border border-slate-700/60 shadow-xl hover:shadow-[0_8px_30px_rgba(59,130,246,0.2)] hover:border-blue-500/50 transition-all duration-500 overflow-hidden flex flex-col relative group">
                                                        <div className="h-16 bg-gradient-to-r from-blue-900/40 via-slate-800/40 to-slate-900/60 border-b border-slate-700/60 group-hover:bg-blue-900/40 transition-colors relative overflow-hidden">
                                                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl -mt-10 -mr-10"></div>
                                                            <div className="absolute bottom-0 left-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl -mb-10 -ml-10"></div>
                                                        </div>
                                                        
                                                        <div className="flex flex-col items-center px-6 pb-6 relative -mt-10 z-10">
                                                            <button className="absolute top-12 right-4 p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-colors">
                                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
                                                            </button>

                                                            <div className="w-20 h-20 bg-gradient-to-br from-slate-800 to-slate-900 rounded-full mb-3 flex border-4 border-slate-900 shadow-2xl items-center justify-center text-3xl font-black text-white group-hover:scale-105 group-hover:border-blue-500/50 transition-all duration-300 overflow-hidden relative">
                                                                {user.name ? (
                                                                    <span className="text-white/95">{user.name[0].toUpperCase()}</span>
                                                                ) : (
                                                                    <User className="w-8 h-8 text-blue-400" />
                                                                )}
                                                            </div>

                                                            <h3 className="text-sm font-black text-white group-hover:text-blue-400 transition-colors truncate w-full text-center drop-shadow-md">{user.name || 'Anonymous User'}</h3>
                                                            <p className="text-[9.5px] uppercase tracking-[0.2em] font-bold text-slate-400 mt-0.5 mb-3">{primaryRole.toLowerCase()}</p>
                                                            
                                                            <div className={`px-3.5 py-1 rounded-full text-[8.5px] font-black uppercase tracking-[0.15em] shadow-sm backdrop-blur-sm ${
                                                                active
                                                                    ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                                                                    : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
                                                            }`}>
                                                                {active ? 'ACTIVE' : 'INACTIVE'}
                                                            </div>
                                                        </div>

                                                        <div className="px-6 py-4 space-y-3 bg-[#0a0f1d]/60 flex-1 border-t border-slate-700/50 relative">
                                                            <div className="flex items-center gap-3 relative z-10">
                                                                <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center flex-shrink-0 shadow-inner group-hover:border-blue-500/40 transition-colors">
                                                                    <Mail className="w-3 h-3 text-slate-300 group-hover:text-blue-400 transition-colors" />
                                                                </div>
                                                                <span className="text-[11px] font-bold text-slate-300 truncate">{user.email}</span>
                                                            </div>
                                                            <div className="flex items-center gap-3 relative z-10">
                                                                <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center flex-shrink-0 shadow-inner group-hover:border-blue-500/40 transition-colors">
                                                                    <Briefcase className="w-3 h-3 text-slate-300 group-hover:text-blue-400 transition-colors" />
                                                                </div>
                                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-800/50 px-2 py-0.5 rounded-md border border-slate-700/50">Campus Staff</span>
                                                                {user.department && <span className="text-[10px] font-black uppercase tracking-widest text-blue-300 bg-slate-800/50 px-2 py-0.5 rounded-md border border-slate-700/50">{user.department}</span>}
                                                            </div>
                                                        </div>

                                                        <div className="mt-auto flex border-t border-slate-700/50 bg-[#0f172a]/90 text-[9px] font-black uppercase tracking-widest text-slate-500 divide-x divide-slate-700/50 relative z-10">
                                                            <div className="w-1/2 px-4 py-3 flex flex-col items-center justify-center group-hover:bg-slate-800/30 transition-colors">
                                                                <span className="text-[8px] text-slate-500 mb-0.5 tracking-[0.2em]">Joined</span>
                                                                <span className="text-blue-200">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}</span>
                                                            </div>
                                                            <div className="w-1/2 px-4 py-3 flex flex-col items-center justify-center gap-1.5 group-hover:bg-slate-800/30 transition-colors">
                                                                {isAdmin ? (
                                                                    <button
                                                                        onClick={() => handleToggleUserStatus(user)}
                                                                        disabled={updatingUserId === user.id || (user.email || '').toLowerCase() === currentUserEmail}
                                                                        className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-[0.15em] border transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
                                                                            active
                                                                                ? 'border-rose-400/40 text-rose-300 hover:bg-rose-500/10'
                                                                                : 'border-emerald-400/40 text-emerald-300 hover:bg-emerald-500/10'
                                                                        }`}
                                                                    >
                                                                        {updatingUserId === user.id ? 'Updating...' : (active ? 'Set Inactive' : 'Set Active')}
                                                                    </button>
                                                                ) : (
                                                                    <>
                                                                        <span className="text-[8px] text-slate-500 mb-0.5 tracking-[0.2em]">Access</span>
                                                                        <span className="text-blue-200">{primaryRole}</span>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                            {staffMembers.length === 0 && (
                                                <div className="col-span-full py-10 text-center flex flex-col items-center bg-white rounded-3xl border border-dashed border-slate-300">
                                                    <Shield className="w-6 h-6 text-slate-300 mb-3" />
                                                    <p className="text-slate-500 font-bold text-sm">No administrative staff found.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* PUBLIC USERS (TABLE) */}
                                    <div>
                                        <div className="flex items-center gap-3 mb-6 border-b border-slate-200/60 pb-3">
                                            <Users className="w-4 h-4 text-slate-400" />
                                            <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">General Public Users</h3>
                                        </div>
                                        
                                        <div className="bg-[#0f172a]/80 backdrop-blur-3xl rounded-[2rem] border border-slate-700/60 shadow-xl overflow-hidden relative">
                                            {/* Decorative glow inside table container */}
                                            <div className="absolute top-0 right-1/4 w-64 h-32 bg-blue-500/10 rounded-full blur-[3rem] pointer-events-none"></div>

                                            <table className="w-full text-sm relative z-10">
                                                <thead className="bg-[#0a0f1d]/60 text-slate-400 uppercase tracking-widest text-[9px] font-black border-b border-slate-700/50">
                                                    <tr>
                                                        <th className="text-left px-8 py-5">Profile Name</th>
                                                        <th className="text-left px-6 py-5">Email Address</th>
                                                        <th className="text-left px-6 py-5">Status</th>
                                                        <th className="text-left px-6 py-5">Clearance</th>
                                                        <th className="text-left px-6 py-5">Member Since</th>
                                                        {isAdmin && <th className="text-left px-6 py-5">Action</th>}
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-700/50">
                                                    {normalUsers.map((user) => {
                                                        const primaryRole = (user.roles || [])[0]?.replace('ROLE_', '') || 'MEMBER';
                                                        const active = isUserActive(user);
                                                        return (
                                                            <tr key={user.id} className="hover:bg-slate-800/40 transition-colors group">
                                                                <td className="px-8 py-5">
                                                                    <div className="flex items-center gap-4">
                                                                        <div className="w-9 h-9 rounded-full bg-slate-800/80 border border-slate-600 text-white flex items-center justify-center font-black text-xs shadow-inner group-hover:border-blue-500/50 transition-colors">
                                                                            {user.name ? user.name[0].toUpperCase() : <User className="w-4 h-4 text-blue-400" />}
                                                                        </div>
                                                                        <span className="font-bold text-white/95 group-hover:text-blue-300 transition-colors drop-shadow-sm">{user.name || 'Anonymous'}</span>
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-5 text-slate-300 font-medium">{user.email}</td>
                                                                <td className="px-6 py-5">
                                                                    <span className={`px-3 py-1 border rounded-full text-[9px] font-black uppercase tracking-widest backdrop-blur-sm ${
                                                                        active
                                                                            ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                                                                            : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                                                                    }`}>
                                                                        {active ? 'ACTIVE' : 'INACTIVE'}
                                                                    </span>
                                                                </td>
                                                                <td className="px-6 py-5">
                                                                    <span className="px-3 py-1 bg-slate-800/50 text-slate-300 border border-slate-600/50 rounded-full text-[9px] font-black uppercase tracking-widest backdrop-blur-sm">
                                                                        {primaryRole}
                                                                    </span>
                                                                </td>
                                                                <td className="px-6 py-5 text-blue-200 font-medium tracking-wide">
                                                                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}
                                                                </td>
                                                                {isAdmin && (
                                                                    <td className="px-6 py-5">
                                                                        <button
                                                                            onClick={() => handleToggleUserStatus(user)}
                                                                            disabled={updatingUserId === user.id || (user.email || '').toLowerCase() === currentUserEmail}
                                                                            className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
                                                                                active
                                                                                    ? 'border-rose-400/40 text-rose-300 hover:bg-rose-500/10'
                                                                                    : 'border-emerald-400/40 text-emerald-300 hover:bg-emerald-500/10'
                                                                            }`}
                                                                        >
                                                                            {updatingUserId === user.id ? 'Updating...' : (active ? 'Set Inactive' : 'Set Active')}
                                                                        </button>
                                                                    </td>
                                                                )}
                                                            </tr>
                                                        );
                                                    })}
                                                    {normalUsers.length === 0 && (
                                                        <tr>
                                                            <td colSpan={isAdmin ? '6' : '5'} className="px-6 py-14 text-center text-slate-400 font-medium">
                                                                No general public users found matching your search.
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;
