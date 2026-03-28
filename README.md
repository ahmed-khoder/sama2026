# 🚀 Sama Logistics - منصة لوجستية متقدمة

منصة Next.js احترافية للحلول اللوجستية مع **21 تحسيناً متقدماً** لتوفير تجربة استثنائية وأداء عالي.

> **🎉 جديد!** تم إضافة 21 تحسيناً متقدماً على مرحلتين - المشروع الآن Production-Ready!

## ✨ المميزات الأساسية

### التصميم والواجهة
- 🌐 **دعم متعدد اللغات**: تبديل سلس بين العربية والإنجليزية مع RTL/LTR
- 🌓 **وضع داكن/فاتح**: تبديل سهل بين الأوضاع مع حفظ التفضيلات
- 📱 **تصميم متجاوب**: يعمل بشكل مثالي على جميع الأجهزة
- 🎨 **تصميم عصري**: واجهة مستخدم جميلة باستخدام TailwindCSS
- 🎭 **حركات سلسة**: رسوم متحركة احترافية باستخدام Framer Motion
- 🧭 **Navbar ذكي**: يختفي ويظهر بناءً على حركة الماوس

### التحسينات المتقدمة (جديد! 🆕)
- 🛡️ **Error Handling**: معالجة أخطاء متقدمة مع Error Boundary
- 🔔 **Toast Notifications**: إشعارات جميلة ومتحركة
- ⏳ **Loading States**: حالات تحميل احترافية (Spinners, Skeletons)
- 🔐 **Authentication**: نظام مصادقة آمن مع Middleware
- ⚡ **Caching**: نظام cache ذكي مع TTL
- 📧 **Email System**: نظام إرسال بريد محترف مع Templates
- 🔗 **Webhooks**: نظام webhooks للتكامل مع خدمات خارجية
- 📁 **File Management**: إدارة ملفات متقدمة مع compression
- 📊 **Advanced Logging**: نظام logging احترافي مع مستويات متعددة
- 🔔 **In-App Notifications**: إشعارات داخلية للمستخدمين
- ⚙️ **Performance**: أدوات تحسين الأداء (memoize, debounce, throttle)
- 💾 **Backup System**: نظام نسخ احتياطي تلقائي
- 📝 **Activity Log**: تتبع كامل لنشاطات المستخدمين
- 🚦 **Rate Limiting**: حماية من الطلبات الزائدة
- ♿ **Accessibility**: مكونات accessible مع ARIA
- 📝 **Form Management**: نظام نماذج متقدم مع Validation
- 🗺️ **SEO**: Sitemap و Robots.txt ديناميكية

## 🚀 البدء السريع

### المتطلبات

- Node.js 18.x أو أحدث
- npm أو yarn أو pnpm
- PostgreSQL (للإنتاج) أو SQLite (للتطوير)

### التثبيت

```bash
# 1. تثبيت المكتبات
npm install

# 2. إعداد قاعدة البيانات
cp .env.example .env
npx prisma generate
npx prisma db push

# 3. تشغيل السيرفر المحلي
npm run dev
```

