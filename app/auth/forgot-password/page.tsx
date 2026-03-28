'use client';

import React, { useState } from 'react';
import { Mail, ArrowRight, ArrowLeft, Loader2, CheckCircle, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import DynamicLogo from '@/components/DynamicLogo';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [contactAdmin, setContactAdmin] = useState(false);
    const { language } = useLanguage();
    const isRTL = language === 'ar';

    const t = {
        title: isRTL ? 'استعادة كلمة المرور' : 'Reset Password',
        subtitle: isRTL
            ? 'أدخل بريدك الإلكتروني وسنرسل لك رابط لإعادة تعيين كلمة المرور'
            : 'Enter your email and we\'ll send you a link to reset your password',
        emailLabel: isRTL ? 'البريد الإلكتروني' : 'Email',
        sendButton: isRTL ? 'إرسال رابط الاستعادة' : 'Send Reset Link',
        sending: isRTL ? 'جاري الإرسال...' : 'Sending...',
        backToLogin: isRTL ? 'العودة لتسجيل الدخول' : 'Back to Login',
        successTitle: isRTL ? 'تم الإرسال بنجاح!' : 'Email Sent!',
        successMessage: isRTL
            ? 'إذا كان البريد مسجلاً في النظام، ستصلك رسالة تحتوي على رابط لإعادة تعيين كلمة المرور. تحقق من صندوق الوارد والبريد المزعج.'
            : 'If the email is registered, you\'ll receive a password reset link. Check your inbox and spam folder.',
        contactAdminTitle: isRTL ? 'تواصل مع مدير النظام' : 'Contact Your Admin',
        contactAdminMessage: isRTL
            ? 'هذه الخدمة متاحة فقط لمدير النظام. لاستعادة كلمة المرور، يرجى التواصل مع مدير النظام ليقوم بإعادة تعيينها من لوحة التحكم.'
            : 'This service is only available for administrators. To reset your password, please contact your system administrator.',
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setContactAdmin(false);

        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to send reset email');
            }

            if (data.contactAdmin) {
                setContactAdmin(true);
            } else {
                setSuccess(true);
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'حدث خطأ');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-marine-50 via-white to-brand-orange/5 dark:from-slate-950 dark:via-slate-900 dark:to-marine-950 p-6" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="w-full max-w-md space-y-8">
                {/* Logo */}
                <div className="text-center">
                    <Link href="/" className="inline-block">
                        <DynamicLogo className="h-14 w-auto mx-auto" />
                    </Link>
                </div>

                {success ? (
                    /* Success State */
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 p-8 text-center space-y-4">
                        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t.successTitle}</h2>
                        <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{t.successMessage}</p>
                        <Link
                            href="/auth/login"
                            className="inline-flex items-center gap-2 mt-4 px-6 py-3 bg-marine-600 hover:bg-marine-700 text-white font-bold rounded-xl transition-colors"
                        >
                            {isRTL ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
                            {t.backToLogin}
                        </Link>
                    </div>
                ) : contactAdmin ? (
                    /* Contact Admin State — non-admin user */
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 p-8 text-center space-y-4">
                        <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto">
                            <ShieldAlert className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t.contactAdminTitle}</h2>
                        <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{t.contactAdminMessage}</p>
                        <Link
                            href="/auth/login"
                            className="inline-flex items-center gap-2 mt-4 px-6 py-3 bg-marine-600 hover:bg-marine-700 text-white font-bold rounded-xl transition-colors"
                        >
                            {isRTL ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
                            {t.backToLogin}
                        </Link>
                    </div>
                ) : (
                    /* Form State */
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 p-8 space-y-6">
                        <div>
                            <h2 className="text-2xl font-bold text-marine-900 dark:text-white mb-2">{t.title}</h2>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">{t.subtitle}</p>
                        </div>

                        {error && (
                            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm font-medium border border-red-100 dark:border-red-900/50">
                                ⚠️ {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-marine-900 dark:text-gray-200 mb-2">
                                    {t.emailLabel}
                                </label>
                                <div className="relative group">
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className={`w-full py-3.5 rounded-xl bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 focus:border-marine-500 focus:ring-4 focus:ring-marine-500/10 outline-none transition-all dark:text-white placeholder:text-gray-400 ${isRTL ? 'pr-4 pl-10' : 'pl-4 pr-10'}`}
                                        placeholder="name@company.com"
                                        required
                                    />
                                    <div className={`absolute top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-marine-500 transition-colors ${isRTL ? 'left-3' : 'right-3'}`}>
                                        <Mail className="w-5 h-5" />
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-4 bg-marine-600 hover:bg-marine-700 text-white font-bold rounded-xl shadow-lg shadow-marine-600/20 hover:shadow-marine-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        {t.sending}
                                    </>
                                ) : (
                                    <>
                                        {t.sendButton}
                                        <Mail className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="text-center pt-4 border-t border-gray-100 dark:border-slate-700">
                            <Link
                                href="/auth/login"
                                className="inline-flex items-center gap-2 text-sm font-medium text-marine-500 hover:text-marine-700 dark:text-marine-400 dark:hover:text-marine-300 hover:underline"
                            >
                                {isRTL ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
                                {t.backToLogin}
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
