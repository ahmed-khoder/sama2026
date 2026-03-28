# 💡 أمثلة عملية - استخدام التحسينات الجديدة

مجموعة أمثلة جاهزة للنسخ واللصق لاستخدام جميع التحسينات الجديدة.

---

## 📋 جدول المحتويات

1. [API Routes Examples](#1-api-routes-examples)
2. [Toast Notifications Examples](#2-toast-notifications-examples)
3. [Form Validation Examples](#3-form-validation-examples)
4. [Loading States Examples](#4-loading-states-examples)
5. [Image Upload Examples](#5-image-upload-examples)
6. [Search & Filter Examples](#6-search--filter-examples)
7. [Complete Page Examples](#7-complete-page-examples)

---

## 1. API Routes Examples

### مثال 1: GET Route بسيط

```tsx
// app/api/users/route.ts
import { asyncHandler, successResponse, Errors } from '@/lib/api-error-handler';
import { withRateLimit, RateLimitConfig } from '@/lib/rate-limiter';
import { prisma } from '@/lib/db';

export const GET = withRateLimit(
  asyncHandler(async (req) => {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    return successResponse(users, 'تم جلب المستخدمين بنجاح');
  }),
  RateLimitConfig.api
);
```

### مثال 2: POST Route مع Validation

```tsx
// app/api/users/route.ts
import { z } from 'zod';

const CreateUserSchema = z.object({
  name: z.string().min(2, 'الاسم يجب أن يكون حرفين على الأقل'),
  email: z.string().email('البريد الإلكتروني غير صحيح'),
  password: z.string().min(6, 'كلمة المرور قصيرة جداً'),
});

export const POST = withRateLimit(
  asyncHandler(async (req) => {
    const body = await req.json();
    const validatedData = CreateUserSchema.parse(body);

    // Check for duplicate email
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      throw Errors.Conflict('البريد الإلكتروني مستخدم بالفعل');
    }

    const user = await prisma.user.create({
      data: validatedData,
    });

    return successResponse(user, 'تم إنشاء المستخدم بنجاح', 201);
  }),
  RateLimitConfig.contact
);
```

### مثال 3: Protected Route

```tsx
// app/api/dashboard/stats/route.ts
import { asyncHandler, successResponse, Errors } from '@/lib/api-error-handler';

export const GET = asyncHandler(async (req) => {
  // Check authentication
  const userId = req.headers.get('x-user-id');
  
  if (!userId) {
    throw Errors.Unauthorized('يجب تسجيل الدخول أولاً');
  }

  // Check authorization
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (user?.role !== 'ADMIN') {
    throw Errors.Forbidden('ليس لديك صلاحية للوصول');
  }

  const stats = await calculateStats();
  return successResponse(stats);
});
```

---

## 2. Toast Notifications Examples

### مثال 1: استخدام أساسي

```tsx
'use client';
import { useToast } from '@/contexts/ToastContext';

function SaveButton() {
  const toast = useToast();

  const handleSave = async () => {
    try {
      await saveData();
      toast.success('تم الحفظ بنجاح!', 'عملية ناجحة');
    } catch (error) {
      toast.error('فشل الحفظ', 'خطأ');
    }
  };

  return <button onClick={handleSave}>احفظ</button>;
}
```

### مثال 2: جميع أنواع Toast

```tsx
function ToastExamples() {
  const toast = useToast();

  return (
    <div className="space-y-2">
      <button onClick={() => toast.success('تم الحفظ!', 'نجاح')}>
        Success Toast
      </button>
      
      <button onClick={() => toast.error('فشلت العملية!', 'خطأ')}>
        Error Toast
      </button>
      
      <button onClick={() => toast.warning('انتبه!', 'تحذير')}>
        Warning Toast
      </button>
      
      <button onClick={() => toast.info('معلومة مهمة', 'تنبيه')}>
        Info Toast
      </button>
    </div>
  );
}
```

### مثال 3: Toast مع API Call

```tsx
async function deleteUser(id: string) {
  const toast = useToast();

  try {
    const response = await fetch(`/api/users/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('فشل الحذف');
    }

    toast.success('تم حذف المستخدم بنجاح', 'نجحت العملية');
    
    // Refresh data
    mutate();
  } catch (error) {
    toast.error('فشل حذف المستخدم', 'خطأ');
  }
}
```

---

## 3. Form Validation Examples

### مثال 1: نموذج تسجيل دخول

```tsx
'use client';
import { useForm } from '@/hooks/useForm';
import { InputField } from '@/components/forms/FormField';
import { AccessibleButton } from '@/components/AccessibleButton';
import { Mail, Lock } from 'lucide-react';
import { z } from 'zod';

const LoginSchema = z.object({
  email: z.string().email('البريد الإلكتروني غير صحيح'),
  password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
});

export default function LoginForm() {
  const form = useForm({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: LoginSchema,
    onSubmit: async (values) => {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error('فشل تسجيل الدخول');
      }

      // Redirect to dashboard
      window.location.href = '/dashboard';
    },
  });

  return (
    <form onSubmit={form.handleSubmit} className="space-y-4">
      <InputField
        {...form.getFieldProps('email')}
        label="البريد الإلكتروني"
        type="email"
        leftIcon={<Mail className="w-5 h-5" />}
        required
      />

      <InputField
        {...form.getFieldProps('password')}
        label="كلمة المرور"
        type="password"
        leftIcon={<Lock className="w-5 h-5" />}
        required
      />

      <AccessibleButton
        type="submit"
        loading={form.isSubmitting}
        loadingText="جاري تسجيل الدخول..."
        variant="primary"
        size="lg"
        fullWidth
      >
        تسجيل الدخول
      </AccessibleButton>
    </form>
  );
}
```

### مثال 2: نموذج تواصل

```tsx
'use client';
import { useForm } from '@/hooks/useForm';
import { InputField, TextareaField } from '@/components/forms/FormField';
import { AccessibleButton } from '@/components/AccessibleButton';
import { useToast } from '@/contexts/ToastContext';
import { z } from 'zod';

const ContactSchema = z.object({
  name: z.string().min(2, 'الاسم قصير جداً'),
  email: z.string().email('البريد الإلكتروني غير صحيح'),
  phone: z.string().regex(/^[0-9]{10,}$/, 'رقم الهاتف غير صحيح'),
  message: z.string().min(10, 'الرسالة قصيرة جداً'),
});

export default function ContactForm() {
  const toast = useToast();

  const form = useForm({
    initialValues: {
      name: '',
      email: '',
      phone: '',
      message: '',
    },
    validationSchema: ContactSchema,
    onSubmit: async (values) => {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error('فشل إرسال الرسالة');
      }

      toast.success('تم إرسال رسالتك بنجاح', 'شكراً لتواصلك');
      form.resetForm();
    },
  });

  return (
    <form onSubmit={form.handleSubmit} className="space-y-6">
      <InputField
        {...form.getFieldProps('name')}
        label="الاسم الكامل"
        required
        hint="أدخل اسمك الكامل"
      />

      <InputField
        {...form.getFieldProps('email')}
        label="البريد الإلكتروني"
        type="email"
        required
      />

      <InputField
        {...form.getFieldProps('phone')}
        label="رقم الهاتف"
        type="tel"
        required
        hint="مثال: 0512345678"
      />

      <TextareaField
        {...form.getFieldProps('message')}
        label="الرسالة"
        rows={5}
        required
        showCharCount
        maxLength={500}
        hint="اكتب رسالتك هنا"
      />

      <AccessibleButton
        type="submit"
        loading={form.isSubmitting}
        loadingText="جاري الإرسال..."
        variant="primary"
        size="lg"
        fullWidth
      >
        إرسال الرسالة
      </AccessibleButton>
    </form>
  );
}
```

---

## 4. Loading States Examples

### مثال 1: صفحة بطاقات

```tsx
'use client';
import { useState, useEffect } from 'react';
import { CardSkeleton } from '@/components/LoadingStates';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <CardSkeleton count={9} />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-3 gap-6">
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
```

### مثال 2: صفحة جدول

```tsx
'use client';
import { TableSkeleton } from '@/components/LoadingStates';
import useSWR from 'swr';

export default function UsersTable() {
  const { data: users, error, isLoading } = useSWR('/api/users', fetcher);

  if (isLoading) {
    return <TableSkeleton rows={10} cols={5} />;
  }

  if (error) {
    return <div>فشل تحميل البيانات</div>;
  }

  return (
    <table className="w-full">
      {/* Table content */}
    </table>
  );
}
```

### مثال 3: زر مع Loading

```tsx
'use client';
import { AccessibleButton } from '@/components/AccessibleButton';
import { Save } from 'lucide-react';

function SaveButton() {
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveData();
    } finally {
      setSaving(false);
    }
  };

  return (
    <AccessibleButton
      onClick={handleSave}
      loading={saving}
      loadingText="جاري الحفظ..."
      leftIcon={<Save />}
      variant="primary"
    >
      احفظ التغييرات
    </AccessibleButton>
  );
}
```

---

## 5. Image Upload Examples

### مثال 1: رفع صورة بروفايل

```tsx
'use client';
import ImageUploadWithCompression from '@/components/ImageUploadWithCompression';
import { useState } from 'react';
import { useToast } from '@/contexts/ToastContext';

