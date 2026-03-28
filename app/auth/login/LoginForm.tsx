'use client';

import React, { useState, useEffect } from 'react';
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import DynamicLogo from '@/components/DynamicLogo';
import AnimatedLogo from '@/components/AnimatedLogo';

export default function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();
    const { user, loading, login } = useAuth();
    const { language } = useLanguage();
    const isRTL = language === 'ar';

    // Redirect already-authenticated users to dashboard
    useEffect(() => {
        if (!loading && user) {
            const params = new URLSearchParams(window.location.search);
            const redirect = params.get('redirect') || '/dashboard';
            router.replace(redirect);
        }
    }, [user, loading, router]);

    // Translations
    const t = {
        heroTitle: isRTL ? 'المنصة الرقمية' : 'The Digital Platform',
        heroTitleHighlight: isRTL ? 'للخدمات اللوجستية' : 'for Logistics Services',
        heroDescription: isRTL
            ? 'بوابة موحدة لإدارة كافة عمليات الشحن، التخليص، والمتابعة. حلول ذكية مصممة لقطاع الأعمال.'
            : 'A unified portal to manage all shipping, clearance, and tracking operations. Smart solutions designed for businesses.',
        statsShipments: isRTL ? 'شحنة منجزة سنوياً' : 'Shipments completed yearly',
        statsSupport: isRTL ? 'دعم فني متخصص' : 'Specialized technical support',
        loginTitle: isRTL ? 'تسجيل الدخول' : 'Sign In',
        loginSubtitle: isRTL
            ? 'قم بإدخال بيانات اعتماد حسابك للوصول إلى لوحة التحكم'
            : 'Enter your account credentials to access the dashboard',
        emailLabel: isRTL ? 'البريد الإلكتروني / اسم المستخدم' : 'Email / Username',
        passwordLabel: isRTL ? 'كلمة المرور' : 'Password',
        forgotPassword: isRTL ? 'نسيت كلمة المرور؟' : 'Forgot password?',
        loginButton: isRTL ? 'الدخول للمنصة' : 'Sign In to Platform',
        loggingIn: isRTL ? 'جاري التحقق...' : 'Signing in...',
        newCustomer: isRTL ? 'عميل جديد؟' : 'New customer?',
        createAccount: isRTL ? 'إنشاء حساب شركة' : 'Create business account',
        securedBy: isRTL ? 'محمي بواسطة SAMA Secure System v1.0' : 'Secured by SAMA Secure System v1.0',
        loginError: isRTL ? 'فشل تسجيل الدخول' : 'Login failed',
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || t.loginError);
            }

            // Login Success — token is now set as HttpOnly cookie by the server
            login(data.user);

            // Redirect to intended page or dashboard
            const params = new URLSearchParams(window.location.search);
            const redirect = params.get('redirect') || '/dashboard';
            router.push(redirect);

        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Login failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-white" dir="ltr">

            {/* LEFT Side - Login Form (دائماً يسار) */}
            <div className="flex-1 flex items-center justify-center p-6 md:p-12">
                <div className="w-full max-w-md space-y-8" dir={isRTL ? 'rtl' : 'ltr'}>
                    <div className="mb-10" dir="ltr">
                        <Link href="/" className="inline-block group">
                            <AnimatedLogo className="h-14 w-60" variant="dark" />
                        </Link>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-marine-900 mb-2">{t.loginTitle}</h2>
                        <p className="text-gray-500 text-sm">
                            {t.loginSubtitle}
                        </p>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100">
                            ⚠️ {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-marine-900 mb-2">
                                    {t.emailLabel}
                                </label>
                                <div className="relative group">
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className={`w-full py-3.5 rounded-xl bg-gray-50 border border-gray-200 focus:border-marine-500 focus:ring-4 focus:ring-marine-500/10 outline-none transition-all text-marine-900 placeholder:text-gray-400 ${isRTL ? 'pr-4 pl-10' : 'pl-4 pr-10'}`}
                                        placeholder="name@company.com"
                                        required
                                    />
                                    <div className={`absolute top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-marine-500 transition-colors ${isRTL ? 'left-3' : 'right-3'}`}>
                                        <Mail className="w-5 h-5" />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between mb-2">
                                    <label className="block text-sm font-semibold text-marine-900">{t.passwordLabel}</label>
                                    <Link href="/auth/forgot-password" className="text-sm font-medium text-marine-500 hover:text-marine-700 hover:underline">{t.forgotPassword}</Link>
                                </div>
                                <div className="relative group">
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className={`w-full py-3.5 rounded-xl bg-gray-50 border border-gray-200 focus:border-marine-500 focus:ring-4 focus:ring-marine-500/10 outline-none transition-all text-marine-900 placeholder:text-gray-400 ${isRTL ? 'pr-4 pl-10' : 'pl-4 pr-10'}`}
                                        placeholder="••••••••"
                                        required
                                    />
                                    <div className={`absolute top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-marine-500 transition-colors ${isRTL ? 'left-3' : 'right-3'}`}>
                                        <Lock className="w-5 h-5" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-4 bg-marine-600 hover:bg-marine-700 text-white font-bold rounded-xl shadow-lg shadow-marine-600/20 hover:shadow-marine-600/30 transition-all flex items-center justify-center gap-2 group active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    {t.loggingIn}
                                </>
                            ) : (
                                <>
                                    {t.loginButton}
                                    <ArrowRight className={`w-5 h-5 transition-transform ${isRTL ? 'rotate-180 group-hover:translate-x-1' : 'group-hover:-translate-x-1'}`} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="pt-6 border-t border-gray-100 text-center">
                        <p className="text-gray-600 text-sm">
                            {t.newCustomer}{' '}
                            <Link href="/auth/register" className="text-brand-orange font-bold hover:text-brand-darkOrange hover:underline transition-colors">
                                {t.createAccount}
                            </Link>
                        </p>
                        <p className="mt-4 text-xs text-gray-400">
                            {t.securedBy}
                        </p>
                    </div>
                </div>
            </div>

            {/* RIGHT Side - Branding (دائماً يمين) */}
            <div className="hidden md:flex md:w-1/2 bg-marine-900 relative overflow-hidden items-center p-12">
                {/* Background Effects */}
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute right-0 top-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1494412574643-35d324698420?auto=format&fit=crop&q=80')] bg-cover bg-center mix-blend-overlay"></div>
                    <div className="absolute inset-0 bg-gradient-to-br from-marine-900 via-marine-800 to-marine-900"></div>
                </div>

                <div className="relative z-10 text-white max-w-lg" dir={isRTL ? 'rtl' : 'ltr'}>
                    {/* Company Logo */}
                    <div className="mb-8">
                        <AnimatedLogo className="h-16 w-64" variant="light" />
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                        {t.heroTitle} <br /> <span className="text-brand-orange">{t.heroTitleHighlight}</span>
                    </h1>
                    <p className={`text-lg text-gray-300 leading-relaxed mb-8 ${isRTL ? 'border-r-4 pr-6' : 'border-l-4 pl-6'} border-brand-orange`}>
                        {t.heroDescription}
                    </p>

                    <div className="grid grid-cols-2 gap-6 mt-12 border-t border-white/10 pt-8">
                        <div>
                            <h3 className="text-2xl font-bold text-brand-orange mb-1">+10k</h3>
                            <p className="text-sm text-gray-400">{t.statsShipments}</p>
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-white mb-1">24/7</h3>
                            <p className="text-sm text-gray-400">{t.statsSupport}</p>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}
