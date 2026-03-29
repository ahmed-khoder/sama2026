'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, User, Shield, Settings, Save, RefreshCw, Plus, Edit2, Trash2,
    ToggleLeft, ToggleRight, Mail, Phone, Camera, Eye, EyeOff, Check, X,
    Globe, Moon, Sun, Monitor, Upload, Key, Server, Database, Zap, CheckCircle2, XCircle, AlertTriangle
} from 'lucide-react';
import { authFetch } from '@/lib/auth-fetch';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { useConfirm } from '@/contexts/ConfirmContext';
import { PERMISSIONS, ALL_PERMISSION_KEYS, DEFAULT_EMPLOYEE_PERMISSIONS, parsePermissions } from '@/lib/permissions';

interface UserData {
    id: string;
    email: string;
    name: string | null;
    phone: string | null;
    role: string;
    isActive: boolean;
    avatar: string | null;
    preferredLanguage: string;
    theme: string;
    permissions: string;
    createdAt: string;
}

const roleColors: Record<string, string> = {
    ADMIN: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
    EMPLOYEE: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
    CLIENT: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
};

export default function SettingsPage() {
    const { language, setLanguage } = useLanguage();
    const { theme: currentTheme, setTheme } = useTheme();
    const isRTL = language === 'ar';
    const { user: currentUser, login } = useAuth();
    const { success, error, warning } = useToast();
    const { confirm } = useConfirm();
    const avatarInputRef = useRef<HTMLInputElement>(null);

    const [activeTab, setActiveTab] = useState('users');
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);

    // Odoo Settings State
    const [odooSettings, setOdooSettings] = useState({ url: '', database: '', username: '', password: '' });
    const [odooTesting, setOdooTesting] = useState(false);
    const [odooConnectionStatus, setOdooConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [showOdooPassword, setShowOdooPassword] = useState(false);
    const [odooHasChanges, setOdooHasChanges] = useState(false);

    // User form state
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingUser, setEditingUser] = useState<UserData | null>(null);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
        phone: '',
        role: 'EMPLOYEE',
        isActive: true,
        permissions: [...DEFAULT_EMPLOYEE_PERMISSIONS] as string[],
    });

    // Profile form state
    const [profileData, setProfileData] = useState({
        name: '',
        email: '',
        phone: '',
        avatar: '',
        preferredLanguage: 'ar',
        theme: 'system',
    });

    // Password change state
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false,
    });

    // Admin password reset modal
    const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
    const [resetPasswordUserId, setResetPasswordUserId] = useState<string | null>(null);
    const [resetPasswordValue, setResetPasswordValue] = useState('');

    // Fetch users
    const fetchUsers = useCallback(async () => {
        try {
            const res = await fetch('/api/users', { credentials: 'same-origin' });
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            }
        } catch (err) {
            console.error('Failed to fetch users:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch Odoo settings from DB
    const fetchOdooSettings = useCallback(async () => {
        try {
            const res = await authFetch('/api/cms/odoo-settings');
            if (res.ok) {
                const data = await res.json();
                setOdooSettings({ url: data.url || '', database: data.database || '', username: data.username || '', password: data.password || '' });
            }
        } catch (err) {
            console.error('Failed to fetch Odoo settings:', err);
        }
    }, []);

    // Save Odoo settings to DB
    const handleSaveOdoo = async () => {
        setSaving(true);
        try {
            const res = await authFetch('/api/cms/odoo-settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(odooSettings),
            });
            if (res.ok) {
                const data = await res.json();
                setOdooSettings(prev => ({ ...prev, password: data.password }));
                setOdooHasChanges(false);
                success(isRTL ? 'تم حفظ إعدادات أودو بنجاح' : 'Odoo settings saved successfully');
            } else {
                throw new Error('Save failed');
            }
        } catch (err) {
            error(isRTL ? 'فشل حفظ إعدادات أودو' : 'Failed to save Odoo settings');
        } finally { setSaving(false); }
    };

    // Test Odoo connection
    const handleTestOdoo = async () => {
        setOdooTesting(true);
        setOdooConnectionStatus('idle');
        try {
            const res = await authFetch('/api/cms/odoo-settings/test', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(odooSettings),
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setOdooConnectionStatus('success');
                success(isRTL ? 'تم الاتصال بنجاح بخادم أودو! ✓' : 'Successfully connected to Odoo! ✓');
            } else {
                throw new Error(data.error || 'Connection failed');
            }
        } catch (err: any) {
            setOdooConnectionStatus('error');
            error(err.message || (isRTL ? 'فشل الاتصال بالخادم' : 'Failed to connect'));
        } finally { setOdooTesting(false); }
    };

    useEffect(() => {
        fetchUsers();
        fetchOdooSettings();
        // Initialize profile with current user data from database
        if (currentUser) {
            setProfileData({
                name: currentUser.name || '',
                email: currentUser.email || '',
                phone: (currentUser as any).phone || '',
                avatar: currentUser.avatar || '',
                preferredLanguage: (currentUser as any).preferredLanguage || language,
                theme: (currentUser as any).theme || currentTheme,
            });
        }
    }, [fetchUsers, fetchOdooSettings, currentUser, language, currentTheme]);

    // Upload avatar
    const handleAvatarUpload = async (file: File) => {
        setUploadingAvatar(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('folder', 'avatars');

            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
                credentials: 'same-origin',
            });

            if (res.ok) {
                const data = await res.json();
                setProfileData(prev => ({ ...prev, avatar: data.path }));
                success(isRTL ? 'تم رفع الصورة بنجاح' : 'Avatar uploaded successfully');
            } else {
                error(isRTL ? 'فشل في رفع الصورة' : 'Failed to upload avatar');
            }
        } catch (err) {
            error(isRTL ? 'حدث خطأ في رفع الصورة' : 'Error uploading avatar');
        } finally {
            setUploadingAvatar(false);
        }
    };

    // Add/Edit User
    const handleSaveUser = async () => {
        setSaving(true);
        try {
            if (editingUser) {
                // Update
                const res = await fetch(`/api/users/${editingUser.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'same-origin',
                    body: JSON.stringify({
                        name: formData.name,
                        phone: formData.phone,
                        role: formData.role,
                        isActive: formData.isActive,
                        permissions: formData.permissions,
                        ...(formData.password ? { password: formData.password } : {}),
                    }),
                });
                if (res.ok) {
                    success(isRTL ? 'تم تحديث المستخدم بنجاح' : 'User updated successfully');
                    fetchUsers();
                    setEditingUser(null);
                    setShowAddModal(false);
                }
            } else {
                // Create
                if (!formData.email || !formData.password) {
                    warning(isRTL ? 'البريد والكلمة السرية مطلوبة' : 'Email and password are required');
                    setSaving(false);
                    return;
                }
                const res = await fetch('/api/users', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'same-origin',
                    body: JSON.stringify({
                        ...formData,
                        permissions: formData.permissions,
                    }),
                });
                if (res.ok) {
                    success(isRTL ? 'تم إضافة المستخدم بنجاح' : 'User added successfully');
                    fetchUsers();
                    setShowAddModal(false);
                    resetForm();
                } else {
                    const data = await res.json();
                    error(data.error || 'Failed to add user');
                }
            }
        } catch (err) {
            error(isRTL ? 'حدث خطأ' : 'An error occurred');
        } finally {
            setSaving(false);
        }
    };

    // Delete User
    const handleDeleteUser = async (id: string) => {
        const confirmed = await confirm({
            title: isRTL ? 'حذف المستخدم' : 'Delete User',
            message: isRTL ? 'هل تريد حذف هذا المستخدم؟' : 'Are you sure you want to delete this user?',
            confirmText: isRTL ? 'حذف' : 'Delete',
            cancelText: isRTL ? 'إلغاء' : 'Cancel',
            type: 'danger',
        });
        if (confirmed) {
            await fetch(`/api/users/${id}`, { method: 'DELETE', credentials: 'same-origin' });
            success(isRTL ? 'تم الحذف' : 'User deleted');
            fetchUsers();
        }
    };

    // Toggle user active status
    const handleToggleActive = async (id: string, isActive: boolean) => {
        await fetch(`/api/users/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify({ isActive }),
        });
        fetchUsers();
    };

    // Admin Reset Password (no old password required)
    const handleAdminResetPassword = async () => {
        if (!resetPasswordValue || resetPasswordValue.length < 6) {
            error(isRTL ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' : 'Password must be at least 6 characters');
            return;
        }

        setSaving(true);
        try {
            const res = await fetch(`/api/users/${resetPasswordUserId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'same-origin',
                body: JSON.stringify({ password: resetPasswordValue }),
            });

            if (res.ok) {
                success(isRTL ? 'تم تغيير كلمة المرور بنجاح' : 'Password reset successfully');
                setShowResetPasswordModal(false);
                setResetPasswordValue('');
                setResetPasswordUserId(null);
            } else {
                error(isRTL ? 'فشل في تغيير كلمة المرور' : 'Failed to reset password');
            }
        } catch (err) {
            error(isRTL ? 'حدث خطأ' : 'An error occurred');
        } finally {
            setSaving(false);
        }
    };

    // Save Profile - Saves to database AND applies language/theme
    const handleSaveProfile = async () => {
        if (!currentUser?.id) {
            error(isRTL ? 'لم يتم العثور على بيانات المستخدم' : 'User data not found');
            return;
        }

        setSaving(true);
        try {
            // Save to database
            const res = await fetch(`/api/users/${currentUser.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'same-origin',
                body: JSON.stringify({
                    name: profileData.name,
                    phone: profileData.phone,
                    avatar: profileData.avatar,
                    preferredLanguage: profileData.preferredLanguage,
                    theme: profileData.theme,
                }),
            });

            if (!res.ok) {
                throw new Error('Failed to save');
            }

            // Update local state — token is managed by HttpOnly cookie
            const updatedUserData = await res.json();
            login({
                ...currentUser,
                ...updatedUserData,
            });

            // Apply language change immediately
            if (profileData.preferredLanguage !== language) {
                setLanguage(profileData.preferredLanguage as 'ar' | 'en');
            }

            // Apply theme change immediately
            if (profileData.theme !== currentTheme) {
                if (profileData.theme === 'system') {
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                    setTheme(prefersDark ? 'dark' : 'light');
                } else {
                    setTheme(profileData.theme as 'light' | 'dark');
                }
            }

            success(isRTL ? 'تم حفظ الإعدادات بنجاح' : 'Settings saved successfully');
        } catch (err) {
            console.error('Save error:', err);
            error(isRTL ? 'فشل في الحفظ' : 'Failed to save');
        } finally {
            setSaving(false);
        }
    };

    // Change Password (for current user)
    const handleChangePassword = async () => {
        if (!currentUser?.id) {
            error(isRTL ? 'لم يتم العثور على بيانات المستخدم' : 'User data not found');
            return;
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            error(isRTL ? 'كلمة المرور غير متطابقة' : 'Passwords do not match');
            return;
        }
        if (passwordData.newPassword.length < 6) {
            error(isRTL ? 'كلمة المرور قصيرة جداً' : 'Password is too short');
            return;
        }

        setSaving(true);
        try {
            // Call password change API
            const res = await fetch(`/api/users/${currentUser.id}/password`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'same-origin',
                body: JSON.stringify({
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword,
                }),
            });

            if (res.ok) {
                success(isRTL ? 'تم تغيير كلمة المرور بنجاح' : 'Password changed successfully');
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            } else {
                const data = await res.json();
                error(data.error || (isRTL ? 'فشل في تغيير كلمة المرور' : 'Failed to change password'));
            }
        } catch (err) {
            console.error('Password change error:', err);
            error(isRTL ? 'فشل في تغيير كلمة المرور' : 'Failed to change password');
        } finally {
            setSaving(false);
        }
    };

    const resetForm = () => {
        setFormData({
            email: '',
            password: '',
            name: '',
            phone: '',
            role: 'EMPLOYEE',
            isActive: true,
            permissions: [...DEFAULT_EMPLOYEE_PERMISSIONS],
        });
    };

    const openEditModal = (user: UserData) => {
        setEditingUser(user);
        setFormData({
            email: user.email,
            password: '',
            name: user.name || '',
            phone: user.phone || '',
            role: user.role,
            isActive: user.isActive,
            permissions: parsePermissions(user.permissions),
        });
        setShowAddModal(true);
    };

    const openResetPasswordModal = (userId: string) => {
        setResetPasswordUserId(userId);
        setResetPasswordValue('');
        setShowResetPasswordModal(true);
    };

    const tabs = [
        { id: 'users', icon: Users, labelAr: 'المستخدمين', labelEn: 'Users' },
        { id: 'profile', icon: User, labelAr: 'البروفايل', labelEn: 'Profile' },
        { id: 'security', icon: Shield, labelAr: 'الأمان', labelEn: 'Security' },
        { id: 'odoo', icon: Server, labelAr: 'ربط أودو', labelEn: 'Odoo ERP' },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <RefreshCw className="w-8 h-8 animate-spin text-brand-orange" />
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <div className="p-2 bg-brand-orange/10 rounded-xl">
                            <Settings className="w-6 h-6 text-brand-orange" />
                        </div>
                        {isRTL ? 'إعدادات النظام' : 'System Settings'}
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">
                        {isRTL ? 'إدارة المستخدمين والإعدادات الشخصية' : 'Manage users and personal settings'}
                    </p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 bg-gray-100 dark:bg-slate-800 p-1.5 rounded-2xl overflow-x-auto">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === tab.id
                            ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                            }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {isRTL ? tab.labelAr : tab.labelEn}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                >
                    {/* Users Tab */}
                    {activeTab === 'users' && (
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                                    {isRTL ? 'إدارة المستخدمين' : 'User Management'}
                                </h2>
                                <button
                                    onClick={() => { resetForm(); setEditingUser(null); setShowAddModal(true); }}
                                    className="flex items-center gap-2 px-4 py-2 bg-marine-600 hover:bg-marine-700 text-white rounded-xl transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                    {isRTL ? 'مستخدم جديد' : 'New User'}
                                </button>
                            </div>

                            {/* Users Grid */}
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {users.map((user) => (
                                    <motion.div
                                        key={user.id}
                                        layout
                                        className={`relative p-4 rounded-xl border transition-all ${user.isActive
                                            ? 'bg-gray-50 dark:bg-slate-900 border-gray-200 dark:border-slate-700'
                                            : 'bg-gray-100 dark:bg-slate-900/50 border-gray-200/50 dark:border-slate-700/50 opacity-60'
                                            }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            {/* Avatar */}
                                            <div className="relative">
                                                <img
                                                    src={user.avatar || `https://ui-avatars.com/api/?name=${user.name || user.email}&background=0ea5e9&color=fff`}
                                                    alt={user.name || ''}
                                                    className="w-12 h-12 rounded-full object-cover"
                                                />
                                                <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 ${user.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-gray-900 dark:text-white truncate">
                                                    {user.name || 'No Name'}
                                                </h3>
                                                <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                                <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${roleColors[user.role] || roleColors.CLIENT}`}>
                                                    {user.role}
                                                </span>
                                                {/* Permission count badge for employees */}
                                                {user.role === 'EMPLOYEE' && (
                                                    <span className="inline-block mt-1 ms-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400">
                                                        {parsePermissions(user.permissions).length}/{ALL_PERMISSION_KEYS.length} {isRTL ? 'صلاحية' : 'perms'}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-200 dark:border-slate-700">
                                            <button
                                                onClick={() => handleToggleActive(user.id, !user.isActive)}
                                                className={`p-2 rounded-lg transition-colors ${user.isActive
                                                    ? 'bg-green-100 dark:bg-green-900/30 text-green-600'
                                                    : 'bg-gray-100 dark:bg-slate-700 text-gray-400'
                                                    }`}
                                                title={isRTL ? 'تفعيل/تعطيل' : 'Toggle Active'}
                                            >
                                                {user.isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                                            </button>
                                            <button
                                                onClick={() => openEditModal(user)}
                                                className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg transition-colors"
                                                title={isRTL ? 'تعديل' : 'Edit'}
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => openResetPasswordModal(user.id)}
                                                className="p-2 bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 hover:bg-yellow-100 dark:hover:bg-yellow-900/50 rounded-lg transition-colors"
                                                title={isRTL ? 'تغيير كلمة المرور' : 'Reset Password'}
                                            >
                                                <Key className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteUser(user.id)}
                                                className="p-2 bg-red-50 dark:bg-red-900/30 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg transition-colors"
                                                title={isRTL ? 'حذف' : 'Delete'}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {users.length === 0 && (
                                <div className="text-center py-12 text-gray-500">
                                    <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                    <p>{isRTL ? 'لا يوجد مستخدمين' : 'No users found'}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Profile Tab */}
                    {activeTab === 'profile' && (
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 space-y-6">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                                {isRTL ? 'البروفايل الشخصي' : 'Personal Profile'}
                            </h2>

                            <div className="grid md:grid-cols-2 gap-6">
                                {/* Avatar with upload */}
                                <div className="md:col-span-2 flex items-center gap-6">
                                    <div className="relative group">
                                        <img
                                            src={profileData.avatar || `https://ui-avatars.com/api/?name=${profileData.name || 'User'}&background=0ea5e9&color=fff&size=128`}
                                            alt="Avatar"
                                            className="w-24 h-24 rounded-full object-cover border-4 border-gray-200 dark:border-slate-700"
                                        />
                                        <button
                                            onClick={() => avatarInputRef.current?.click()}
                                            disabled={uploadingAvatar}
                                            className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            {uploadingAvatar ? (
                                                <RefreshCw className="w-6 h-6 text-white animate-spin" />
                                            ) : (
                                                <Camera className="w-6 h-6 text-white" />
                                            )}
                                        </button>
                                        <input
                                            ref={avatarInputRef}
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => {
                                                if (e.target.files?.[0]) {
                                                    handleAvatarUpload(e.target.files[0]);
                                                }
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 dark:text-white">{profileData.name || 'User'}</h3>
                                        <p className="text-sm text-gray-500">{profileData.email}</p>
                                        <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${roleColors[currentUser?.role || 'CLIENT']}`}>
                                            {currentUser?.role || 'CLIENT'}
                                        </span>
                                        <button
                                            onClick={() => avatarInputRef.current?.click()}
                                            className="mt-2 flex items-center gap-1 text-xs text-brand-orange hover:text-brand-darkOrange"
                                        >
                                            <Upload className="w-3 h-3" />
                                            {isRTL ? 'تغيير الصورة' : 'Change Photo'}
                                        </button>
                                    </div>
                                </div>

                                {/* Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        {isRTL ? 'الاسم' : 'Name'}
                                    </label>
                                    <input
                                        type="text"
                                        value={profileData.name}
                                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                        className="w-full p-3 rounded-xl bg-gray-50 dark:bg-slate-900 border-none ring-1 ring-gray-200 dark:ring-slate-600 focus:ring-2 focus:ring-brand-orange"
                                    />
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        {isRTL ? 'البريد الإلكتروني' : 'Email'}
                                    </label>
                                    <input
                                        type="email"
                                        value={profileData.email}
                                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                        className="w-full p-3 rounded-xl bg-gray-50 dark:bg-slate-900 border-none ring-1 ring-gray-200 dark:ring-slate-600 focus:ring-2 focus:ring-brand-orange"
                                    />
                                </div>

                                {/* Phone */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        {isRTL ? 'الهاتف' : 'Phone'}
                                    </label>
                                    <input
                                        type="tel"
                                        value={profileData.phone}
                                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                        className="w-full p-3 rounded-xl bg-gray-50 dark:bg-slate-900 border-none ring-1 ring-gray-200 dark:ring-slate-600 focus:ring-2 focus:ring-brand-orange"
                                        dir="ltr"
                                    />
                                </div>

                                {/* Language */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        {isRTL ? 'اللغة المفضلة' : 'Preferred Language'}
                                    </label>
                                    <div className="flex gap-2">
                                        {[{ id: 'ar', label: 'العربية', icon: '🇸🇦' }, { id: 'en', label: 'English', icon: '🇺🇸' }].map((lang) => (
                                            <button
                                                key={lang.id}
                                                onClick={() => setProfileData({ ...profileData, preferredLanguage: lang.id })}
                                                className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl transition-all ${profileData.preferredLanguage === lang.id
                                                    ? 'bg-brand-orange text-white'
                                                    : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400'
                                                    }`}
                                            >
                                                <span>{lang.icon}</span>
                                                <span className="text-sm font-medium">{lang.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Theme */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        {isRTL ? 'السمة' : 'Theme'}
                                    </label>
                                    <div className="flex gap-2">
                                        {[
                                            { id: 'light', labelAr: 'فاتح', labelEn: 'Light', icon: Sun },
                                            { id: 'dark', labelAr: 'داكن', labelEn: 'Dark', icon: Moon },
                                            { id: 'system', labelAr: 'النظام', labelEn: 'System', icon: Monitor },
                                        ].map((themeOption) => (
                                            <button
                                                key={themeOption.id}
                                                onClick={() => setProfileData({ ...profileData, theme: themeOption.id })}
                                                className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl transition-all ${profileData.theme === themeOption.id
                                                    ? 'bg-marine-600 text-white'
                                                    : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400'
                                                    }`}
                                            >
                                                <themeOption.icon className="w-4 h-4" />
                                                <span className="text-sm font-medium">{isRTL ? themeOption.labelAr : themeOption.labelEn}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleSaveProfile}
                                disabled={saving}
                                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-brand-orange to-brand-gold text-white font-bold rounded-xl shadow-lg transition-all disabled:opacity-50"
                            >
                                {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                {isRTL ? 'حفظ التغييرات' : 'Save Changes'}
                            </button>
                        </div>
                    )}

                    {/* Security Tab */}
                    {activeTab === 'security' && (
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 space-y-6">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                                {isRTL ? 'تغيير كلمة المرور' : 'Change Password'}
                            </h2>

                            <div className="max-w-md space-y-4">
                                {/* Current Password */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        {isRTL ? 'كلمة المرور الحالية' : 'Current Password'}
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPasswords.current ? 'text' : 'password'}
                                            value={passwordData.currentPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                            className="w-full p-3 pe-12 rounded-xl bg-gray-50 dark:bg-slate-900 border-none ring-1 ring-gray-200 dark:ring-slate-600 focus:ring-2 focus:ring-brand-orange"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                                            className="absolute top-1/2 end-3 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>

                                {/* New Password */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        {isRTL ? 'كلمة المرور الجديدة' : 'New Password'}
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPasswords.new ? 'text' : 'password'}
                                            value={passwordData.newPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                            className="w-full p-3 pe-12 rounded-xl bg-gray-50 dark:bg-slate-900 border-none ring-1 ring-gray-200 dark:ring-slate-600 focus:ring-2 focus:ring-brand-orange"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                                            className="absolute top-1/2 end-3 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>

                                {/* Confirm Password */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        {isRTL ? 'تأكيد كلمة المرور' : 'Confirm Password'}
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPasswords.confirm ? 'text' : 'password'}
                                            value={passwordData.confirmPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                            className="w-full p-3 pe-12 rounded-xl bg-gray-50 dark:bg-slate-900 border-none ring-1 ring-gray-200 dark:ring-slate-600 focus:ring-2 focus:ring-brand-orange"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                                            className="absolute top-1/2 end-3 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>

                                {/* Password match indicator */}
                                {passwordData.newPassword && passwordData.confirmPassword && (
                                    <div className={`flex items-center gap-2 text-sm ${passwordData.newPassword === passwordData.confirmPassword
                                        ? 'text-green-600'
                                        : 'text-red-600'
                                        }`}>
                                        {passwordData.newPassword === passwordData.confirmPassword ? (
                                            <><Check className="w-4 h-4" /> {isRTL ? 'كلمة المرور متطابقة' : 'Passwords match'}</>
                                        ) : (
                                            <><X className="w-4 h-4" /> {isRTL ? 'كلمة المرور غير متطابقة' : 'Passwords do not match'}</>
                                        )}
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={handleChangePassword}
                                disabled={saving || !passwordData.currentPassword || !passwordData.newPassword || passwordData.newPassword !== passwordData.confirmPassword}
                                className="flex items-center gap-2 px-6 py-3 bg-marine-600 hover:bg-marine-700 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                                {isRTL ? 'تغيير كلمة المرور' : 'Change Password'}
                            </button>
                        </div>
                    )}

                    {/* Odoo ERP Tab */}
                    {activeTab === 'odoo' && (
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
                            <div className="p-6 space-y-6">
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                                        {isRTL ? 'إعدادات الاتصال بأودو' : 'Odoo Connection Settings'}
                                    </h2>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        {isRTL ? 'أدخل بيانات خادم أودو لربط النظام. اضغط "اختبار" للتأكد ثم "حفظ".' : 'Enter your Odoo server credentials. Click "Test" to verify, then "Save".'}
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                                    {/* Server URL */}
                                    <div>
                                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                            <Server className="w-4 h-4 text-brand-orange" />
                                            {isRTL ? 'رابط الخادم' : 'Server URL'}
                                            <span className="text-red-400">*</span>
                                        </label>
                                        <input
                                            type="url"
                                            value={odooSettings.url}
                                            onChange={(e) => { setOdooSettings(s => ({ ...s, url: e.target.value })); setOdooHasChanges(true); setOdooConnectionStatus('idle'); }}
                                            placeholder="https://samalogs.co/"
                                            className="w-full p-3 rounded-xl bg-gray-50 dark:bg-slate-900 border-none ring-1 ring-gray-200 dark:ring-slate-600 focus:ring-2 focus:ring-brand-orange text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                                            dir="ltr"
                                        />
                                    </div>

                                    {/* Database */}
                                    <div>
                                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                            <Database className="w-4 h-4 text-brand-orange" />
                                            {isRTL ? 'اسم قاعدة البيانات' : 'Database Name'}
                                            <span className="text-red-400">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={odooSettings.database}
                                            onChange={(e) => { setOdooSettings(s => ({ ...s, database: e.target.value })); setOdooHasChanges(true); setOdooConnectionStatus('idle'); }}
                                            placeholder="sama"
                                            className="w-full p-3 rounded-xl bg-gray-50 dark:bg-slate-900 border-none ring-1 ring-gray-200 dark:ring-slate-600 focus:ring-2 focus:ring-brand-orange text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                                            dir="ltr"
                                        />
                                    </div>

                                    {/* Username */}
                                    <div>
                                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                            <User className="w-4 h-4 text-brand-orange" />
                                            {isRTL ? 'اسم المستخدم / البريد' : 'Username / Email'}
                                            <span className="text-red-400">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={odooSettings.username}
                                            onChange={(e) => { setOdooSettings(s => ({ ...s, username: e.target.value })); setOdooHasChanges(true); setOdooConnectionStatus('idle'); }}
                                            placeholder="admin@samalogs.com"
                                            className="w-full p-3 rounded-xl bg-gray-50 dark:bg-slate-900 border-none ring-1 ring-gray-200 dark:ring-slate-600 focus:ring-2 focus:ring-brand-orange text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                                            dir="ltr"
                                        />
                                    </div>

                                    {/* Password */}
                                    <div>
                                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                            <Key className="w-4 h-4 text-brand-orange" />
                                            {isRTL ? 'كلمة المرور / مفتاح API' : 'Password / API Key'}
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showOdooPassword ? 'text' : 'password'}
                                                value={odooSettings.password}
                                                onChange={(e) => { setOdooSettings(s => ({ ...s, password: e.target.value })); setOdooHasChanges(true); setOdooConnectionStatus('idle'); }}
                                                placeholder="••••••••"
                                                className="w-full p-3 pe-12 rounded-xl bg-gray-50 dark:bg-slate-900 border-none ring-1 ring-gray-200 dark:ring-slate-600 focus:ring-2 focus:ring-brand-orange text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                                                dir="ltr"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowOdooPassword(!showOdooPassword)}
                                                className="absolute top-1/2 end-3 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                            >
                                                {showOdooPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                            {isRTL ? 'اتركها فارغة للاحتفاظ بالقيمة المحفوظة.' : 'Leave blank to keep the stored value.'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Action Bar */}
                            <div className="px-6 py-4 bg-gray-50 dark:bg-slate-900/50 border-t border-gray-100 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    {odooConnectionStatus === 'success' && (
                                        <div className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400 font-medium">
                                            <CheckCircle2 className="w-3.5 h-3.5" /> {isRTL ? 'الاتصال ناجح ✓' : 'Connected ✓'}
                                        </div>
                                    )}
                                    {odooConnectionStatus === 'error' && (
                                        <div className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400 font-medium">
                                            <XCircle className="w-3.5 h-3.5" /> {isRTL ? 'فشل الاتصال ✗' : 'Failed ✗'}
                                        </div>
                                    )}
                                    {odooHasChanges && (
                                        <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
                                            <AlertTriangle className="w-3 h-3" /> {isRTL ? 'تغييرات غير محفوظة' : 'Unsaved changes'}
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={handleTestOdoo}
                                        disabled={odooTesting || !odooSettings.url || !odooSettings.database || !odooSettings.username}
                                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                                            odooConnectionStatus === 'success' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 ring-1 ring-green-200 dark:ring-green-800'
                                            : odooConnectionStatus === 'error' ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 ring-1 ring-red-200 dark:ring-red-800'
                                            : 'bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-300 ring-1 ring-gray-200 dark:ring-slate-600 hover:bg-gray-50 dark:hover:bg-slate-600'
                                        }`}
                                    >
                                        {odooTesting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                                        {odooTesting ? (isRTL ? 'جارٍ الفحص...' : 'Testing...') : (isRTL ? 'اختبار الاتصال' : 'Test Connection')}
                                    </button>
                                    <button
                                        onClick={handleSaveOdoo}
                                        disabled={saving || odooTesting}
                                        className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-brand-orange to-brand-gold text-white font-bold rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                        {isRTL ? 'حفظ الإعدادات' : 'Save Settings'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>

            {/* Add/Edit User Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-md space-y-4"
                        >
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                {editingUser ? (isRTL ? 'تعديل المستخدم' : 'Edit User') : (isRTL ? 'مستخدم جديد' : 'New User')}
                            </h3>

                            <div className="space-y-3">
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder={isRTL ? 'البريد الإلكتروني' : 'Email'}
                                    disabled={!!editingUser}
                                    className="w-full p-3 rounded-xl bg-gray-50 dark:bg-slate-900 border-none ring-1 ring-gray-200 dark:ring-slate-600 focus:ring-2 focus:ring-brand-orange disabled:opacity-50"
                                />
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    placeholder={editingUser ? (isRTL ? 'كلمة مرور جديدة (اتركها فارغة للإبقاء)' : 'New password (leave empty to keep)') : (isRTL ? 'كلمة المرور' : 'Password')}
                                    className="w-full p-3 rounded-xl bg-gray-50 dark:bg-slate-900 border-none ring-1 ring-gray-200 dark:ring-slate-600 focus:ring-2 focus:ring-brand-orange"
                                />
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder={isRTL ? 'الاسم' : 'Name'}
                                    className="w-full p-3 rounded-xl bg-gray-50 dark:bg-slate-900 border-none ring-1 ring-gray-200 dark:ring-slate-600 focus:ring-2 focus:ring-brand-orange"
                                />
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder={isRTL ? 'الهاتف' : 'Phone'}
                                    className="w-full p-3 rounded-xl bg-gray-50 dark:bg-slate-900 border-none ring-1 ring-gray-200 dark:ring-slate-600 focus:ring-2 focus:ring-brand-orange"
                                    dir="ltr"
                                />
                                <select
                                    value={formData.role}
                                    onChange={(e) => {
                                        const newRole = e.target.value;
                                        setFormData({
                                            ...formData,
                                            role: newRole,
                                            // Reset permissions when role changes
                                            permissions: newRole === 'EMPLOYEE' ? [...DEFAULT_EMPLOYEE_PERMISSIONS] : [],
                                        });
                                    }}
                                    className="w-full p-3 rounded-xl bg-gray-50 dark:bg-slate-900 border-none ring-1 ring-gray-200 dark:ring-slate-600 focus:ring-2 focus:ring-brand-orange"
                                >
                                    <option value="ADMIN">{isRTL ? 'مدير' : 'Admin'}</option>
                                    <option value="EMPLOYEE">{isRTL ? 'موظف' : 'Employee'}</option>
                                    <option value="CLIENT">{isRTL ? 'عميل' : 'Client'}</option>
                                </select>

                                {/* Permissions Grid — only shown for EMPLOYEE role */}
                                {formData.role === 'EMPLOYEE' && (
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                                {isRTL ? '🔐 الصلاحيات' : '🔐 Permissions'}
                                            </label>
                                            <div className="flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, permissions: [...ALL_PERMISSION_KEYS] })}
                                                    className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                                                >
                                                    {isRTL ? 'تحديد الكل' : 'Select All'}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, permissions: [] })}
                                                    className="text-xs px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                                                >
                                                    {isRTL ? 'إلغاء الكل' : 'Deselect All'}
                                                </button>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto p-3 bg-gray-50 dark:bg-slate-900 rounded-xl ring-1 ring-gray-200 dark:ring-slate-600">
                                            {PERMISSIONS.map((perm) => (
                                                <label
                                                    key={perm.key}
                                                    className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all ${
                                                        formData.permissions.includes(perm.key)
                                                            ? 'bg-brand-orange/10 ring-1 ring-brand-orange/30'
                                                            : 'hover:bg-gray-100 dark:hover:bg-slate-800'
                                                    }`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.permissions.includes(perm.key)}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                setFormData({ ...formData, permissions: [...formData.permissions, perm.key] });
                                                            } else {
                                                                setFormData({ ...formData, permissions: formData.permissions.filter(p => p !== perm.key) });
                                                            }
                                                        }}
                                                        className="w-4 h-4 rounded text-brand-orange focus:ring-brand-orange border-gray-300 dark:border-slate-600"
                                                    />
                                                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                                        {isRTL ? perm.labelAr : perm.labelEn}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                        <p className="text-xs text-gray-400 mt-1">
                                            {isRTL
                                                ? `${formData.permissions.length} من ${ALL_PERMISSION_KEYS.length} صلاحية محددة`
                                                : `${formData.permissions.length} of ${ALL_PERMISSION_KEYS.length} permissions selected`
                                            }
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={handleSaveUser}
                                    disabled={saving}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-marine-600 hover:bg-marine-700 text-white rounded-xl transition-colors disabled:opacity-50"
                                >
                                    {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    {isRTL ? 'حفظ' : 'Save'}
                                </button>
                                <button
                                    onClick={() => { setShowAddModal(false); setEditingUser(null); }}
                                    className="px-4 py-3 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-xl transition-colors"
                                >
                                    {isRTL ? 'إلغاء' : 'Cancel'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Admin Reset Password Modal */}
            <AnimatePresence>
                {showResetPasswordModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-sm space-y-4"
                        >
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Key className="w-5 h-5 text-yellow-500" />
                                {isRTL ? 'تغيير كلمة المرور' : 'Reset Password'}
                            </h3>

                            <p className="text-sm text-gray-500">
                                {isRTL ? 'أدخل كلمة مرور جديدة للمستخدم' : 'Enter a new password for this user'}
                            </p>

                            <input
                                type="password"
                                value={resetPasswordValue}
                                onChange={(e) => setResetPasswordValue(e.target.value)}
                                placeholder={isRTL ? 'كلمة المرور الجديدة' : 'New Password'}
                                className="w-full p-3 rounded-xl bg-gray-50 dark:bg-slate-900 border-none ring-1 ring-gray-200 dark:ring-slate-600 focus:ring-2 focus:ring-brand-orange"
                            />

                            <div className="flex gap-2">
                                <button
                                    onClick={handleAdminResetPassword}
                                    disabled={saving || !resetPasswordValue}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl transition-colors disabled:opacity-50"
                                >
                                    {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
                                    {isRTL ? 'تغيير' : 'Reset'}
                                </button>
                                <button
                                    onClick={() => { setShowResetPasswordModal(false); setResetPasswordValue(''); }}
                                    className="px-4 py-3 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-xl transition-colors"
                                >
                                    {isRTL ? 'إلغاء' : 'Cancel'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