export default function ProfileImageUpload() {
  const toast = useToast();
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (file: File, preview: string) => {
    setUploading(true);

    try {
      // Create FormData
      const formData = new FormData();
      formData.append('image', file);

      // Upload to server
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('فشل رفع الصورة');
      }

      const { url } = await response.json();
      
      toast.success('تم رفع الصورة بنجاح!');
      
      // Update user profile
      await updateProfile({ avatar: url });
    } catch (error) {
      toast.error('فشل رفع الصورة');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <h3 className="text-lg font-bold mb-4">صورة الملف الشخصي</h3>
      <ImageUploadWithCompression
        onUpload={handleUpload}
        maxSize={5}
        compressionQuality={0.8}
        maxWidth={512}
        maxHeight={512}
        label="رفع صورة جديدة"
        hint="JPG, PNG أو WebP - حتى 5MB"
      />
    </div>
  );
}
```

---

## 6. Search & Filter Examples

### مثال 1: بحث وفلترة شحنات

```tsx
'use client';
import AdvancedSearch, { FilterConfig } from '@/components/AdvancedSearch';
import { useState, useEffect } from 'react';

const filters: FilterConfig[] = [
  {
    id: 'status',
    label: 'الحالة',
    labelEn: 'Status',
    type: 'select',
    options: [
      { value: 'PENDING', label: 'قيد الانتظار', labelEn: 'Pending' },
      { value: 'IN_TRANSIT', label: 'في الطريق', labelEn: 'In Transit' },
      { value: 'DELIVERED', label: 'تم التوصيل', labelEn: 'Delivered' },
    ],
  },
  {
    id: 'type',
    label: 'نوع الشحن',
    labelEn: 'Shipment Type',
    type: 'select',
    options: [
      { value: 'SEA', label: 'بحري', labelEn: 'Sea' },
      { value: 'AIR', label: 'جوي', labelEn: 'Air' },
      { value: 'LAND', label: 'بري', labelEn: 'Land' },
    ],
  },
  {
    id: 'urgent',
    label: 'عاجلة فقط',
    labelEn: 'Urgent Only',
    type: 'checkbox',
  },
];

