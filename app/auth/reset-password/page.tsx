'use client';

import React, { useState, Suspense } from 'react';
import { Lock, ArrowRight, ArrowLeft, Loader2, CheckCircle, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import DynamicLogo from '@/components/DynamicLogo';

function ResetPasswordForm() {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const searchParams = useSearchParams();
    const { language } = useLanguage();
    const isRTL = language === 'ar';

    const token = searchParams.get('token');
    const email = searchParams.get('email');

    const t = {
        title: isRTL ? 'كلمة مرور جديدة' : 'New Password',
        subtitle: isRTL
            ? 'أدخل كلمة المرور الجديدة لحسابك'
            : 'Enter a new password for your account',
        newPasswordLabel: isRTL ? 'كلمة المرور الجديدة' : 'New Password',
        confirmLabel: isRTL ? 'تأكيد كلمة المرور' : 'Confirm Password',
        resetButton: isRTL ? 'تعيين كلمة المرور' : 'Set Password',
        resetting: isRTL ? 'جاري التعيين...' : 'Setting...',
        backToLogin: isRTL ? 'العودة لتسجيل الدخول' : 'Back to Login',
        successTitle: isRTL ? 'تم التغيير بنجاح!' : 'Password Changed!',
        successMessage: isRTL
            ? 'تم تغيير كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة.'
            : 'Your password has been changed. You can now login with your new password.',
        invalidLink: isRTL
            ? 'رابط إعادة التعيين غير صالح. يرجى طلب رابط جديد.'
            : 'Invalid reset link. Please request a new one.',
        passwordMismatch: isRTL ? 'كلمة المرور غير متطابقة' : 'Passwords do not match',
        passwordTooShort: isRTL ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' : 'Password must be at least 6 characters',
        loginButton: isRTL ? 'تسجيل الدخول' : 'Go to Login',
        requestNewLink: isRTL ? 'طلب رابط جديد' : 'Request New Link',
    };

    // Invalid token/email in URL
    if (!token || !email) {
        return (
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 p-8 text-center space-y-4">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto">
                    <Lock className="w-8 h-8 text-red-600 dark:text-red-400" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t.invalidLink}</h2>
                <Link
                    href="/auth/forgot-password"
                    className="inline-flex items-center gap-2 mt-4 px-6 py-3 bg-marine-600 hover:bg-marine-700 text-white font-bold rounded-xl transition-colors"
                >
                    {t.requestNewLink}
                </Link>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (newPassword.length < 6) {
            setError(t.passwordTooShort);
            return;
        }
        if (newPassword !== confirmPassword) {
            setError(t.passwordMismatch);
            return;
        }

        setIsLoading(true);

        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, token, newPassword }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to reset password');
            }

            setSuccess(true);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'حدث خطأ');
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
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
                    {t.loginButton}
                </Link>
            </div>
        );
    }

    return (
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
                        {t.newPasswordLabel}
                    </label>
                    <div className="relative group">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className={`w-full py-3.5 rounded-xl bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 focus:border-marine-500 focus:ring-4 focus:ring-marine-500/10 outline-none transition-all dark:text-white placeholder:text-gray-400 ${isRTL ? 'pr-4 pl-10' : 'pl-4 pr-10'}`}
                            placeholder="••••••••"
                            required
                            minLength={6}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className={`absolute top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors ${isRTL ? 'left-3' : 'right-3'}`}
                        >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-marine-900 dark:text-gray-200 mb-2">
                        {t.confirmLabel}
                    </label>
                    <div className="relative group">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className={`w-full py-3.5 rounded-xl bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 focus:border-marine-500 focus:ring-4 focus:ring-marine-500/10 outline-none transition-all dark:text-white placeholder:text-gray-400 ${isRTL ? 'pr-4 pl-10' : 'pl-4 pr-10'}`}
                            placeholder="••••••••"
                            required
                            minLength={6}
                        />
                        <div className={`absolute top-1/2 -translate-y-1/2 text-gray-400 ${isRTL ? 'left-3' : 'right-3'}`}>
                            <Lock className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                {/* Password match indicator */}
                {newPassword && confirmPassword && (
                    <div className={`flex items-center gap-2 text-sm ${newPassword === confirmPassword ? 'text-green-600' : 'text-red-600'}`}>
                        {newPassword === confirmPassword ? (
                            <><CheckCircle className="w-4 h-4" /> {isRTL ? 'كلمة المرور متطابقة' : 'Passwords match'}</>
                        ) : (
                            <><Lock className="w-4 h-4" /> {t.passwordMismatch}</>
                        )}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isLoading || !newPassword || !confirmPassword || newPassword !== confirmPassword}
                    className="w-full py-4 bg-marine-600 hover:bg-marine-700 text-white font-bold rounded-xl shadow-lg shadow-marine-600/20 hover:shadow-marine-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            {t.resetting}
                        </>
                    ) : (
                        <>
                            {t.resetButton}
                            <Lock className="w-5 h-5" />
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
    );
}

export default function ResetPasswordPage() {
    const { language } = useLanguage();
    const isRTL = language === 'ar';

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-marine-50 via-white to-brand-orange/5 dark:from-slate-950 dark:via-slate-900 dark:to-marine-950 p-6" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <Link href="/" className="inline-block">
                        <DynamicLogo className="h-14 w-auto mx-auto" />
                    </Link>
                </div>
                <Suspense fallback={
                    <div className="flex items-center justify-center p-12">
                        <Loader2 className="w-8 h-8 animate-spin text-marine-500" />
                    </div>
                }>
                    <ResetPasswordForm />
                </Suspense>
            </div>
        </div>
    );
}
