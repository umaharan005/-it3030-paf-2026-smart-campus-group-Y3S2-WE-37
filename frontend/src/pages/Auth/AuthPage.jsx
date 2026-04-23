import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import {
    ArrowRight,
    BookOpen,
    Lock,
    Mail,
    ShieldCheck,
    Sparkles,
    User,
    Wrench,
} from 'lucide-react';
import { CAMPUS_IMAGES } from '../../constants/visuals';

const GOOGLE_LOGIN_ENABLED = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);

const authHighlights = [
    {
        title: 'Reserve campus spaces',
        description: 'Access rooms, labs, and resources from the member-facing booking experience.',
        icon: BookOpen,
    },
    {
        title: 'Track support issues',
        description: 'Raise operational requests and follow resolution updates without entering the admin shell.',
        icon: Wrench,
    },
    {
        title: 'Role-aware security',
        description: 'Sign in once and the platform routes you into the correct user or staff experience.',
        icon: ShieldCheck,
    },
];

const AuthPage = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || '/';
    const [isRegister, setIsRegister] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.email || !formData.password) {
            toast.error('Email and password are required');
            return;
        }

        if (isRegister && !formData.name) {
            toast.error('Name is required');
            return;
        }

        setSubmitting(true);
        try {
            const endpoint = isRegister ? 'http://localhost:8080/auth/register' : 'http://localhost:8080/auth/login';
            const payload = isRegister
                ? { name: formData.name, email: formData.email, password: formData.password }
                : { email: formData.email, password: formData.password };

            const response = await axios.post(endpoint, payload);

            if (response.data.token) {
                login(response.data.token);
                toast.success(isRegister ? 'Account created successfully!' : 'Login successful!');
                navigate(from);
            }
        } catch (err) {
            const errorMessage = err?.response?.data?.error || 'Authentication failed';
            toast.error(errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        setSubmitting(true);
        try {
            const googleProfile = credentialResponse?.credential
                ? jwtDecode(credentialResponse.credential)
                : null;

            const profileData = {
                name: googleProfile?.name || '',
                picture: googleProfile?.picture || '',
                email: googleProfile?.email || '',
            };

            try {
                const response = await axios.post('http://localhost:8080/auth/google', {
                    token: credentialResponse.credential
                });

                if (response.data.token) {
                    login(response.data.token, profileData);
                    toast.success('Welcome back! Logged in successfully.');
                    navigate(from);
                    return;
                }
            } catch (backendErr) {
                login(credentialResponse.credential, profileData);
                toast.success(`Welcome, ${googleProfile?.name || 'User'}! Signed in via Google.`);
                navigate(from);
                return;
            }

            toast.error('Authentication error. Please try again.');
        } catch (err) {
            toast.error('Google authentication failed. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#fffaf3] px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-7xl overflow-hidden rounded-[2.6rem] border border-slate-200/80 bg-white shadow-[0_35px_90px_rgba(19,35,59,0.12)] lg:grid-cols-[1.05fr_0.95fr]">
                <section className="relative overflow-hidden bg-[#13233b] text-white">
                    <img src={CAMPUS_IMAGES.support} alt="Campus support" className="absolute inset-0 h-full w-full object-cover opacity-30" />
                    <div className="absolute inset-0 bg-[linear-gradient(130deg,rgba(19,35,59,0.97),rgba(19,35,59,0.9),rgba(201,93,58,0.28))]" />

                    <div className="relative z-10 flex h-full flex-col justify-between p-8 md:p-10">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.38em] text-amber-200">Smart campus hub</p>
                            <h1 className="mt-5 max-w-xl text-4xl font-black leading-tight md:text-5xl">
                                {isRegister ? 'Create your member account.' : 'Sign in to your campus portal.'}
                            </h1>
                            <p className="mt-5 max-w-xl text-base font-medium leading-8 text-slate-200">
                                {isRegister
                                    ? 'Join the redesigned public experience for bookings, resource discovery, and support.'
                                    : 'Access bookings, facilities, and service requests through the refreshed public-facing portal.'}
                            </p>
                        </div>

                        <div className="mt-10 grid gap-4">
                            {authHighlights.map((item) => (
                                <div key={item.title} className="rounded-[1.7rem] border border-white/10 bg-white/8 p-5 backdrop-blur-md">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/12 text-amber-200">
                                        <item.icon className="h-5 w-5" />
                                    </div>
                                    <h3 className="mt-4 text-xl font-black">{item.title}</h3>
                                    <p className="mt-2 text-sm font-medium leading-7 text-slate-300">{item.description}</p>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 grid gap-4 md:grid-cols-2">
                            <div className="overflow-hidden rounded-[1.7rem]">
                                <img src={CAMPUS_IMAGES.about} alt="Campus spaces" className="h-40 w-full object-cover" />
                            </div>
                            <div className="rounded-[1.7rem] bg-white/10 p-5 backdrop-blur-md">
                                <Sparkles className="h-7 w-7 text-amber-200" />
                                <p className="mt-4 text-sm font-black uppercase tracking-[0.28em] text-amber-200">Different auth UI</p>
                                <p className="mt-3 text-sm font-medium leading-7 text-slate-200">
                                    Login and signup now share the same brand language as the new public home page instead of the old default card layout.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="flex items-center justify-center bg-[radial-gradient(circle_at_top_right,rgba(183,128,56,0.1),transparent_28%),linear-gradient(180deg,#fffdf9_0%,#fff8ef_100%)] p-6 md:p-10">
                    <div className="w-full max-w-md">
                        <div className="mb-8 flex rounded-[1.4rem] border border-slate-200 bg-white p-2 shadow-sm">
                            <button
                                onClick={() => setIsRegister(false)}
                                className={`flex-1 rounded-[1rem] px-4 py-3 text-xs font-black uppercase tracking-[0.28em] transition ${
                                    !isRegister ? 'bg-[#13233b] text-white' : 'text-slate-500'
                                }`}
                            >
                                Sign in
                            </button>
                            <button
                                onClick={() => setIsRegister(true)}
                                className={`flex-1 rounded-[1rem] px-4 py-3 text-xs font-black uppercase tracking-[0.28em] transition ${
                                    isRegister ? 'bg-[#c95d3a] text-white' : 'text-slate-500'
                                }`}
                            >
                                Sign up
                            </button>
                        </div>

                        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_25px_60px_rgba(19,35,59,0.08)]">
                            <p className="text-[10px] font-black uppercase tracking-[0.34em] text-[#b78038]">
                                {isRegister ? 'New member onboarding' : 'Member access'}
                            </p>
                            <h2 className="mt-4 text-3xl font-black text-[#13233b]">
                                {isRegister ? 'Create account' : 'Welcome back'}
                            </h2>
                            <p className="mt-3 text-sm font-medium leading-7 text-slate-500">
                                {isRegister
                                    ? 'Set up your account to start exploring spaces and managing reservations.'
                                    : 'Continue to bookings, support, and your personalized campus dashboard.'}
                            </p>

                            {GOOGLE_LOGIN_ENABLED && (
                                <>
                                    <div className="mt-6 flex justify-center">
                                        <GoogleLogin
                                            onSuccess={handleGoogleSuccess}
                                            onError={() => toast.error('Google login failed. Please try again.')}
                                            width="320px"
                                            theme="outline"
                                            shape="pill"
                                        />
                                    </div>
                                    <div className="my-6 flex items-center">
                                        <div className="flex-grow border-t border-slate-200" />
                                        <span className="mx-4 text-[10px] font-black uppercase tracking-[0.28em] text-slate-400">Or continue with email</span>
                                        <div className="flex-grow border-t border-slate-200" />
                                    </div>
                                </>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {isRegister && (
                                    <div>
                                        <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.26em] text-slate-500">Full name</label>
                                        <div className="relative">
                                            <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                            <input
                                                type="text"
                                                name="name"
                                                placeholder="Your full name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                className="form-field-light w-full rounded-[1.1rem] border border-slate-200 bg-[#fcfaf5] py-3 pl-11 pr-4 text-sm font-semibold outline-none transition focus:border-[#b78038] focus:bg-white"
                                                required
                                            />
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.26em] text-slate-500">Email address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="email"
                                            name="email"
                                            placeholder="name@campus.edu"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="form-field-light w-full rounded-[1.1rem] border border-slate-200 bg-[#fcfaf5] py-3 pl-11 pr-4 text-sm font-semibold outline-none transition focus:border-[#b78038] focus:bg-white"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.26em] text-slate-500">Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="password"
                                            name="password"
                                            placeholder="Enter your password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            className="form-field-light w-full rounded-[1.1rem] border border-slate-200 bg-[#fcfaf5] py-3 pl-11 pr-4 text-sm font-semibold outline-none transition focus:border-[#b78038] focus:bg-white"
                                            required
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className={`mt-2 flex w-full items-center justify-center gap-2 rounded-[1.2rem] px-4 py-4 text-xs font-black uppercase tracking-[0.28em] text-white transition disabled:opacity-70 ${
                                        isRegister
                                            ? 'bg-[linear-gradient(90deg,#d07d49,#ba5133)] hover:brightness-105'
                                            : 'bg-[#13233b] hover:bg-[#1b3354]'
                                    }`}
                                >
                                    {submitting ? 'Processing...' : (isRegister ? 'Create account' : 'Sign in')}
                                    <ArrowRight className="h-4 w-4" />
                                </button>
                            </form>

                            <p className="mt-6 text-center text-sm text-slate-500">
                                {isRegister ? 'Already have an account?' : "Don't have an account?"}
                                <button
                                    onClick={() => setIsRegister(!isRegister)}
                                    className="ml-2 font-black text-[#c95d3a] transition hover:text-[#9f432b]"
                                >
                                    {isRegister ? 'Sign in' : 'Create one'}
                                </button>
                            </p>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default AuthPage;
