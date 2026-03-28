# 🚀 التحسينات المتقدمة - المرحلة الثانية

هذا الملف يوثّق التحسينات المتقدمة التي تم إضافتها للمشروع في المرحلة الثانية.

## 📋 جدول المحتويات

1. [Authentication Middleware](#1-authentication-middleware)
2. [Query Cache System](#2-query-cache-system)
3. [Email Service](#3-email-service)
4. [Webhook System](#4-webhook-system)
5. [File Storage Manager](#5-file-storage-manager)
6. [Advanced Logging](#6-advanced-logging)
7. [Notification System](#7-notification-system)
8. [Performance Optimizer](#8-performance-optimizer)
9. [Backup System](#9-backup-system)
10. [Activity Log](#10-activity-log)

---

## 1. Authentication Middleware

### 📝 الوصف
نظام middleware متقدم للمصادقة والتفويض في API Routes.

### 📁 الملف
```
lib/auth-middleware.ts
```

### ✨ المميزات

- ✅ استخراج المستخدم من JWT token
- ✅ التحقق من صلاحيات المستخدم
- ✅ حماية المسارات حسب الدور (Admin, User, etc.)
- ✅ Rate limiting خاص بكل مستخدم
- ✅ التحقق من ملكية الموارد

### 🎯 الاستخدام

#### Require Authentication
```typescript
import { requireAuth } from '@/lib/auth-middleware';
import { asyncHandler } from '@/lib/api-error-handler';

export const GET = asyncHandler(
  requireAuth(async (req, user) => {
    // المستخدم مصادق ومتاح هنا
    return NextResponse.json({ user });
  })
);
```

#### Require Admin Role
```typescript
import { requireAdmin } from '@/lib/auth-middleware';

export const DELETE = asyncHandler(
  requireAdmin(async (req, user) => {
    // فقط الـ Admin يمكنه الوصول
    await deleteResource();
    return successResponse({ message: 'تم الحذف' });
  })
);
```

#### Require Specific Roles
```typescript
import { requireRole } from '@/lib/auth-middleware';

export const POST = asyncHandler(
  requireRole(['ADMIN', 'MANAGER'], async (req, user) => {
    // Admin أو Manager فقط
    return successResponse({ data: 'OK' });
  })
);
```

#### Optional Authentication
```typescript
import { optionalAuth } from '@/lib/auth-middleware';

export const GET = asyncHandler(
  optionalAuth(async (req, user) => {
    // user قد يكون null أو معرّف
    const data = await getData(user?.id);
    return successResponse({ data });
  })
);
```

---

## 2. Query Cache System

### 📝 الوصف
نظام cache متقدم للاستعلامات مع TTL وإدارة ذكية للذاكرة.

### 📁 الملف
```
lib/query-cache.ts
```

### ✨ المميزات

- ✅ In-memory caching سريع
- ✅ TTL مخصص لكل query
- ✅ Invalidation patterns
- ✅ تنظيف تلقائي للـ expired entries
- ✅ Cache statistics

### 🎯 الاستخدام

#### Basic Usage
```typescript
import { cachedQuery, CacheTTL } from '@/lib/query-cache';

const users = await cachedQuery(
  'users:all',
  async () => {
    return await prisma.user.findMany();
  },
  CacheTTL.MEDIUM // 5 minutes
);
```

#### With Parameters
```typescript
const user = await cachedQuery(
  'users:byId',
  async () => {
    return await prisma.user.findUnique({
      where: { id: userId },
    });
  },
  CacheTTL.SHORT,
  { userId } // cache key parameters
);
```

#### Invalidate Cache
```typescript
import { invalidateCache } from '@/lib/query-cache';

// بعد تحديث المستخدمين
await prisma.user.create({ ... });
invalidateCache.users(); // مسح كل الـ cache المتعلق بالمستخدمين

// أو مسح كل شيء
invalidateCache.all();
```

#### Cache TTL Options
```typescript
CacheTTL.VERY_SHORT  // 10 seconds
CacheTTL.SHORT       // 1 minute
CacheTTL.MEDIUM      // 5 minutes
CacheTTL.LONG        // 15 minutes
CacheTTL.VERY_LONG   // 1 hour
CacheTTL.DAY         // 24 hours
```

---

## 3. Email Service

### 📝 الوصف
نظام إرسال بريد إلكتروني احترافي مع templates جاهزة.

### 📁 الملف
```
lib/email-service.ts
```

### ✨ المميزات

- ✅ Email templates جاهزة ومصممة
- ✅ RTL support للعربية
- ✅ Responsive design
- ✅ دعم المرفقات
- ✅ تصميم احترافي مع gradients

### 🎯 الاستخدام

#### Send Welcome Email
```typescript
import { emailService } from '@/lib/email-service';

await emailService.sendWelcomeEmail(
  'user@example.com',
  'محمد أحمد'
);
```

#### Send Password Reset
```typescript
await emailService.sendPasswordResetEmail(
  'user@example.com',
  'محمد أحمد',
  'reset-token-123'
);
```

#### Send Shipment Status Update
```typescript
await emailService.sendShipmentStatusEmail(
  'user@example.com',
  'TRACK-12345',
  'في الطريق للتوصيل'
);
```

#### Send Custom Email
```typescript
await emailService.send({
  to: 'user@example.com',
  subject: 'عنوان مخصص',
  html: '<p>محتوى HTML</p>',
  text: 'محتوى نصي بديل',
});
```

#### Available Templates
- ✉️ `sendWelcomeEmail()`
- 🔐 `sendPasswordResetEmail()`
- 📦 `sendShipmentStatusEmail()`
- 💰 `sendQuoteReceivedEmail()`
- 📬 `sendContactFormNotification()`

---

## 4. Webhook System

### 📝 الوصف
نظام webhooks لإرسال إشعارات للخدمات الخارجية.

### 📁 الملف
```
lib/webhook-service.ts
```

### ✨ المميزات

- ✅ Automatic retry مع exponential backoff
- ✅ Webhook queue للمعالجة
- ✅ Event helpers جاهزة
- ✅ Secret validation
- ✅ Custom headers support

### 🎯 الاستخدام

#### Trigger Webhook
```typescript
import { webhookService } from '@/lib/webhook-service';

await webhookService.trigger('shipment.created', {
  shipmentId: '123',
  status: 'pending',
});
```

#### Using Event Helpers
```typescript
// Shipment events
await webhookService.shipment.created('shipment-id', data);
await webhookService.shipment.statusChanged('id', 'pending', 'delivered');

// User events
await webhookService.user.created('user-id', userData);
await webhookService.user.updated('user-id', changes);

// Quote events
await webhookService.quote.created('quote-id', quoteData);
await webhookService.quote.accepted('quote-id');
```

#### Queue Webhook
```typescript
// للمعالجة لاحقاً (non-blocking)
webhookService.queueWebhook('event.name', data);
```

#### Available Events
```typescript
WebhookEvents.SHIPMENT_CREATED
WebhookEvents.SHIPMENT_UPDATED
WebhookEvents.SHIPMENT_STATUS_CHANGED
WebhookEvents.USER_CREATED
WebhookEvents.QUOTE_CREATED
WebhookEvents.CONTACT_FORM_SUBMITTED
// ...والمزيد
```

---

## 5. File Storage Manager

### 📝 الوصف
نظام إدارة ملفات متقدم مع دعم التحميل والحذف والإحصائيات.

### 📁 الملف
```
lib/file-storage.ts
```

### ✨ المميزات

- ✅ Upload validation (size, type)
- ✅ Unique filename generation
- ✅ Folder organization
- ✅ File cleanup utilities
- ✅ Storage statistics
- ✅ Safe filename generation

### 🎯 الاستخدام

#### Upload File
```typescript
import { fileStorage } from '@/lib/file-storage';

const result = await fileStorage.upload(file, {
  maxSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  folder: 'avatars',
});

if (result.success) {
  console.log('File URL:', result.url);
}
```

#### Upload from Buffer
```typescript
const result = await fileStorage.uploadBuffer(
  buffer,
  'filename.jpg',
  { folder: 'temp' }
);
```

#### Delete File
```typescript
await fileStorage.delete('/uploads/images/file.jpg');
```

#### List Files
```typescript
const files = await fileStorage.listFiles('images');
```

#### Cleanup Old Files
```typescript
// حذف الملفات الأقدم من 7 أيام
const deletedCount = await fileStorage.cleanup('temp', 7);
```

#### Get Storage Stats
```typescript
const stats = await fileStorage.getStats();
console.log('Total files:', stats.totalFiles);
console.log('Total size:', fileStorage.formatSize(stats.totalSize));
```

---

## 6. Advanced Logging

### 📝 الوصف
نظام logging احترافي مع مستويات ومعالجات مختلفة.

### 📁 الملف
```
lib/logger.ts
```

### ✨ المميزات

- ✅ مستويات متعددة (debug, info, warn, error, fatal)
- ✅ تنسيق جميل مع emojis
- ✅ Context data support
- ✅ Stack trace للأخطاء
- ✅ In-memory log storage
- ✅ Export capabilities
- ✅ Statistics

### 🎯 الاستخدام

#### Basic Logging
```typescript
import { log } from '@/lib/logger';

log.debug('Debug message', { extra: 'data' });
log.info('Information message');
log.warn('Warning message');
log.error('Error occurred', new Error('Details'));
log.fatal('Fatal error!', error);
```

#### Specialized Loggers
```typescript
// API request logging
log.api('POST', '/api/users', userId, 201);

// Database query logging
log.db('SELECT * FROM users', 150); // 150ms duration

// Authentication logging
log.auth('user@example.com', true);
```

#### Using Logger Instance
```typescript
import { logger } from '@/lib/logger';

logger.info('User logged in', {
  userId: '123',
  timestamp: new Date(),
});

// Get recent logs
const recentLogs = logger.getRecentLogs(50);

// Get error logs only
const errors = logger.getErrorLogs();

// Export logs
const json = logger.exportLogs();

// Get statistics
const stats = logger.getStats();
console.log('Total errors:', stats.error);
```

---

## 7. Notification System

### 📝 الوصف
نظام إشعارات داخلي للتطبيق.

### 📁 الملف
```
lib/notification-service.ts
```

### ✨ المميزات

- ✅ أنواع مختلفة (info, success, warning, error)
- ✅ Action buttons
- ✅ Expiration dates
- ✅ Read/unread tracking
- ✅ Templates جاهزة

### 🎯 الاستخدام

#### Create Notification
```typescript
import { notificationService } from '@/lib/notification-service';

notificationService.create({
  userId: 'user-123',
  type: 'success',
  title: 'نجاح العملية',
  message: 'تم حفظ البيانات بنجاح',
  actionUrl: '/dashboard',
  actionText: 'عرض',
});
```

#### Using Templates
```typescript
// Shipment status changed
notificationService.templates.shipmentStatusChanged(
  'user-id',
  'TRACK-123',
  'في الطريق'
);

// Quote received
notificationService.templates.quoteReceived('user-id', 'quote-123');

// Payment due
notificationService.templates.paymentDue('user-id', 500, new Date());

// Welcome message
notificationService.templates.welcomeMessage('user-id', 'محمد');
```

#### Get User Notifications
```typescript
// All notifications
const notifications = notificationService.getUserNotifications('user-id');

// Unread only
const unread = notificationService.getUserNotifications('user-id', {
  unreadOnly: true,
});

// Limited count
const latest = notificationService.getUserNotifications('user-id', {
  limit: 10,
});
```

#### Mark as Read
```typescript
notificationService.markAsRead('user-id', 'notification-id');
notificationService.markAllAsRead('user-id');
```

#### Delete Notifications
```typescript
notificationService.delete('user-id', 'notification-id');
notificationService.deleteAll('user-id');
```

#### Get Unread Count
```typescript
const count = notificationService.getUnreadCount('user-id');
```

---

## 8. Performance Optimizer

### 📝 الوصف
أدوات تحسين الأداء: memoization, debounce, throttle, وغيرها.

### 📁 الملف
```
lib/performance.ts
```

### ✨ المميزات

- ✅ Memoization
- ✅ Debounce & Throttle
- ✅ Batch processing
- ✅ Retry with backoff
- ✅ Performance monitoring
- ✅ Lazy loading
- ✅ Parallel execution with limit

### 🎯 الاستخدام

#### Memoize
```typescript
import { memoize } from '@/lib/performance';

const expensiveFunction = memoize((x: number) => {
  // حسابات معقدة
  return x * x;
});

// النتيجة ستُحفظ في الذاكرة
const result1 = expensiveFunction(5); // يُحسب
const result2 = expensiveFunction(5); // من الذاكرة
```

#### Debounce
```typescript
import { debounce } from '@/lib/performance';

const searchHandler = debounce((query: string) => {
  performSearch(query);
}, 500);

// سيتم الانتظار 500ms بعد آخر استدعاء
searchHandler('test');
```

#### Throttle
```typescript
import { throttle } from '@/lib/performance';

const scrollHandler = throttle(() => {
  updateScrollPosition();
}, 100);

// سيتم التنفيذ مرة واحدة كل 100ms
window.addEventListener('scroll', scrollHandler);
```

#### Batch Processing
```typescript
import { batch } from '@/lib/performance';

const batchLogger = batch((items: string[]) => {
  console.log('Logging batch:', items);
}, 1000);

// سيتم جمع العناصر لمدة ثانية ثم معالجتها دفعة واحدة
batchLogger('item1');
batchLogger('item2');
batchLogger('item3');
```

#### Retry with Backoff
```typescript
import { retryWithBackoff } from '@/lib/performance';

const result = await retryWithBackoff(
  async () => {
    return await fetchDataFromAPI();
  },
  3, // max retries
  1000 // base delay
);
```

#### Measure Time
```typescript
import { measureTime } from '@/lib/performance';

const { result, duration } = await measureTime(
  async () => {
    return await heavyOperation();
  },
  'Heavy Operation' // label (optional)
);

console.log(`Took ${duration}ms`);
```

#### Performance Monitor
```typescript
import { perfMonitor } from '@/lib/performance';

// Mark start
perfMonitor.mark('operation-start');

// Do work...
await doWork();

// Measure
const duration = perfMonitor.measure('operation', 'operation-start');

// Get statistics
const stats = perfMonitor.getMetrics('operation');
console.log('Average:', stats.average);

// Print report
perfMonitor.report();
```

#### Parallel with Limit
```typescript
import { parallelLimit } from '@/lib/performance';

const tasks = urls.map(url => () => fetch(url));

// تنفيذ 5 طلبات بالتوازي فقط
const results = await parallelLimit(tasks, 5);
```

---

## 9. Backup System

### 📝 الوصف
نظام النسخ الاحتياطي التلقائي للقاعدة والملفات.

### 📁 الملف
```
lib/backup-service.ts
```

### ✨ المميزات

- ✅ Database backup (JSON export)
- ✅ File backup (uploads)
- ✅ Scheduled backups
- ✅ Automatic cleanup
- ✅ Restore capabilities
- ✅ Backup statistics

### 🎯 الاستخدام

#### Create Backup
```typescript
import { backupService } from '@/lib/backup-service';

const result = await backupService.createBackup({
  includeDatabase: true,
  includeUploads: true,
});

if (result.success) {
  console.log('Backup created:', result.backupPath);
  console.log('Size:', result.size);
  console.log('Duration:', result.duration);
}
```

#### List Backups
```typescript
const backups = await backupService.listBackups();

backups.forEach(backup => {
  console.log(backup.name);
  console.log('Created:', backup.createdAt);
  console.log('Size:', backup.size);
});
```

#### Cleanup Old Backups
```typescript
// حفظ آخر 5 نسخ فقط
const deletedCount = await backupService.cleanupOldBackups(5);
console.log(`Deleted ${deletedCount} old backups`);
```

#### Schedule Automatic Backups
```typescript
// نسخة احتياطية كل 24 ساعة
backupService.scheduleBackups(24);
```

#### Restore Backup
```typescript
const success = await backupService.restoreBackup('backup-2026-01-12');

if (success) {
  console.log('Restore completed');
}
```

---

## 10. Activity Log

### 📝 الوصف
نظام تسجيل نشاطات المستخدمين والمسؤولين.

### 📁 الملف
```
lib/activity-log.ts
```

### ✨ المميزات

- ✅ تسجيل كل النشاطات
- ✅ Change tracking
- ✅ IP address & user agent
- ✅ Activity statistics
- ✅ Export capabilities
- ✅ Helper methods

### 🎯 الاستخدام

#### Log Activity
```typescript
import { activityLog, ActivityTypes } from '@/lib/activity-log';

activityLog.log({
  userId: 'user-123',
  userName: 'محمد أحمد',
  userEmail: 'user@example.com',
  action: ActivityTypes.SHIPMENT_CREATED,
  resource: 'shipment',
  resourceId: 'shipment-456',
  metadata: { status: 'pending' },
});
```

#### Using Helpers
```typescript
// User login
activityLog.helpers.userLogin(
  { id: '123', name: 'محمد', email: 'user@example.com' },
  '192.168.1.1'
);

// Shipment created
activityLog.helpers.shipmentCreated(
  user,
  'shipment-id',
  { trackingNumber: 'TRACK-123' }
);

// Shipment updated with changes
activityLog.helpers.shipmentUpdated(
  user,
  'shipment-id',
  {
    status: { old: 'pending', new: 'in-transit' },
    location: { old: 'Cairo', new: 'Alexandria' },
  }
);

// CMS updated
activityLog.helpers.cmsUpdated(user, 'hero-section', changes);

// Settings updated
activityLog.helpers.settingsUpdated(user, 'site-config', changes);
```

#### Get User Activities
```typescript
const activities = activityLog.getUserActivities('user-id', {
  limit: 20,
  action: ActivityTypes.SHIPMENT_CREATED,
});
```

#### Get All Activities (Admin)
```typescript
const allActivities = activityLog.getAllActivities({
  limit: 100,
  userId: 'specific-user', // optional
  resource: 'shipment', // optional
});
```

#### Get Statistics
```typescript
const stats = activityLog.getStatistics();

console.log('Total activities:', stats.totalActivities);
console.log('By action:', stats.activitiesByAction);
console.log('By user:', stats.activitiesByUser);
console.log('By resource:', stats.activitiesByResource);
```

#### Export Activities
```typescript
const json = activityLog.exportActivities({
  startDate: new Date('2026-01-01'),
  endDate: new Date('2026-01-31'),
  userId: 'user-123', // optional
});

// حفظ في ملف
await fs.writeFile('activities.json', json);
```

#### Cleanup Old Activities
```typescript
// حذف النشاطات الأقدم من 30 يوم
const deletedCount = activityLog.clearOldActivities(30);
```

---

## 🎯 Best Practices

### 1. استخدم الـ Caching بحكمة
```typescript
// ✅ جيد: cache البيانات التي لا تتغير كثيراً
const settings = await cachedQuery('settings', fetchSettings, CacheTTL.LONG);

// ❌ سيء: cache البيانات الحساسة أو المتغيرة
const currentOrders = await cachedQuery('orders', fetchOrders, CacheTTL.VERY_LONG);
```

### 2. استخدم الـ Logger في كل مكان
```typescript
try {
  await criticalOperation();
  log.info('Operation completed successfully');
} catch (error) {
  log.error('Operation failed', error, { context: 'payment-processing' });
  throw error;
}
```

### 3. سجّل النشاطات المهمة فقط
```typescript
// ✅ جيد: تسجيل الإجراءات المهمة
activityLog.helpers.shipmentCreated(user, shipmentId, data);

// ❌ سيء: تسجيل كل شيء (سيملأ الذاكرة)
activityLog.log({ action: 'page_viewed', ... });
```

### 4. استخدم الـ Authentication Middleware
```typescript
// ✅ جيد: حماية API routes
export const DELETE = asyncHandler(
  requireAdmin(async (req, user) => {
    // آمن
  })
);

// ❌ سيء: بدون حماية
export async function DELETE(req: Request) {
  // غير آمن!
}
```

### 5. أرسل Webhooks للأحداث المهمة
```typescript
// بعد إنشاء شحنة
await prisma.shipment.create({ ... });
await webhookService.shipment.created(shipmentId, data);
```

---

## 🔒 Security Considerations

1. **Authentication**: استخدم JWT tokens بشكل صحيح
2. **Authorization**: تحقق دائماً من الصلاحيات
3. **Rate Limiting**: حماية من الهجمات
4. **Input Validation**: استخدم Zod للتحقق
5. **Activity Logging**: سجّل كل الإجراءات الحساسة

---

## 📊 Performance Tips

1. استخدم `memoize` للدوال المعقدة
2. استخدم `debounce` للبحث والإدخال
3. استخدم `throttle` للـ scroll events
4. استخدم `cachedQuery` للاستعلامات المتكررة
5. استخدم `parallelLimit` للطلبات المتعددة

---

## 🎉 الخلاصة

هذه التحسينات تجعل المشروع:

- ✅ أكثر أماناً (Authentication + Activity Log)
- ✅ أسرع (Caching + Performance Utilities)
- ✅ أكثر موثوقية (Backup + Logging)
- ✅ أسهل في الصيانة (Organized code)
- ✅ جاهز للإنتاج (Production-ready)

---

**Created with ❤️ for Sama Logistics**
