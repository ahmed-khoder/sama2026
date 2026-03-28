# 🔄 دليل Migration - تطبيق التحسينات على الكود الموجود

هذا الدليل يساعدك على دمج التحسينات الجديدة مع الكود الموجود بدون مشاكل.

---

## 📋 قائمة التحقق (Checklist)

- [ ] تحديث API Routes لاستخدام Error Handling
- [ ] استبدال Loading Components القديمة
- [ ] إضافة Toast بدلاً من Alert
- [ ] تحديث Forms لاستخدام Validation
- [ ] إضافة Rate Limiting للـ API
- [ ] تحسين Buttons لـ Accessibility
- [ ] تحديث Image Uploads
- [ ] إضافة Search & Filters

---

## 1. تحديث API Routes

### ❌ القديم (Before):

```tsx
// app/api/users/route.ts
export async function GET(req: Request) {
  try {
    const users = await prisma.user.findMany();
    return Response.json({ success: true, data: users });
  } catch (error) {
    return Response.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}
```

### ✅ الجديد (After):

```tsx
// app/api/users/route.ts
import { asyncHandler, successResponse, Errors } from '@/lib/api-error-handler';
import { withRateLimit, RateLimitConfig } from '@/lib/rate-limiter';

export const GET = withRateLimit(
  asyncHandler(async (req) => {
    const users = await prisma.user.findMany();
    
    if (!users.length) {
      throw Errors.NotFound('لا يوجد مستخدمين');
    }
    
    return successResponse(users, 'تم جلب البيانات بنجاح');
  }),
  RateLimitConfig.api
);
```

### 🔄 خطوات التحديث:

1. استورد الـ Helpers:
```tsx
import { asyncHandler, successResponse, Errors } from '@/lib/api-error-handler';
import { withRateLimit, RateLimitConfig } from '@/lib/rate-limiter';
```

2. غيّر Function Declaration:
```tsx
// من
export async function GET(req) { ... }
// إلى
export const GET = withRateLimit(asyncHandler(async (req) => { ... }));
```

3. استخدم `throw` بدلاً من `return Error`:
```tsx
// من
return Response.json({ error: 'Not found' }, { status: 404 });
// إلى
throw Errors.NotFound('البيانات غير موجودة');
```

4. استخدم `successResponse`:
```tsx
// من
return Response.json({ success: true, data });
// إلى
return successResponse(data, 'تم بنجاح');
```

---

## 2. استبدال Loading Components

### ❌ القديم (Before):

```tsx
function MyPage() {
  const [loading, setLoading] = useState(true);

  if (loading) {
    return <div>جاري التحميل...</div>;
  }

  return <div>Content</div>;
}
```

### ✅ الجديد (After):

```tsx
import { CardSkeleton, SectionLoading } from '@/components/LoadingStates';

function MyPage() {
  const [loading, setLoading] = useState(true);

  if (loading) {
    return <CardSkeleton count={6} />;
  }

  return <div>Content</div>;
}
```

### 🔄 أمثلة حسب النوع:

```tsx
// Full Page Loading
import { PageLoading } from '@/components/LoadingStates';
if (loading) return <PageLoading />;

// Section Loading
import { SectionLoading } from '@/components/LoadingStates';
if (loading) return <SectionLoading message="جاري تحميل البيانات..." />;

// Table Loading
import { TableSkeleton } from '@/components/LoadingStates';
if (loading) return <TableSkeleton rows={10} cols={5} />;

// Dashboard Stats
import { StatsLoading } from '@/components/LoadingStates';
if (loading) return <StatsLoading count={4} />;
```

---

## 3. استبدال Alerts بـ Toast

### ❌ القديم (Before):

```tsx
function SaveButton() {
  const handleSave = async () => {
    try {
      await saveData();
      alert('تم الحفظ بنجاح!');
    } catch (error) {
      alert('فشل الحفظ');
    }
  };

  return <button onClick={handleSave}>احفظ</button>;
}
```

### ✅ الجديد (After):

```tsx
import { useToast } from '@/contexts/ToastContext';

function SaveButton() {
  const toast = useToast();

  const handleSave = async () => {
    try {
      await saveData();
      toast.success('تم الحفظ بنجاح!', 'نجحت العملية');
    } catch (error) {
      toast.error('فشل الحفظ', 'خطأ');
    }
  };

  return <button onClick={handleSave}>احفظ</button>;
}
```

### 📝 أنواع Toast:

```tsx
const toast = useToast();

// Success
toast.success('تم بنجاح!', 'عملية ناجحة');

// Error
toast.error('حدث خطأ!', 'خطأ');

// Warning
toast.warning('تحذير!', 'انتبه');

// Info
toast.info('معلومة مهمة', 'تنبيه');
```

---

## 4. تحديث Forms مع Validation

### ❌ القديم (Before):

```tsx
function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Manual validation
    const newErrors = {};
    if (!email) newErrors.email = 'البريد مطلوب';
    if (password.length < 6) newErrors.password = 'كلمة المرور قصيرة';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Submit
    login({ email, password });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={email} onChange={(e) => setEmail(e.target.value)} />
      {errors.email && <span>{errors.email}</span>}
      
      <input value={password} onChange={(e) => setPassword(e.target.value)} />
      {errors.password && <span>{errors.password}</span>}
      
      <button type="submit">دخول</button>
    </form>
  );
}
```

### ✅ الجديد (After):

```tsx
import { useForm } from '@/hooks/useForm';
import { InputField } from '@/components/forms/FormField';
import { AccessibleButton } from '@/components/AccessibleButton';
import { z } from 'zod';

const LoginSchema = z.object({
  email: z.string().email('البريد الإلكتروني غير صحيح'),
  password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
});

function LoginForm() {
  const form = useForm({
    initialValues: { email: '', password: '' },
    validationSchema: LoginSchema,
    onSubmit: async (values) => {
      await login(values);
    },
  });

  return (
    <form onSubmit={form.handleSubmit}>
      <InputField
        {...form.getFieldProps('email')}
        label="البريد الإلكتروني"
        type="email"
        leftIcon={<Mail />}
      />
      
      <InputField
        {...form.getFieldProps('password')}
        label="كلمة المرور"
        type="password"
        leftIcon={<Lock />}
      />
      
      <AccessibleButton 
        type="submit" 
        loading={form.isSubmitting}
        fullWidth
      >
        تسجيل الدخول
      </AccessibleButton>
    </form>
  );
}
```

### 🔄 خطوات التحديث:

1. أنشئ Zod Schema:
```tsx
const MySchema = z.object({
  field1: z.string().min(2, 'قصير جداً'),
  field2: z.string().email('بريد غير صحيح'),
});
```

2. استخدم useForm Hook:
```tsx
const form = useForm({
  initialValues: { field1: '', field2: '' },
  validationSchema: MySchema,
  onSubmit: async (values) => {
    await submitData(values);
  },
});
```

3. استخدم InputField:
```tsx
<InputField
  {...form.getFieldProps('field1')}
  label="التسمية"
  hint="نص مساعد"
/>
```

---

## 5. تحديث Buttons

### ❌ القديم (Before):

```tsx
<button onClick={handleClick} disabled={loading}>
  {loading ? 'جاري...' : 'احفظ'}
</button>
```

### ✅ الجديد (After):

```tsx
import { AccessibleButton } from '@/components/AccessibleButton';

<AccessibleButton
  onClick={handleClick}
  loading={loading}
  loadingText="جاري الحفظ..."
  variant="primary"
  size="md"
  leftIcon={<Save />}
  ariaLabel="حفظ البيانات"
>
  احفظ
</AccessibleButton>
```

### 📝 Variants:

```tsx
<AccessibleButton variant="primary">أساسي</AccessibleButton>
<AccessibleButton variant="secondary">ثانوي</AccessibleButton>
<AccessibleButton variant="ghost">شفاف</AccessibleButton>
<AccessibleButton variant="danger">خطر</AccessibleButton>
<AccessibleButton variant="success">نجاح</AccessibleButton>
```

---

## 6. تحديث Image Upload

### ❌ القديم (Before):

```tsx
function ImageUpload() {
  const handleChange = (e) => {
    const file = e.target.files[0];
    // Basic upload
  };

  return <input type="file" onChange={handleChange} />;
}
```

### ✅ الجديد (After):

```tsx
import ImageUploadWithCompression from '@/components/ImageUploadWithCompression';

function ImageUpload() {
  const handleUpload = (file, preview) => {
    console.log('Compressed file:', file);
    console.log('Preview URL:', preview);
    // Upload compressed file
  };

  return (
    <ImageUploadWithCompression
      onUpload={handleUpload}
      maxSize={5}
      compressionQuality={0.8}
      maxWidth={1920}
      maxHeight={1080}
      label="رفع صورة"
      hint="JPG, PNG, or WebP - Max 5MB"
    />
  );
}
```

---

## 7. إضافة Search & Filters

### ✅ جديد:

