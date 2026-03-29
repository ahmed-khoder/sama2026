'use client';

import React, { useState, useEffect } from 'react';
import { authFetch } from '@/lib/auth-fetch';
import { invalidateCache } from '@/lib/cms-cache';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, RefreshCw, Eye, EyeOff, HardDrive } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import Link from 'next/link';

// Import types
import { getTabCategories } from './types';

// Import custom hook
import { useWebsiteSettings } from './hooks';
import { BlogHeroSettingsTab } from './components/tabs/blog';

// Import components
import { HeroPreview } from './components/HeroPreview';
import { WhyChooseUsPreview } from './components/WhyChooseUsPreview';
import { AboutSectionPreview } from './components/AboutSectionPreview';
import {
    HeroTab,
    StatsTab,
    AboutSectionTab,
    TeamTab,
} from './components/tabs/home';
import BrandingTab from './components/tabs/home/BrandingTab';
import AccreditationsTab from './components/tabs/home/AccreditationsTab';
import {
    ServicesHeroTab,
    ServicesManagementTab,
    ServicesStylingTab,
    ServicesContentTab,
    ServicesStatsTab,
    FleetTab,
    PortsTab,
    CargoTab,
} from './components/tabs/services';
import { MilestonesTab, AboutHeroTab, AboutStylingTab, AboutContentTab, WhyChooseUsTab } from './components/tabs/about';
import { CareersHeroTab, CareersStylingTab, CareersContentTab } from './components/tabs/careers';
import {
    StylingTab,
    ContentTab,
} from './components/tabs/appearance';

