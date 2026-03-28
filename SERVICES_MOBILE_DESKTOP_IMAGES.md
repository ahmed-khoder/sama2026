# 📱💻 ميزة رفع صورتين منفصلتين للخدمات (Desktop & Mobile)

## ✨ المميزات الجديدة

تم إضافة إمكانية رفع صورتين منفصلتين لكل خدمة:
1. **صورة سطح المكتب** (Desktop) - افتراضية ومطلوبة
2. **صورة الموبايل** (Mobile) - اختيارية

### **السلوك:**
- إذا رُفعت صورة موبايل → تُستخدم على الأجهزة الموبايل 📱
- إذا لم تُرفع صورة موبايل → تُستخدم صورة سطح المكتب كافتراضي 💻
- صورة سطح المكتب تُستخدم دائماً على Desktop

---

## 🎯 الفائدة

### **لماذا صورتين منفصلتين؟**

#### **صورة سطح المكتب (Desktop):**
- ✅ أبعاد: `1920x1080` بكسل (16:9)
- ✅ Landscape orientation
- ✅ مثالية للشاشات الكبيرة
- ✅ تعرض تفاصيل أكثر

#### **صورة الموبايل (Mobile):**
- ✅ أبعاد: `750x1334` بكسل (9:16)
- ✅ Portrait or optimized for mobile
- ✅ تركيز على العنصر الرئيسي
- ✅ أفضل للشاشات الصغيرة

---

## 🔧 التعديلات التقنية

### 1️⃣ **Database Schema**

تم إضافة حقل `imageMobile` في جدول `Service`:

```prisma
model Service {
  // ... الحقول الموجودة
  image         String?  // Desktop image (default)
  imageMobile   String?  // Mobile-specific image (optional)
  // ...
}
```

**Migration:**
```bash
npx prisma db push
```

---

### 2️⃣ **TypeScript Types**

تم تحديث `ServiceItem` interface:

```typescript
export interface ServiceItem {
    // ... الحقول الموجودة
    image?: string;        // Desktop image (default)
    imageMobile?: string;  // Mobile-specific image (optional)
    // ...
}
```

**الملف:** `app/dashboard/website-settings/types.ts`

---

### 3️⃣ **Dashboard UI - Form**

تم إضافة حقلين لرفع الصور:

#### **Desktop Image (Default):**
```tsx
<ImageUploader
    folder="services"
    currentImage={formData.image}
    onUpload={(path) => setFormData(prev => ({ ...prev, image: path }))}
    aspectRatio="video"  // 16:9
    isRTL={isRTL}
/>
```

#### **Mobile Image (Optional):**
```tsx
<ImageUploader
    folder="services"
    currentImage={formData.imageMobile}
    onUpload={(path) => setFormData(prev => ({ ...prev, imageMobile: path }))}
    aspectRatio="portrait"  // 9:16
    isRTL={isRTL}
/>
```

**الملف:** `app/dashboard/website-settings/components/tabs/services/ServicesManagementTab.tsx`

**المميزات:**
- ✅ Label واضح لكل صورة
- ✅ توضيح "افتراضية" و "اختيارية"
- ✅ شرح الأبعاد المطلوبة
- ✅ زر لإزالة صورة الموبايل

---

### 4️⃣ **API Endpoints**

#### **POST `/api/cms/services`**

```typescript
// إضافة Desktop image
if (body.image && body.image !== '') {
    serviceData.image = body.image;
    console.log('✅ Desktop image will be saved:', body.image);
}

// إضافة Mobile image
if (body.imageMobile && body.imageMobile !== '') {
    serviceData.imageMobile = body.imageMobile;
    console.log('✅ Mobile image will be saved:', body.imageMobile);
}
```

#### **PUT `/api/cms/services/[id]`**

```typescript
// تحديث Desktop image
if (body.image !== undefined) {
    updateData.image = body.image || null;
    console.log('✅ Desktop image will be updated');
}

// تحديث Mobile image
if (body.imageMobile !== undefined) {
    updateData.imageMobile = body.imageMobile || null;
    console.log('✅ Mobile image will be updated');
}
```

**الملفات:**
- `app/api/cms/services/route.ts`
- `app/api/cms/services/[id]/route.ts`

---

### 5️⃣ **Frontend Display Logic**