```tsx
import AdvancedSearch, { FilterConfig } from '@/components/AdvancedSearch';

const filters: FilterConfig[] = [
  {
    id: 'status',
    label: 'الحالة',
    labelEn: 'Status',
    type: 'select',
    options: [
      { value: 'all', label: 'الكل', labelEn: 'All' },
      { value: 'active', label: 'نشط', labelEn: 'Active' },
      { value: 'inactive', label: 'غير نشط', labelEn: 'Inactive' },
    ],
  },
  {
    id: 'verified',
    label: 'موثق فقط',
    labelEn: 'Verified Only',
    type: 'checkbox',
  },
];

function MyPage() {
  const handleSearch = (query, filters) => {
    console.log('Search:', query);
    console.log('Filters:', filters);
    // Fetch data with query and filters
  };

  return (
    <AdvancedSearch
      placeholder="ابحث..."
      placeholderEn="Search..."
      filters={filters}
      onSearch={handleSearch}
      debounceMs={500}
      showFilterCount
    />
  );
}
```

---

## 8. تحديث قاعدة البيانات (اختياري)

إذا أردت استخدام Prisma في Production:

### 1. انتقل من SQLite إلى PostgreSQL:

```prisma
// prisma/schema.prisma
datasource db {
  provider = "postgresql" // بدلاً من sqlite
  url      = env("DATABASE_URL")
}
```

### 2. حدّث Environment Variables:

```bash
# .env
DATABASE_URL="postgresql://user:password@localhost:5432/samalogistics"
```

### 3. قم بـ Migration:

```bash
npx prisma migrate dev --name init
npx prisma generate
```

---

## 9. تحديث Environment Variables

أضف المتغيرات التالية لـ `.env`:

```bash
# Site Configuration
NEXT_PUBLIC_SITE_URL=https://samalogistics.com

# Database
DATABASE_URL="file:./dev.db"

# Optional: Error Tracking
# SENTRY_DSN=your-sentry-dsn

# Optional: Analytics
# NEXT_PUBLIC_GA_ID=your-google-analytics-id
```

---

## 10. اختبار التحسينات

### ✅ Checklist للاختبار:

1. **Error Handling:**
   - [ ] جرّب API Route مع خطأ متعمد
   - [ ] تأكد من ظهور Error Boundary
   - [ ] تحقق من رسائل الخطأ

2. **Toast Notifications:**
   - [ ] جرّب Success Toast
   - [ ] جرّب Error Toast
   - [ ] تحقق من Auto-close

3. **Loading States:**
   - [ ] تحقق من Skeleton Screens
   - [ ] جرّب Button Loading
   - [ ] تأكد من Smooth Transitions

4. **Forms:**
   - [ ] جرّب Validation
   - [ ] تحقق من Error Messages
   - [ ] اختبر Submit

5. **Rate Limiting:**
   - [ ] جرّب أكثر من الحد المسموح
   - [ ] تحقق من Error 429
   - [ ] تأكد من Reset

6. **Image Upload:**
   - [ ] جرّب رفع صورة كبيرة
   - [ ] تحقق من Compression
   - [ ] اختبر Drag & Drop

7. **Search & Filters:**
   - [ ] جرّب البحث
   - [ ] اختبر Filters
   - [ ] تحقق من Debouncing

---

## 🚨 مشاكل شائعة وحلولها

### 1. TypeScript Errors

**المشكلة:** أخطاء في Types بعد التحديث

**الحل:**
```bash
npm run build
# أو
npx tsc --noEmit
```

### 2. Prisma Client Issues

**المشكلة:** Prisma Client قديم

**الحل:**
```bash
npx prisma generate
```

### 3. Toast لا يظهر

**المشكلة:** نسيت إضافة ToastProvider

**الحل:**
تأكد من وجود ToastContainer في Providers.tsx (تم إضافته تلقائياً)

### 4. Rate Limiting لا يعمل في Development

**الحل:**
Rate Limiting يعمل على IP. في Development، قد تحتاج لـ:
```tsx
// Disable in development
if (process.env.NODE_ENV === 'development') {
  return handler(req, context);
}
```

---

## 📚 موارد إضافية

- [Zod Documentation](https://zod.dev)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Framer Motion](https://www.framer.com/motion/)
- [TailwindCSS](https://tailwindcss.com/docs)

---

## ✅ الخلاصة

اتبع هذا الدليل خطوة بخطوة لدمج التحسينات بدون مشاكل. ابدأ بـ API Routes ثم انتقل للـ Components.

**نصيحة:** لا تحدّث كل شيء مرة واحدة! حدّث قسم واحد في كل مرة واختبره جيداً.

---

**حظ موفق! 🚀**