export default function WebsiteSettingsPage() {
    const { language } = useLanguage();
    const isRTL = language === 'ar';

    // Tab state
    const [activeCategory, setActiveCategory] = useState('home');
    const [activeTab, setActiveTab] = useState('slides');
    const [showPreview, setShowPreview] = useState(true);

    // Preview state
    const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
    const [previewSlideIndex, setPreviewSlideIndex] = useState(0);

    // Reset preview slide index when tab changes
    useEffect(() => {
        setPreviewSlideIndex(0);
    }, [activeTab, activeCategory]);

    // Use the custom hook for all data and handlers
    const {
        // States
        loading,
        saving,
        slidesLoading,

        // Data
        settings,
        slides,
        stats,
        aboutSettings,
        teamMembers,
        services,
        setServices,
        milestones,
        servicesHeroSlides,
        servicesHeroSettings,
        setServicesHeroSettings,
        careersHeroSlides,
        careersHeroSettings,
        aboutHeroSlides,
        setAboutHeroSlides,
        aboutHeroSettings,
        setAboutHeroSettings,

        // Handlers
        handleSettingsChange,
        handleSave,
        handleAboutChange,
        handleFeatureChange,
        handleDeleteSlide,
        handleMoveSlide,
        handleUpdateSlideImage,
        handleCreateSlide,
        handleStatChange,
        handleAddMember,
        handleUpdateMember,
        handleDeleteMember,
        handleAddService,
        handleUpdateService,
        handleToggleServiceActive,
        handleSwapService,
        handleAddMilestone,
        handleUpdateMilestone,
        handleDeleteMilestone,
        handleMoveMilestone,
        futurePulse,
        handleUpdateFuturePulse,
        handleAddServicesHeroSlide,
        handleDeleteServicesHeroSlide,
        handleSaveServicesHeroSettings,
        handleAddCareersHeroSlide,
        handleDeleteCareersHeroSlide,
        handleSaveCareersHeroSettings,
        handleUpdateCareersSlideImage,
        handleMoveCareersSlide,
        handleAddAboutHeroSlide,
        handleDeleteAboutHeroSlide,
        handleSaveAboutHeroSettings,

        // Utils
        uploadImage,
        setServicesHeroSlides,
        setCareersHeroSettings,
        setCareersHeroSlides,

        // Services Page Dynamic Sections
        servicesPageStats,
        fleetTrucks,
        portOperations,
        specializedCargo,
        handleAddServicesPageStat,
        handleUpdateServicesPageStat,
        handleDeleteServicesPageStat,
        handleAddFleetTruck,
        handleUpdateFleetTruck,
        handleDeleteFleetTruck,
        handleAddPortOperation,
        handleUpdatePortOperation,
        handleDeletePortOperation,
        handleAddSpecializedCargo,
        handleUpdateSpecializedCargo,
        handleDeleteSpecializedCargo,
    } = useWebsiteSettings();

    const categories = getTabCategories(isRTL);
    const currentCategory = categories.find(c => c.id === activeCategory);

    // Handle category change
    const handleCategoryChange = (catId: string) => {
        setActiveCategory(catId);
        const cat = categories.find(c => c.id === catId);
        if (cat && cat.tabs.length > 0) {
            setActiveTab(cat.tabs[0].id);
        }
    };

    // Render tab content based on activeTab
    const renderTabContent = () => {
        switch (activeTab) {
            // Home tabs
            case 'hero':
                return (
                    <HeroTab
                        slides={slides}
                        slidesLoading={slidesLoading}
                        isRTL={isRTL}
                        onAddSlide={async () => {
                            await handleCreateSlide('/images/hero/placeholder.jpg');
                        }}
                        onDeleteSlide={handleDeleteSlide}
                        onMoveSlide={handleMoveSlide}
                        onUpdateSlideImage={handleUpdateSlideImage}
                        uploadImage={uploadImage}
                        settings={settings}
                        onSettingsChange={handleSettingsChange}
                    />
                );
            case 'styling':
                return (
                    <StylingTab
                        settings={settings}
                        isRTL={isRTL}
                        onSettingsChange={handleSettingsChange}
                    />
                );
            case 'content':
                return (
                    <ContentTab
                        settings={settings}
                        isRTL={isRTL}
                        onSettingsChange={handleSettingsChange}
                    />
                );
            case 'stats':
                return (
                    <StatsTab
                        stats={stats}
                        isRTL={isRTL}
                        onStatChange={handleStatChange}
                    />
                );
            case 'about':
                return (
                    <AboutSectionTab
                        aboutSettings={aboutSettings}
                        heroSettings={settings}
                        isRTL={isRTL}
                        onAboutChange={handleAboutChange}
                        onHeroSettingsChange={handleSettingsChange}
                        onFeatureChange={handleFeatureChange}
                        onAddFeature={() => {
                            handleAboutChange('features', [
                                ...aboutSettings.features,
                                { ar: '', en: '' }
                            ]);
                        }}
                        onDeleteFeature={(index) => {
                            handleAboutChange('features',
                                aboutSettings.features.filter((_, i) => i !== index)
                            );
                        }}
                        uploadImage={uploadImage}
                    />
                );
            case 'team':
                return (
                    <TeamTab
                        teamMembers={teamMembers}
                        isRTL={isRTL}
                        onAddMember={handleAddMember}
                        onUpdateMember={async (id, editedFields) => {
                            console.log('🔵 [Page] onUpdateMember called, id:', id, 'editedFields:', editedFields);
                            // Send only the edited fields — do NOT merge with fullMember
                            // to avoid re-sending the existing image path (which may not exist on disk)
                            await handleUpdateMember({ id, ...editedFields } as any);
                        }}
                        onDeleteMember={handleDeleteMember}
                        uploadImage={uploadImage}
                    />
                );
            case 'branding':
                return (
                    <BrandingTab
                        isRTL={isRTL}
                        uploadImage={uploadImage}
                    />
                );
            case 'accreditations':
                return <AccreditationsTab />;

            // Services tabs
            case 'services-hero':
                return (
                    <ServicesHeroTab
                        slides={servicesHeroSlides}
                        slidesLoading={slidesLoading}
                        settings={servicesHeroSettings}
                        isRTL={isRTL}
                        onAddSlide={async () => {
                            await handleAddServicesHeroSlide('/images/services/placeholder.jpg');
                        }}
                        onDeleteSlide={handleDeleteServicesHeroSlide}
                        onMoveSlide={async (id, direction) => {
                            const idx = servicesHeroSlides.findIndex(s => s.id === id);
                            if (idx === -1) return;
                            if (direction === 'up' && idx === 0) return;
                            if (direction === 'down' && idx === servicesHeroSlides.length - 1) return;

                            const newSlides = [...servicesHeroSlides];
                            const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
                            [newSlides[idx], newSlides[swapIdx]] = [newSlides[swapIdx], newSlides[idx]];
                            setServicesHeroSlides(newSlides);
                        }}
                        onUpdateSlideImage={async (slideId, field, path) => {
                            // Update local state immediately
                            setServicesHeroSlides(prev =>
                                prev.map(s => s.id === slideId ? { ...s, [field]: path } : s)
                            );

                            // Save to database via API
                            try {
                                const response = await authFetch(`/api/cms/services-hero/slides/${slideId}`, {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ [field]: path })
                                });

                                if (!response.ok) {
                                    throw new Error('Failed to save image');
                                }

                                console.log(`Saved ${field} for slide ${slideId}:`, path);
                            } catch (error) {
                                console.error('Error saving image:', error);
                                console.error(isRTL ? 'فشل حفظ الصورة' : 'Failed to save image');
                            }
                        }}
                        onSettingsChange={async (field, value) => {
                            setServicesHeroSettings(prev => ({ ...prev, [field]: value }));
                            // Auto-save with debounce-like delay
                            setTimeout(() => handleSaveServicesHeroSettings(), 500);
                        }}
                        uploadImage={uploadImage}
                    />
                );
            case 'services-styling':
                return (
                    <ServicesStylingTab
                        settings={servicesHeroSettings}
                        isRTL={isRTL}
                        onSettingsChange={async (field, value) => {
                            setServicesHeroSettings(prev => ({ ...prev, [field]: value }));
                            setTimeout(() => handleSaveServicesHeroSettings(), 500);
                        }}
                    />
                );
            case 'services-content':
                return (
                    <ServicesContentTab
                        settings={servicesHeroSettings}
                        isRTL={isRTL}
                        onSettingsChange={async (field, value) => {
                            setServicesHeroSettings(prev => ({ ...prev, [field]: value }));
                            setTimeout(() => handleSaveServicesHeroSettings(), 500);
                        }}
                    />
                );
            case 'services':
                return (
                    <ServicesManagementTab
                        services={services}
                        isRTL={isRTL}
                        onAddService={handleAddService}
                        onUpdateService={handleUpdateService}
                        onDeleteService={async (id) => {
                            try {
                                const res = await authFetch(`/api/cms/services/${id}`, { method: 'DELETE' });
                                if (res.ok) {
                                    // Remove from local state immediately
                                    setServices(prev => prev.filter(s => s.id !== id));
                                    invalidateCache('/api/cms/services');
                                } else {
                                    const errData = await res.json().catch(() => ({ error: 'Unknown error' }));
                                    console.error('Delete failed:', errData.error);
                                }
                            } catch (err) {
                                console.error('Error deleting service:', err);
                            }
                        }}
                        onToggleService={handleToggleServiceActive}
                        onSwapService={handleSwapService}
                    />
                );

            case 'services-stats':
                return (
                    <ServicesStatsTab
                        stats={servicesPageStats}
                        onAdd={handleAddServicesPageStat}
                        onUpdate={handleUpdateServicesPageStat}
                        onDelete={handleDeleteServicesPageStat}
                    />
                );
            case 'services-fleet':
                return (
                    <FleetTab
                        trucks={fleetTrucks}
                        onAdd={handleAddFleetTruck}
                        onUpdate={handleUpdateFleetTruck}
                        onDelete={handleDeleteFleetTruck}
                    />
                );
            case 'services-ports':
                return (
                    <PortsTab
                        ports={portOperations}
                        onAdd={handleAddPortOperation}
                        onUpdate={handleUpdatePortOperation}
                        onDelete={handleDeletePortOperation}
                    />
                );
            case 'services-cargo':
                return (
                    <CargoTab
                        cargo={specializedCargo}
                        onAdd={handleAddSpecializedCargo}
                        onUpdate={handleUpdateSpecializedCargo}
                        onDelete={handleDeleteSpecializedCargo}
                    />
                );

            // About tabs
            case 'about-hero':
                return (
                    <AboutHeroTab
                        slides={aboutHeroSlides}
                        settings={aboutHeroSettings}
                        slidesLoading={slidesLoading}
                        isRTL={isRTL}
                        onAddSlide={async () => {
                            await handleAddAboutHeroSlide('/images/about/placeholder.jpg');
                        }}
                        onDeleteSlide={handleDeleteAboutHeroSlide}
                        onMoveSlide={async (id, direction) => {
                            const idx = aboutHeroSlides.findIndex(s => s.id === id);
                            if (idx === -1) return;
                            if (direction === 'up' && idx === 0) return;
                            if (direction === 'down' && idx === aboutHeroSlides.length - 1) return;

                            const newSlides = [...aboutHeroSlides];
                            const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
                            [newSlides[idx], newSlides[swapIdx]] = [newSlides[swapIdx], newSlides[idx]];
                            setAboutHeroSlides(newSlides);
                        }}
                        onUpdateSlideImage={async (slideId, field, path) => {
                            // Update local state immediately
                            setAboutHeroSlides(prev =>
                                prev.map(s => s.id === slideId ? { ...s, [field]: path } : s)
                            );

                            // Save to database via API
                            try {
                                const response = await authFetch(`/api/cms/about-hero/slides/${slideId}`, {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ [field]: path })
                                });

                                if (!response.ok) {
                                    throw new Error('Failed to save image');
                                }

                                console.log(`Saved ${field} for About slide ${slideId}:`, path);
                            } catch (error) {
                                console.error('Error saving About image:', error);
                                console.error(isRTL ? 'فشل حفظ الصورة' : 'Failed to save image');
                            }
                        }}
                        onSettingsChange={async (field, value) => {
                            setAboutHeroSettings(prev => ({ ...prev, [field]: value }));
                            setTimeout(() => handleSaveAboutHeroSettings(), 500);
                        }}
                        uploadImage={uploadImage}
                    />
                );
            case 'about-styling':
                return (
                    <AboutStylingTab
                        settings={aboutHeroSettings}
                        isRTL={isRTL}
                        onSettingsChange={async (field, value) => {
                            setAboutHeroSettings(prev => ({ ...prev, [field]: value }));
                            setTimeout(() => handleSaveAboutHeroSettings(), 500);
                        }}
                    />
                );
            case 'about-content':
                return (
                    <AboutContentTab
                        settings={aboutHeroSettings}
                        isRTL={isRTL}
                        onSettingsChange={async (field, value) => {
                            setAboutHeroSettings(prev => ({ ...prev, [field]: value }));
                            setTimeout(() => handleSaveAboutHeroSettings(), 500);
                        }}
                    />
                );
            case 'milestones':
                return (
                    <MilestonesTab
                        milestones={milestones}
                        isRTL={isRTL}
                        onAddMilestone={handleAddMilestone}
                        onUpdateMilestone={handleUpdateMilestone}
                        onDeleteMilestone={handleDeleteMilestone}
                        onMoveMilestone={handleMoveMilestone}
                        futurePulse={futurePulse}
                        onUpdateFuturePulse={handleUpdateFuturePulse}
                    />
                );
            case 'why-choose-us':
                return (
                    <WhyChooseUsTab
                        isRTL={isRTL}
                        uploadImage={uploadImage}
                    />
                );

            // Careers tabs
            case 'careers-hero':
                return (
                    <CareersHeroTab
                        slides={careersHeroSlides}
                        settings={careersHeroSettings}
                        slidesLoading={slidesLoading}
                        isRTL={isRTL}
                        onAddSlide={async () => {
                            // Create new slide with empty image, user will upload
                            await handleAddCareersHeroSlide('');
                        }}
                        onDeleteSlide={handleDeleteCareersHeroSlide}
                        onMoveSlide={handleMoveCareersSlide}
                        onUpdateSlideImage={handleUpdateCareersSlideImage}
                        onSettingsChange={async (field, value) => {
                            setCareersHeroSettings(prev => ({ ...prev, [field]: value }));
                            // Auto-save
                            setTimeout(() => handleSaveCareersHeroSettings(), 500);
                        }}
                        uploadImage={uploadImage}
                    />
                );
            case 'careers-styling':
                return (
                    <CareersStylingTab
                        settings={careersHeroSettings}
                        isRTL={isRTL}
                        onSettingsChange={async (field, value) => {
                            setCareersHeroSettings(prev => ({ ...prev, [field]: value }));
                            setTimeout(() => handleSaveCareersHeroSettings(), 500);
                        }}
                    />
                );
            case 'careers-content':
                return (
                    <CareersContentTab
                        settings={careersHeroSettings}
                        isRTL={isRTL}
                        onSettingsChange={async (field, value) => {
                            setCareersHeroSettings(prev => ({ ...prev, [field]: value }));
                            setTimeout(() => handleSaveCareersHeroSettings(), 500);
                        }}
                    />
                );

            // Appearance tabs (for home page)
            case 'styling':
                return (
                    <StylingTab
                        settings={settings}
                        isRTL={isRTL}
                        onSettingsChange={handleSettingsChange}
                    />
                );
            case 'content':
                return (
                    <ContentTab
                        settings={settings}
                        isRTL={isRTL}
                        onSettingsChange={handleSettingsChange}
                    />
                );

            // Blog tabs
            case 'blog-settings':
                return (
                    <BlogHeroSettingsTab isRTL={isRTL} uploadImage={uploadImage} />
                );


            default:
                return null;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <RefreshCw className="w-8 h-8 animate-spin text-brand-orange" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {isRTL ? 'إعدادات الموقع' : 'Website Settings'}
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">
                        {isRTL ? 'تخصيص مظهر ومحتوى الموقع' : 'Customize website appearance and content'}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowPreview(!showPreview)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${showPreview
                            ? 'bg-marine-100 dark:bg-marine-900/50 text-marine-700 dark:text-marine-300'
                            : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400'
                            }`}
                    >
                        {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        <span className="hidden sm:inline">{isRTL ? 'المعاينة' : 'Preview'}</span>
                    </button>
                    <Link
                        href="/dashboard/settings/storage"
                        className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-400 rounded-xl transition-all"
                    >
                        <HardDrive className="w-4 h-4" />
                        <span className="hidden sm:inline">{isRTL ? 'إدارة التخزين' : 'Storage'}</span>
                    </Link>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-brand-orange to-brand-gold hover:from-brand-orange/90 hover:to-brand-gold/90 text-white font-bold rounded-xl shadow-lg shadow-brand-orange/30 transition-all disabled:opacity-50"
                    >
                        {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        <span>{isRTL ? 'حفظ الكل' : 'Save All'}</span>
                    </button>
                </div>
            </div>

            {/* Main Layout */}
            <div className={`grid gap-6 ${showPreview ? 'lg:grid-cols-2' : ''}`}>
                {/* Settings Panel */}
                <div className="space-y-6">
                    {/* Category Navigation */}
                    <div className="space-y-3">
                        {/* Category Selector */}
                        <div className="flex gap-2 bg-gray-100 dark:bg-slate-800 p-1.5 rounded-2xl overflow-x-auto">
                            {categories.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => handleCategoryChange(cat.id)}
                                    className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeCategory === cat.id
                                        ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm'
                                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                        }`}
                                >
                                    {isRTL ? cat.labelAr : cat.labelEn}
                                </button>
                            ))}
                        </div>

                        {/* Category Description & Sub-tabs */}
                        {currentCategory && (
                            <div className="space-y-3">
                                <p className="text-xs text-gray-500 px-1">
                                    {isRTL ? currentCategory.descAr : currentCategory.descEn}
                                </p>
                                <div className="flex gap-2 flex-wrap">
                                    {currentCategory.tabs.map(tab => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${activeTab === tab.id
                                                ? 'bg-brand-orange text-white'
                                                : 'bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-slate-600'
                                                }`}
                                        >
                                            {isRTL ? tab.labelAr : tab.labelEn}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
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
                            {renderTabContent()}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Live Preview Panel */}
                {showPreview && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:sticky lg:top-24 space-y-4"
                    >
                        {/* Show AboutSectionPreview when About tab is active in Home category */}
                        {activeCategory === 'home' && activeTab === 'about' ? (
                            <AboutSectionPreview
                                aboutSettings={aboutSettings}
                                heroSettings={settings}
                                previewMode={previewMode}
                                onPreviewModeChange={setPreviewMode}
                            />
                        ) : activeCategory === 'aboutpage' && activeTab === 'why-choose-us' ? (
                            <WhyChooseUsPreview
                                previewMode={previewMode}
                                onPreviewModeChange={setPreviewMode}
                            />
                        ) : (
                            <HeroPreview
                                activeTab={activeTab}
                                activeCategory={activeCategory}
                                previewMode={previewMode}
                                onPreviewModeChange={setPreviewMode}
                                settings={settings}
                                slides={slides}
                                servicesHeroSettings={servicesHeroSettings}
                                servicesHeroSlides={servicesHeroSlides}
                                careersHeroSettings={careersHeroSettings}
                                careersHeroSlides={careersHeroSlides}
                                aboutHeroSettings={aboutHeroSettings}
                                aboutHeroSlides={aboutHeroSlides}
                                previewSlideIndex={previewSlideIndex}
                                onSlideChange={setPreviewSlideIndex}
                            />
                        )}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