صفحة تفاصيل الخدمة تختار الصورة المناسبة تلقائياً:

```typescript
import { useIsMobile } from '@/hooks/useIsMobile';

const isMobile = useIsMobile();

// اختيار الصورة المناسبة
const currentImage = (isMobile && service.imageMobile) 
    ? service.imageMobile   // استخدم Mobile image إذا كان موجوداً
    : service.image;        // وإلا استخدم Desktop image

const hasImage = !!(currentImage);
```

```tsx
{hasImage && (
    <img 
        src={currentImage} 
        alt={service.title}
        className="w-full h-full object-cover object-[center_30%] md:object-center"
    />
)}
```

**الملف:** `app/services/[slug]/page.tsx`

**المنطق:**
1. التحقق: هل الجهاز موبايل؟ (`isMobile`)
2. إذا نعم: هل توجد صورة موبايل؟
   - نعم → استخدمها ✅
   - لا → استخدم صورة Desktop
3. إذا لا (Desktop): استخدم صورة Desktop دائماً

---

## 📱 كيفية الاستخدام

### **في Dashboard:**

#### **الخطوة 1: الذهاب إلى إدارة الخدمات**
```
/dashboard/website-settings
→ Services Tab
→ اختر خدمة أو أنشئ جديدة
```

#### **الخطوة 2: رفع صورة سطح المكتب**
```
📁 صورة سطح المكتب (افتراضية)
- اضغط "Choose File"
- اختر صورة (يفضل 1920x1080 بكسل)
- رفع ✅
```

#### **الخطوة 3: رفع صورة الموبايل (اختياري)**
```
📱 صورة الموبايل (اختيارية)
- اضغط "Choose File"
- اختر صورة محسّنة للموبايل (يفضل 750x1334 بكسل)
- رفع ✅
```

#### **الخطوة 4: الحفظ**
```
اضغط "Save" أو "Add Service"
```

---

## 🎨 أمثلة الاستخدام

### **مثال 1: خدمة الشحن الجوي**

#### **Desktop Image:**
```
صورة طائرة كبيرة على المدرج
الأبعاد: 1920x1080
تُظهر: طائرة كاملة + مدرج + سماء
مثالية للشاشات الكبيرة
```

#### **Mobile Image:**
```
صورة طائرة مقربة
الأبعاد: 750x1334
تُظهر: الطائرة فقط (تركيز)
مثالية للشاشات الصغيرة
```

---

### **مثال 2: خدمة الشحن البحري**

#### **Desktop Image:**
```
صورة سفينة شحن كاملة مع حاويات
الأبعاد: 1920x1080
Landscape - عرض واسع
```

#### **Mobile Image:**
```
صورة حاويات مقربة
الأبعاد: 750x1334
Portrait - تركيز على العنصر الرئيسي
```

---

## 🔍 الفرق بين الصورتين

### **Desktop Image:**
```
┌────────────────────────────────────────────┐
│                                            │
│  [Wide landscape view]                     │
│  [طائرة + مدرج + سماء]                     │
│                                            │
└────────────────────────────────────────────┘
16:9 aspect ratio
```

### **Mobile Image:**
```
┌──────────────┐
│              │
│              │
│  [طائرة]     │
│  [مقربة]     │
│  [تركيز]     │
│              │
│              │
└──────────────┘
9:16 aspect ratio
```

---

## 📊 جدول المقارنة

| الميزة | صورة Desktop | صورة Mobile |
|--------|--------------|-------------|
| **الأبعاد المفضلة** | 1920x1080 | 750x1334 |
| **Aspect Ratio** | 16:9 | 9:16 |
| **Orientation** | Landscape | Portrait/Optimized |
| **الاستخدام** | Screens > 768px | Screens < 768px |
| **مطلوبة؟** | ✅ نعم | ⚪ اختيارية |
| **تُستخدم كافتراضي؟** | ✅ نعم | ❌ لا |

---

## 🎯 حالات الاستخدام

### **الحالة 1: رُفعت صورتين**
```
Desktop → يرى Desktop image  ✅
Mobile  → يرى Mobile image   ✅
```

### **الحالة 2: رُفعت صورة Desktop فقط**
```
Desktop → يرى Desktop image  ✅
Mobile  → يرى Desktop image  ✅ (افتراضي)
```

