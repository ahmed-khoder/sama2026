# تعليمات التشغيل السريع

## 1. تثبيت المكتبات

قبل تشغيل المشروع، يجب تثبيت جميع المكتبات المطلوبة:

```bash
npm install
```

أو باستخدام yarn:

```bash
yarn install
```

أو باستخدام pnpm:

```bash
pnpm install
```

## 2. تشغيل المشروع

بعد التثبيت، شغّل السيرفر المحلي:

```bash
npm run dev
```

## 3. افتح المتصفح

افتح [http://localhost:3000](http://localhost:3000) في المتصفح المفضل لديك.

## 🎯 اختبار الميزات

### تبديل اللغة
- اضغط على زر اللغة في شريط التنقل
- سيتغير اتجاه الصفحة تلقائيًا (RTL/LTR)

### تبديل الثيم
- اضغط على زر الشمس/القمر في شريط التنقل
- سيتم حفظ اختيارك تلقائيًا

### اختبار Navbar الذكي
- حرك الماوس للأسفل - سيختفي الـ Navbar
- حرك الماوس للأعلى - سيظهر الـ Navbar

### اختبار القائمة المحمولة
- صغّر نافذة المتصفح أو افتح من الهاتف
- اضغط على زر القائمة (☰)
- ستنسحب القائمة من الجانب

## 📦 المكتبات المستخدمة

- Next.js 14
- React 18
- TypeScript
- TailwindCSS
- Framer Motion
- Lucide React

## 🐛 حل المشاكل

إذا واجهت مشكلة:

1. تأكد من إصدار Node.js (يجب أن يكون 18 أو أحدث):
```bash
node --version
```

2. احذف مجلد node_modules وأعد التثبيت:
```bash
rm -rf node_modules
npm install
```

3. احذف مجلد .next:
```bash
rm -rf .next
npm run dev
```

## 🎨 التخصيص السريع

لتغيير الألوان الأساسية، عدّل `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        // ألوانك المخصصة
      }
    }
  }
}
```

---

## ✅ الملفات الأساسية

- `app/layout.tsx` - الـ Layout الرئيسي
- `app/page.tsx` - الصفحة الرئيسية
- `components/Navbar.tsx` - شريط التنقل
- `contexts/LanguageContext.tsx` - إدارة اللغة
- `contexts/ThemeContext.tsx` - إدارة الثيم

جميع الملفات جاهزة للعمل! 🚀


