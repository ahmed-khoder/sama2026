'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    HardDrive, Trash2, RefreshCw, CheckCircle2, AlertTriangle,
    ArrowLeft, ArrowRight, Image as ImageIcon, FileX, Database, Eye, Download,
    Search, X, Loader2, Link2, Unlink2, Shield
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/contexts/ToastContext';
import { useConfirm } from '@/contexts/ConfirmContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// ── Types ──────────────────────────────────────────────────────────

interface MediaUsage {
    entity: string;
    entityId: string;
    resolvedTitleAr: string | null;
    resolvedTitleEn: string | null;
}

interface MediaItem {
    id: string;
    url: string;
    fileName: string | null;
    mimeType: string | null;
    size: number | null;
    width: number | null;
    height: number | null;
    createdAt: string;
    _count: { usages: number };
    usages: MediaUsage[];
}

interface MediaResponse {
    items: MediaItem[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

interface CleanupData {
    success: boolean;
    dryRun: boolean;
    summary: {
        totalPhysicalFiles: number;
        totalDbReferences: number;
        orphansFound: number;
        deletedCount?: number;
        failedCount?: number;
    };
    orphans: string[];
    failed?: string[];
}

// ── Entity Label Map (for badge coloring) ──────────────────────────

const ENTITY_LABELS: Record<string, { en: string; ar: string; color: string }> = {
    hero: { en: 'Hero', ar: 'الهيرو', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' },
    about: { en: 'About', ar: 'عن الشركة', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300' },
    blog: { en: 'Blog', ar: 'المدونة', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' },
    milestone: { en: 'Milestone', ar: 'محطات النجاح', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' },
    service: { en: 'Service', ar: 'الخدمات', color: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' },
    team: { en: 'Team', ar: 'فريق العمل', color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300' },
    career: { en: 'Career', ar: 'التوظيف', color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300' },
};

// ── Two-Tier Nested Tab Configuration ──────────────────────────────

type Tier1Key = 'all' | 'home' | 'services' | 'about-company' | 'careers' | 'blog' | 'unlinked';

interface SubTabDef {
    key: string;
    ar: string;
    en: string;
    filter: (m: MediaItem) => boolean;
}

interface Tier1Def {
    key: Tier1Key;
    ar: string;
    en: string;
    filter: (m: MediaItem) => boolean;
    subtabs: SubTabDef[];
}

// Helper: check if any usage matches
const hasEntity = (m: MediaItem, entity: string) =>
    m.usages?.some(u => u.entity === entity) ?? false;

const hasEntityId = (m: MediaItem, entity: string, entityId: string) =>
    m.usages?.some(u => u.entity === entity && u.entityId === entityId) ?? false;

const hasEntityNotId = (m: MediaItem, entity: string, excludeEntityId: string) =>
    m.usages?.some(u => u.entity === entity && u.entityId !== excludeEntityId) ?? false;

const hasEntityTitle = (m: MediaItem, entity: string, titleSubstr: string) =>
    m.usages?.some(u => u.entity === entity && (u.resolvedTitleAr?.includes(titleSubstr) || u.resolvedTitleEn?.includes(titleSubstr))) ?? false;

const isUnlinked = (m: MediaItem) =>
    !m.usages || m.usages.length === 0 || m._count.usages === 0;

// Tier 1 + Tier 2 definitions
const TIER1_TABS: Tier1Def[] = [
    {
        key: 'all', ar: 'الكل', en: 'All',
        filter: () => true,
        subtabs: [],
    },
    {
        key: 'home', ar: 'الصفحة الرئيسية', en: 'Home Page',
        // Home = hero slides + homepage about section (entityId='default') + team
        filter: (m) => hasEntity(m, 'hero') || hasEntityId(m, 'about', 'default') || hasEntity(m, 'team'),
        subtabs: [
            { key: 'all', ar: 'الكل', en: 'All', filter: () => true },
            { key: 'hero', ar: 'صور الهيرو', en: 'Hero Images', filter: (m) => hasEntity(m, 'hero') },
            { key: 'about-section', ar: 'قسم من نحن', en: 'About Section', filter: (m) => hasEntityId(m, 'about', 'default') },
            { key: 'team', ar: 'فريق العمل', en: 'Team', filter: (m) => hasEntity(m, 'team') },
        ],
    },
    {
        key: 'services', ar: 'الخدمات', en: 'Services',
        filter: (m) => hasEntity(m, 'service'),
        subtabs: [
            { key: 'all', ar: 'الكل', en: 'All', filter: () => true },
            { key: 'hero', ar: 'هيرو الصفحة', en: 'Page Hero', filter: (m) => hasEntityTitle(m, 'service', 'هيرو الخدمات') || hasEntityTitle(m, 'service', 'Services Hero') },
            { key: 'management', ar: 'إدارة الخدمات', en: 'Service Management', filter: (m) => hasEntityTitle(m, 'service', 'إدارة الخدمات') || hasEntityTitle(m, 'service', 'Service Management') },
            { key: 'fleet', ar: 'أسطول الشاحنات', en: 'Fleet Trucks', filter: (m) => hasEntityTitle(m, 'service', 'أسطول الشاحنات') || hasEntityTitle(m, 'service', 'Fleet Trucks') },
            { key: 'ports', ar: 'عمليات الموانئ', en: 'Port Operations', filter: (m) => hasEntityTitle(m, 'service', 'عمليات الموانئ') || hasEntityTitle(m, 'service', 'Port Operations') },
            { key: 'gallery', ar: 'صور الخدمات', en: 'Service Gallery', filter: (m) => hasEntityTitle(m, 'service', 'صور الخدمات') || hasEntityTitle(m, 'service', 'Service Gallery') },
        ],
    },
    {
        key: 'about-company', ar: 'عن الشركة', en: 'About Company',
        // About Company page = about entities EXCEPT homepage section (entityId='default') + milestones
        filter: (m) => hasEntityNotId(m, 'about', 'default') || hasEntity(m, 'milestone'),
        subtabs: [
            { key: 'all', ar: 'الكل', en: 'All', filter: () => true },
            { key: 'hero', ar: 'هيرو الصفحة', en: 'Page Hero', filter: (m) => hasEntityTitle(m, 'about', 'صورة من نحن') || hasEntityTitle(m, 'about', 'About Slide') },
            { key: 'milestones', ar: 'مراحل النجاح', en: 'Milestones', filter: (m) => hasEntity(m, 'milestone') },
            { key: 'why-us', ar: 'لماذا نحن ؟', en: 'Why Us?', filter: (m) => hasEntityTitle(m, 'about', 'لماذا نحن') || hasEntityTitle(m, 'about', 'Why Us') },
        ],
    },
    {
        key: 'careers', ar: 'الوظائف', en: 'Careers',
        filter: (m) => hasEntity(m, 'career'),
        subtabs: [
            { key: 'all', ar: 'الكل', en: 'All', filter: () => true },
            { key: 'hero', ar: 'هيرو الصفحة', en: 'Page Hero', filter: (m) => hasEntityTitle(m, 'career', 'سلايد توظيف') || hasEntityTitle(m, 'career', 'Career Slide') },
            { key: 'jobs', ar: 'الوظائف المتاحة', en: 'Job Listings', filter: (m) => m.usages?.some(u => u.entity === 'career' && !u.resolvedTitleAr?.includes('سلايد') && !u.resolvedTitleEn?.includes('Slide')) ?? false },
        ],
    },
    {
        key: 'blog', ar: 'المدونة', en: 'Blog',
        filter: (m) => hasEntity(m, 'blog'),
        subtabs: [
            { key: 'all', ar: 'الكل', en: 'All', filter: () => true },
            { key: 'hero', ar: 'هيرو الصفحة', en: 'Page Hero', filter: (m) => hasEntityTitle(m, 'blog', 'خلفية هيرو') || hasEntityTitle(m, 'blog', 'Blog Hero') },
            { key: 'posts', ar: 'صور المقالات', en: 'Post Images', filter: (m) => m.usages?.some(u => u.entity === 'blog' && !u.resolvedTitleAr?.includes('هيرو') && !u.resolvedTitleEn?.includes('Hero')) ?? false },
        ],
    },
    {
        key: 'unlinked', ar: 'غير مرتبطة', en: 'Unlinked',
        filter: isUnlinked,
        subtabs: [],
    },
];

// ── Main Tab Type ──────────────────────────────────────────────────
type Tab = 'library' | 'orphans' | 'trash';

export default function StorageManagementPage() {
    const { language } = useLanguage();
    const { success, error } = useToast();
    const { confirm } = useConfirm();
    const router = useRouter();
    const isRTL = language === 'ar';

    // Tab state
    const [activeTab, setActiveTab] = useState<Tab>('library');

    // ── Media Library State ────────────────────────────────────────
    const [mediaData, setMediaData] = useState<MediaResponse | null>(null);
    const [mediaLoading, setMediaLoading] = useState(true);
    const [mediaSearch, setMediaSearch] = useState('');
    const [tier1Tab, setTier1Tab] = useState<Tier1Key>('all');
    const [tier2Sub, setTier2Sub] = useState<string>('all');
    const [previewMedia, setPreviewMedia] = useState<MediaItem | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // ── Orphan State (legacy cleanup) ──────────────────────────────
    const [cleanupData, setCleanupData] = useState<CleanupData | null>(null);
    const [cleanupLoading, setCleanupLoading] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [deleted, setDeleted] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [trashCount, setTrashCount] = useState(0);
    const [emptyingTrash, setEmptyingTrash] = useState(false);

    // ── Trash View State ───────────────────────────────────────────
    const [trashFiles, setTrashFiles] = useState<any[]>([]);
    const [trashLoading, setTrashLoading] = useState(false);
    const [trashTotalSize, setTrashTotalSize] = useState(0);

    // ── Fetch Media Library (always fetch ALL) ─────────────────────
    const fetchMedia = useCallback(async () => {
        setMediaLoading(true);
        try {
            const params = new URLSearchParams({ limit: '200' });
            const res = await fetch(`/api/cms/media?${params}`, { credentials: 'same-origin' });
            if (!res.ok) throw new Error('Failed');
            const json = await res.json();
            setMediaData(json);
        } catch (err) {
            console.error(err);
            error(isRTL ? 'فشل في تحميل مكتبة الوسائط' : 'Failed to load media library');
        } finally {
            setMediaLoading(false);
        }
    }, [isRTL, error]);

    // ── Fetch Orphan Data (dry run) ────────────────────────────────
    const fetchCleanupData = useCallback(async () => {
        setCleanupLoading(true);
        setDeleted(false);
        try {
            const res = await fetch('/api/admin/cleanup-storage', { credentials: 'same-origin' });
            if (!res.ok) throw new Error('Failed to fetch');
            const json = await res.json();
            setCleanupData(json);
        } catch (err) {
            console.error(err);
            error(isRTL ? 'فشل في تحميل بيانات التخزين' : 'Failed to load storage data');
        } finally {
            setCleanupLoading(false);
        }
    }, [isRTL, error]);

    // ── Fetch Trash Count ──────────────────────────────────────────
    const fetchTrashCount = useCallback(async () => {
        try {
            const res = await fetch('/api/admin/empty-trash', { credentials: 'same-origin' });
            if (res.ok) {
                const json = await res.json();
                setTrashCount(json.fileCount || 0);
            }
        } catch { /* silent */ }
    }, []);

    useEffect(() => {
        fetchMedia();
        fetchTrashCount();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── Fetch Trash Files (read-only listing) ─────────────────────
    const fetchTrashFiles = useCallback(async () => {
        setTrashLoading(true);
        try {
            const res = await fetch('/api/admin/trash-files', { credentials: 'same-origin' });
            if (res.ok) {
                const json = await res.json();
                setTrashFiles(json.files || []);
                setTrashCount(json.totalCount || 0);
                setTrashTotalSize(json.totalSize || 0);
            }
        } catch { /* silent */ }
        finally { setTrashLoading(false); }
    }, []);

    // ── Smart Delete Media (with usage warning) ─────────────────────
    const handleDeleteMedia = async (item: MediaItem) => {
        const hasUsages = item._count.usages > 0;
        const uniqueEntities = [...new Set(item.usages.map(u => u.entity))];

        let modalMessage: string;
        let modalTitle: string;
        let confirmLabel: string;

        if (hasUsages) {
            // Build entity list with resolved titles
            const entityNames = item.usages
                .map(u => {
                    const cat = ENTITY_LABELS[u.entity]?.ar || u.entity;
                    const title = u.resolvedTitleAr;
                    return title ? `${cat}: ${title}` : cat;
                })
                .join('، ');
            const entityNamesEn = item.usages
                .map(u => {
                    const cat = ENTITY_LABELS[u.entity]?.en || u.entity;
                    const title = u.resolvedTitleEn;
                    return title ? `${cat}: ${title}` : cat;
                })
                .join(', ');

            modalTitle = isRTL ? '⚠️ تحذير: حذف صورة مستخدمة' : '⚠️ Warning: Deleting In-Use Media';
            modalMessage = isRTL
                ? `⚠️ تحذير: هذه الصورة مستخدمة حالياً في: ${entityNames}.\nحذفها سيؤدي إلى اختفائها من هذه الصفحات.\nهل تريد تأكيد الحذف الإجباري؟`
                : `⚠️ Warning: This image is currently used in: ${entityNamesEn}.\nDeleting it will remove it from those pages.\nConfirm force delete?`;
            confirmLabel = isRTL ? 'حذف إجباري' : 'Force Delete';
        } else {
            modalTitle = isRTL ? '🗑️ حذف الوسائط' : '🗑️ Delete Media';
            modalMessage = isRTL
                ? `هذه الصورة غير مرتبطة بأي قسم. يمكنك حذفها بأمان.\n${item.url}`
                : `This image is not linked to any section. Safe to delete.\n${item.url}`;
            confirmLabel = isRTL ? 'حذف' : 'Delete';
        }

        const confirmed = await confirm({
            title: modalTitle,
            message: modalMessage,
            confirmText: confirmLabel,
            cancelText: isRTL ? 'إلغاء' : 'Cancel',
            type: 'danger',
        });
        if (!confirmed) return;

        setDeletingId(item.id);
        try {
            const forceParam = hasUsages ? '?force=true' : '';
            const res = await fetch(`/api/cms/media/${item.id}${forceParam}`, {
                method: 'DELETE',
                credentials: 'same-origin',
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed');
            }
            success(isRTL ? '✅ تم حذف الملف بنجاح' : '✅ File deleted successfully');
            fetchMedia();
        } catch (err: any) {
            error(err.message || (isRTL ? 'فشل في الحذف' : 'Delete failed'));
        } finally {
            setDeletingId(null);
        }
    };

    // ── Empty Trash ────────────────────────────────────────────────
    const handleEmptyTrash = async () => {
        const confirmed = await confirm({
            title: isRTL ? '🗑️ إفراغ سلة المهملات' : '🗑️ Empty Trash',
            message: isRTL
                ? `سيتم حذف ${trashCount} ملف نهائياً من سلة المهملات. لا يمكن التراجع عن هذا الإجراء.`
                : `${trashCount} files will be permanently deleted from trash. This cannot be undone.`,
            confirmText: isRTL ? 'إفراغ نهائي' : 'Empty Permanently',
            cancelText: isRTL ? 'إلغاء' : 'Cancel',
            type: 'danger',
        });
        if (!confirmed) return;

        setEmptyingTrash(true);
        try {
            const res = await fetch('/api/admin/empty-trash', {
                method: 'POST',
                credentials: 'same-origin',
            });
            if (!res.ok) throw new Error('Failed');
            const result = await res.json();
            setTrashCount(0);
            success(
                isRTL
                    ? `🗑️ تم إفراغ السلة — ${result.deletedCount} ملف حُذف نهائياً`
                    : `🗑️ Trash emptied — ${result.deletedCount} files permanently deleted`
            );
        } catch {
            error(isRTL ? 'فشل في إفراغ السلة' : 'Failed to empty trash');
        } finally {
            setEmptyingTrash(false);
        }
    };

    // ── Delete Orphans ──────────────────────────────────────────────
    const handleDeleteOrphans = async () => {
        const confirmed = await confirm({
            title: isRTL ? '⚠️ حذف الملفات اليتيمة' : '⚠️ Delete Orphan Files',
            message: isRTL
                ? `هل أنت متأكد من حذف ${cleanupData?.summary.orphansFound || 0} ملف يتيم نهائياً؟`
                : `Delete ${cleanupData?.summary.orphansFound || 0} orphan files permanently?`,
            confirmText: isRTL ? 'حذف نهائي' : 'Delete Permanently',
            cancelText: isRTL ? 'إلغاء' : 'Cancel',
            type: 'danger',
        });
        if (!confirmed) return;

        setDeleting(true);
        try {
            const res = await fetch('/api/admin/cleanup-storage?dry=false', {
                method: 'POST',
                credentials: 'same-origin',
            });
            if (!res.ok) throw new Error('Failed');
            const result = await res.json();
            setDeleted(true);
            setCleanupData(result);
            setTrashCount(prev => prev + (result.summary.deletedCount || 0));
            success(
                isRTL
                    ? `♻️ تم نقل ${result.summary.deletedCount} ملف إلى سلة المهملات!`
                    : `♻️ Moved ${result.summary.deletedCount} files to trash!`
            );
        } catch {
            error(isRTL ? 'فشل في حذف الملفات' : 'Failed to delete files');
        } finally {
            setDeleting(false);
        }
    };

    // ── Filter Helpers ──────────────────────────────────────────────
    // ── Two-tier frontend filter (useMemo) ─────────────────────
    const activeTier1 = useMemo(() => TIER1_TABS.find(t => t.key === tier1Tab) ?? TIER1_TABS[0], [tier1Tab]);

    const filteredMediaByTab = useMemo(() => {
        if (!mediaData?.items) return [];

        // First: filter by Tier 1
        let items = mediaData.items.filter(activeTier1.filter);

        // Then: apply Tier 2 sub-filter if not 'all'
        if (tier2Sub !== 'all' && activeTier1.subtabs.length > 0) {
            const subDef = activeTier1.subtabs.find(s => s.key === tier2Sub);
            if (subDef) items = items.filter(subDef.filter);
        }

        // Search (URL, filename, AND resolved titles)
        if (mediaSearch.trim()) {
            const q = mediaSearch.toLowerCase();
            items = items.filter(m =>
                m.url.toLowerCase().includes(q) ||
                (m.fileName && m.fileName.toLowerCase().includes(q)) ||
                m.usages?.some(u =>
                    (u.resolvedTitleAr && u.resolvedTitleAr.toLowerCase().includes(q)) ||
                    (u.resolvedTitleEn && u.resolvedTitleEn.toLowerCase().includes(q))
                )
            );
        }

        return items;
    }, [mediaData, activeTier1, tier2Sub, mediaSearch]);

    const getFolders = (orphans: string[]) => {
        const folders = new Set<string>();
        orphans.forEach((file) => {
            const parts = file.split('/');
            if (parts.length > 2) folders.add(parts.slice(0, -1).join('/'));
        });
        return Array.from(folders).sort();
    };

    const getFilteredOrphans = () => {
        if (!cleanupData?.orphans) return [];
        let filtered = cleanupData.orphans;
        if (selectedFolder) filtered = filtered.filter((f) => f.startsWith(selectedFolder + '/'));
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter((f) => f.toLowerCase().includes(q));
        }
        return filtered;
    };

    const isImage = (path: string) => /\.(webp|png|jpg|jpeg|gif|svg|avif|bmp|ico)$/i.test(path);
    const getFolderLabel = (path: string) => {
        const parts = path.split('/');
        return parts.length > 2 ? parts.slice(1, -1).join('/') : 'root';
    };

    const formatBytes = (bytes: number | null) => {
        if (!bytes) return '—';
        if (bytes < 1024) return `${bytes}B`;
        if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)}KB`;
        return `${(bytes / 1048576).toFixed(1)}MB`;
    };

    const filteredMedia = filteredMediaByTab;
    const filteredOrphans = getFilteredOrphans();
    const folders = cleanupData?.orphans ? getFolders(cleanupData.orphans) : [];

    // ── Stats Card Component ───────────────────────────────────────
    const StatCard = ({ icon: Icon, label, value, color, bgColor }: {
        icon: React.ComponentType<{ className?: string }>; label: string; value: number | string; color: string; bgColor: string;
    }) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`relative overflow-hidden rounded-2xl p-6 ${bgColor} border border-gray-100 dark:border-slate-700`}
        >
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
                    <p className={`text-3xl font-bold mt-1 ${color}`}>{typeof value === 'number' ? value.toLocaleString() : value}</p>
                </div>
                <div className={`p-3 rounded-xl ${color.includes('orange') ? 'bg-brand-orange/10' : color.includes('green') ? 'bg-green-100 dark:bg-green-900/30' : color.includes('red') ? 'bg-red-100 dark:bg-red-900/30' : 'bg-blue-100 dark:bg-blue-900/30'}`}>
                    <Icon className={`w-6 h-6 ${color}`} />
                </div>
            </div>
            <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full bg-gradient-to-br from-transparent to-black/[0.03] dark:to-white/[0.03]" />
        </motion.div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-20">

            {/* ── Header ───────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 rounded-xl bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
                    >
                        <ArrowRight className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                            <div className="p-2 bg-brand-orange/10 rounded-xl">
                                <HardDrive className="w-6 h-6 text-brand-orange" />
                            </div>
                            {isRTL ? 'مكتبة الوسائط والتخزين' : 'Media Library & Storage'}
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">
                            {isRTL ? 'إدارة الوسائط، تتبع الاستخدام، وتنظيف الملفات اليتيمة' : 'Manage media, track usage, and clean orphan files'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => { fetchMedia(); fetchTrashCount(); }}
                        disabled={mediaLoading}
                        className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-xl transition-all font-medium text-sm"
                    >
                        <RefreshCw className={`w-4 h-4 ${mediaLoading ? 'animate-spin' : ''}`} />
                        {isRTL ? 'تحديث' : 'Refresh'}
                    </button>
                </div>
            </div>

            {/* ── Tabs ──────────────────────────────────────────────── */}
            <div className="flex gap-1 p-1 bg-gray-100 dark:bg-slate-800 rounded-xl w-fit">
                <button
                    onClick={() => setActiveTab('library')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'library'
                        ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                >
                    <ImageIcon className="w-4 h-4" />
                    {isRTL ? 'مكتبة الوسائط' : 'Media Library'}
                    {mediaData && (
                        <span className="ml-1 px-1.5 py-0.5 bg-brand-orange/10 text-brand-orange text-xs font-bold rounded-md">
                            {mediaData.pagination.total}
                        </span>
                    )}
                </button>
                <button
                    onClick={() => { setActiveTab('orphans'); if (!cleanupData) fetchCleanupData(); }}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'orphans'
                        ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                >
                    <FileX className="w-4 h-4" />
                    {isRTL ? 'الملفات اليتيمة' : 'Orphan Files'}
                </button>
                <button
                    onClick={() => { setActiveTab('trash'); if (trashFiles.length === 0) fetchTrashFiles(); }}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'trash'
                        ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                >
                    <Trash2 className="w-4 h-4" />
                    {isRTL ? 'سلة المهملات' : 'Trash'}
                    {trashCount > 0 && (
                        <span className="ml-1 px-1.5 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold rounded-md">
                            {trashCount}
                        </span>
                    )}
                </button>
            </div>

            {/* ══════════════════════════════════════════════════════════
                   TAB 1: MEDIA LIBRARY
               ══════════════════════════════════════════════════════════ */}
            {activeTab === 'library' && (
                <>
                    {/* Stats */}
                    {mediaData && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <StatCard
                                icon={ImageIcon}
                                label={isRTL ? 'إجمالي الوسائط' : 'Total Media'}
                                value={mediaData.pagination.total}
                                color="text-blue-600 dark:text-blue-400"
                                bgColor="bg-white dark:bg-slate-800"
                            />
                            <StatCard
                                icon={Link2}
                                label={isRTL ? 'مستخدمة' : 'In Use'}
                                value={mediaData.items.filter(m => m._count.usages > 0).length}
                                color="text-green-600 dark:text-green-400"
                                bgColor="bg-white dark:bg-slate-800"
                            />
                            <StatCard
                                icon={Unlink2}
                                label={isRTL ? 'غير مرتبطة' : 'Unlinked'}
                                value={mediaData.items.filter(m => m._count.usages === 0).length}
                                color="text-red-600 dark:text-red-400"
                                bgColor="bg-white dark:bg-slate-800"
                            />
                            <StatCard
                                icon={Trash2}
                                label={isRTL ? 'في السلة' : 'In Trash'}
                                value={trashCount}
                                color="text-amber-600 dark:text-amber-400"
                                bgColor="bg-white dark:bg-slate-800"
                            />
                        </div>
                    )}

                    {/* ════ TWO-TIER TABS + SEARCH ════ */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-4 space-y-3">

                        {/* Tier 1 Tabs (Pages) */}
                        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                            {TIER1_TABS.map((t1) => {
                                const count = mediaData?.items?.filter(t1.filter).length ?? 0;
                                return (
                                    <button
                                        key={t1.key}
                                        onClick={() => { setTier1Tab(t1.key); setTier2Sub('all'); }}
                                        className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${tier1Tab === t1.key
                                            ? t1.key === 'unlinked'
                                                ? 'bg-red-500 text-white shadow-md shadow-red-500/20'
                                                : 'bg-brand-orange text-white shadow-md shadow-brand-orange/20'
                                            : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-600'
                                            }`}
                                    >
                                        {isRTL ? t1.ar : t1.en}
                                        <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${tier1Tab === t1.key
                                            ? 'bg-white/20 text-white'
                                            : 'bg-gray-200 dark:bg-slate-600 text-gray-500 dark:text-gray-400'
                                            }`}>{count}</span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Tier 2 Sub-Tabs (only if active Tier1 has subtabs) */}
                        {activeTier1.subtabs.length > 0 && (
                            <div className="flex items-center gap-1 overflow-x-auto border-t border-gray-100 dark:border-slate-700 pt-3">
                                {activeTier1.subtabs.map((sub) => {
                                    const t1Items = mediaData?.items?.filter(activeTier1.filter) ?? [];
                                    const subCount = sub.key === 'all' ? t1Items.length : t1Items.filter(sub.filter).length;
                                    return (
                                        <button
                                            key={sub.key}
                                            onClick={() => setTier2Sub(sub.key)}
                                            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all ${tier2Sub === sub.key
                                                ? 'bg-marine-600 text-white shadow-sm'
                                                : 'bg-gray-50 dark:bg-slate-900 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 ring-1 ring-gray-200 dark:ring-slate-600'
                                                }`}
                                        >
                                            {isRTL ? sub.ar : sub.en}
                                            <span className={`px-1 py-0.5 rounded text-[9px] font-bold ${tier2Sub === sub.key
                                                ? 'bg-white/20 text-white'
                                                : 'bg-gray-200 dark:bg-slate-700 text-gray-400'
                                                }`}>{subCount}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {/* Search bar */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                value={mediaSearch}
                                onChange={(e) => setMediaSearch(e.target.value)}
                                placeholder={isRTL ? 'بحث في الوسائط...' : 'Search media...'}
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 dark:bg-slate-900 border-none ring-1 ring-gray-200 dark:ring-slate-600 focus:ring-2 focus:ring-brand-orange text-sm"
                                dir="ltr"
                            />
                            {mediaSearch && (
                                <button onClick={() => setMediaSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Media Grid */}
                    {mediaLoading ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                            {Array.from({ length: 12 }).map((_, i) => (
                                <div key={i} className="aspect-square rounded-xl bg-gray-200 dark:bg-slate-700 animate-pulse" />
                            ))}
                        </div>
                    ) : filteredMedia.length === 0 ? (
                        <div className="text-center py-16 text-gray-500">
                            <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
                            <p className="font-medium">{isRTL ? 'لا توجد وسائط' : 'No media found'}</p>
                            <p className="text-sm mt-1">{isRTL ? 'ارفع صورة من لوحة التحكم لتظهر هنا' : 'Upload an image from the dashboard to see it here'}</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                            <AnimatePresence>
                                {filteredMedia.map((item, index) => {
                                    const hasUsages = item._count.usages > 0;
                                    const uniqueEntities = [...new Set(item.usages.map(u => u.entity))];

                                    return (
                                        <motion.div
                                            key={item.id}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            transition={{ delay: Math.min(index * 0.02, 0.5) }}
                                            className={`group relative bg-white dark:bg-slate-800 rounded-xl border overflow-hidden transition-all cursor-pointer ${hasUsages
                                                ? 'border-green-200 dark:border-green-800 hover:border-green-400 dark:hover:border-green-600 hover:shadow-lg hover:shadow-green-500/10'
                                                : 'border-gray-200 dark:border-slate-700 hover:border-red-300 dark:hover:border-red-700 hover:shadow-lg hover:shadow-red-500/10'
                                                }`}
                                            onClick={() => setPreviewMedia(item)}
                                        >
                                            {/* Thumbnail */}
                                            <div className="aspect-square bg-gray-50 dark:bg-slate-900 flex items-center justify-center overflow-hidden">
                                                {isImage(item.url) ? (
                                                    <img
                                                        src={item.url}
                                                        alt=""
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                        loading="lazy"
                                                    />
                                                ) : (
                                                    <div className="flex flex-col items-center gap-1 text-gray-400 dark:text-gray-500">
                                                        <FileX className="w-8 h-8" />
                                                        <span className="text-xs">{item.url.split('.').pop()?.toUpperCase()}</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Delete Button (top-left, visible on hover) */}
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDeleteMedia(item); }}
                                                disabled={deletingId === item.id}
                                                className="absolute top-2 left-2 z-10 p-1.5 rounded-lg bg-red-500/90 hover:bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-all duration-200 backdrop-blur-sm shadow-lg shadow-red-500/25"
                                                title={isRTL ? 'حذف' : 'Delete'}
                                            >
                                                {deletingId === item.id ? (
                                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                ) : (
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                )}
                                            </button>

                                            {/* Usage Badge (top-right) */}
                                            <div className="absolute top-2 right-2">
                                                {hasUsages ? (
                                                    <span className="flex items-center gap-1 px-1.5 py-0.5 bg-green-500/90 text-white text-[10px] font-bold rounded-md backdrop-blur-sm">
                                                        <Shield className="w-3 h-3" />
                                                        {item._count.usages}
                                                    </span>
                                                ) : (
                                                    <span className="px-1.5 py-0.5 bg-red-500/90 text-white text-[10px] font-bold rounded-md backdrop-blur-sm">
                                                        {isRTL ? 'غير مرتبط' : 'UNLINKED'}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Entity Badges (bottom-left) — show resolved titles */}
                                            {item.usages.length > 0 && (
                                                <div className="absolute bottom-12 left-2 flex flex-wrap gap-1 max-w-[calc(100%-16px)]">
                                                    {item.usages.slice(0, 2).map((u, idx) => {
                                                        const label = ENTITY_LABELS[u.entity];
                                                        const title = isRTL ? u.resolvedTitleAr : u.resolvedTitleEn;
                                                        return (
                                                            <span key={idx} className={`px-1.5 py-0.5 text-[9px] font-bold rounded ${label?.color || 'bg-gray-100 text-gray-600'} backdrop-blur-sm truncate max-w-full`} title={title || undefined}>
                                                                {title ? `${isRTL ? label?.ar : label?.en}: ${title}` : (isRTL ? label?.ar : label?.en)}
                                                            </span>
                                                        );
                                                    })}
                                                    {item.usages.length > 2 && (
                                                        <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-gray-600/80 text-white backdrop-blur-sm">
                                                            +{item.usages.length - 2}
                                                        </span>
                                                    )}
                                                </div>
                                            )}

                                            {/* Hover overlay */}
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                                <Eye className="w-6 h-6 text-white" />
                                            </div>

                                            {/* File info */}
                                            <div className="p-2">
                                                <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate font-mono" dir="ltr" title={item.url}>
                                                    {item.url.split('/').pop()}
                                                </p>
                                                <p className="text-[10px] text-gray-400 dark:text-gray-500">
                                                    {formatBytes(item.size)}
                                                    {item.width && item.height ? ` · ${item.width}×${item.height}` : ''}
                                                </p>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>
                    )}
                </>
            )
            }

            {/* ══════════════════════════════════════════════════════════
                   TAB 2: ORPHAN FILES (Legacy Cleanup)
               ══════════════════════════════════════════════════════════ */}
            {
                activeTab === 'orphans' && (
                    <>
                        {/* Trash Bin */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`border rounded-2xl p-6 ${trashCount > 0
                                ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
                                : 'bg-gray-50 dark:bg-slate-800/50 border-gray-200 dark:border-slate-700'
                                }`}
                        >
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className={`p-3 rounded-xl ${trashCount > 0 ? 'bg-amber-100 dark:bg-amber-900/40' : 'bg-gray-200 dark:bg-slate-700'}`}>
                                        <Trash2 className={`w-6 h-6 ${trashCount > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-gray-400 dark:text-gray-500'}`} />
                                    </div>
                                    <div>
                                        <h3 className={`font-bold ${trashCount > 0 ? 'text-amber-800 dark:text-amber-300' : 'text-gray-600 dark:text-gray-400'}`}>
                                            {isRTL ? 'سلة المهملات' : 'Trash Bin'}
                                        </h3>
                                        <p className={`text-sm mt-0.5 ${trashCount > 0 ? 'text-amber-700 dark:text-amber-400' : 'text-gray-500'}`}>
                                            {trashCount > 0
                                                ? (isRTL ? `${trashCount} ملف في السلة` : `${trashCount} files in trash`)
                                                : (isRTL ? 'السلة فارغة' : 'Trash is empty')
                                            }
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleEmptyTrash}
                                    disabled={emptyingTrash || trashCount === 0}
                                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed ${trashCount > 0
                                        ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-lg shadow-amber-500/25'
                                        : 'bg-gray-200 dark:bg-slate-700 text-gray-400 dark:text-gray-500'
                                        }`}
                                >
                                    {emptyingTrash ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                    {isRTL ? 'إفراغ سلة المهملات' : 'Empty Trash'}
                                </button>
                            </div>
                        </motion.div>

                        {/* Scan / Delete buttons */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={fetchCleanupData}
                                disabled={cleanupLoading}
                                className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-xl transition-all font-medium text-sm"
                            >
                                <RefreshCw className={`w-4 h-4 ${cleanupLoading ? 'animate-spin' : ''}`} />
                                {isRTL ? 'فحص الملفات اليتيمة' : 'Scan Orphans'}
                            </button>
                            {cleanupData && cleanupData.summary.orphansFound > 0 && !deleted && (
                                <button
                                    onClick={handleDeleteOrphans}
                                    disabled={deleting}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl transition-all font-bold text-sm shadow-lg shadow-red-500/25 disabled:opacity-60"
                                >
                                    {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                    {isRTL ? `حذف ${cleanupData.summary.orphansFound} يتيم` : `Delete ${cleanupData.summary.orphansFound} Orphans`}
                                </button>
                            )}
                        </div>

                        {/* Loading */}
                        {cleanupLoading && (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                {Array.from({ length: 12 }).map((_, i) => (
                                    <div key={i} className="aspect-square rounded-xl bg-gray-200 dark:bg-slate-700 animate-pulse" />
                                ))}
                            </div>
                        )}

                        {/* Stats */}
                        {cleanupData && !cleanupLoading && (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <StatCard icon={HardDrive} label={isRTL ? 'ملفات فيزيائية' : 'Physical Files'} value={cleanupData.summary.totalPhysicalFiles} color="text-blue-600 dark:text-blue-400" bgColor="bg-white dark:bg-slate-800" />
                                <StatCard icon={Database} label={isRTL ? 'مراجع قاعدة البيانات' : 'DB References'} value={cleanupData.summary.totalDbReferences} color="text-green-600 dark:text-green-400" bgColor="bg-white dark:bg-slate-800" />
                                <StatCard icon={FileX} label={isRTL ? 'ملفات يتيمة' : 'Orphans'} value={deleted ? 0 : cleanupData.summary.orphansFound} color="text-red-600 dark:text-red-400" bgColor="bg-white dark:bg-slate-800" />
                                <StatCard icon={Trash2} label={isRTL ? 'في السلة' : 'In Trash'} value={trashCount} color="text-amber-600 dark:text-amber-400" bgColor="bg-white dark:bg-slate-800" />
                            </div>
                        )}

                        {/* Success State */}
                        {deleted && (
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-8 text-center">
                                <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-green-800 dark:text-green-300">{isRTL ? 'تم النقل إلى السلة!' : 'Files Moved to Trash!'}</h3>
                                <p className="text-green-600 dark:text-green-400 mt-2">
                                    {isRTL ? `${cleanupData?.summary.deletedCount || 0} ملف` : `${cleanupData?.summary.deletedCount || 0} files moved`}
                                </p>
                                <button onClick={() => { fetchCleanupData(); fetchTrashCount(); }} className="mt-4 px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-colors">
                                    {isRTL ? 'إعادة الفحص' : 'Re-scan'}
                                </button>
                            </motion.div>
                        )}

                        {/* Clean State */}
                        {cleanupData && cleanupData.summary.orphansFound === 0 && !deleted && !cleanupLoading && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-12 text-center">
                                <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-green-800 dark:text-green-300">{isRTL ? 'التخزين نظيف!' : 'Storage is Clean!'}</h3>
                                <p className="text-green-600 dark:text-green-400 mt-2">{isRTL ? 'لا توجد ملفات يتيمة' : 'No orphan files found'}</p>
                            </motion.div>
                        )}

                        {/* Orphan Browser */}
                        {cleanupData && cleanupData.summary.orphansFound > 0 && !deleted && !cleanupLoading && (
                            <>
                                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-4">
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <div className="relative flex-1">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={isRTL ? 'بحث...' : 'Search...'} className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 dark:bg-slate-900 border-none ring-1 ring-gray-200 dark:ring-slate-600 focus:ring-2 focus:ring-brand-orange text-sm" dir="ltr" />
                                        </div>
                                        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                                            <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                            <button onClick={() => setSelectedFolder(null)} className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${!selectedFolder ? 'bg-brand-orange text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400'}`}>
                                                {isRTL ? 'الكل' : 'All'} ({cleanupData.orphans.length})
                                            </button>
                                            {folders.map((folder) => {
                                                const count = cleanupData.orphans.filter((f) => f.startsWith(folder + '/')).length;
                                                return (
                                                    <button key={folder} onClick={() => setSelectedFolder(folder === selectedFolder ? null : folder)} className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${selectedFolder === folder ? 'bg-brand-orange text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400'}`}>
                                                        {folder.replace('/images/', '')} ({count})
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-3">
                                        {isRTL ? `عرض ${filteredOrphans.length} من ${cleanupData.orphans.length}` : `Showing ${filteredOrphans.length} of ${cleanupData.orphans.length}`}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                                    <AnimatePresence>
                                        {filteredOrphans.map((file, index) => (
                                            <motion.div key={file} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ delay: Math.min(index * 0.02, 0.5) }} className="group relative bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 overflow-hidden hover:border-red-300 dark:hover:border-red-700 hover:shadow-lg hover:shadow-red-500/10 transition-all cursor-pointer" onClick={() => isImage(file) && setPreviewImage(file)}>
                                                <div className="aspect-square bg-gray-50 dark:bg-slate-900 flex items-center justify-center overflow-hidden">
                                                    {isImage(file) ? (
                                                        <img src={file} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                                                    ) : (
                                                        <div className="flex flex-col items-center gap-1 text-gray-400 dark:text-gray-500">
                                                            <FileX className="w-8 h-8" />
                                                            <span className="text-xs">{file.split('.').pop()?.toUpperCase()}</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="absolute top-2 right-2">
                                                    <span className="px-1.5 py-0.5 bg-red-500/90 text-white text-[10px] font-bold rounded-md backdrop-blur-sm">{isRTL ? 'يتيم' : 'ORPHAN'}</span>
                                                </div>
                                                {isImage(file) && <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><Eye className="w-6 h-6 text-white" /></div>}
                                                <div className="p-2">
                                                    <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate font-mono" dir="ltr" title={file}>{file.split('/').pop()}</p>
                                                    <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate" dir="ltr">{getFolderLabel(file)}</p>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>

                                {filteredOrphans.length === 0 && (
                                    <div className="text-center py-12 text-gray-500">
                                        <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
                                        <p>{isRTL ? 'لا توجد نتائج' : 'No results found'}</p>
                                    </div>
                                )}

                                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 flex items-start gap-3">
                                    <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-bold text-amber-800 dark:text-amber-300 text-sm">{isRTL ? 'تنبيه مهم' : 'Important Notice'}</p>
                                        <p className="text-amber-700 dark:text-amber-400 text-xs mt-1">
                                            {isRTL ? 'هذه الملفات غير مرتبطة بأي سجل في قاعدة البيانات.' : 'These files are not linked to any database record.'}
                                        </p>
                                    </div>
                                </div>
                            </>
                        )}
                    </>
                )
            }

            {/* ══════════════════════════════════════════════════════════
                   MEDIA PREVIEW MODAL
               ══════════════════════════════════════════════════════════ */}
            <AnimatePresence>
                {previewMedia && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setPreviewMedia(null)}>
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative max-w-4xl w-full max-h-[90vh] rounded-2xl overflow-hidden bg-white dark:bg-slate-800 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                            {/* Header */}
                            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700">
                                <p className="text-sm font-mono text-gray-500 dark:text-gray-400 truncate max-w-[60%]" dir="ltr">{previewMedia.url}</p>
                                <button onClick={() => setPreviewMedia(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>

                            {/* Image */}
                            <div className="p-4 flex items-center justify-center bg-[repeating-conic-gradient(#0001_0%_25%,transparent_0%_50%)] dark:bg-[repeating-conic-gradient(#fff1_0%_25%,transparent_0%_50%)] bg-[length:20px_20px] max-h-[50vh] overflow-auto">
                                <img src={previewMedia.url} alt="" className="max-w-full max-h-[48vh] object-contain rounded-lg" />
                            </div>

                            {/* Metadata */}
                            <div className="p-4 border-t border-gray-200 dark:border-slate-700 space-y-3">
                                {/* Size / Dimensions */}
                                <div className="flex flex-wrap gap-3 text-xs text-gray-500 dark:text-gray-400">
                                    {previewMedia.size && <span>📦 {formatBytes(previewMedia.size)}</span>}
                                    {previewMedia.width && previewMedia.height && <span>📐 {previewMedia.width} × {previewMedia.height}</span>}
                                    {previewMedia.mimeType && <span>🏷️ {previewMedia.mimeType}</span>}
                                    {previewMedia.fileName && <span>📄 {previewMedia.fileName}</span>}
                                </div>

                                {/* Usage Badges */}
                                <div>
                                    <p className="text-xs font-bold text-gray-600 dark:text-gray-300 mb-2">
                                        {isRTL ? `مستخدم في: ${previewMedia._count.usages} مكان` : `Used in: ${previewMedia._count.usages} place(s)`}
                                    </p>
                                    {previewMedia.usages.length > 0 ? (
                                        <div className="flex flex-wrap gap-1.5">
                                            {previewMedia.usages.map((u, i) => {
                                                const label = ENTITY_LABELS[u.entity];
                                                const resolvedTitle = isRTL ? u.resolvedTitleAr : u.resolvedTitleEn;
                                                return (
                                                    <span key={i} className={`inline-flex items-center gap-1 px-2 py-1 text-[11px] font-bold rounded-lg ${label?.color || 'bg-gray-100 text-gray-600'}`}>
                                                        <Link2 className="w-3 h-3" />
                                                        {isRTL ? label?.ar : label?.en}: {resolvedTitle || u.entityId.substring(0, 8) + '…'}
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-[11px] font-bold rounded-lg">
                                            <Unlink2 className="w-3 h-3" />
                                            {isRTL ? 'غير مرتبط — يمكن حذفه' : 'Unlinked — safe to delete'}
                                        </span>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 pt-2 border-t border-gray-200 dark:border-slate-700">
                                    <a href={previewMedia.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-brand-orange hover:text-brand-darkOrange">
                                        <Download className="w-3 h-3" />
                                        {isRTL ? 'فتح في تبويب جديد' : 'Open in new tab'}
                                    </a>
                                    <div className="flex-1" />
                                    <button
                                        onClick={() => { setPreviewMedia(null); handleDeleteMedia(previewMedia); }}
                                        disabled={deletingId === previewMedia.id}
                                        className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all ${previewMedia._count.usages > 0
                                            ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-lg shadow-amber-500/25'
                                            : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg shadow-red-500/25'
                                            }`}
                                    >
                                        {deletingId === previewMedia.id ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : previewMedia._count.usages > 0 ? (
                                            <>
                                                <AlertTriangle className="w-4 h-4" />
                                                {isRTL ? 'حذف إجباري' : 'Force Delete'}
                                            </>
                                        ) : (
                                            <>
                                                <Trash2 className="w-4 h-4" />
                                                {isRTL ? 'حذف' : 'Delete'}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ══════════════════════════════════════════════════════════
                   TAB 3: TRASH VIEW (READ-ONLY)
               ══════════════════════════════════════════════════════════ */}
            {
                activeTab === 'trash' && (
                    <>
                        {/* Trash Stats */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <StatCard
                                icon={Trash2}
                                label={isRTL ? 'ملفات في السلة' : 'Files in Trash'}
                                value={trashCount}
                                color="text-red-600 dark:text-red-400"
                                bgColor="bg-white dark:bg-slate-800"
                            />
                            <StatCard
                                icon={HardDrive}
                                label={isRTL ? 'حجم السلة' : 'Trash Size'}
                                value={formatBytes(trashTotalSize)}
                                color="text-orange-600 dark:text-orange-400"
                                bgColor="bg-white dark:bg-slate-800"
                            />
                            <StatCard
                                icon={Eye}
                                label={isRTL ? 'الوضع' : 'Mode'}
                                value={isRTL ? 'عرض فقط' : 'Read Only'}
                                color="text-blue-600 dark:text-blue-400"
                                bgColor="bg-white dark:bg-slate-800"
                            />
                        </div>

                        {/* Info banner */}
                        <div className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 rounded-xl">
                            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
                            <p className="text-sm text-amber-800 dark:text-amber-300">
                                {isRTL
                                    ? 'هذه الصفحة للعرض فقط — لإفراغ السلة، استخدم زر "إفراغ سلة المهملات" في تبويب مكتبة الوسائط.'
                                    : 'This page is view-only — to empty the trash, use the "Empty Trash" button in the Media Library tab.'}
                            </p>
                        </div>

                        {/* Refresh button */}
                        <div className="flex justify-end">
                            <button
                                onClick={fetchTrashFiles}
                                disabled={trashLoading}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-xl transition-all font-medium text-sm"
                            >
                                <RefreshCw className={`w-4 h-4 ${trashLoading ? 'animate-spin' : ''}`} />
                                {isRTL ? 'تحديث' : 'Refresh'}
                            </button>
                        </div>

                        {/* Loading state */}
                        {trashLoading && (
                            <div className="flex items-center justify-center py-20">
                                <div className="flex flex-col items-center gap-3">
                                    <RefreshCw className="w-8 h-8 text-brand-orange animate-spin" />
                                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                                        {isRTL ? 'جاري تحميل ملفات السلة...' : 'Loading trash files...'}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Empty state */}
                        {!trashLoading && trashFiles.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-full mb-4">
                                    <CheckCircle2 className="w-12 h-12 text-green-500" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                                    {isRTL ? 'سلة المهملات فارغة' : 'Trash is Empty'}
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400 text-sm">
                                    {isRTL ? 'لا توجد ملفات محذوفة حالياً.' : 'No deleted files at the moment.'}
                                </p>
                            </div>
                        )}

                        {/* File grid */}
                        {!trashLoading && trashFiles.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                {trashFiles.map((file, idx) => (
                                    <motion.div
                                        key={file.relativePath || idx}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: Math.min(idx * 0.03, 0.5) }}
                                        className="group bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden hover:border-red-300 dark:hover:border-red-600/50 transition-colors"
                                    >
                                        {/* Thumbnail */}
                                        <div className="aspect-square bg-gray-50 dark:bg-slate-900 flex items-center justify-center overflow-hidden">
                                            {file.isImage ? (
                                                <img
                                                    src={`/.trash/${file.relativePath}`}
                                                    alt={file.name}
                                                    className="w-full h-full object-cover"
                                                    loading="lazy"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).style.display = 'none';
                                                        (e.target as HTMLImageElement).parentElement!.innerHTML = '<div class="flex flex-col items-center gap-2 text-gray-400"><svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg></div>';
                                                    }}
                                                />
                                            ) : (
                                                <div className="flex flex-col items-center gap-2 text-gray-400 dark:text-gray-500">
                                                    <FileX className="w-10 h-10" />
                                                    <span className="text-xs font-mono uppercase">{file.fileType}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* File Info */}
                                        <div className="p-3 space-y-1.5">
                                            <p className="text-xs font-medium text-gray-900 dark:text-white truncate" title={file.name} dir="ltr">
                                                {file.name}
                                            </p>
                                            <div className="flex items-center justify-between text-[10px] text-gray-500 dark:text-gray-400">
                                                <span className="px-1.5 py-0.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded font-medium">
                                                    {file.fileType}
                                                </span>
                                                <span>{formatBytes(file.size)}</span>
                                            </div>
                                            <p className="text-[10px] text-gray-400 dark:text-gray-500" dir="ltr">
                                                {isRTL ? 'حُذف: ' : 'Deleted: '}
                                                {new Date(file.modifiedAt).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US', {
                                                    year: 'numeric', month: 'short', day: 'numeric',
                                                    hour: '2-digit', minute: '2-digit'
                                                })}
                                            </p>
                                            {file.relativePath.includes('/') && (
                                                <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate font-mono" dir="ltr" title={file.relativePath}>
                                                    📁 {file.relativePath.split('/').slice(0, -1).join('/')}
                                                </p>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </>
                )
            }

            {/* ── Orphan Image Preview Modal (legacy) ───────────────── */}
            <AnimatePresence>
                {previewImage && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setPreviewImage(null)}>
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative max-w-4xl max-h-[90vh] rounded-2xl overflow-hidden bg-white dark:bg-slate-800 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700">
                                <p className="text-sm font-mono text-gray-500 dark:text-gray-400 truncate max-w-[80%]" dir="ltr">{previewImage}</p>
                                <button onClick={() => setPreviewImage(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"><X className="w-5 h-5 text-gray-500" /></button>
                            </div>
                            <div className="p-4 flex items-center justify-center bg-[repeating-conic-gradient(#0001_0%_25%,transparent_0%_50%)] dark:bg-[repeating-conic-gradient(#fff1_0%_25%,transparent_0%_50%)] bg-[length:20px_20px]">
                                <img src={previewImage} alt="" className="max-w-full max-h-[70vh] object-contain rounded-lg" />
                            </div>
                            <div className="p-3 border-t border-gray-200 dark:border-slate-700 flex items-center justify-between">
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold rounded-lg">
                                    <FileX className="w-3 h-3" />
                                    {isRTL ? 'ملف يتيم — سيتم حذفه' : 'Orphan file — will be deleted'}
                                </span>
                                <a href={previewImage} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-brand-orange hover:text-brand-darkOrange">
                                    <Download className="w-3 h-3" />
                                    {isRTL ? 'فتح' : 'Open'}
                                </a>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div >
    );
}
