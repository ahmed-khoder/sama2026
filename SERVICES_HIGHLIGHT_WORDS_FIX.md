# ✨ إضافة ميزة Highlight Words لصفحة الخدمات

## 🎯 المشكلة

في **Dashboard → Services → Hero → Content**، يوجد حقل **"Highlight Words"** (AR/EN) الذي يسمح بتحديد كلمات معينة لتظليلها بلون مختلف في العنوان.

**المشكلة:**
- ✅ الميزة موجودة في Dashboard
- ✅ تعمل في **المعاينة (Preview)**
- ✅ تعمل في **الصفحة الرئيسية (`/`)**
- ❌ **لا تعمل** في صفحة الخدمات (`/services`)

---

## 🔍 مثال من الصفحة الرئيسية

في Home page، إذا كان العنوان:
```
"نوصل أعمالك إلى العالم"
```

وحددت Highlight Words:
```
أعمالك, العالم
```

بلون برتقالي (`#F97316`)، ستظهر هكذا:

```
نوصل أعمالك إلى العالم
      ^^^^^^      ^^^^^
   (برتقالي)   (برتقالي)
```

---

## ✅ الحل المُطبّق

### 1️⃣ **إضافة دالة `highlightText`**

نفس الدالة المستخدمة في Home page:

```typescript
const highlightText = (
    text: string | undefined, 
    wordsToHighlight: string | undefined, 
    highlightColor: string | undefined
): React.ReactNode => {
    if (!text) return null;
    if (!wordsToHighlight || !highlightColor) return text;

    // فصل الكلمات المراد تظليلها (مفصولة بفواصل)
    const words = wordsToHighlight.split(',').map(w => w.trim()).filter(Boolean);
    if (words.length === 0) return text;

    // إنشاء pattern regex
    const pattern = new RegExp(`(${words.join('|')})`, 'gi');
    const parts = text.split(pattern);

    // تطبيق اللون على الكلمات المطابقة
    return (
        <>
            {parts.map((part, i) => {
                const isMatch = words.some(w => w.toLowerCase() === part.toLowerCase());
                return isMatch ? (
                    <span key={i} style={{ color: highlightColor }}>{part}</span>
                ) : (
                    part
                );
            })}
        </>
    );
};
```

### 2️⃣ **تطبيق Highlight على العنوان (h1)**

**قبل:**
```typescript
<h1>
    {isRTL ? heroSettings.titleAr : heroSettings.titleEn}
</h1>
```

**بعد:**
```typescript
<h1>
    {highlightText(
        isRTL ? heroSettings.titleAr : heroSettings.titleEn,
        isRTL ? heroSettings.highlightWordsAr : heroSettings.highlightWordsEn,
        heroSettings.highlightColor
    )}
</h1>
```

### 3️⃣ **تطبيق Highlight على الوصف (p)**

**قبل:**
```typescript
<p>
    {isRTL ? heroSettings.descriptionAr : heroSettings.descriptionEn}
</p>
```

**بعد:**
```typescript
<p>
    {highlightText(
        isRTL ? heroSettings.descriptionAr : heroSettings.descriptionEn,
        isRTL ? heroSettings.highlightWordsAr : heroSettings.highlightWordsEn,
        heroSettings.highlightColor
    )}
</p>
```

---

## 🎨 كيفية الاستخدام

### **الخطوة 1: الذهاب إلى Dashboard**
```
/dashboard/website-settings
→ Services Tab
→ Hero Section  
→ Content Tab
```

### **الخطوة 2: كتابة الكلمات المراد تظليلها**

#### **مثال بالعربي:**

**العنوان:**
```
خدماتنا اللوجستية المتكاملة
```

**Highlight Words (AR):**
```
اللوجستية, المتكاملة
```

**النتيجة:**
```
خدماتنا اللوجستية المتكاملة
        ^^^^^^^^^  ^^^^^^^^^
      (برتقالي)   (برتقالي)
```

#### **مثال بالإنجليزي:**

**Title:**
```
Our Comprehensive Logistics Services
```

**Highlight Words (EN):**
```
Comprehensive, Logistics
```

**Result:**
```
Our Comprehensive Logistics Services
    ^^^^^^^^^^^^^  ^^^^^^^^^
    (orange)       (orange)
```

### **الخطوة 3: تحديد لون التظليل**

اذهب إلى **Styling Tab** وحدد **Highlight Color**:
- البرتقالي الافتراضي: `#F97316`
- أو اختر أي لون تريده!

### **الخطوة 4: المعاينة والحفظ**
- انقر **Preview** 👁️ لمشاهدة التغييرات
- انقر **Save** 💾 للتطبيق

---

## 📊 أمثلة عملية

### **مثال 1: تظليل كلمة واحدة**

**الإعدادات:**
```
Title AR: خدماتنا اللوجستية
Highlight Words AR: اللوجستية
Highlight Color: #F97316
```

**النتيجة:**
```
خدماتنا اللوجستية
        ^^^^^^^^^
      (برتقالي)
```

---

### **مثال 2: تظليل كلمات متعددة**

**الإعدادات:**
```
Title AR: شحن بحري وجوي سريع وآمن
Highlight Words AR: سريع, آمن
Highlight Color: #10B981 (أخضر)
```

**النتيجة:**
```
شحن بحري وجوي سريع وآمن
            ^^^^  ^^^^
          (أخضر) (أخضر)
```

---