افتح [http://localhost:3000](http://localhost:3000) في المتصفح.

### 📚 التوثيق الشامل

للبدء السريع مع التحسينات الجديدة:
```bash
# اقرأ دليل البدء السريع
cat QUICK_START.md

# اقرأ الأمثلة العملية
cat EXAMPLES.md

# اقرأ الدليل الشامل
cat COMPLETE_ENHANCEMENTS_GUIDE.md
```

## 📁 هيكل المشروع

```
sama_log/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # الـ Layout الرئيسي
│   ├── page.tsx           # الصفحة الرئيسية
│   ├── globals.css        # الـ Styles العامة
│   ├── services/          # صفحة الخدمات
│   ├── about/             # صفحة من نحن
│   └── contact/           # صفحة التواصل
├── components/            # المكونات
│   └── Navbar.tsx        # شريط التنقل
├── contexts/             # Context Providers
│   ├── LanguageContext.tsx
│   └── ThemeContext.tsx
├── tailwind.config.js    # إعدادات Tailwind
├── tsconfig.json         # إعدادات TypeScript
└── package.json
```

## 🎨 التقنيات المستخدمة

### Core Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: Prisma ORM (PostgreSQL/SQLite)
- **Styling**: TailwindCSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Fonts**: Inter, Cairo, Poppins, Montserrat

### التحسينات المتقدمة
- **State Management**: React Context API
- **Form Validation**: Zod Schema Validation
- **Image Processing**: Compressor.js, Sharp
- **File Upload**: React Dropzone
- **Email**: Nodemailer (planned)
- **Caching**: In-Memory Cache System
- **Logging**: Custom Logger Service
- **Backup**: Automated Backup System

## 🔧 التخصيص

### تغيير الألوان

عدّل ملف `tailwind.config.js` لتغيير نظام الألوان:

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        // ألوانك هنا
      }
    }
  }
}
```

### إضافة لغات جديدة

عدّل ملف `contexts/LanguageContext.tsx`:

```typescript
const translations = {
  ar: { /* الترجمات العربية */ },
  en: { /* الترجمات الإنجليزية */ },
  // أضف لغة جديدة
};
```

## 📱 الميزات التقنية

### Navbar الذكي

- يختفي تلقائيًا عند تحريك الماوس بعيدًا عن الأعلى
- يظهر عند الاقتراب من أعلى الصفحة
- منيو جانبي سلس للهواتف المحمولة
- حركات Hover متقدمة

### Context Management

- **ThemeContext**: إدارة الوضع الداكن/الفاتح
- **LanguageContext**: إدارة اللغة والاتجاه (RTL/LTR)

## 🌐 المتصفحات المدعومة

- Chrome (آخر إصدارين)
- Firefox (آخر إصدارين)
- Safari (آخر إصدارين)
- Edge (آخر إصدارين)

## 🆕 التحسينات الـ 21 (جديد!)

### المرحلة الأولى: الأساسيات
1. **Error Boundary** - معالجة أخطاء React
2. **Toast System** - إشعارات جميلة
3. **Loading States** - Spinners & Skeletons
4. **API Error Handler** - معالجة موحدة للأخطاء
5. **Rate Limiter** - حماية API
6. **Accessible Button** - مكون زر accessible
7. **Form Field** - حقول نماذج موحدة
8. **useForm Hook** - إدارة النماذج مع Zod
9. **Sitemap & Robots** - تحسين SEO
10. **Image Upload** - رفع صور مع compression
11. **Advanced Search** - بحث متقدم مع filters

### المرحلة الثانية: المتقدمة
12. **Auth Middleware** - حماية API routes
13. **Query Cache** - نظام cache ذكي
14. **Email Service** - إرسال بريد محترف
15. **Webhook System** - تكامل مع خدمات خارجية
16. **File Storage** - إدارة ملفات متقدمة
17. **Advanced Logger** - logging احترافي
18. **Notifications** - إشعارات داخلية
19. **Performance** - أدوات تحسين الأداء
20. **Backup System** - نسخ احتياطي تلقائي
21. **Activity Log** - تتبع النشاطات

📚 **للتفاصيل الكاملة**: راجع ملفات التوثيق في الجذر

## 📝 البناء للإنتاج

```bash
# بناء المشروع
npm run build

# تشغيل النسخة المبنية
npm start
```

### Environment Variables للإنتاج
```env
NODE_ENV=production
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
EMAIL_PROVIDER=smtp
LOG_LEVEL=warn
```

## 🤝 المساهمة

نرحب بمساهماتك! لا تتردد في فتح Issue أو Pull Request.

## 📄 الرخصة

MIT License

## 📚 ملفات التوثيق

| الملف | الوصف |
|-------|-------|
| **QUICK_START.md** | دليل البدء السريع للتحسينات |
| **EXAMPLES.md** | أمثلة عملية (50+ مثال) |
| **COMPLETE_ENHANCEMENTS_GUIDE.md** | دليل شامل للتحسينات الـ 21 |
| **ENHANCEMENTS.md** | تفاصيل المرحلة الأولى |
| **ADVANCED_ENHANCEMENTS.md** | تفاصيل المرحلة الثانية |
| **MIGRATION_GUIDE.md** | دليل ترحيل الكود القديم |
| **SCRIPTS_GUIDE.md** | Scripts مفيدة للصيانة |
| **IMPLEMENTATION_SUMMARY.md** | ملخص التنفيذ والإحصائيات |

## 🎯 Quick Links

- **بداية سريعة**: `cat QUICK_START.md`
- **أمثلة عملية**: `cat EXAMPLES.md`
- **API Routes محمية**: راجع `lib/auth-middleware.ts`
- **Forms مع Validation**: راجع `hooks/useForm.ts`
- **Toast Notifications**: راجع `components/Toast.tsx`

## 🙏 شكر خاص

شكر خاص لجميع المساهمين والمكتبات مفتوحة المصدر المستخدمة في هذا المشروع.

---

**صُنع بـ ❤️ لـ Sama Logistics**

*Production-Ready | Secure | Fast | Maintainable*