### **الحالة 3: رُفعت صورة Mobile فقط**
```
❌ غير ممكن - Desktop image مطلوبة
```

### **الحالة 4: لم تُرفع أي صورة**
```
Desktop → يرى Header بسيط (بدون صورة)
Mobile  → يرى Header بسيط (بدون صورة)
```

---

## ✅ Checklist التنفيذ

- [x] ✅ تحديث Prisma Schema (إضافة `imageMobile`)
- [x] ✅ تشغيل Migration (`prisma db push`)
- [x] ✅ تحديث TypeScript Types
- [x] ✅ تحديث Dashboard Form (حقلين منفصلين)
- [x] ✅ تحديث POST API endpoint
- [x] ✅ تحديث PUT API endpoint
- [x] ✅ تحديث Frontend Display Logic
- [x] ✅ إضافة `useIsMobile` hook
- [x] ✅ اختبار التوافق
- [x] ✅ No linter errors
- [x] ✅ التوثيق الكامل

---

## 🚀 الاختبار

### **الخطوة 1: رفع صورتين**
```
1. افتح /dashboard/website-settings
2. اختر خدمة (مثلاً: Air Freight)
3. ارفع صورة Desktop (1920x1080)
4. ارفع صورة Mobile (750x1334)
5. احفظ
```

### **الخطوة 2: التحقق من Desktop**
```
1. افتح /services/air-freight على Desktop
2. يجب أن تظهر صورة Desktop ✅
```

### **الخطوة 3: التحقق من Mobile**
```
1. افتح /services/air-freight على Mobile (أو صغّر الشاشة)
2. يجب أن تظهر صورة Mobile ✅
```

### **الخطوة 4: اختبار Fallback**
```
1. احذف صورة Mobile فقط
2. افتح على Mobile
3. يجب أن تظهر صورة Desktop ✅ (fallback)
```

---

## 🎁 Bonus: نصائح لاختيار الصور

### **للDesktop:**
- ✅ استخدم Landscape wide shots
- ✅ اعرض السياق الكامل
- ✅ أبعاد: 1920x1080 أو أكبر
- ✅ نسبة 16:9

### **للMobile:**
- ✅ استخدم Portrait أو Square
- ✅ ركّز على العنصر الرئيسي
- ✅ أبعاد: 750x1334 أو 1080x1920
- ✅ نسبة 9:16 أو 1:1

### **عامة:**
- ✅ جودة عالية (HD or higher)
- ✅ صور واضحة وحادة
- ✅ إضاءة جيدة
- ✅ ألوان متناسقة مع البراند
- ✅ حجم الملف: < 2MB لكل صورة

---

## 📝 الملفات المُعدّلة

| الملف | التعديل |
|-------|---------|
| `prisma/schema.prisma` | إضافة `imageMobile` field |
| `app/dashboard/website-settings/types.ts` | تحديث `ServiceItem` interface |
| `app/dashboard/website-settings/components/tabs/services/ServicesManagementTab.tsx` | إضافة حقل Mobile image |
| `app/dashboard/website-settings/hooks/useWebsiteSettings.ts` | إرسال `imageMobile` للAPI |
| `app/api/cms/services/route.ts` | حفظ `imageMobile` (POST) |
| `app/api/cms/services/[id]/route.ts` | تحديث `imageMobile` (PUT) |
| `app/services/[slug]/page.tsx` | عرض الصورة المناسبة |
| `SERVICES_MOBILE_DESKTOP_IMAGES.md` | التوثيق الشامل |

---

## 🎉 النتيجة النهائية

**الآن يمكنك:**
1. ✅ رفع صورة مُحسّنة لسطح المكتب (1920x1080)
2. ✅ رفع صورة مُحسّنة للموبايل (750x1334)
3. ✅ الموقع يختار الصورة المناسبة تلقائياً
4. ✅ صورة Desktop تُستخدم كافتراضي إذا لم تُرفع صورة Mobile
5. ✅ تجربة مستخدم محسّنة لكل جهاز!

---

**✅ الميزة مُفعّلة وجاهزة للاستخدام!** 🎊

---

*آخر تحديث: 12 يناير 2026 - ميزة صور Desktop & Mobile للخدمات*
