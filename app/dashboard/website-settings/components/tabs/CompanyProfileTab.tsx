'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, X, Download, RefreshCw, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/contexts/ToastContext';
import { authFetch } from '@/lib/auth-fetch';
import { motion, AnimatePresence } from 'framer-motion';

interface FileStatus {
    exists: boolean;
    size: number;
    lastModified: string | null;
}

export default function CompanyProfileTab() {
    const { language } = useLanguage();
    const isRTL = language === 'ar';
    const { success, error: toastError } = useToast();

    // ── State ──
    const [status, setStatus] = useState<FileStatus | null>(null);
    const [statusLoading, setStatusLoading] = useState(true);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const [validationError, setValidationError] = useState<string | null>(null);

    // ── Fetch current file status ──
    const fetchStatus = useCallback(async () => {
        setStatusLoading(true);
        try {
            const res = await authFetch('/api/upload-pdf');
            const data = await res.json();
            setStatus(data);
        } catch {
            setStatus(null);
        } finally {
            setStatusLoading(false);
        }
    }, []);

    useEffect(() => { fetchStatus(); }, [fetchStatus]);

    // ── Validation ──
    const validateFile = (file: File): string | null => {
        if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
            return isRTL
                ? 'نوع الملف غير مقبول. يُسمح فقط بملفات PDF.'
                : 'Invalid file type. Only PDF files are accepted.';
        }
        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            return isRTL
                ? `حجم الملف كبير جداً. الحد الأقصى 10 ميجابايت. حجم ملفك ${(file.size / 1024 / 1024).toFixed(1)} ميجابايت.`
                : `File too large. Maximum is 10MB. Your file is ${(file.size / 1024 / 1024).toFixed(1)}MB.`;
        }
        return null;
    };

    const handleFileSelect = (file: File) => {
        const err = validateFile(file);
        if (err) {
            setValidationError(err);
            setSelectedFile(null);
            return;
        }
        setValidationError(null);
        setSelectedFile(file);
    };

    // ── Drag & Drop ──
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file) handleFileSelect(file);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFileSelect(file);
        // Reset input so same file can be selected again
        e.target.value = '';
    };

    // ── Upload ──
    const handleUpload = async () => {
        if (!selectedFile || uploading) return;

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', selectedFile);

            const res = await authFetch('/api/upload-pdf', {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Upload failed');
            }

            success(
                isRTL ? 'تم رفع البروفايل بنجاح وتحديث الرابط فوراً.' : 'Profile uploaded successfully. Download link updated instantly.',
                isRTL ? '✅ تم الرفع' : '✅ Uploaded'
            );

            setSelectedFile(null);
            await fetchStatus();
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Unknown error';
            toastError(
                isRTL ? `فشل الرفع: ${msg}` : `Upload failed: ${msg}`,
                isRTL ? '❌ خطأ' : '❌ Error'
            );
        } finally {
            setUploading(false);
        }
    };

    // ── Format helpers ──
    const formatSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
    };

    const formatDate = (iso: string) => {
        try {
            return new Intl.DateTimeFormat(isRTL ? 'ar-EG' : 'en-US', {
                year: 'numeric', month: 'short', day: 'numeric',
                hour: '2-digit', minute: '2-digit',
            }).format(new Date(iso));
        } catch {
            return iso;
        }
    };

    return (
        <div className="space-y-6">
            {/* ── Current Status Card ── */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-brand-orange/10 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-brand-orange" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-white">
                            {isRTL ? 'حالة البروفايل الحالي' : 'Current Profile Status'}
                        </h3>
                        <p className="text-xs text-gray-500">
                            {isRTL ? 'رابط التحميل الثابت:' : 'Permanent download link:'}{' '}
                            <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-brand-orange font-mono text-xs">/pdf</code>
                        </p>
                    </div>
                </div>

                {statusLoading ? (
                    <div className="flex items-center gap-2 text-gray-400">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm">{isRTL ? 'جارٍ التحقق...' : 'Checking...'}</span>
                    </div>
                ) : status?.exists ? (
                    <div className="flex items-center justify-between bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-xl p-4">
                        <div className="flex items-center gap-3">
                            <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                            <div>
                                <p className="text-sm font-medium text-green-800 dark:text-green-300">
                                    {isRTL ? 'البروفايل موجود ومتاح للتحميل' : 'Profile is live and available for download'}
                                </p>
                                <p className="text-xs text-green-600 dark:text-green-400 mt-0.5">
                                    {formatSize(status.size)} • {isRTL ? 'آخر تحديث:' : 'Last updated:'} {status.lastModified ? formatDate(status.lastModified) : '—'}
                                </p>
                            </div>
                        </div>
                        <a
                            href={`/pdf?t=${Date.now()}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-lg transition-colors shrink-0"
                        >
                            <Download className="w-3.5 h-3.5" />
                            {isRTL ? 'تحميل' : 'Download'}
                        </a>
                    </div>
                ) : (
                    <div className="flex items-center gap-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                        <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                        <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                            {isRTL ? 'لم يتم رفع أي بروفايل بعد. قم بالرفع أدناه.' : 'No profile uploaded yet. Upload one below.'}
                        </p>
                    </div>
                )}
            </div>

            {/* ── Upload Zone ── */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-6">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4">
                    {isRTL ? 'رفع / تحديث البروفايل' : 'Upload / Update Profile'}
                </h3>

                {/* Drag & Drop Area */}
                <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
                        dragOver
                            ? 'border-brand-orange bg-brand-orange/5 scale-[1.01]'
                            : validationError
                                ? 'border-red-300 dark:border-red-700 bg-red-50/50 dark:bg-red-900/5'
                                : selectedFile
                                    ? 'border-green-300 dark:border-green-700 bg-green-50/50 dark:bg-green-900/5'
                                    : 'border-gray-300 dark:border-slate-700 hover:border-brand-orange/50 hover:bg-gray-50 dark:hover:bg-slate-800/50'
                    }`}
                    onClick={() => document.getElementById('pdf-file-input')?.click()}
                >
                    <input
                        id="pdf-file-input"
                        type="file"
                        accept="application/pdf,.pdf"
                        className="hidden"
                        onChange={handleInputChange}
                    />

                    <AnimatePresence mode="wait">
                        {selectedFile ? (
                            <motion.div
                                key="selected"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-3"
                            >
                                <div className="w-14 h-14 mx-auto rounded-2xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                    <FileText className="w-7 h-7 text-green-600 dark:text-green-400" />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900 dark:text-white text-sm">{selectedFile.name}</p>
                                    <p className="text-xs text-gray-500 mt-1">{formatSize(selectedFile.size)}</p>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedFile(null);
                                        setValidationError(null);
                                    }}
                                    className="inline-flex items-center gap-1 text-xs text-red-500 hover:text-red-700 transition-colors"
                                >
                                    <X className="w-3.5 h-3.5" />
                                    {isRTL ? 'إزالة' : 'Remove'}
                                </button>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-3"
                            >
                                <div className={`w-14 h-14 mx-auto rounded-2xl flex items-center justify-center ${
                                    dragOver ? 'bg-brand-orange/20' : 'bg-gray-100 dark:bg-slate-800'
                                }`}>
                                    <Upload className={`w-7 h-7 ${dragOver ? 'text-brand-orange' : 'text-gray-400'}`} />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-700 dark:text-gray-300 text-sm">
                                        {isRTL ? 'اسحب ملف PDF هنا أو اضغط للاختيار' : 'Drag a PDF here or click to browse'}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        {isRTL ? 'PDF فقط • الحد الأقصى 10 ميجابايت' : 'PDF only • Max 10MB'}
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Validation Error */}
                <AnimatePresence>
                    {validationError && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-3 flex items-center gap-2 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-xl p-3"
                        >
                            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                            <p className="text-xs text-red-700 dark:text-red-300 font-medium">{validationError}</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Upload Button */}
                <div className="mt-4 flex items-center gap-3">
                    <button
                        onClick={handleUpload}
                        disabled={!selectedFile || uploading}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-brand-orange to-brand-darkOrange hover:from-brand-darkOrange hover:to-brand-orange text-white font-bold rounded-xl shadow-lg shadow-brand-orange/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
                    >
                        {uploading ? (
                            <>
                                <RefreshCw className="w-4 h-4 animate-spin" />
                                {isRTL ? 'جارٍ الرفع...' : 'Uploading...'}
                            </>
                        ) : (
                            <>
                                <Upload className="w-4 h-4" />
                                {isRTL ? 'رفع / تحديث' : 'Upload / Update'}
                            </>
                        )}
                    </button>
                </div>

                {/* Info Notice */}
                <p className="mt-3 text-xs text-gray-400 dark:text-gray-500 leading-relaxed">
                    {isRTL
                        ? '⚠️ رفع ملف جديد سيستبدل الملف الحالي مباشرة. الرابط الثابت /pdf سيعرض النسخة الجديدة فوراً بدون أي تأخير.'
                        : '⚠️ Uploading a new file will instantly replace the current one. The permanent link /pdf will serve the new version immediately with no caching delay.'
                    }
                </p>
            </div>
        </div>
    );
}
