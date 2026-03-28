'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Mail,
    Star,
    Trash2,
    Archive,
    Eye,
    EyeOff,
    MessageSquare,
    FileText,
    Filter,
    RefreshCw,
    ChevronDown,
    Search,
    MapPin,
    Box,
    Calendar,
    Phone as PhoneIcon,
    User
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useConfirm } from '@/contexts/ConfirmContext';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface Message {
    id: string;
    type: 'INQUIRY' | 'QUOTE_REQUEST';
    name: string;
    email: string;
    phone: string;
    countryCode: string;
    message: string | null;
    origin: string | null;
    destination: string | null;
    containerType: string | null;
    containerQty: number | null;
    status: string;
    isRead: boolean;
    isStarred: boolean;
    isArchived: boolean;
    createdAt: string;
}

type FilterType = 'all' | 'INQUIRY' | 'QUOTE_REQUEST';
type StatusFilter = 'all' | 'unread' | 'starred' | 'archived';

export default function MessagesPage() {
    const { language, t } = useLanguage();
    const { confirm } = useConfirm();
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
    const [typeFilter, setTypeFilter] = useState<FilterType>('all');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
    const [searchQuery, setSearchQuery] = useState('');

    const tr = (ar: string, en: string) => language === 'ar' ? ar : en;

    const fetchMessages = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (typeFilter !== 'all') params.set('type', typeFilter);
            if (statusFilter === 'archived') params.set('archived', 'true');

            const res = await fetch(`/api/contact?${params.toString()}`, { credentials: 'same-origin' });
            const data = await res.json();
            setMessages(data);
        } catch (error) {
            console.error('Error fetching messages:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, [typeFilter, statusFilter]);

    const updateMessage = async (id: string, updates: Partial<Message>) => {
        try {
            await fetch('/api/contact', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'same-origin',
                body: JSON.stringify({ id, ...updates }),
            });
            setMessages(messages.map(m => m.id === id ? { ...m, ...updates } : m));
            if (selectedMessage?.id === id) {
                setSelectedMessage({ ...selectedMessage, ...updates });
            }
        } catch (error) {
            console.error('Error updating message:', error);
        }
    };

    const deleteMessage = async (id: string) => {
        const confirmed = await confirm({
            title: tr('حذف الرسالة', 'Delete Message'),
            message: tr('هل أنت متأكد من حذف هذه الرسالة؟', 'Are you sure you want to delete this message?'),
            confirmText: tr('حذف', 'Delete'),
            cancelText: tr('إلغاء', 'Cancel'),
            type: 'danger'
        });
        if (!confirmed) return;

        try {
            await fetch(`/api/contact?id=${id}`, { method: 'DELETE', credentials: 'same-origin' });
            setMessages(messages.filter(m => m.id !== id));
            if (selectedMessage?.id === id) setSelectedMessage(null);
        } catch (error) {
            console.error('Error deleting message:', error);
        }
    };

    const handleSelectMessage = async (message: Message) => {
        setSelectedMessage(message);
        if (!message.isRead) {
            await updateMessage(message.id, { isRead: true });
        }
    };

    // Filter messages
    const filteredMessages = messages.filter(m => {
        if (statusFilter === 'unread' && m.isRead) return false;
        if (statusFilter === 'starred' && !m.isStarred) return false;
        if (statusFilter === 'archived' !== m.isArchived) return false;
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            return (
                m.name.toLowerCase().includes(query) ||
                m.email.toLowerCase().includes(query) ||
                m.message?.toLowerCase().includes(query) ||
                m.origin?.toLowerCase().includes(query) ||
                m.destination?.toLowerCase().includes(query)
            );
        }
        return true;
    });

    const unreadCount = messages.filter(m => !m.isRead && !m.isArchived).length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-marine-900 dark:text-white flex items-center gap-2">
                        <Mail className="w-7 h-7 text-brand-orange" />
                        {tr('الرسائل الواردة', 'Inbox Messages')}
                        {unreadCount > 0 && (
                            <span className="px-2 py-0.5 text-xs font-bold bg-red-500 text-white rounded-full">
                                {unreadCount}
                            </span>
                        )}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        {tr('إدارة رسائل العملاء وطلبات عروض الأسعار', 'Manage customer inquiries and quote requests')}
                    </p>
                </div>

                <button
                    onClick={fetchMessages}
                    className="flex items-center gap-2 px-4 py-2 bg-marine-100 dark:bg-marine-900/30 text-marine-700 dark:text-marine-300 rounded-xl hover:bg-marine-200 dark:hover:bg-marine-900/50 transition-colors"
                >
                    <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
                    {tr('تحديث', 'Refresh')}
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={tr('بحث...', 'Search...')}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 focus:border-marine-500 focus:ring-2 focus:ring-marine-200 dark:text-white"
                    />
                </div>

                {/* Type Filter */}
                <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-gray-400" />
                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value as FilterType)}
                        className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 dark:text-white"
                    >
                        <option value="all">{tr('الكل', 'All Types')}</option>
                        <option value="INQUIRY">{tr('استفسارات', 'Inquiries')}</option>
                        <option value="QUOTE_REQUEST">{tr('عروض أسعار', 'Quote Requests')}</option>
                    </select>
                </div>

                {/* Status Filter */}
                <div className="flex gap-2">
                    {(['all', 'unread', 'starred', 'archived'] as StatusFilter[]).map((status) => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={cn(
                                "px-4 py-2 rounded-xl text-sm font-medium transition-colors",
                                statusFilter === status
                                    ? "bg-marine-600 text-white"
                                    : "bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700"
                            )}
                        >
                            {status === 'all' && tr('الكل', 'All')}
                            {status === 'unread' && tr('غير مقروءة', 'Unread')}
                            {status === 'starred' && tr('مميزة', 'Starred')}
                            {status === 'archived' && tr('مؤرشفة', 'Archived')}
                        </button>
                    ))}
                </div>
            </div>

            {/* Messages List & Detail View */}
            <div className="grid lg:grid-cols-5 gap-6">
                {/* Messages List */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 overflow-hidden">
                    {loading ? (
                        <div className="p-8 text-center text-gray-500">
                            <RefreshCw className="w-8 h-8 mx-auto mb-2 animate-spin" />
                            {tr('جاري التحميل...', 'Loading...')}
                        </div>
                    ) : filteredMessages.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            <Mail className="w-12 h-12 mx-auto mb-2 opacity-30" />
                            {tr('لا توجد رسائل', 'No messages')}
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100 dark:divide-slate-800 max-h-[600px] overflow-y-auto">
                            {filteredMessages.map((message) => (
                                <motion.div
                                    key={message.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    onClick={() => handleSelectMessage(message)}
                                    className={cn(
                                        "p-4 cursor-pointer transition-all duration-200 relative",
                                        selectedMessage?.id === message.id
                                            ? "bg-marine-50 dark:bg-marine-900/30"
                                            : message.isRead
                                                ? "bg-white dark:bg-slate-900 hover:bg-gray-50 dark:hover:bg-slate-800/70"
                                                : "bg-blue-50/50 dark:bg-blue-900/10 hover:bg-blue-100/50 dark:hover:bg-blue-900/20",
                                        !message.isRead && "border-l-4 border-brand-orange"
                                    )}
                                >
                                    {/* Unread Indicator Dot */}
                                    {!message.isRead && (
                                        <div className="absolute top-4 end-4 w-2.5 h-2.5 bg-brand-orange rounded-full animate-pulse" />
                                    )}

                                    <div className="flex items-start gap-3">
                                        <div className={cn(
                                            "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                                            message.type === 'INQUIRY'
                                                ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600"
                                                : "bg-orange-100 dark:bg-orange-900/30 text-orange-600"
                                        )}>
                                            {message.type === 'INQUIRY' ? <MessageSquare className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className={cn(
                                                    "text-sm truncate",
                                                    !message.isRead
                                                        ? "font-bold text-marine-900 dark:text-white"
                                                        : "font-medium text-gray-600 dark:text-gray-400"
                                                )}>
                                                    {message.name}
                                                </span>
                                                <span className="text-xs text-gray-400 shrink-0 me-4">
                                                    {format(new Date(message.createdAt), 'MMM d', { locale: language === 'ar' ? ar : undefined })}
                                                </span>
                                            </div>

                                            <p className={cn(
                                                "text-xs truncate mb-1",
                                                !message.isRead
                                                    ? "text-gray-700 dark:text-gray-300"
                                                    : "text-gray-500 dark:text-gray-500"
                                            )}>
                                                {message.email || tr('بدون بريد إلكتروني', 'No email')}
                                            </p>

                                            <p className={cn(
                                                "text-xs truncate",
                                                !message.isRead
                                                    ? "text-gray-600 dark:text-gray-400"
                                                    : "text-gray-400 dark:text-gray-600"
                                            )}>
                                                {message.type === 'INQUIRY'
                                                    ? message.message?.substring(0, 50)
                                                    : `${message.origin} → ${message.destination}`
                                                }
                                            </p>
                                        </div>

                                        {message.isStarred && (
                                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 shrink-0" />
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Message Detail */}
                <div className="lg:col-span-3">
                    <AnimatePresence mode="wait">
                        {selectedMessage ? (
                            <motion.div
                                key={selectedMessage.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 overflow-hidden"
                            >
                                {/* Detail Header */}
                                <div className="p-6 border-b border-gray-100 dark:border-slate-800">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "w-12 h-12 rounded-full flex items-center justify-center",
                                                selectedMessage.type === 'INQUIRY'
                                                    ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600"
                                                    : "bg-orange-100 dark:bg-orange-900/30 text-orange-600"
                                            )}>
                                                {selectedMessage.type === 'INQUIRY' ? <MessageSquare className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg text-marine-900 dark:text-white">
                                                    {selectedMessage.name}
                                                </h3>
                                                <span className={cn(
                                                    "text-xs font-bold px-2 py-0.5 rounded-full",
                                                    selectedMessage.type === 'INQUIRY'
                                                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                                                        : "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300"
                                                )}>
                                                    {selectedMessage.type === 'INQUIRY' ? tr('استفسار', 'Inquiry') : tr('طلب عرض سعر', 'Quote Request')}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => updateMessage(selectedMessage.id, { isStarred: !selectedMessage.isStarred })}
                                                className={cn(
                                                    "p-2 rounded-lg transition-colors",
                                                    selectedMessage.isStarred
                                                        ? "bg-yellow-100 text-yellow-600"
                                                        : "hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400"
                                                )}
                                            >
                                                <Star className={cn("w-5 h-5", selectedMessage.isStarred && "fill-yellow-500")} />
                                            </button>
                                            <button
                                                onClick={() => updateMessage(selectedMessage.id, { isArchived: !selectedMessage.isArchived })}
                                                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400 hover:text-gray-600"
                                            >
                                                <Archive className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => deleteMessage(selectedMessage.id)}
                                                className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-400 hover:text-red-600"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Contact Info */}
                                    <div className="flex flex-wrap gap-4 text-sm">
                                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                            <Mail className="w-4 h-4" />
                                            <a href={`mailto:${selectedMessage.email}`} className="hover:text-marine-600">
                                                {selectedMessage.email}
                                            </a>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                            <PhoneIcon className="w-4 h-4" />
                                            <a href={`tel:${selectedMessage.phone}`} className="hover:text-marine-600">
                                                {selectedMessage.phone}
                                            </a>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-400">
                                            <Calendar className="w-4 h-4" />
                                            {format(new Date(selectedMessage.createdAt), 'PPpp', { locale: language === 'ar' ? ar : undefined })}
                                        </div>
                                    </div>
                                </div>

                                {/* Detail Body */}
                                <div className="p-6">
                                    {selectedMessage.type === 'INQUIRY' ? (
                                        <div>
                                            <h4 className="font-bold text-gray-700 dark:text-gray-300 mb-3">
                                                {tr('الرسالة', 'Message')}
                                            </h4>
                                            <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-xl text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                                {selectedMessage.message}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {/* Quote Details */}
                                            <div className="grid md:grid-cols-2 gap-4">
                                                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                                                    <div className="flex items-center gap-2 text-green-700 dark:text-green-400 mb-1">
                                                        <MapPin className="w-4 h-4" />
                                                        <span className="font-medium">{tr('من', 'From')}</span>
                                                    </div>
                                                    <p className="text-gray-700 dark:text-gray-300">{selectedMessage.origin}</p>
                                                </div>
                                                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
                                                    <div className="flex items-center gap-2 text-red-700 dark:text-red-400 mb-1">
                                                        <MapPin className="w-4 h-4" />
                                                        <span className="font-medium">{tr('إلى', 'To')}</span>
                                                    </div>
                                                    <p className="text-gray-700 dark:text-gray-300">{selectedMessage.destination}</p>
                                                </div>
                                            </div>

                                            <div className="grid md:grid-cols-2 gap-4">
                                                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                                                    <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 mb-1">
                                                        <Box className="w-4 h-4" />
                                                        <span className="font-medium">{tr('نوع الحاوية', 'Container Type')}</span>
                                                    </div>
                                                    <p className="text-gray-700 dark:text-gray-300">{selectedMessage.containerType}</p>
                                                </div>
                                                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                                                    <div className="flex items-center gap-2 text-purple-700 dark:text-purple-400 mb-1">
                                                        <span className="font-medium">{tr('العدد', 'Quantity')}</span>
                                                    </div>
                                                    <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">{selectedMessage.containerQty}</p>
                                                </div>
                                            </div>

                                            {selectedMessage.message && (
                                                <div>
                                                    <h4 className="font-bold text-gray-700 dark:text-gray-300 mb-3">
                                                        {tr('ملاحظات إضافية', 'Additional Notes')}
                                                    </h4>
                                                    <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-xl text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                                        {selectedMessage.message}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="h-full min-h-[400px] flex items-center justify-center bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800"
                            >
                                <div className="text-center text-gray-400">
                                    <Mail className="w-16 h-16 mx-auto mb-4 opacity-30" />
                                    <p>{tr('اختر رسالة لعرض التفاصيل', 'Select a message to view details')}</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