### **مثال 3: تظليل في العنوان والوصف**

**الإعدادات:**
```
Title AR: خدماتنا اللوجستية المتميزة
Description AR: نقدم حلول شاملة لجميع احتياجاتك
Highlight Words AR: اللوجستية, شاملة
Highlight Color: #F97316
```

**النتيجة:**
```
Title: خدماتنا اللوجستية المتميزة
                ^^^^^^^^^
              (برتقالي)

Description: نقدم حلول شاملة لجميع احتياجاتك
                    ^^^^^
                  (برتقالي)
```

---

### **مثال 4: Case Insensitive (غير حساس لحالة الأحرف)**

**الإعدادات:**
```
Title EN: Our LOGISTICS Services
Highlight Words EN: logistics
Highlight Color: #F97316
```

**النتيجة:**
```
Our LOGISTICS Services
    ^^^^^^^^^
   (برتقالي)
```

✅ تعمل حتى لو كانت الكلمة بأحرف كبيرة أو صغيرة!

---

## 🔧 التفاصيل التقنية

### **كيف تعمل الدالة:**

1. **تقسيم الكلمات:**
```typescript
const words = "word1, word2, word3".split(',').map(w => w.trim());
// Result: ['word1', 'word2', 'word3']
```

2. **إنشاء Regex Pattern:**
```typescript
const pattern = new RegExp(`(word1|word2|word3)`, 'gi');
// 'g' = global (كل المطابقات)
// 'i' = case insensitive (غير حساس للأحرف)
```

3. **تقسيم النص:**
```typescript
const text = "This is word1 and word2";
const parts = text.split(pattern);
// Result: ['This is ', 'word1', ' and ', 'word2', '']
```

4. **تطبيق الألوان:**
```typescript
parts.map((part, i) => {
    const isMatch = words.includes(part.toLowerCase());
    return isMatch ? 
        <span style={{ color: highlightColor }}>{part}</span> : 
        part;
});
```

---

## 📝 الملفات المُعدّلة

### **`app/services/page.tsx`**

#### **1. إضافة دالة `highlightText`:**
```typescript
// Helper to highlight words
const highlightText = (text, wordsToHighlight, highlightColor) => {
    // ... implementation
};
```

#### **2. تطبيق على العنوان:**
```typescript
<h1>
    {highlightText(
        isRTL ? heroSettings.titleAr : heroSettings.titleEn,
        isRTL ? heroSettings.highlightWordsAr : heroSettings.highlightWordsEn,
        heroSettings.highlightColor
    )}
</h1>
```

#### **3. تطبيق على الوصف:**
```typescript
<p>
    {highlightText(
        isRTL ? heroSettings.descriptionAr : heroSettings.descriptionEn,
        isRTL ? heroSettings.highlightWordsAr : heroSettings.highlightWordsEn,
        heroSettings.highlightColor
    )}
</p>
```

---

## ✅ النتيجة

### **الآن:**

1. ✅ في **Dashboard**: أدخل الكلمات المراد تظليلها
2. ✅ في **Preview**: تظهر الكلمات بالألوان
3. ✅ في **`/services`**: **تظهر نفس الألوان تماماً!** 🎨

### **التناسق الكامل:**

```
Dashboard → Preview → Website
   🎨    →    🎨   →    🎨
 (متطابق 100%)
```

---

## 🎨 أمثلة ألوان شائعة

### **1. البرتقالي (Brand Orange):**
```
#F97316
```

### **2. الذهبي (Gold):**
```
#FBBF24
```

### **3. الأزرق (Blue):**
```
#3B82F6
```

### **4. الأخضر (Green):**
```
#10B981
```

### **5. الوردي (Pink):**
```
#EC4899
```

### **6. الأحمر (Red):**
```
#EF4444
```

---

## 📌 نصائح

### **1. اختيار الكلمات المهمة:**
- ركّز على الكلمات الأساسية
- لا تظلل أكثر من 2-3 كلمات
- اختر كلمات قصيرة ومؤثرة

### **2. اختيار الألوان:**
- استخدم ألوان متباينة مع الخلفية
- تأكد من وضوح القراءة
- حافظ على هوية البراند

### **3. التجربة:**
- جرّب في Preview قبل الحفظ
- اختبر في Dark Mode
- تأكد من الوضوح على Mobile

---

## ✅ Checklist

- [x] ✅ إضافة دالة `highlightText`
- [x] ✅ تطبيق على العنوان (h1)
- [x] ✅ تطبيق على الوصف (p)
- [x] ✅ دعم العربي والإنجليزي
- [x] ✅ Case insensitive
- [x] ✅ دعم كلمات متعددة (comma-separated)
- [x] ✅ التناسق مع Dashboard Preview
- [x] ✅ No linter errors
- [x] ✅ Responsive
- [x] ✅ Dark mode support

---

## 🎉 مكتمل!

**الآن ميزة Highlight Words تعمل بشكل كامل في صفحة `/services` تماماً كما في الصفحة الرئيسية!** ✨

---

## 📸 المقارنة

### **قبل:**
```
Title: خدماتنا اللوجستية
       (كله بنفس اللون)
```

### **بعد:**
```
Title: خدماتنا اللوجستية
                ^^^^^^^^^
              (برتقالي مظلل!)
```

---

**✅ الميزة مُفعّلة ومتاحة للاستخدام!** 🎊

---

*آخر تحديث: 12 يناير 2026 - إضافة Highlight Words*
