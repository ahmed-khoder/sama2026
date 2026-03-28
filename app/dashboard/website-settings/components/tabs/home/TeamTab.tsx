'use client';

import { Plus, Trash2, Upload, RefreshCw, User, Edit3, X, Check } from 'lucide-react';
import { useState } from 'react';
import { TeamMember } from '../../../types';
import { useConfirm } from '@/contexts/ConfirmContext';

// LinkedIn & Twitter Icons
const LinkedInIcon = () => (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
);

const TwitterIcon = () => (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
);

interface TeamTabProps {
    teamMembers: TeamMember[];
    isRTL: boolean;
    onAddMember: (member: Partial<TeamMember>) => Promise<boolean>;
    onUpdateMember: (id: string, member: Partial<TeamMember>) => Promise<void>;
    onDeleteMember: (id: string) => Promise<void>;
    uploadImage: (file: File, folder: string) => Promise<string | null>;
}

export function TeamTab({
    teamMembers,
    isRTL,
    onAddMember,
    onUpdateMember,
    onDeleteMember,
    uploadImage
}: TeamTabProps) {
    const { confirm } = useConfirm();
    const [newMember, setNewMember] = useState<Partial<TeamMember>>({});
    const [uploading, setUploading] = useState(false);
    const [adding, setAdding] = useState(false);

    // Edit state
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingMember, setEditingMember] = useState<Partial<TeamMember>>({});
    const [editUploading, setEditUploading] = useState(false);

    const handleImageUpload = async (file: File) => {
        setUploading(true);
        const path = await uploadImage(file, 'team');
        if (path) {
            setNewMember(prev => ({ ...prev, image: path }));
        }
        setUploading(false);
    };

    const handleEditImageUpload = async (file: File) => {
        setEditUploading(true);
        const path = await uploadImage(file, 'team');
        if (path) {
            setEditingMember(prev => ({ ...prev, image: path }));
        }
        setEditUploading(false);
    };

    const handleAdd = async () => {
        // Guard: ensure image is a valid uploaded path
        if (!newMember.image || !newMember.image.startsWith('/images/')) {
            return;
        }
        setAdding(true);
        const success = await onAddMember(newMember);
        if (success) {
            setNewMember({});
        }
        setAdding(false);
    };

    const startEditing = (member: TeamMember) => {
        setEditingId(member.id);
        setEditingMember({
            nameAr: member.nameAr,
            nameEn: member.nameEn,
            roleAr: member.roleAr,
            roleEn: member.roleEn,
            image: member.image,
            linkedin: member.linkedin || '',
            twitter: member.twitter || '',
        });
    };

    const cancelEditing = () => {
        setEditingId(null);
        setEditingMember({});
    };

    const saveEditing = async () => {
        console.log('🔵 [TeamTab] saveEditing called, editingId:', editingId);
        console.log('🔵 [TeamTab] editingMember:', JSON.stringify(editingMember, null, 2));
        if (editingId) {
            await onUpdateMember(editingId, editingMember);
            setEditingId(null);
            setEditingMember({});
        } else {
            console.warn('⚠️ [TeamTab] saveEditing called but editingId is null');
        }
    };

    return (
        <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white">
                    {isRTL ? 'فريق العمل' : 'Team Members'}
                </h3>
                <span className="text-xs text-gray-500 bg-gray-100 dark:bg-slate-700 px-3 py-1 rounded-full">
                    {teamMembers.length} {isRTL ? 'أعضاء' : 'Members'}
                </span>
            </div>

            {/* Add New Member Form */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-marine-50 to-brand-orange/10 dark:from-marine-900/30 dark:to-brand-orange/5 border border-marine-200 dark:border-marine-800">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                    {isRTL ? 'إضافة عضو جديد' : 'Add New Member'}
                </h4>

                {/* Row 1: Names */}
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <input
                        type="text"
                        value={newMember.nameAr || ''}
                        onChange={(e) => setNewMember(prev => ({ ...prev, nameAr: e.target.value }))}
                        placeholder={isRTL ? 'الاسم بالعربي' : 'Name (AR)'}
                        className="w-full p-3 rounded-xl bg-white dark:bg-slate-800 border-none ring-1 ring-gray-200 dark:ring-slate-600 focus:ring-2 focus:ring-brand-orange"
                        dir="rtl"
                    />
                    <input
                        type="text"
                        value={newMember.nameEn || ''}
                        onChange={(e) => setNewMember(prev => ({ ...prev, nameEn: e.target.value }))}
                        placeholder={isRTL ? 'الاسم بالإنجليزي' : 'Name (EN)'}
                        className="w-full p-3 rounded-xl bg-white dark:bg-slate-800 border-none ring-1 ring-gray-200 dark:ring-slate-600 focus:ring-2 focus:ring-brand-orange"
                    />
                </div>

                {/* Row 2: Roles */}
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <input
                        type="text"
                        value={newMember.roleAr || ''}
                        onChange={(e) => setNewMember(prev => ({ ...prev, roleAr: e.target.value }))}
                        placeholder={isRTL ? 'المنصب بالعربي' : 'Role (AR)'}
                        className="w-full p-3 rounded-xl bg-white dark:bg-slate-800 border-none ring-1 ring-gray-200 dark:ring-slate-600 focus:ring-2 focus:ring-brand-orange"
                        dir="rtl"
                    />
                    <input
                        type="text"
                        value={newMember.roleEn || ''}
                        onChange={(e) => setNewMember(prev => ({ ...prev, roleEn: e.target.value }))}
                        placeholder={isRTL ? 'المنصب بالإنجليزي' : 'Role (EN)'}
                        className="w-full p-3 rounded-xl bg-white dark:bg-slate-800 border-none ring-1 ring-gray-200 dark:ring-slate-600 focus:ring-2 focus:ring-brand-orange"
                    />
                </div>

                {/* Row 3: Social Links (Optional) */}
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#0A66C2]">
                            <LinkedInIcon />
                        </div>
                        <input
                            type="url"
                            value={newMember.linkedin || ''}
                            onChange={(e) => setNewMember(prev => ({ ...prev, linkedin: e.target.value }))}
                            placeholder={isRTL ? 'رابط لينكد إن (اختياري)' : 'LinkedIn URL (optional)'}
                            className="w-full p-3 pl-10 rounded-xl bg-white dark:bg-slate-800 border-none ring-1 ring-gray-200 dark:ring-slate-600 focus:ring-2 focus:ring-[#0A66C2]"
                        />
                    </div>
                    <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-900 dark:text-white">
                            <TwitterIcon />
                        </div>
                        <input
                            type="url"
                            value={newMember.twitter || ''}
                            onChange={(e) => setNewMember(prev => ({ ...prev, twitter: e.target.value }))}
                            placeholder={isRTL ? 'رابط تويتر/X (اختياري)' : 'Twitter/X URL (optional)'}
                            className="w-full p-3 pl-10 rounded-xl bg-white dark:bg-slate-800 border-none ring-1 ring-gray-200 dark:ring-slate-600 focus:ring-2 focus:ring-gray-900"
                        />
                    </div>
                </div>

                {/* Row 4: Image + Add Button */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    {/* Image Upload with Requirements */}
                    <div className="flex flex-col gap-2">
                        <label className="relative group w-20 h-20 rounded-xl overflow-hidden border border-gray-200 dark:border-slate-600 bg-gray-100 dark:bg-slate-700 flex-shrink-0 cursor-pointer block">
                            {uploading ? (
                                <div className="w-full h-full flex items-center justify-center">
                                    <RefreshCw className="w-6 h-6 animate-spin text-brand-orange" />
                                </div>
                            ) : newMember.image ? (
                                <img src={newMember.image} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    <User className="w-8 h-8" />
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Upload className="w-5 h-5 text-white" />
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                    if (e.target.files?.[0]) {
                                        handleImageUpload(e.target.files[0]);
                                    }
                                }}
                            />
                        </label>
                        {/* Image Requirements */}
                        <div className="text-[10px] leading-tight text-gray-500 dark:text-gray-400 space-y-0.5">
                            <p className="font-medium" dir={isRTL ? 'rtl' : 'ltr'}>
                                {isRTL ? '📐 الأبعاد: 400×400 بكسل' : '📐 Dimensions: 400×400px'}
                            </p>
                            <p dir={isRTL ? 'rtl' : 'ltr'}>
                                {isRTL ? '📁 الامتداد: JPG, PNG, WebP' : '📁 Format: JPG, PNG, WebP'}
                            </p>
                            <p dir={isRTL ? 'rtl' : 'ltr'}>
                                {isRTL ? '💾 الحجم: أقصى 2 ميجابايت' : '💾 Size: Max 2MB'}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={handleAdd}
                        disabled={adding || !newMember.nameAr || !newMember.nameEn || !newMember.roleAr || !newMember.roleEn || !newMember.image}
                        className="flex-1 w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-3 bg-marine-600 hover:bg-marine-700 disabled:bg-gray-300 dark:disabled:bg-slate-700 text-white rounded-xl transition-colors"
                    >
                        {adding ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                            <Plus className="w-4 h-4" />
                        )}
                        {isRTL ? 'إضافة العضو' : 'Add Member'}
                    </button>
                </div>
            </div>

            {/* Existing Members */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {teamMembers.map((member) => (
                    <div key={member.id} className="relative group p-4 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700">
                        {editingId === member.id ? (
                            // EDIT MODE
                            <div className="space-y-3">
                                {/* Edit Image */}
                                <div className="flex flex-col gap-2 items-center">
                                    <label className="relative group/img w-16 h-16 rounded-xl overflow-hidden border border-gray-200 dark:border-slate-600 bg-gray-100 dark:bg-slate-700 cursor-pointer block">
                                        {editUploading ? (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <RefreshCw className="w-5 h-5 animate-spin text-brand-orange" />
                                            </div>
                                        ) : editingMember.image ? (
                                            <img src={editingMember.image} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                <User className="w-6 h-6" />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                                            <Upload className="w-4 h-4 text-white" />
                                        </div>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => {
                                                if (e.target.files?.[0]) {
                                                    handleEditImageUpload(e.target.files[0]);
                                                }
                                            }}
                                        />
                                    </label>
                                    {/* Image Requirements */}
                                    <div className="text-[9px] leading-tight text-gray-500 dark:text-gray-400 space-y-0.5 text-center">
                                        <p dir={isRTL ? 'rtl' : 'ltr'}>
                                            {isRTL ? '📐 400×400 | 📁 JPG,PNG,WebP | 💾 Max 2MB' : '📐 400×400 | 📁 JPG,PNG,WebP | 💾 Max 2MB'}
                                        </p>
                                    </div>
                                </div>

                                {/* Edit Name/Role */}
                                <input
                                    type="text"
                                    value={editingMember.nameAr || ''}
                                    onChange={(e) => setEditingMember(prev => ({ ...prev, nameAr: e.target.value }))}
                                    placeholder={isRTL ? 'الاسم بالعربي' : 'Name (AR)'}
                                    className="w-full p-2 text-sm rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600"
                                    dir="rtl"
                                />
                                <input
                                    type="text"
                                    value={editingMember.nameEn || ''}
                                    onChange={(e) => setEditingMember(prev => ({ ...prev, nameEn: e.target.value }))}
                                    placeholder={isRTL ? 'الاسم بالإنجليزي' : 'Name (EN)'}
                                    className="w-full p-2 text-sm rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600"
                                />
                                <input
                                    type="text"
                                    value={editingMember.roleAr || ''}
                                    onChange={(e) => setEditingMember(prev => ({ ...prev, roleAr: e.target.value }))}
                                    placeholder={isRTL ? 'المنصب بالعربي' : 'Role (AR)'}
                                    className="w-full p-2 text-sm rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600"
                                    dir="rtl"
                                />
                                <input
                                    type="text"
                                    value={editingMember.roleEn || ''}
                                    onChange={(e) => setEditingMember(prev => ({ ...prev, roleEn: e.target.value }))}
                                    placeholder={isRTL ? 'المنصب بالإنجليزي' : 'Role (EN)'}
                                    className="w-full p-2 text-sm rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600"
                                />

                                {/* Edit Social Links */}
                                <div className="relative">
                                    <div className="absolute left-2 top-1/2 -translate-y-1/2 text-[#0A66C2]">
                                        <LinkedInIcon />
                                    </div>
                                    <input
                                        type="url"
                                        value={editingMember.linkedin || ''}
                                        onChange={(e) => setEditingMember(prev => ({ ...prev, linkedin: e.target.value }))}
                                        placeholder="LinkedIn"
                                        className="w-full p-2 pl-8 text-sm rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600"
                                    />
                                </div>
                                <div className="relative">
                                    <div className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-900 dark:text-white">
                                        <TwitterIcon />
                                    </div>
                                    <input
                                        type="url"
                                        value={editingMember.twitter || ''}
                                        onChange={(e) => setEditingMember(prev => ({ ...prev, twitter: e.target.value }))}
                                        placeholder="Twitter/X"
                                        className="w-full p-2 pl-8 text-sm rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600"
                                    />
                                </div>

                                {/* Save/Cancel Buttons */}
                                <div className="flex gap-2">
                                    <button
                                        onClick={saveEditing}
                                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors"
                                    >
                                        <Check className="w-4 h-4" />
                                        {isRTL ? 'حفظ' : 'Save'}
                                    </button>
                                    <button
                                        onClick={cancelEditing}
                                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-gray-500 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                        {isRTL ? 'إلغاء' : 'Cancel'}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            // VIEW MODE
                            <>
                                {/* Action Buttons */}
                                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                    <button
                                        onClick={() => startEditing(member)}
                                        className="p-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg"
                                    >
                                        <Edit3 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={async () => {
                                            const confirmed = await confirm({
                                                title: isRTL ? 'حذف العضو' : 'Delete Member',
                                                message: isRTL ? 'هل تريد حذف هذا العضو؟' : 'Are you sure you want to delete this member?',
                                                confirmText: isRTL ? 'حذف' : 'Delete',
                                                cancelText: isRTL ? 'إلغاء' : 'Cancel',
                                                type: 'danger'
                                            });
                                            if (confirmed) {
                                                onDeleteMember(member.id);
                                            }
                                        }}
                                        className="p-1.5 bg-red-50 dark:bg-red-900/30 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-200 dark:bg-slate-700 flex-shrink-0">
                                        {member.image ? (
                                            <img src={member.image} alt={member.nameEn} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                <User className="w-6 h-6" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="font-bold text-gray-900 dark:text-white text-sm truncate">
                                            {isRTL ? member.nameAr : member.nameEn}
                                        </p>
                                        <p className="text-xs text-gray-500 truncate">
                                            {isRTL ? member.roleAr : member.roleEn}
                                        </p>
                                        {/* Social Links Display */}
                                        {(member.linkedin || member.twitter) && (
                                            <div className="flex items-center gap-2 mt-1">
                                                {member.linkedin && (
                                                    <a
                                                        href={member.linkedin}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-[#0A66C2] hover:opacity-80 transition-opacity"
                                                    >
                                                        <LinkedInIcon />
                                                    </a>
                                                )}
                                                {member.twitter && (
                                                    <a
                                                        href={member.twitter}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-gray-900 dark:text-white hover:opacity-80 transition-opacity"
                                                    >
                                                        <TwitterIcon />
                                                    </a>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
