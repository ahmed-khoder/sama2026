'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/contexts/ToastContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { authFetch } from '@/lib/auth-fetch';
import { invalidateCache } from '@/lib/cms-cache';
import {
    HeroSettings,
    HeroSlide,
    StatItem,
    AboutSettings,
    TeamMember,
    ServiceItem,
    MilestoneItem,
    FuturePulseSettings,
    ServicesHeroSettings,
    ServicesHeroSlide,
    CareersHeroSettings,
    CareersHeroSlide,
    CareersStat,
    AboutHeroSettings,
    AboutHeroSlide,
    ServicesPageStatItem,
    FleetTruckItem,
    PortOperationItem,
    SpecializedCargoItem,
    defaultHeroSettings,
    defaultAboutSettings,
    defaultServicesHeroSettings,
    defaultCareersHeroSettings,
    defaultAboutHeroSettings,
} from '../types';

export function useWebsiteSettings() {
    const { language } = useLanguage();
    const isRTL = language === 'ar';
    const { success, error, warning } = useToast();

    // Loading States
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [slidesLoading, setSlidesLoading] = useState(false);
    const [uploadingSlide, setUploadingSlide] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [uploadingCareersSlide, setUploadingCareersSlide] = useState(false);

    // Data States
    const [settings, setSettings] = useState<HeroSettings>(defaultHeroSettings);
    const [slides, setSlides] = useState<HeroSlide[]>([]);
    const [stats, setStats] = useState<StatItem[]>([]);
    const [aboutSettings, setAboutSettings] = useState<AboutSettings>(defaultAboutSettings);
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [services, setServices] = useState<ServiceItem[]>([]);
    const [milestones, setMilestones] = useState<MilestoneItem[]>([]);
    const [futurePulse, setFuturePulse] = useState<FuturePulseSettings>({
        badgeAr: 'المستقبل', badgeEn: 'The Future',
        titleAr: 'طموحنا مستمر..', titleEn: 'Our Ambition Continues..',
        descriptionAr: 'نحو مستقبل لوجستي متكامل', descriptionEn: 'Towards an Integrated Logistics Future',
    });

    // Services Hero
    const [servicesHeroSlides, setServicesHeroSlides] = useState<ServicesHeroSlide[]>([]);
    const [servicesHeroSettings, setServicesHeroSettings] = useState<ServicesHeroSettings>(defaultServicesHeroSettings);

    // Careers Hero
    const [careersHeroSlides, setCareersHeroSlides] = useState<CareersHeroSlide[]>([]);
    const [careersHeroSettings, setCareersHeroSettings] = useState<CareersHeroSettings>(defaultCareersHeroSettings);
    const [careersStats, setCareersStats] = useState<CareersStat[]>([]);

    // About Hero
    const [aboutHeroSlides, setAboutHeroSlides] = useState<AboutHeroSlide[]>([]);
    const [aboutHeroSettings, setAboutHeroSettings] = useState<AboutHeroSettings>(defaultAboutHeroSettings);

    // Services Page Dynamic Sections
    const [servicesPageStats, setServicesPageStats] = useState<ServicesPageStatItem[]>([]);
    const [fleetTrucks, setFleetTrucks] = useState<FleetTruckItem[]>([]);
    const [portOperations, setPortOperations] = useState<PortOperationItem[]>([]);
    const [specializedCargo, setSpecializedCargo] = useState<SpecializedCargoItem[]>([]);


    // ==================== DATA FETCHING ====================

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Hero Settings
                const settingsRes = await authFetch('/api/cms/hero/settings');
                if (settingsRes.ok) {
                    const data = await settingsRes.json();
                    setSettings(data);
                }

                // Fetch Hero Slides
                setSlidesLoading(true);
                const slidesRes = await authFetch('/api/cms/hero');
                if (slidesRes.ok) {
                    const data = await slidesRes.json();
                    setSlides(data);
                }

                // Fetch About Settings
                const aboutRes = await authFetch('/api/cms/about');
                if (aboutRes.ok) {
                    const aboutData = await aboutRes.json();
                    setAboutSettings(aboutData);
                }

                // Fetch Team Members
                const teamRes = await authFetch('/api/cms/team');
                if (teamRes.ok) {
                    const teamData = await teamRes.json();
                    setTeamMembers(teamData);
                }

                // Fetch Services (all=true to include inactive ones for management)
                const servicesRes = await authFetch('/api/cms/services?all=true');
                if (servicesRes.ok) {
                    const servicesData = await servicesRes.json();
                    console.log('📥 Services loaded:', servicesData.map((s: ServiceItem) => ({
                        id: s.id,
                        title: s.titleEn,
                        hasImage: !!s.image,
                        imagePath: s.image
                    })));
                    setServices(servicesData);
                }

                // Fetch Milestones
                const milestonesRes = await authFetch('/api/cms/milestones');
                if (milestonesRes.ok) {
                    const milestonesData = await milestonesRes.json();
                    setMilestones(milestonesData);
                }

                // Fetch Future Pulse Settings
                const futurePulseRes = await authFetch('/api/cms/future-pulse');
                if (futurePulseRes.ok) {
                    const futurePulseData = await futurePulseRes.json();
                    setFuturePulse(futurePulseData);
                }

                // Fetch Stats
                const statsRes = await authFetch('/api/cms/stats');
                if (statsRes.ok) {
                    const statsData = await statsRes.json();
                    if (statsData.length > 0) {
                        setStats(statsData.sort((a: StatItem, b: StatItem) => a.order - b.order));
                    } else {
                        // Create default stats if none exist
                        const defaultStats = [
                            { value: '25+', labelAr: 'سنة خبرة', labelEn: 'Years Experience', icon: 'Clock', order: 0 },
                            { value: '50+', labelAr: 'ميناء عالمي', labelEn: 'Global Ports', icon: 'Globe2', order: 1 },
                            { value: '10K+', labelAr: 'شحنة ناجحة', labelEn: 'Successful Shipments', icon: 'Package', order: 2 },
                            { value: '24/7', labelAr: 'دعم متواصل', labelEn: 'Support Available', icon: 'Phone', order: 3 },
                        ];
                        for (const stat of defaultStats) {
                            const res = await authFetch('/api/cms/stats', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(stat)
                            });
                            if (res.ok) {
                                const created = await res.json();
                                setStats(prev => [...prev, created]);
                            }
                        }
                    }
                }

                // Fetch Services Hero Settings
                const servicesHeroSettingsRes = await authFetch('/api/cms/services-hero/settings');
                if (servicesHeroSettingsRes.ok) {
                    const data = await servicesHeroSettingsRes.json();
                    setServicesHeroSettings(prev => ({ ...prev, ...data }));
                }

                // Fetch Services Hero Slides
                const servicesHeroSlidesRes = await authFetch('/api/cms/services-hero/slides');
                if (servicesHeroSlidesRes.ok) {
                    const data = await servicesHeroSlidesRes.json();
                    setServicesHeroSlides(data);
                }

                // Fetch Careers Hero Settings
                const careersHeroSettingsRes = await authFetch('/api/cms/careers-hero/settings');
                if (careersHeroSettingsRes.ok) {
                    const data = await careersHeroSettingsRes.json();
                    setCareersHeroSettings(prev => ({ ...prev, ...data }));
                    try {
                        const parsedStats = JSON.parse(data.statsJson || '[]');
                        setCareersStats(parsedStats);
                    } catch (e) {
                        console.error('Failed to parse careers stats:', e);
                    }
                }

                // Fetch Careers Hero Slides
                const careersHeroSlidesRes = await authFetch('/api/cms/careers-hero/slides');
                if (careersHeroSlidesRes.ok) {
                    const data = await careersHeroSlidesRes.json();
                    setCareersHeroSlides(data);
                }

                // Fetch About Hero Settings
                const aboutHeroSettingsRes = await authFetch('/api/cms/about-hero/settings');
                if (aboutHeroSettingsRes.ok) {
                    const data = await aboutHeroSettingsRes.json();
                    setAboutHeroSettings(prev => ({ ...prev, ...data }));
                }

                // Fetch About Hero Slides
                const aboutHeroSlidesRes = await authFetch('/api/cms/about-hero/slides');
                if (aboutHeroSlidesRes.ok) {
                    const data = await aboutHeroSlidesRes.json();
                    setAboutHeroSlides(data);
                }

                // Fetch Services Page Stats
                const spsRes = await authFetch('/api/cms/services-page-stats');
                if (spsRes.ok) setServicesPageStats(await spsRes.json());

                // Fetch Fleet Trucks
                const fleetRes = await authFetch('/api/cms/fleet');
                if (fleetRes.ok) setFleetTrucks(await fleetRes.json());

                // Fetch Port Operations
                const portsRes = await authFetch('/api/cms/ports');
                if (portsRes.ok) setPortOperations(await portsRes.json());

                // Fetch Specialized Cargo
                const cargoRes = await authFetch('/api/cms/specialized-cargo');
                if (cargoRes.ok) setSpecializedCargo(await cargoRes.json());
            } catch (err) {
                console.error('Failed to load data', err);
            } finally {
                setLoading(false);
                setSlidesLoading(false);
            }
        };
        fetchData();
    }, []);

    // ==================== SETTINGS HANDLERS ====================

    // Auto-save timeout reference
    const saveTimeoutRef = { current: null as NodeJS.Timeout | null };

    const handleSettingsChange = useCallback((field: keyof HeroSettings, value: string | number | boolean) => {
        setSettings(prev => {
            const newSettings = { ...prev, [field]: value };

            // Clear previous timeout
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }

            // Auto-save after 500ms delay
            saveTimeoutRef.current = setTimeout(async () => {
                try {
                    await authFetch('/api/cms/hero/settings', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(newSettings),
                    });
                } catch (err) {
                    console.error('Auto-save failed:', err);
                }
            }, 500);

            return newSettings;
        });
    }, []);

    const handleSave = useCallback(async () => {
        setSaving(true);
        try {
            // Save Hero Settings
            await authFetch('/api/cms/hero/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings),
            });

            // Save About Settings
            await authFetch('/api/cms/about', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(aboutSettings),
            });

            // Save Services Hero Settings
            await authFetch('/api/cms/services-hero/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(servicesHeroSettings),
            });

            // Save Careers Hero Settings
            await authFetch('/api/cms/careers-hero/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(careersHeroSettings),
            });

            // Save About Hero Settings
            await authFetch('/api/cms/about-hero/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(aboutHeroSettings),
            });

            success(
                isRTL ? 'تم حفظ جميع التغييرات بنجاح!' : 'All changes saved successfully!',
                isRTL ? '✨ نجح الحفظ' : '✨ Save Successful'
            );
        } catch (err) {
            console.error('Save failed:', err);
            error(
                isRTL ? 'حدث خطأ أثناء حفظ التغييرات. حاول مرة أخرى' : 'Failed to save changes. Please try again',
                isRTL ? '❌ خطأ في الحفظ' : '❌ Save Error'
            );
        } finally {
            setSaving(false);
        }
    }, [settings, aboutSettings, servicesHeroSettings, careersHeroSettings, aboutHeroSettings, isRTL, success, error]);

    // ==================== ABOUT HANDLERS ====================

    const handleAboutChange = useCallback((field: keyof AboutSettings, value: string | number | boolean | { ar: string; en: string }[]) => {
        setAboutSettings(prev => ({ ...prev, [field]: value }));
    }, []);

    const handleFeatureChange = useCallback((idx: number, lang: 'ar' | 'en', value: string) => {
        setAboutSettings(prev => ({
            ...prev,
            features: prev.features.map((f, i) => i === idx ? { ...f, [lang]: value } : f)
        }));
    }, []);

    // ==================== SLIDES HANDLERS ====================

    const handleSlideImageUpload = useCallback(async (file: File, type: 'desktop' | 'mobile') => {
        setUploadingSlide(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('folder', 'hero');

            const res = await authFetch('/api/upload', {
                method: 'POST',
                body: formData
            });

            if (res.ok) {
                const data = await res.json();
                success(
                    isRTL ? `تم رفع صورة ${type === 'desktop' ? 'الديسكتوب' : 'الموبايل'} بنجاح!` : `${type === 'desktop' ? 'Desktop' : 'Mobile'} image uploaded successfully!`,
                    isRTL ? '✅ تم الرفع' : '✅ Uploaded'
                );
                return data.path;
            } else {
                throw new Error('Upload failed');
            }
        } catch (err) {
            error(
                isRTL ? 'فشل رفع الصورة. حاول مرة أخرى' : 'Failed to upload image. Please try again',
                isRTL ? '❌ خطأ في الرفع' : '❌ Upload Error'
            );
            return null;
        } finally {
            setUploadingSlide(false);
        }
    }, [isRTL, success, error]);

    const handleCreateSlide = useCallback(async (imageUrl: string) => {
        if (!imageUrl) {
            warning(
                isRTL ? 'الرجاء رفع صورة على الأقل' : 'Please upload at least one image',
                isRTL ? '⚠️ صورة مطلوبة' : '⚠️ Image Required'
            );
            return false;
        }

        try {
            const res = await authFetch('/api/cms/hero', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    imageDesktopAr: imageUrl,  // Use same image for both languages by default
                    imageDesktopEn: imageUrl,
                    imageMobile: imageUrl,
                    order: slides.length
                }),
            });

            if (res.ok) {
                const newSlide = await res.json();
                setSlides(prev => [...prev, newSlide]);
                success(
                    isRTL ? 'تمت إضافة الشريحة الجديدة بنجاح!' : 'New slide added successfully!',
                    isRTL ? '🎉 تمت الإضافة' : '🎉 Slide Added'
                );
                return true;
            }
            return false;
        } catch (err) {
            error(
                isRTL ? 'فشل في إضافة الشريحة. حاول مرة أخرى' : 'Failed to add slide. Please try again',
                isRTL ? '❌ خطأ' : '❌ Error'
            );
            return false;
        }
    }, [slides.length, isRTL, success, error, warning]);

    const handleDeleteSlide = useCallback(async (id: string) => {
        try {
            await authFetch(`/api/cms/hero/${id}`, { method: 'DELETE' });
            setSlides(prev => prev.filter(s => s.id !== id));
        } catch (err) {
            console.error('Failed to delete slide', err);
        }
    }, []);

    const handleMoveSlide = useCallback(async (id: string, direction: 'up' | 'down') => {
        const idx = slides.findIndex(s => s.id === id);
        if (idx === -1) return;
        if (direction === 'up' && idx === 0) return;
        if (direction === 'down' && idx === slides.length - 1) return;

        const newSlides = [...slides];
        const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
        [newSlides[idx], newSlides[swapIdx]] = [newSlides[swapIdx], newSlides[idx]];

        newSlides.forEach((slide, i) => {
            slide.order = i;
        });

        setSlides(newSlides);

        try {
            await Promise.all(newSlides.map(slide =>
                authFetch(`/api/cms/hero/${slide.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ order: slide.order }),
                })
            ));
        } catch (err) {
            console.error('Failed to reorder slides', err);
        }
    }, [slides]);

    const handleUpdateSlideImage = useCallback(async (slideId: string, field: 'imageDesktopAr' | 'imageDesktopEn' | 'imageMobile', path: string) => {
        try {
            await authFetch(`/api/cms/hero/${slideId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ [field]: path })
            });
            setSlides(prev => prev.map(s => s.id === slideId ? { ...s, [field]: path } : s));
        } catch (err) {
            console.error('Failed to update slide image', err);
        }
    }, []);

    // ==================== STATS HANDLERS ====================

    const handleStatChange = useCallback(async (id: string, field: keyof StatItem, value: string) => {
        setStats(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));

        try {
            await authFetch(`/api/cms/stats/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ [field]: value })
            });
        } catch (err) {
            console.error('Failed to save stat', err);
        }
    }, []);

    // ==================== TEAM HANDLERS ====================

    const handleAddMember = useCallback(async (member: Partial<TeamMember>) => {
        if (!member.nameAr || !member.nameEn || !member.roleAr || !member.roleEn || !member.image) {
            warning(
                isRTL ? 'الرجاء ملء جميع الحقول المطلوبة للمتابعة' : 'Please fill all required fields to continue',
                isRTL ? '⚠️ حقول مطلوبة' : '⚠️ Required Fields'
            );
            return false;
        }
        try {
            const res = await authFetch('/api/cms/team', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...member, order: teamMembers.length }),
            });
            if (res.ok) {
                const newMember = await res.json();
                setTeamMembers(prev => [...prev, newMember]);
                success(
                    isRTL ? 'تمت إضافة العضو الجديد بنجاح!' : 'New member added successfully!',
                    isRTL ? '✅ تمت الإضافة' : '✅ Member Added'
                );
                return true;
            }
            return false;
        } catch (err) {
            error(
                isRTL ? 'فشل في إضافة العضو. حاول مرة أخرى' : 'Failed to add member. Please try again',
                isRTL ? '❌ خطأ في الإضافة' : '❌ Addition Error'
            );
            return false;
        }
    }, [teamMembers.length, isRTL, success, error, warning]);

    const handleUpdateMember = useCallback(async (member: TeamMember) => {
        try {
            // ── Strict sanitization: only send Prisma-safe fields ──
            const sanitizedData: Record<string, unknown> = {};
            if (member.nameAr !== undefined) sanitizedData.nameAr = member.nameAr;
            if (member.nameEn !== undefined) sanitizedData.nameEn = member.nameEn;
            if (member.roleAr !== undefined) sanitizedData.roleAr = member.roleAr;
            if (member.roleEn !== undefined) sanitizedData.roleEn = member.roleEn;
            if (member.image !== undefined) sanitizedData.image = member.image;
            if (member.linkedin !== undefined) sanitizedData.linkedin = member.linkedin || null;
            if (member.twitter !== undefined) sanitizedData.twitter = member.twitter || null;
            if (member.order !== undefined) sanitizedData.order = member.order;
            if (member.isActive !== undefined) sanitizedData.isActive = member.isActive;

            const url = `/api/cms/team/${member.id}`;
            console.log('📤 [TeamUpdate] PUT', url);
            console.log('📤 [TeamUpdate] Body:', JSON.stringify(sanitizedData, null, 2));

            const res = await authFetch(url, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(sanitizedData),
            });

            console.log('📥 [TeamUpdate] Response status:', res.status);

            if (res.ok) {
                const updated = await res.json();
                console.log('✅ [TeamUpdate] Success:', updated.id);
                setTeamMembers(prev => prev.map(m => m.id === updated.id ? updated : m));
                success(
                    isRTL ? 'تم تحديث بيانات العضو بنجاح!' : 'Member details updated successfully!',
                    isRTL ? '✅ تم التحديث' : '✅ Updated'
                );
                return true;
            } else {
                const errData = await res.json().catch(() => ({ error: 'Unknown error' }));
                console.error('❌ [TeamUpdate] Server error:', res.status, errData);
                error(
                    isRTL ? `فشل في التحديث: ${errData.error}` : `Update failed: ${errData.error}`,
                    isRTL ? '❌ خطأ في التحديث' : '❌ Update Error'
                );
                return false;
            }
        } catch (err) {
            console.error('❌ [TeamUpdate] Exception:', err);
            error(
                isRTL ? 'فشل في تحديث البيانات. حاول مرة أخرى' : 'Failed to update member. Please try again',
                isRTL ? '❌ خطأ في التحديث' : '❌ Update Error'
            );
            return false;
        }
    }, [isRTL, success, error]);

    const handleDeleteMember = useCallback(async (id: string) => {
        try {
            await authFetch(`/api/cms/team/${id}`, { method: 'DELETE' });
            setTeamMembers(prev => prev.filter(m => m.id !== id));
            success(
                isRTL ? 'تم حذف العضو بنجاح!' : 'Member deleted successfully!',
                isRTL ? '🗑️ تم الحذف' : '🗑️ Deleted'
            );
        } catch (err) {
            error(
                isRTL ? 'فشل في حذف العضو. حاول مرة أخرى' : 'Failed to delete member. Please try again',
                isRTL ? '❌ خطأ في الحذف' : '❌ Deletion Error'
            );
        }
    }, [isRTL, success, error]);

    // ==================== SERVICES HANDLERS ====================

    const handleAddService = useCallback(async (service: Partial<ServiceItem>) => {
        if (!service.titleAr || !service.titleEn) {
            warning(
                isRTL ? 'الرجاء إدخال اسم الخدمة بالعربي والإنجليزي' : 'Please enter service name in Arabic and English',
                isRTL ? '⚠️ حقول مطلوبة' : '⚠️ Required Fields'
            );
            return false;
        }

        try {
            // Generate slug from English title if not provided
            const slug = service.slug || service.titleEn
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '');

            const serviceData = {
                slug,
                iconName: service.iconName || 'Ship',
                titleAr: service.titleAr,
                titleEn: service.titleEn,
                shortDescAr: service.shortDescAr || service.titleAr,
                shortDescEn: service.shortDescEn || service.titleEn,
                descriptionAr: service.descriptionAr || '',
                descriptionEn: service.descriptionEn || '',
                featuresJson: service.featuresJson || '[]',
                color: service.color || '#F97316',
                order: service.order !== undefined ? service.order : services.length,
                isActive: true,
                image: service.image || '', // Desktop image (default)
                imageMobile: service.imageMobile || '' // Mobile image (optional)
            };

            console.log('📤 Sending service data to API:', {
                titleEn: serviceData.titleEn,
                hasImage: !!serviceData.image,
                imagePath: serviceData.image,
                allFields: Object.keys(serviceData)
            });

            const res = await authFetch('/api/cms/services', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(serviceData)
            });

            if (res.ok) {
                const newService = await res.json();
                setServices(prev => [...prev, newService]);
                invalidateCache('/api/cms/services');
                success(
                    isRTL ? 'تمت إضافة الخدمة بنجاح!' : 'Service added successfully!',
                    isRTL ? '✅ تمت الإضافة' : '✅ Added'
                );
                return true;
            } else {
                const errorData = await res.json();
                error(
                    isRTL ? `فشل في إضافة الخدمة: ${errorData.error || 'خطأ غير معروف'}` : `Failed to add service: ${errorData.error || 'Unknown error'}`,
                    isRTL ? '❌ خطأ في الإضافة' : '❌ Addition Error'
                );
                return false;
            }
        } catch (err) {
            console.error('Error adding service:', err);
            error(
                isRTL ? 'فشل في إضافة الخدمة. حاول مرة أخرى' : 'Failed to add service. Please try again',
                isRTL ? '❌ خطأ في الإضافة' : '❌ Addition Error'
            );
            return false;
        }
    }, [services.length, isRTL, success, error, warning]);

    const handleUpdateService = useCallback(async (service: ServiceItem) => {
        try {
            console.log('📤 Updating service:', {
                id: service.id,
                hasImage: !!service.image,
                imagePath: service.image
            });

            // Strip non-Prisma fields before sending
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { id: _id, features: _f, images: _imgs, ...cleanData } = service;

            const res = await authFetch(`/api/cms/services/${service.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(cleanData)
            });
            if (res.ok) {
                const updated = await res.json();
                console.log('✅ Service updated successfully:', {
                    id: updated.id,
                    hasImage: !!updated.image
                });
                setServices(prev => prev.map(s => s.id === updated.id ? updated : s));
                invalidateCache('/api/cms/services');
                success(
                    isRTL ? 'تم تحديث الخدمة بنجاح!' : 'Service updated successfully!',
                    isRTL ? '✅ تم التحديث' : '✅ Updated'
                );
                return true;
            } else {
                const errData = await res.json().catch(() => ({ error: 'Unknown error' }));
                error(
                    isRTL ? `فشل في تحديث الخدمة: ${errData.error}` : `Failed to update service: ${errData.error}`,
                    isRTL ? '❌ خطأ' : '❌ Error'
                );
                return false;
            }
        } catch (err) {
            console.error('❌ Error updating service:', err);
            error(
                isRTL ? 'فشل في تحديث الخدمة' : 'Failed to update service',
                isRTL ? '❌ خطأ' : '❌ Error'
            );
            return false;
        }
    }, [isRTL, success, error]);

    const handleToggleServiceActive = useCallback(async (serviceId: string, isActive: boolean) => {
        try {
            const res = await authFetch(`/api/cms/services/${serviceId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive })
            });
            if (res.ok) {
                setServices(prev => prev.map(s => s.id === serviceId ? { ...s, isActive } as ServiceItem : s));
                invalidateCache('/api/cms/services');
                success(
                    isRTL
                        ? (isActive ? 'تم تفعيل الخدمة بنجاح!' : 'تم تعطيل الخدمة بنجاح!')
                        : (isActive ? 'Service activated!' : 'Service deactivated!'),
                    isRTL ? '✅ تم التحديث' : '✅ Updated'
                );
            } else {
                const errData = await res.json().catch(() => ({ error: 'Unknown error' }));
                error(
                    isRTL ? `فشل في تحديث الخدمة: ${errData.error}` : `Failed to toggle service: ${errData.error}`,
                    isRTL ? '❌ خطأ' : '❌ Error'
                );
            }
        } catch (err) {
            console.error(err);
            error(
                isRTL ? 'فشل في تحديث حالة الخدمة' : 'Failed to toggle service status',
                isRTL ? '❌ خطأ' : '❌ Error'
            );
        }
    }, [isRTL, success, error]);

    const handleSwapService = useCallback(async (serviceId: string, targetServiceId: string) => {
        try {
            const res = await authFetch('/api/cms/services/swap', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ serviceId, targetServiceId })
            });
            if (res.ok) {
                // Refresh services list after swap
                const refreshRes = await authFetch('/api/cms/services?all=true');
                if (refreshRes.ok) {
                    const refreshed = await refreshRes.json();
                    setServices(refreshed);
                }
                invalidateCache('/api/cms/services');
                return true;
            } else {
                const errData = await res.json().catch(() => ({ error: 'Unknown error' }));
                error(
                    isRTL ? `فشل في تغيير الترتيب: ${errData.error}` : `Failed to swap order: ${errData.error}`,
                    isRTL ? '❌ خطأ' : '❌ Error'
                );
                return false;
            }
        } catch (err) {
            console.error('Error swapping services:', err);
            error(
                isRTL ? 'فشل في تغيير ترتيب الخدمة' : 'Failed to swap service order',
                isRTL ? '❌ خطأ' : '❌ Error'
            );
            return false;
        }
    }, [isRTL, error]);

    // ==================== MILESTONES HANDLERS ====================

    const handleAddMilestone = useCallback(async (milestone: Partial<MilestoneItem>) => {
        if (!milestone.year || !milestone.titleAr || !milestone.titleEn) {
            return false;
        }
        try {
            const res = await authFetch('/api/cms/milestones', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...milestone, order: milestones.length })
            });
            if (res.ok) {
                const newMilestone = await res.json();
                setMilestones(prev => [...prev, newMilestone]);
                return true;
            }
            return false;
        } catch (err) {
            console.error(err);
            return false;
        }
    }, [milestones.length]);

    const handleUpdateMilestone = useCallback(async (milestone: MilestoneItem) => {
        try {
            const res = await authFetch(`/api/cms/milestones/${milestone.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(milestone)
            });
            if (res.ok) {
                const updated = await res.json();
                setMilestones(prev => prev.map(m => m.id === updated.id ? updated : m));
                return true;
            }
            return false;
        } catch (err) {
            console.error(err);
            return false;
        }
    }, []);

    const handleDeleteMilestone = useCallback(async (id: string) => {
        try {
            await authFetch(`/api/cms/milestones/${id}`, { method: 'DELETE' });
            setMilestones(prev => prev.filter(m => m.id !== id));
        } catch (err) {
            console.error('Failed to delete milestone', err);
        }
    }, []);

    const handleMoveMilestone = useCallback(async (id: string, direction: 'up' | 'down') => {
        const sorted = [...milestones].sort((a, b) => a.order - b.order);
        const idx = sorted.findIndex(m => m.id === id);
        if (idx === -1) return;
        if (direction === 'up' && idx === 0) return;
        if (direction === 'down' && idx === sorted.length - 1) return;

        const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
        const current = sorted[idx];
        const target = sorted[swapIdx];
        const tempOrder = current.order;

        try {
            await Promise.all([
                authFetch(`/api/cms/milestones/${current.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ order: target.order })
                }),
                authFetch(`/api/cms/milestones/${target.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ order: tempOrder })
                })
            ]);
            setMilestones(prev => prev.map(m => {
                if (m.id === current.id) return { ...m, order: target.order };
                if (m.id === target.id) return { ...m, order: tempOrder };
                return m;
            }));
        } catch (err) {
            console.error(err);
        }
    }, [milestones]);

    // ==================== FUTURE PULSE HANDLERS ====================

    const handleUpdateFuturePulse = useCallback(async (data: FuturePulseSettings) => {
        try {
            const res = await authFetch('/api/cms/future-pulse', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (res.ok) {
                const updated = await res.json();
                setFuturePulse(updated);
                success(language === 'ar' ? 'تم تحديث كارت المستقبل' : 'Future card updated');
                return true;
            }
            return false;
        } catch (err) {
            console.error('Failed to update future pulse:', err);
            error(language === 'ar' ? 'فشل في التحديث' : 'Update failed');
            return false;
        }
    }, [language, success, error]);

    // ==================== SERVICES HERO HANDLERS ====================

    const handleSaveServicesHeroSettings = useCallback(async () => {
        try {
            await authFetch('/api/cms/services-hero/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(servicesHeroSettings)
            });
            return true;
        } catch (err) {
            console.error(err);
            return false;
        }
    }, [servicesHeroSettings]);

    const handleAddServicesHeroSlide = useCallback(async (imageDesktop: string) => {
        try {
            const res = await authFetch('/api/cms/services-hero/slides', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ imageDesktopAr: imageDesktop, imageDesktopEn: imageDesktop })
            });
            if (res.ok) {
                const newSlide = await res.json();
                setServicesHeroSlides(prev => [...prev, newSlide]);
                return true;
            }
            return false;
        } catch (err) {
            console.error(err);
            return false;
        }
    }, []);

    const handleDeleteServicesHeroSlide = useCallback(async (id: string) => {
        try {
            await authFetch(`/api/cms/services-hero/slides/${id}`, { method: 'DELETE' });
            setServicesHeroSlides(prev => prev.filter(s => s.id !== id));
        } catch (err) {
            console.error(err);
        }
    }, []);

    // ==================== CAREERS HERO HANDLERS ====================

    const handleSaveCareersHeroSettings = useCallback(async () => {
        setSaving(true);
        try {
            const updatedSettings = {
                ...careersHeroSettings,
                statsJson: JSON.stringify(careersStats)
            };
            await authFetch('/api/cms/careers-hero/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedSettings)
            });
            return true;
        } catch (err) {
            console.error('Failed to save:', err);
            return false;
        } finally {
            setSaving(false);
        }
    }, [careersHeroSettings, careersStats]);

    const handleAddCareersHeroSlide = useCallback(async (imageDesktop: string) => {
        setUploadingCareersSlide(true);
        try {
            const res = await authFetch('/api/cms/careers-hero/slides', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ imageDesktopAr: imageDesktop, imageDesktopEn: imageDesktop })
            });
            if (res.ok) {
                const newSlide = await res.json();
                setCareersHeroSlides(prev => [...prev, newSlide]);
                return true;
            }
            return false;
        } catch (err) {
            console.error('Failed to add slide:', err);
            return false;
        } finally {
            setUploadingCareersSlide(false);
        }
    }, []);

    const handleDeleteCareersHeroSlide = useCallback(async (id: string) => {
        try {
            await authFetch(`/api/cms/careers-hero/slides/${id}`, { method: 'DELETE' });
            setCareersHeroSlides(prev => prev.filter(s => s.id !== id));
        } catch (err) {
            console.error('Failed to delete slide:', err);
        }
    }, []);

    const handleUpdateCareersSlideImage = useCallback(async (slideId: string, field: 'imageDesktopAr' | 'imageDesktopEn' | 'imageMobile', path: string) => {
        try {
            await authFetch(`/api/cms/careers-hero/slides/${slideId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ [field]: path })
            });
            setCareersHeroSlides(prev => prev.map(s => s.id === slideId ? { ...s, [field]: path } : s));
        } catch (err) {
            console.error('Failed to update careers slide image:', err);
        }
    }, []);

    const handleMoveCareersSlide = useCallback(async (id: string, direction: 'up' | 'down') => {
        const idx = careersHeroSlides.findIndex(s => s.id === id);
        if (idx === -1) return;
        if (direction === 'up' && idx === 0) return;
        if (direction === 'down' && idx === careersHeroSlides.length - 1) return;

        const newSlides = [...careersHeroSlides];
        const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
        [newSlides[idx], newSlides[swapIdx]] = [newSlides[swapIdx], newSlides[idx]];

        newSlides.forEach((slide, i) => {
            slide.order = i;
        });

        setCareersHeroSlides(newSlides);

        try {
            await Promise.all(newSlides.map(slide =>
                authFetch(`/api/cms/careers-hero/slides/${slide.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ order: slide.order }),
                })
            ));
        } catch (err) {
            console.error('Failed to reorder careers slides:', err);
        }
    }, [careersHeroSlides]);

    // ==================== IMAGE UPLOAD UTIL ====================

    const uploadImage = useCallback(async (file: File, folder: string): Promise<string | null> => {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('folder', folder);
            const res = await authFetch('/api/upload', { method: 'POST', body: formData });
            if (res.ok) {
                const data = await res.json();
                return data.path;
            }
            return null;
        } catch (err) {
            console.error('Upload failed', err);
            return null;
        }
    }, []);

    return {
        // States
        loading,
        saving,
        slidesLoading,
        uploadingSlide,
        uploadingImage,
        uploadingCareersSlide,
        isRTL,

        // Data
        settings,
        setSettings,
        slides,
        setSlides,
        stats,
        setStats,
        aboutSettings,
        setAboutSettings,
        teamMembers,
        setTeamMembers,
        services,
        setServices,
        milestones,
        setMilestones,
        servicesHeroSlides,
        setServicesHeroSlides,
        servicesHeroSettings,
        setServicesHeroSettings,
        careersHeroSlides,
        setCareersHeroSlides,
        careersHeroSettings,
        setCareersHeroSettings,
        careersStats,
        setCareersStats,
        aboutHeroSlides,
        setAboutHeroSlides,
        aboutHeroSettings,
        setAboutHeroSettings,

        // Settings Handlers
        handleSettingsChange,
        handleSave,

        // About Handlers
        handleAboutChange,
        handleFeatureChange,

        // Slides Handlers
        handleSlideImageUpload,
        handleCreateSlide,
        handleDeleteSlide,
        handleMoveSlide,
        handleUpdateSlideImage,

        // Stats Handlers
        handleStatChange,

        // Team Handlers
        handleAddMember,
        handleUpdateMember,
        handleDeleteMember,

        // Services Handlers
        handleAddService,
        handleUpdateService,
        handleToggleServiceActive,
        handleSwapService,

        // Milestones Handlers
        handleAddMilestone,
        handleUpdateMilestone,
        handleDeleteMilestone,
        handleMoveMilestone,

        // Future Pulse
        futurePulse,
        setFuturePulse,
        handleUpdateFuturePulse,

        // Services Hero Handlers
        handleSaveServicesHeroSettings,
        handleAddServicesHeroSlide,
        handleDeleteServicesHeroSlide,

        // Careers Hero Handlers
        handleSaveCareersHeroSettings,
        handleAddCareersHeroSlide,
        handleDeleteCareersHeroSlide,
        handleUpdateCareersSlideImage,
        handleMoveCareersSlide,

        // About Hero Handlers
        handleSaveAboutHeroSettings: async () => {
            try {
                await authFetch('/api/cms/about-hero/settings', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(aboutHeroSettings)
                });
                return true;
            } catch (err) {
                console.error(err);
                return false;
            }
        },
        handleAddAboutHeroSlide: async (imageDesktop: string) => {
            try {
                const res = await authFetch('/api/cms/about-hero/slides', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ imageDesktopAr: imageDesktop, imageDesktopEn: imageDesktop })
                });
                if (res.ok) {
                    const newSlide = await res.json();
                    setAboutHeroSlides(prev => [...prev, newSlide]);
                    return true;
                }
                return false;
            } catch (err) {
                console.error(err);
                return false;
            }
        },
        handleDeleteAboutHeroSlide: async (id: string) => {
            try {
                await authFetch(`/api/cms/about-hero/slides/${id}`, { method: 'DELETE' });
                setAboutHeroSlides(prev => prev.filter(s => s.id !== id));
            } catch (err) {
                console.error(err);
            }
        },

        // Utils
        uploadImage,
        setUploadingImage,

        // Services Page Dynamic Sections
        servicesPageStats,
        setServicesPageStats,
        fleetTrucks,
        setFleetTrucks,
        portOperations,
        setPortOperations,
        specializedCargo,
        setSpecializedCargo,

        // Services Page Stats Handlers
        handleAddServicesPageStat: async (stat: Partial<ServicesPageStatItem>) => {
            try {
                const res = await authFetch('/api/cms/services-page-stats', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...stat, order: servicesPageStats.length })
                });
                if (res.ok) {
                    const created = await res.json();
                    setServicesPageStats(prev => [...prev, created]);
                    success(isRTL ? 'تمت إضافة الإحصائية!' : 'Stat added!', isRTL ? '✅ تمت الإضافة' : '✅ Added');
                    return true;
                }
                error(isRTL ? 'فشل في إضافة الإحصائية' : 'Failed to add stat', '❌');
                return false;
            } catch (err) { console.error(err); error(isRTL ? 'خطأ غير متوقع' : 'Unexpected error', '❌'); return false; }
        },
        handleUpdateServicesPageStat: async (stat: ServicesPageStatItem) => {
            try {
                const { id: _id, createdAt: _c, updatedAt: _u, ...cleanStat } = stat as any;
                const res = await authFetch(`/api/cms/services-page-stats/${stat.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(cleanStat)
                });
                if (res.ok) {
                    const updated = await res.json();
                    setServicesPageStats(prev => prev.map(s => s.id === updated.id ? updated : s));
                    success(isRTL ? 'تم التحديث!' : 'Stat updated!', isRTL ? '✅ تم' : '✅ Updated');
                    return true;
                }
                error(isRTL ? 'فشل في تحديث الإحصائية' : 'Failed to update stat', '❌');
                return false;
            } catch (err) { console.error(err); error(isRTL ? 'خطأ غير متوقع' : 'Unexpected error', '❌'); return false; }
        },
        handleDeleteServicesPageStat: async (id: string) => {
            try {
                const res = await authFetch(`/api/cms/services-page-stats/${id}`, { method: 'DELETE' });
                if (res.ok) {
                    setServicesPageStats(prev => prev.filter(s => s.id !== id));
                    success(isRTL ? 'تم الحذف!' : 'Stat deleted!', isRTL ? '🗑️ تم' : '🗑️ Deleted');
                } else {
                    error(isRTL ? 'فشل في الحذف' : 'Failed to delete', '❌');
                }
            } catch (err) { console.error(err); error(isRTL ? 'فشل في الحذف' : 'Failed to delete', '❌'); }
        },

        // Fleet Handlers
        handleAddFleetTruck: async (truck: Partial<FleetTruckItem>) => {
            try {
                const res = await authFetch('/api/cms/fleet', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...truck, order: fleetTrucks.length })
                });
                if (res.ok) {
                    const created = await res.json();
                    setFleetTrucks(prev => [...prev, created]);
                    success(isRTL ? 'تمت إضافة الشاحنة!' : 'Truck added!', isRTL ? '✅ تمت الإضافة' : '✅ Added');
                    return true;
                }
                error(isRTL ? 'فشل في إضافة الشاحنة' : 'Failed to add truck', '❌');
                return false;
            } catch (err) { console.error(err); error(isRTL ? 'خطأ غير متوقع' : 'Unexpected error', '❌'); return false; }
        },
        handleUpdateFleetTruck: async (truck: FleetTruckItem) => {
            try {
                const { id: _id, createdAt: _c, updatedAt: _u, ...cleanTruck } = truck as any;
                const res = await authFetch(`/api/cms/fleet/${truck.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(cleanTruck)
                });
                if (res.ok) {
                    const updated = await res.json();
                    setFleetTrucks(prev => prev.map(t => t.id === updated.id ? updated : t));
                    success(isRTL ? 'تم التحديث!' : 'Truck updated!', isRTL ? '✅ تم' : '✅ Updated');
                    return true;
                }
                error(isRTL ? 'فشل في تحديث الشاحنة' : 'Failed to update truck', '❌');
                return false;
            } catch (err) { console.error(err); error(isRTL ? 'خطأ غير متوقع' : 'Unexpected error', '❌'); return false; }
        },
        handleDeleteFleetTruck: async (id: string) => {
            try {
                const res = await authFetch(`/api/cms/fleet/${id}`, { method: 'DELETE' });
                if (res.ok) {
                    setFleetTrucks(prev => prev.filter(t => t.id !== id));
                    success(isRTL ? 'تم الحذف!' : 'Truck deleted!', isRTL ? '🗑️ تم' : '🗑️ Deleted');
                } else {
                    error(isRTL ? 'فشل في الحذف' : 'Failed to delete', '❌');
                }
            } catch (err) { console.error(err); error(isRTL ? 'فشل في الحذف' : 'Failed to delete', '❌'); }
        },

        // Port Handlers
        handleAddPortOperation: async (port: Partial<PortOperationItem>) => {
            try {
                const res = await authFetch('/api/cms/ports', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...port, order: portOperations.length })
                });
                if (res.ok) {
                    const created = await res.json();
                    setPortOperations(prev => [...prev, created]);
                    success(isRTL ? 'تمت إضافة الميناء!' : 'Port added!', isRTL ? '✅ تمت الإضافة' : '✅ Added');
                    return true;
                }
                error(isRTL ? 'فشل في إضافة الميناء' : 'Failed to add port', '❌');
                return false;
            } catch (err) { console.error(err); error(isRTL ? 'خطأ غير متوقع' : 'Unexpected error', '❌'); return false; }
        },
        handleUpdatePortOperation: async (port: PortOperationItem) => {
            try {
                const { id: _id, createdAt: _c, updatedAt: _u, ...cleanPort } = port as any;
                const res = await authFetch(`/api/cms/ports/${port.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(cleanPort)
                });
                if (res.ok) {
                    const updated = await res.json();
                    setPortOperations(prev => prev.map(p => p.id === updated.id ? updated : p));
                    success(isRTL ? 'تم التحديث!' : 'Port updated!', isRTL ? '✅ تم' : '✅ Updated');
                    return true;
                }
                error(isRTL ? 'فشل في تحديث الميناء' : 'Failed to update port', '❌');
                return false;
            } catch (err) { console.error(err); error(isRTL ? 'خطأ غير متوقع' : 'Unexpected error', '❌'); return false; }
        },
        handleDeletePortOperation: async (id: string) => {
            try {
                const res = await authFetch(`/api/cms/ports/${id}`, { method: 'DELETE' });
                if (res.ok) {
                    setPortOperations(prev => prev.filter(p => p.id !== id));
                    success(isRTL ? 'تم الحذف!' : 'Port deleted!', isRTL ? '🗑️ تم' : '🗑️ Deleted');
                } else {
                    error(isRTL ? 'فشل في الحذف' : 'Failed to delete', '❌');
                }
            } catch (err) { console.error(err); error(isRTL ? 'فشل في الحذف' : 'Failed to delete', '❌'); }
        },

        // Specialized Cargo Handlers
        handleAddSpecializedCargo: async (cargo: Partial<SpecializedCargoItem>) => {
            try {
                const res = await authFetch('/api/cms/specialized-cargo', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...cargo, order: specializedCargo.length })
                });
                if (res.ok) {
                    const created = await res.json();
                    setSpecializedCargo(prev => [...prev, created]);
                    success(isRTL ? 'تمت إضافة نوع البضاعة!' : 'Cargo type added!', isRTL ? '✅ تمت الإضافة' : '✅ Added');
                    return true;
                }
                error(isRTL ? 'فشل في إضافة نوع البضاعة' : 'Failed to add cargo type', '❌');
                return false;
            } catch (err) { console.error(err); error(isRTL ? 'خطأ غير متوقع' : 'Unexpected error', '❌'); return false; }
        },
        handleUpdateSpecializedCargo: async (cargo: SpecializedCargoItem) => {
            try {
                const { id: _id, createdAt: _c, updatedAt: _u, ...cleanCargo } = cargo as any;
                const res = await authFetch(`/api/cms/specialized-cargo/${cargo.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(cleanCargo)
                });
                if (res.ok) {
                    const updated = await res.json();
                    setSpecializedCargo(prev => prev.map(c => c.id === updated.id ? updated : c));
                    success(isRTL ? 'تم التحديث!' : 'Cargo updated!', isRTL ? '✅ تم' : '✅ Updated');
                    return true;
                }
                error(isRTL ? 'فشل في تحديث نوع البضاعة' : 'Failed to update cargo type', '❌');
                return false;
            } catch (err) { console.error(err); error(isRTL ? 'خطأ غير متوقع' : 'Unexpected error', '❌'); return false; }
        },
        handleDeleteSpecializedCargo: async (id: string) => {
            try {
                const res = await authFetch(`/api/cms/specialized-cargo/${id}`, { method: 'DELETE' });
                if (res.ok) {
                    setSpecializedCargo(prev => prev.filter(c => c.id !== id));
                    success(isRTL ? 'تم الحذف!' : 'Cargo deleted!', isRTL ? '🗑️ تم' : '🗑️ Deleted');
                } else {
                    error(isRTL ? 'فشل في الحذف' : 'Failed to delete', '❌');
                }
            } catch (err) { console.error(err); error(isRTL ? 'فشل في الحذف' : 'Failed to delete', '❌'); }
        },
    };
}
