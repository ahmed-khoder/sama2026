'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'ar' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const translations = {
  ar: {
    // Navigation
    home: 'الرئيسية',
    services: 'خدماتنا اللوجستية',
    blog: 'المدونة',
    about: 'عن الشركة',
    contact: 'تواصل معنا',
    careers: 'وظائف',
    dashboard: 'لوحة التحكم',

    // Hero Section
    hero_title: 'حلول لوجستية متكاملة للشحن والتخليص الجمركي',
    hero_subtitle: 'نقدم خدمات الشحن البحري والجوي والتخليص الجمركي بأعلى معايير الاحترافية. شريكك الموثوق في سلسلة الإمداد العالمية.',
    get_quote: 'اطلب عرض سعر',
    our_services: 'استكشف خدماتنا',

    // Stats
    years_experience: 'سنة خبرة',
    global_ports: 'ميناء عالمي',
    successful_shipments: 'شحنة ناجحة',
    support_247: 'دعم متواصل',

    // Features
    why_choose_us: 'لماذا تختار سما؟',
    why_choose_us_subtitle: 'أبعد من مجرد شحن.. نحن ننقل الثقة.',
    feature_global: 'وصول عالمي.. خبرة محلية',
    feature_global_desc: 'نبني الجسور بينك وبين الأسواق العالمية عبر شبكة وكلاء موثوقة في كافة الموانئ والمطارات، لتجعل أعمالك بلا حدود.',
    feature_safety: 'أمان لا يقبل المساومة',
    feature_safety_desc: 'شحنتك هي "أمانتنا". من الاستلام وحتى التسليم، نطبق معايير أمان صارمة لنضمن وصول بضائعك سليمة تماماً كما وعدنا.',
    feature_customs: 'تخليص جمركي سلس',
    feature_customs_desc: 'نحول التعقيدات القانونية إلى مسار ممهد. خبراؤنا يتولون إنهاء كافة الإجراءات بكفاءة، لتفادي أي عوائق قد تؤخر نجاحك.',
    feature_tailored: 'حلول مُفصلة لنموك',
    feature_tailored_desc: 'لا نؤمن بالحلول الجاهزة. نحن لا نقدم مجرد شحن، بل نصمم حلولاً لوجستية مفصلة تناسب ميزانيتك وجدولك الزمني بدقة.',

    // Leadership Team
    leadership_title: 'قيادة ملهمة.. رؤية ثاقبة',
    leadership_subtitle: 'نخبة من الخبراء يقودون دفة "سما" نحو آفاق جديدة من التميز والابتكار في عالم الخدمات اللوجستية.',
    ceo_name: 'أحمد خضير',
    ceo_role: 'الرئيس التنفيذي',
    ceo_quote: 'رؤيتنا هي أن نكون الشريان الذي يربط الأعمال بالعالم، ليس فقط بنقل البضائع، بل بنقل القيم والثقة.',
    ops_manager_name: 'محمد خضير',
    ops_manager_role: 'مدير العمليات',
    ops_manager_quote: 'الدقة في التفاصيل هي سر نجاحنا. نحن نضمن أن كل خطوة في سلسلة الإمداد محسوبة ومراقبة بدقة متناهية.',
    customs_manager_name: 'سلمى جمال',
    customs_manager_role: 'مدير التخليص الجمركي',
    customs_manager_quote: 'نتجاوز التحديات الروتينية بخبرة عميقة وعلاقات قوية، لنجعل من التخليص الجمركي مرحلة سلسة لا عائقاً.',

    // Company Fleet
    fleet_title: 'أسطولنا.. القوة الدافعة لأعمالك',
    fleet_description: 'في "سما"، لا ندير الشحنات فحسب، بل نقودها بأنفسنا. امتلاكنا لأسطول ضخم وحديث يضمن لك توافر الناقلات، ومرونة كاملة، وسيطرة تامة على رحلة بضائعك.',
    fleet_feature_diverse: 'تنوع القدرات',
    fleet_feature_diverse_desc: 'جاهزون لكافة أنواع البضائع الجافة والمبردة والثقيلة',
    fleet_feature_tracking: 'تتبع لحظي',
    fleet_feature_tracking_desc: 'رؤية كاملة لمسار الشحنة',
    fleet_feature_maintenance: 'صيانة دورية',
    fleet_feature_maintenance_desc: 'شاحنات يعتمد عليها بلا أعطال',

    // About Us
    about_hero_title: 'سما لوجستيك: نصل العوالم.. ونصنع القيمة.',
    about_hero_desc: 'نحن لسنا مجرد مزود خدمات لوجستية، بل نحن مهندسو سلاسل الإمداد. نمزج بين الخبرة العميقة والقدرات الميدانية لنبقي العالم في حركة مستمرة. من الطرق المحلية إلى الموانئ العالمية، نحن "الحلقة الوثيقة" التي تحول طموح أعمالك إلى واقع ملموس.',
    about_vision_title: 'إعادة صياغة المفاهيم اللوجستية',
    about_vision_desc: 'أن نكون القوة الدافعة خلف نمو عملائنا، واضعين معايير جديدة للموثوقية والابتكار في صناعة اللوجستيات.',
    about_mission_title: 'تحويل التحديات إلى حلول',
    about_mission_desc: 'تمكين الشركات عبر تقديم حلول لوجستية متكاملة وسلسة حيث تلتقي الدقة بالسرعة وكفاءة التكلفة.',
    about_value_precision: 'الدقة في التفاصيل',
    about_value_precision_desc: 'نؤمن بأن الفرق يكمن في التفاصيل الصغيرة؛ لذا نعتني بكل خطوة.',
    about_value_partnership: 'شراكة حقيقية',
    about_value_partnership_desc: 'أهدافكم هي أهدافنا. نعمل كامتداد لفريقكم وليس كطرف خارجي.',
    about_value_integrity: 'النزاهة والشفافية',
    about_value_integrity_desc: 'الصدق عملتنا. ما نعد به، نلتزم بتنفيذه مهما كانت الظروف.',

    // Services Page
    services_hero_title: 'حلولنا اللوجستية: حلول متكاملة لأعمالك',
    services_hero_desc: 'نقدم مجموعة متكاملة من خدمات الشحن والتخليص الجمركي المصممة خصيصاً لتلبية احتياجات عملك، مع ضمان السرعة والأمان.',
    service_sea: 'الشحن البحري',
    service_sea_desc: 'خدمات شحن الحاويات الكاملة (FCL) والمشتركة (LCL) من وإلى جميع الموانئ العالمية بأسعار تنافسية.',
    service_air: 'الشحن الجوي',
    service_air_desc: 'حلول شحن جوي سريعة للبضائع العاجلة والحساسة مع خيارات توصيل من الباب إلى الباب.',
    service_land: 'النقل البري',
    service_land_desc: 'أسطول حديث لنقل البضائع محلياً وإقليمياً، مع تتبع دقيق للشحنات لضمان وصولها في الموعد.',
    service_customs: 'التخليص الجمركي',
    service_customs_desc: 'فريق من الخبراء لإنهاء كافة الإجراءات الجمركية بسرعة وكفاءة وتجنب أي غرامات تأخير.',
    service_warehousing: 'التخزين والتوزيع',
    service_warehousing_desc: 'مستودعات آمنة ومجهزة بأحدث التقنيات لإدارة المخزون وتوزيعه حسب الطلب.',
    service_insurance: 'تأمين البضائع',
    service_insurance_desc: 'خدمات تأمين شاملة لحماية بضائعك من المخاطر المحتملة أثناء النقل والشحن.',

    // Dashboard & Sidebar
    shipments: 'الشحنات',
    quotes: 'عروض الأسعار',
    customers: 'العملاء',
    analytics: 'التحليلات',
    inventory: 'المخزون',
    settings: 'الإعدادات',
    blog_management: 'إدارة المدونة',
    website_settings: 'إعدادات الموقع',
    recruitment: 'التوظيف',
    logout: 'تسجيل الخروج',

    // Blog
    blog_title_ar: 'العنوان (بالعربية)',
    blog_title_en: 'العنوان (بالإنجليزية)',
    blog_content_ar: 'المحتوى (بالعربية)',
    blog_content_en: 'المحتوى (بالإنجليزية)',
    blog_image: 'رابط الصورة',
    blog_status: 'الحالة',
    blog_published: 'منشور',
    blog_draft: 'مسودة',
    blog_create: 'إضافة مقال',
    blog_edit: 'تعديل المقال',
    blog_delete: 'حذف',
    blog_save: 'حفظ',
    blog_cancel: 'إلغاء',
    blog_posts: 'المقالات',
    blog_new: 'مقال جديد',
    blog_slug: 'الرابط الدائم (Slug)',
    back_to_site: 'العودة للموقع',
    operations: 'عملياتنا',
    profile: 'بروفايل الشركة',

    // Operations Page
    ops_title: 'معرض الأعمال',
    ops_subtitle: 'نظرة على عملياتنا اليومية.. حيث الاحترافية في كل تفصيل.',
    filter_all: 'الكل',
    filter_fleet: 'عمليات الأسطول',
    filter_port: 'أعمال الموانئ',
    filter_customs: 'تخليص جمركي',

    // Login Page
    login_title: 'تسجيل الدخول',
    login_subtitle: 'قم بإدخال بيانات اعتماد حسابك للوصول إلى لوحة التحكم',
    email_label: 'البريد الإلكتروني / اسم المستخدم',
    password_label: 'كلمة المرور',
    login_button: 'الدخول للمنصة',
    forgot_password: 'نسيت كلمة المرور؟',
    new_client: 'عميل جديد؟',
    create_account: 'إنشاء حساب شركة',
    secure_badge: 'محمي بواسطة SAMA Secure System',

    // Shipments Page
    shipments_title: 'إدارة الشحنات',
    shipments_subtitle: 'متابعة وتحديث حالة الشحنات الجارية',
    tracking_no: 'رقم التتبع',
    type: 'النوع',
    status: 'الحالة',
    origin: 'المصدر',
    destination: 'الوجهة',
    date: 'التاريخ',
    actions: 'الإجراءات',

    // Shipment Statuses
    PENDING: 'قيد الانتظار',
    PROCESSING: 'قيد المعالجة',
    IN_TRANSIT: 'في الطريق',
    CUSTOMS_CLEARANCE: 'تخليص جمركي',
    DELIVERED: 'تم التوصيل',
    CANCELLED: 'ملغاة',

    // Shipment Types
    SEA: 'بحري',
    AIR: 'جوي',
    LAND: 'بري',

    // Messages
    messages: 'الرسائل',

    // Footer/General
    copyright: 'جميع الحقوق محفوظة © 2024',
  },
  en: {
    // Navigation
    home: 'Home',
    services: 'Logistic Services',
    blog: 'Blog',
    about: 'About Us',
    contact: 'Contact Us',
    careers: 'Careers',
    dashboard: 'Dashboard',

    // Hero Section
    hero_title: 'Integrated Logistics Solutions for Shipping & Customs',
    hero_subtitle: 'We provide professional sea freight, air freight, and customs clearance services. Your trusted partner in the global supply chain.',
    get_quote: 'Get a Quote',
    our_services: 'Our Services',

    // Stats
    years_experience: 'Years Experience',
    global_ports: 'Global Ports',
    successful_shipments: 'Successful Shipments',
    support_247: '24/7 Support',

    // Features
    why_choose_us: 'Why Choose Sama?',
    why_choose_us_subtitle: 'Beyond Logistics.. We Deliver Promises.',
    feature_global: 'Global Reach, Local Touch',
    feature_global_desc: 'We bridge the gap between you and the world through a trusted network of agents in every major hub, ensuring your business has no borders.',
    feature_safety: 'Uncompromising Safety',
    feature_safety_desc: 'Your cargo is our pledge. From pickup to delivery, we apply strict safety protocols to ensure that what matters to you arrives exactly as promised.',
    feature_customs: 'Seamless Customs Clearance',
    feature_customs_desc: 'We turn complex regulations into smooth sailing. Our experts act as your legal shield, handling formalities efficiently to eliminate delays before they happen.',
    feature_tailored: 'Tailored for Your Growth',
    feature_tailored_desc: 'One size fits no one. We don\'t just offer shipping; we design logistics solutions specifically shaped around your budget and timeline.',

    // Leadership Team
    leadership_title: 'Inspiring Leadership.. Visionary Insight',
    leadership_subtitle: 'A team of experts steering "Sama" towards new horizons of excellence and innovation in the logistics world.',
    ceo_name: 'Ahmed Khoder',
    ceo_role: 'Chief Executive Officer',
    ceo_quote: 'Our vision is to be the artery connecting businesses to the world, not just by moving cargo, but by delivering values and trust.',
    ops_manager_name: 'Mohammed Khoder',
    ops_manager_role: 'Operations Manager',
    ops_manager_quote: 'Precision in detail is our secret. We ensure every step in the supply chain is calculated and monitored with extreme accuracy.',
    customs_manager_name: 'Salma Jamal',
    customs_manager_role: 'Customs Clearance Manager',
    customs_manager_quote: 'We overcome routine challenges with deep expertise and strong relationships, making customs clearance a smooth phase, not a barrier.',

    // Company Fleet
    fleet_title: 'Our Fleet: The Power to Move',
    fleet_description: 'Unlike others, we don’t just manage shipments; we drive them. With our own extensive fleet of modern trucks, we guarantee availability, flexibility, and total control over your cargo’s journey.',
    fleet_feature_diverse: 'Diverse Capabilities',
    fleet_feature_diverse_desc: 'Ready for dry, refrigerated, and heavy cargo.',
    fleet_feature_tracking: 'GPS Tracking',
    fleet_feature_tracking_desc: 'Full visibility on the road.',
    fleet_feature_maintenance: 'Maintenance Excellence',
    fleet_feature_maintenance_desc: 'Reliable trucks, zero delays.',

    // About Us
    about_hero_title: 'Sama Logistics: Connecting Worlds, Delivering Value.',
    about_hero_desc: 'More than just a logistics provider, we are the architects of supply chains. We combine deep industry expertise with asset-based capabilities to keep the world moving. From local roads to global ports, we are the link that turns your business potential into reach.',
    about_vision_title: 'Redefining Logistics Standards',
    about_vision_desc: 'To be the driving force behind our clients\' growth, setting new benchmarks for reliability and innovation.',
    about_mission_title: 'Turning Challenges into Solutions',
    about_mission_desc: 'Empowering businesses by delivering seamless, end-to-end logistics solutions where precision meets speed and cost-efficiency.',
    about_value_precision: 'Precision',
    about_value_precision_desc: 'We believe perfection is in the details; we care for every step.',
    about_value_partnership: 'Partnership',
    about_value_partnership_desc: 'Your goals are our goals. We work as an extension of your team.',
    about_value_integrity: 'Integrity',
    about_value_integrity_desc: 'Transparency is our currency. We deliver on our promises, always.',

    // Services Page
    services_hero_title: 'Logistic Services: Integrated Solutions for Your Business',
    services_hero_desc: 'We offer a comprehensive range of shipping and customs clearance services designed specifically to meet your business needs, ensuring speed and security.',
    service_sea: 'Sea Freight',
    service_sea_desc: 'FCL and LCL shipping services to and from all global ports at competitive rates.',
    service_air: 'Air Freight',
    service_air_desc: 'Fast air freight solutions for urgent and sensitive cargo with door-to-door delivery options.',
    service_land: 'Land Freight',
    service_land_desc: 'Modern fleet for local and regional cargo transport, with precise tracking to ensure on-time delivery.',
    service_customs: 'Customs Clearance',
    service_customs_desc: 'Expert team to handle all customs procedures quickly and efficiently, avoiding any delay penalties.',
    service_warehousing: 'Warehousing & Distribution',
    service_warehousing_desc: 'Secure warehouses equipped with the latest technology for inventory management and on-demand distribution.',
    service_insurance: 'Cargo Insurance',
    service_insurance_desc: 'Comprehensive insurance services to protect your cargo from potential risks during transport and shipping.',

    // Dashboard & Sidebar
    shipments: 'Shipments',
    quotes: 'Quotes',
    customers: 'Customers',
    analytics: 'Analytics',
    inventory: 'Inventory',
    settings: 'Settings',
    blog_management: 'Blog Management',
    website_settings: 'Website Settings',
    recruitment: 'Recruitment',
    logout: 'Logout',

    // Blog
    blog_title_ar: 'Title (Arabic)',
    blog_title_en: 'Title (English)',
    blog_content_ar: 'Content (Arabic)',
    blog_content_en: 'Content (English)',
    blog_image: 'Image URL',
    blog_status: 'Status',
    blog_published: 'Published',
    blog_draft: 'Draft',
    blog_create: 'Create Post',
    blog_edit: 'Edit Post',
    blog_delete: 'Delete',
    blog_save: 'Save',
    blog_cancel: 'Cancel',
    blog_posts: 'Blog Posts',
    blog_new: 'New Post',
    blog_slug: 'Permanent Link (Slug)',
    back_to_site: 'Back to Website',
    operations: 'Operations',
    profile: 'Company Profile',

    // Operations Page
    ops_title: 'Our Operations',
    ops_subtitle: 'A glimpse into our daily operations.. where professionalism is in every detail.',
    filter_all: 'All',
    filter_fleet: 'Fleet Operations',
    filter_port: 'Port Handling',
    filter_customs: 'Customs Clearance',

    // Login Page
    login_title: 'Login',
    login_subtitle: 'Enter your account credentials to access the dashboard',
    email_label: 'Email / Username',
    password_label: 'Password',
    login_button: 'Login to Platform',
    forgot_password: 'Forgot Password?',
    new_client: 'New Client?',
    create_account: 'Create Company Account',
    secure_badge: 'Protected by SAMA Secure System',

    // Shipments Page
    shipments_title: 'Shipments Management',
    shipments_subtitle: 'Track and update ongoing shipments status',
    tracking_no: 'Tracking No.',
    type: 'Type',
    status: 'Status',
    origin: 'Origin',
    destination: 'Destination',
    date: 'Date',
    actions: 'Actions',

    // Shipment Statuses
    PENDING: 'Pending',
    PROCESSING: 'Processing',
    IN_TRANSIT: 'In Transit',
    CUSTOMS_CLEARANCE: 'Customs Clearance',
    DELIVERED: 'Delivered',
    CANCELLED: 'Cancelled',

    // Shipment Types
    SEA: 'Sea Freight',
    AIR: 'Air Freight',
    LAND: 'Land Freight',

    // Messages
    messages: 'Messages',

    // Footer/General
    copyright: 'All Rights Reserved © 2024',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('language', language);
      document.documentElement.lang = language;
      document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    }
  }, [language, mounted]);

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'ar' ? 'en' : 'ar'));
  };

  const t = (key: string): string => {
    const langTranslations = translations[language] as Record<string, string>;
    return langTranslations[key] || key;
  };

  // if (!mounted) {
  //   return null;
  // }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