export default function ShipmentsPage() {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (query: string, filters: Record<string, any>) => {
    setLoading(true);

    try {
      const params = new URLSearchParams({
        q: query,
        ...filters,
      });

      const response = await fetch(`/api/shipments?${params}`);
      const data = await response.json();
      
      setShipments(data);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">الشحنات</h1>

      <AdvancedSearch
        placeholder="ابحث عن شحنة..."
        placeholderEn="Search shipment..."
        filters={filters}
        onSearch={handleSearch}
        debounceMs={500}
        showFilterCount
      />

      <div className="mt-8">
        {loading ? (
          <TableSkeleton rows={10} cols={6} />
        ) : (
          <ShipmentsTable shipments={shipments} />
        )}
      </div>
    </div>
  );
}
```

---

## 7. Complete Page Examples

### مثال كامل: صفحة إدارة المستخدمين

```tsx
'use client';
import { useState, useEffect } from 'react';
import { useToast } from '@/contexts/ToastContext';
import { TableSkeleton } from '@/components/LoadingStates';
import { AccessibleButton } from '@/components/AccessibleButton';
import AdvancedSearch, { FilterConfig } from '@/components/AdvancedSearch';
import { Plus, Edit, Trash2 } from 'lucide-react';

const filters: FilterConfig[] = [
  {
    id: 'role',
    label: 'الدور',
    labelEn: 'Role',
    type: 'select',
    options: [
      { value: 'CLIENT', label: 'عميل', labelEn: 'Client' },
      { value: 'EMPLOYEE', label: 'موظف', labelEn: 'Employee' },
      { value: 'ADMIN', label: 'مدير', labelEn: 'Admin' },
    ],
  },
  {
    id: 'isActive',
    label: 'نشط فقط',
    labelEn: 'Active Only',
    type: 'checkbox',
  },
];

export default function UsersManagementPage() {
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchUsers = async (query = '', filters = {}) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ q: query, ...filters });
      const response = await fetch(`/api/users?${params}`);
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      toast.error('فشل تحميل المستخدمين');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (userId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المستخدم؟')) {
      return;
    }

    setDeleting(userId);
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error();

      toast.success('تم حذف المستخدم بنجاح');
      fetchUsers();
    } catch (error) {
      toast.error('فشل حذف المستخدم');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">إدارة المستخدمين</h1>
        <AccessibleButton
          variant="primary"
          leftIcon={<Plus />}
          onClick={() => {/* Navigate to create page */}}
        >
          إضافة مستخدم
        </AccessibleButton>
      </div>

      {/* Search & Filter */}
      <div className="mb-6">
        <AdvancedSearch
          placeholder="ابحث عن مستخدم..."
          placeholderEn="Search user..."
          filters={filters}
          onSearch={fetchUsers}
          showFilterCount
        />
      </div>

      {/* Table */}
      {loading ? (
        <TableSkeleton rows={10} cols={5} />
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-slate-900">
              <tr>
                <th className="px-6 py-4 text-right">الاسم</th>
                <th className="px-6 py-4 text-right">البريد</th>
                <th className="px-6 py-4 text-right">الدور</th>
                <th className="px-6 py-4 text-right">الحالة</th>
                <th className="px-6 py-4 text-right">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4">{user.name}</td>
                  <td className="px-6 py-4">{user.email}</td>
                  <td className="px-6 py-4">{user.role}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      user.isActive 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {user.isActive ? 'نشط' : 'غير نشط'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <AccessibleButton
                        variant="ghost"
                        size="sm"
                        leftIcon={<Edit className="w-4 h-4" />}
                      >
                        تعديل
                      </AccessibleButton>
                      <AccessibleButton
                        variant="danger"
                        size="sm"
                        leftIcon={<Trash2 className="w-4 h-4" />}
                        loading={deleting === user.id}
                        onClick={() => handleDelete(user.id)}
                      >
                        حذف
                      </AccessibleButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
```

---

## 🎓 الخلاصة

جميع الأمثلة أعلاه جاهزة للنسخ واللصق والاستخدام مباشرة!

**نصيحة:** ابدأ بالأمثلة البسيطة ثم انتقل للأمثلة المعقدة تدريجياً.

---

**حظ موفق! 🚀**
