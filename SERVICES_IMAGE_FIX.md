# 🔧 إصلاح مشكلة صور الخدمات

## 🐛 المشكلة

كانت هناك مشكلة في حفظ وعرض صور الخدمات:
1. ❌ الصورة لا تُحفظ في قاعدة البيانات
2. ❌ الصورة القديمة لا تظهر عند التعديل
3. ❌ الصورة لا تظهر في الفرونت إند

---

## ✅ الإصلاحات المُطبّقة

### 1️⃣ إصلاح نموذج الإضافة/التعديل
**الملف:** `app/dashboard/website-settings/components/tabs/services/ServicesManagementTab.tsx`

**التغييرات:**
- ✅ إضافة حقل `image` في `formData` الافتراضي
- ✅ إضافة حقل `image` في دالة `resetForm()`
- ✅ إضافة console.log للتتبع

```typescript
const [formData, setFormData] = useState<Partial<ServiceItem>>({
    // ...
    image: '',  // ← تم الإضافة
    // ...
});
```

### 2️⃣ إصلاح دالة الإضافة
**الملف:** `app/dashboard/website-settings/hooks/useWebsiteSettings.ts`

**التغييرات:**
- ✅ التأكد من إرسال حقل `image` في الـ body
- ✅ إضافة console.log للتتبع

```typescript
const serviceData = {
    ...service,
    image: service.image || null // ← تم الإضافة
};
```

### 3️⃣ إصلاح دالة التحديث
**الملف:** `app/dashboard/website-settings/hooks/useWebsiteSettings.ts`

**التغييرات:**
- ✅ إضافة رسائل نجاح/فشل
- ✅ إضافة console.log للتتبع

### 4️⃣ إصلاح API Endpoints
**الملفات:**
- `app/api/cms/services/route.ts` (POST)
- `app/api/cms/services/[id]/route.ts` (PUT)

**التغييرات:**
- ✅ إضافة console.log لتتبع البيانات
- ✅ التأكد من حفظ حقل `image`

---

## 🧪 كيفية الاختبار

### اختبار 1: إضافة خدمة جديدة بصورة

1. **افتح الداشبورد**
   ```
   http://localhost:3000/dashboard/website-settings
   ```

2. **اذهب إلى Services → Services**

3. **انقر على "خدمة جديدة"**

4. **املأ البيانات:**
   - اختر أيقونة
   - ارفع صورة (مثلاً: صورة سفينة)
   - أدخل العنوان بالعربي والإنجليزي
   - أدخل الأوصاف

5. **احفظ**

6. **افتح Console في المتصفح (F12)**
   - يجب أن ترى:
     ```
     💾 Saving service data: { hasImage: true, imagePath: "/images/services/..." }
     📤 Sending service data to API: { hasImage: true }
     📥 Received new service request: { hasImage: true, imagePath: "..." }
     ✅ Service created in database: { id: "...", hasImage: true }
     ```

7. **تحقق من الفرونت إند**
   ```
   http://localhost:3000/services
   ```
   - يجب أن تظهر الصورة في بطاقة الخدمة

### اختبار 2: تعديل خدمة موجودة

1. **في الداشبورد، انقر على ✏️ بجانب خدمة**

2. **يجب أن تظهر:**
   - الصورة الحالية (إذا كانت موجودة)
   - جميع البيانات الأخرى

3. **ارفع صورة جديدة (اختياري)**

4. **عدّل أي حقل آخر**

5. **احفظ**

6. **في Console، يجب أن ترى:**
   ```
   📤 Updating service: { hasImage: true, imagePath: "..." }
   📥 Received update request for service: { hasImage: true }
   ✅ Service updated in database: { hasImage: true }
   ```

7. **تحقق من الفرونت إند**
   - يجب أن تظهر الصورة الجديدة

### اختبار 3: خدمة بدون صورة

1. **أضف خدمة جديدة بدون رفع صورة**

2. **احفظ**

3. **في الفرونت إند:**
   - يجب أن تظهر الأيقونة فقط (بدون صورة)
   - كل شيء آخر يعمل بشكل طبيعي

