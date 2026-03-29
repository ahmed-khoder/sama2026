'use client';

import { useState } from 'react';
import { OdooSettings } from '../../../types';
import { Save, Server, Database, User, Key, Power, RefreshCw, Zap, CheckCircle2, XCircle, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface Props {
    settings: OdooSettings;
    setSettings: (updater: (prev: OdooSettings) => OdooSettings) => void;
    onSave: () => Promise<boolean>;
    onTest?: () => Promise<boolean>;
    loading?: boolean;
}

type ConnectionStatus = 'idle' | 'testing' | 'success' | 'error';

export function OdooIntegrationTab({ settings, setSettings, onSave, onTest, loading }: Props) {
    const { language } = useLanguage();
    const isRTL = language === 'ar';
    const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('idle');
    const [isTesting, setIsTesting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    const handleChange = (field: keyof OdooSettings, value: string | boolean) => {
        setSettings(prev => ({ ...prev, [field]: value }));
        setHasUnsavedChanges(true);
        // Reset connection status on any change
        if (field !== 'isActive') {
            setConnectionStatus('idle');
        }
    };

    const handleTest = async () => {
        if (!onTest) return;
        setIsTesting(true);
        setConnectionStatus('testing');
        const result = await onTest();
        setConnectionStatus(result ? 'success' : 'error');
        setIsTesting(false);
    };

    const handleSave = async () => {
        const result = await onSave();
        if (result) {
            setHasUnsavedChanges(false);
        }
    };

    const getStatusBadge = () => {
        switch (connectionStatus) {
            case 'testing':
                return (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-medium animate-pulse">
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        {isRTL ? 'جارٍ الفحص...' : 'Testing...'}
                    </div>
                );
            case 'success':
                return (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg text-xs font-medium">
                        <CheckCircle2 className="w-3 h-3" />
                        {isRTL ? 'الاتصال ناجح ✓' : 'Connected ✓'}
                    </div>
                );
            case 'error':
                return (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-xs font-medium">
                        <XCircle className="w-3 h-3" />
                        {isRTL ? 'فشل الاتصال ✗' : 'Failed ✗'}
                    </div>
                );
            default:
                return null;
        }
    };

    // Check if all required fields are filled
    const isFormValid = settings.url.trim() !== '' && settings.database.trim() !== '' && settings.username.trim() !== '';

    return (
        <div className="space-y-6">
            {/* ─── Header ──────────────────────────────────────────────── */}
            <div className="flex flex-col gap-4">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div>
                        <h2 className={`text-xl font-bold text-gray-900 dark:text-white ${isRTL ? 'font-cairo' : 'font-inter'}`}>
                            {isRTL ? 'إعدادات ربط أودو (Odoo ERP)' : 'Odoo ERP Integration Settings'}
                        </h2>
                        <p className={`text-sm text-gray-500 dark:text-gray-400 mt-1 ${isRTL ? 'font-cairo' : 'font-inter'}`}>
                            {isRTL
                                ? 'أدخل بيانات الاتصال بخادم أودو، ثم اضغط "اختبار الاتصال" للتأكد من صحتها قبل الحفظ.'
                                : 'Enter your Odoo server credentials, then click "Test Connection" to verify before saving.'}
                        </p>
                    </div>

                    {/* Toggle */}
                    <label className="flex items-center gap-3 cursor-pointer bg-white dark:bg-slate-800 px-4 py-2.5 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm shrink-0">
                        <div className={`relative inline-block w-11 h-6 rounded-full transition-colors duration-200 ease-in-out ${settings.isActive ? 'bg-brand-orange' : 'bg-gray-300 dark:bg-slate-600'}`}>
                            <input
                                type="checkbox"
                                className="opacity-0 w-0 h-0 absolute"
                                checked={settings.isActive}
                                onChange={(e) => handleChange('isActive', e.target.checked)}
                            />
                            <span
                                className={`absolute top-1 bg-white w-4 h-4 rounded-full shadow transition-all duration-200 ease-in-out ${settings.isActive ? (isRTL ? 'left-1' : 'right-1') : (isRTL ? 'right-1' : 'left-1')}`}
                            />
                        </div>
                        <span className={`font-semibold text-sm ${settings.isActive ? 'text-brand-orange' : 'text-gray-500 dark:text-gray-400'} ${isRTL ? 'font-cairo' : 'font-inter'}`}>
                            {settings.isActive
                                ? (isRTL ? 'مفعّل' : 'Active')
                                : (isRTL ? 'معطّل' : 'Disabled')}
                        </span>
                    </label>
                </div>
            </div>

            {/* ─── Status Banner ───────────────────────────────────────── */}
            <div className={`p-4 rounded-xl border ${settings.isActive
                ? 'bg-brand-orange/5 dark:bg-brand-orange/10 border-brand-orange/15 dark:border-brand-orange/20'
                : 'bg-red-50 dark:bg-red-900/15 border-red-100 dark:border-red-800/40'
            }`}>
                <div className="flex gap-3">
                    <Power className={`w-5 h-5 shrink-0 mt-0.5 ${settings.isActive ? 'text-brand-orange' : 'text-red-500 dark:text-red-400'}`} />
                    <p className={`text-sm leading-relaxed ${settings.isActive ? 'text-gray-700 dark:text-gray-300' : 'text-red-600 dark:text-red-400'} ${isRTL ? 'font-cairo' : 'font-inter'}`}>
                        {settings.isActive
                            ? (isRTL
                                ? 'نظام الربط مع أودو مفعّل. سيتم سحب الإحصائيات وبيانات الشركاء مباشرة من السيرفر.'
                                : 'Odoo integration is active. Statistics and partners data will be fetched live from the server.')
                            : (isRTL
                                ? 'تم تعطيل الربط مؤقتاً. لن يتم إجراء أي طلبات للسيرفر وسيعرض الموقع قيماً افتراضية.'
                                : 'Integration is disabled. No server requests will be made.')}
                    </p>
                </div>
            </div>

            {/* ─── Fields Card ─────────────────────────────────────────── */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
                <div className="p-6 space-y-6">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                        {/* Server URL */}
                        <div className="space-y-1.5">
                            <label className={`flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 ${isRTL ? 'font-cairo' : 'font-inter'}`}>
                                <Server className="w-4 h-4 text-brand-orange" />
                                {isRTL ? 'رابط الخادم' : 'Server URL'}
                                <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="url"
                                value={settings.url}
                                onChange={(e) => handleChange('url', e.target.value)}
                                placeholder="https://samalogs.co/"
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-600 rounded-xl focus:border-brand-orange focus:ring-1 focus:ring-brand-orange/20 dark:focus:border-brand-orange transition-all text-left text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-sm"
                                dir="ltr"
                            />
                            <p className="text-xs text-gray-400 dark:text-gray-500">{isRTL ? 'مثال: https://samalogs.co/' : 'Example: https://samalogs.co/'}</p>
                        </div>

                        {/* Database */}
                        <div className="space-y-1.5">
                            <label className={`flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 ${isRTL ? 'font-cairo' : 'font-inter'}`}>
                                <Database className="w-4 h-4 text-brand-orange" />
                                {isRTL ? 'اسم قاعدة البيانات' : 'Database Name'}
                                <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="text"
                                value={settings.database}
                                onChange={(e) => handleChange('database', e.target.value)}
                                placeholder="sama"
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-600 rounded-xl focus:border-brand-orange focus:ring-1 focus:ring-brand-orange/20 dark:focus:border-brand-orange transition-all text-left text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-sm"
                                dir="ltr"
                            />
                        </div>

                        {/* Username */}
                        <div className="space-y-1.5">
                            <label className={`flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 ${isRTL ? 'font-cairo' : 'font-inter'}`}>
                                <User className="w-4 h-4 text-brand-orange" />
                                {isRTL ? 'اسم المستخدم / البريد' : 'Username / Email'}
                                <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="text"
                                value={settings.username}
                                onChange={(e) => handleChange('username', e.target.value)}
                                placeholder="admin@samalogs.com"
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-600 rounded-xl focus:border-brand-orange focus:ring-1 focus:ring-brand-orange/20 dark:focus:border-brand-orange transition-all text-left text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-sm"
                                dir="ltr"
                            />
                        </div>

                        {/* Password */}
                        <div className="space-y-1.5">
                            <label className={`flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 ${isRTL ? 'font-cairo' : 'font-inter'}`}>
                                <Key className="w-4 h-4 text-brand-orange" />
                                {isRTL ? 'كلمة المرور / مفتاح API' : 'Password / API Key'}
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={settings.password || ''}
                                    onChange={(e) => handleChange('password', e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full px-4 py-3 pr-12 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-600 rounded-xl focus:border-brand-orange focus:ring-1 focus:ring-brand-orange/20 dark:focus:border-brand-orange transition-all text-left text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-sm"
                                    dir="ltr"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            <p className="text-xs text-gray-400 dark:text-gray-500">
                                {isRTL ? 'اتركها فارغة للاحتفاظ بالقيمة الحالية.' : 'Leave blank to keep the current value.'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* ─── Action Bar ──────────────────────────────────────── */}
                <div className="px-6 py-4 bg-gray-50 dark:bg-slate-900/50 border-t border-gray-100 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        {getStatusBadge()}
                        {hasUnsavedChanges && connectionStatus !== 'testing' && (
                            <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
                                <AlertTriangle className="w-3 h-3" />
                                {isRTL ? 'تغييرات غير محفوظة' : 'Unsaved changes'}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Test Connection */}
                        {onTest && (
                            <button
                                onClick={handleTest}
                                disabled={isTesting || loading || !isFormValid}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                                    connectionStatus === 'success'
                                        ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'
                                        : connectionStatus === 'error'
                                        ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'
                                        : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700'
                                }`}
                            >
                                {isTesting ? (
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                ) : connectionStatus === 'success' ? (
                                    <CheckCircle2 className="w-4 h-4" />
                                ) : connectionStatus === 'error' ? (
                                    <XCircle className="w-4 h-4" />
                                ) : (
                                    <Zap className="w-4 h-4" />
                                )}
                                <span className={isRTL ? 'font-cairo' : 'font-inter'}>
                                    {isTesting
                                        ? (isRTL ? 'جارٍ الفحص...' : 'Testing...')
                                        : (isRTL ? 'اختبار الاتصال' : 'Test Connection')}
                                </span>
                            </button>
                        )}

                        {/* Save */}
                        <button
                            onClick={handleSave}
                            disabled={loading || isTesting}
                            className="flex items-center gap-2 px-6 py-2.5 bg-brand-navy text-white rounded-xl hover:bg-brand-orange transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-sm font-medium"
                        >
                            <Save className={`w-4 h-4 ${loading ? 'animate-pulse' : ''}`} />
                            <span className={isRTL ? 'font-cairo' : 'font-inter'}>
                                {loading
                                    ? (isRTL ? 'جارٍ الحفظ...' : 'Saving...')
                                    : (isRTL ? 'حفظ الإعدادات' : 'Save Settings')}
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