---

## 🔍 تتبع المشاكل (Debugging)

### إذا لم تظهر الصورة في الداشبورد عند التعديل:

1. **افتح Console (F12)**

2. **ابحث عن رسالة "Services loaded"**
   ```
   📥 Services loaded: [
     { id: "...", title: "...", hasImage: true, imagePath: "/images/services/..." }
   ]
   ```

3. **إذا كان `hasImage: false`:**
   - الصورة لم تُحفظ في قاعدة البيانات
   - تابع الخطوات التالية

### إذا لم تُحفظ الصورة:

1. **افتح Console عند الحفظ**

2. **ابحث عن الرسائل:**
   ```
   💾 Saving service data: { hasImage: ?, imagePath: ? }
   📤 Sending service data to API: { hasImage: ? }
   📥 Received new service request: { hasImage: ?, imagePath: ? }
   ✅ Service created in database: { hasImage: ?, imagePath: ? }
   ```

3. **إذا كان `hasImage: false` في أي مرحلة:**
   - قد تكون هناك مشكلة في رفع الصورة نفسه
   - تحقق من `/api/upload` endpoint

### إذا لم تظهر الصورة في الفرونت إند:

1. **تحقق من مسار الصورة في قاعدة البيانات**
   ```bash
   npx prisma studio
   ```
   - افتح جدول `Service`
   - تحقق من حقل `image`
   - يجب أن يكون مثل: `/images/services/1704892800000-abc123.webp`

2. **تحقق من وجود الملف**
   ```bash
   ls public/images/services/
   ```
   - يجب أن ترى ملفات `.webp`

3. **تحقق من صلاحيات الملفات**
   ```bash
   chmod -R 755 public/images/
   ```

---

## 🛠️ الأوامر المفيدة

### مسح Cache المتصفح
```
Ctrl + Shift + R  (Windows/Linux)
Cmd + Shift + R   (Mac)
```

### إعادة تشغيل الـ Dev Server
```bash
# أوقف السيرفر (Ctrl+C)
npm run dev
```

### فحص قاعدة البيانات
```bash
npx prisma studio
```

### فحص الملفات المرفوعة
```bash
ls -la public/images/services/
```

---

## 📊 ملخص التغييرات

| الملف | التغيير | الهدف |
|------|---------|--------|
| `ServicesManagementTab.tsx` | إضافة `image: ''` في formData | التأكد من وجود حقل الصورة |
| `useWebsiteSettings.ts` | إضافة `image` في handleAddService | إرسال الصورة للAPI |
| `useWebsiteSettings.ts` | console.log في handleUpdateService | تتبع التحديثات |
| `api/cms/services/route.ts` | console.log في POST | تتبع الإضافة |
| `api/cms/services/[id]/route.ts` | console.log في PUT | تتبع التحديث |

---

## ✅ النتيجة المتوقعة

بعد هذه الإصلاحات:

1. ✅ **رفع الصورة:** يعمل بشكل صحيح
2. ✅ **حفظ الصورة:** تُحفظ في قاعدة البيانات
3. ✅ **عرض في الداشبورد:** تظهر الصورة عند التعديل
4. ✅ **عرض في الفرونت إند:** تظهر في `/services` و `/services/[slug]`
5. ✅ **Console Logs:** تظهر رسائل واضحة للتتبع

---

## 🎯 الخطوات التالية

1. **اختبر إضافة خدمة جديدة بصورة**
2. **اختبر تعديل خدمة موجودة**
3. **تحقق من الفرونت إند**
4. **إذا كان كل شيء يعمل، يمكنك إزالة console.log إذا أردت**

---

## 📝 ملاحظات

- جميع console.log مؤقتة للتتبع
- يمكن إزالتها بعد التأكد من أن كل شيء يعمل
- الصور تُضغط تلقائياً وتُحوّل لـ WebP
- الحجم الموصى به: 1200×600 بكسل

---

**Created with ❤️ for Sama Logistics**

*آخر تحديث: 12 يناير 2026*
