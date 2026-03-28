# 🔧 دليل Scripts المفيدة

## 📋 Scripts الموجودة حالياً

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  }
}
```

---

## 🚀 Scripts مقترحة للإضافة

يمكنك إضافة هذه الـ scripts إلى `package.json`:

### Development Scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "dev:turbo": "next dev --turbo",
    "build": "next build",
    "build:analyze": "ANALYZE=true next build",
    "start": "next start",
    "start:prod": "NODE_ENV=production next start",
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "type-check": "tsc --noEmit",
    "format": "prettier --write \"**/*.{ts,tsx,js,jsx,json,md}\"",
    "format:check": "prettier --check \"**/*.{ts,tsx,js,jsx,json,md}\""
  }
}
```

### Database Scripts

```json
{
  "scripts": {
    "db:generate": "prisma generate",
    "db:migrate": "prisma migrate dev",
    "db:migrate:prod": "prisma migrate deploy",
    "db:push": "prisma db push",
    "db:seed": "prisma db seed",
    "db:studio": "prisma studio",
    "db:reset": "prisma migrate reset",
    "db:backup": "node scripts/backup-db.js",
    "db:restore": "node scripts/restore-db.js"
  }
}
```

### Testing Scripts

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

### Utility Scripts

```json
{
  "scripts": {
    "clean": "rm -rf .next node_modules",
    "clean:cache": "rm -rf .next/cache",
    "clean:build": "rm -rf .next dist",
    "postinstall": "prisma generate",
    "prepare": "husky install",
    "check": "npm run type-check && npm run lint && npm run format:check"
  }
}
```

---

## 📝 Scripts مخصصة للمشروع

### 1. Backup Script
إنشاء ملف `scripts/backup.js`:

```javascript
#!/usr/bin/env node

const { backupService } = require('../lib/backup-service');
const { logger } = require('../lib/logger');

async function main() {
  logger.info('Starting backup...');
  
  const result = await backupService.createBackup({
    includeDatabase: true,
    includeUploads: true,
  });

  if (result.success) {
    logger.info('Backup completed successfully', {
      path: result.backupPath,
      size: result.size,
      duration: result.duration,
    });
    
    // Cleanup old backups
    const deleted = await backupService.cleanupOldBackups(5);
    logger.info(`Cleaned up ${deleted} old backups`);
  } else {
    logger.error('Backup failed', new Error(result.error));
    process.exit(1);
  }
}

main();
```

ثم أضف للـ package.json:
```json
{
  "scripts": {
    "backup": "node scripts/backup.js",
    "backup:auto": "node scripts/schedule-backup.js"
  }
}
```

### 2. Cache Clear Script
إنشاء ملف `scripts/clear-cache.js`:

```javascript
#!/usr/bin/env node

const { queryCache } = require('../lib/query-cache');
const { logger } = require('../lib/logger');

async function main() {
  logger.info('Clearing cache...');
  
  const stats = queryCache.getStats();
  logger.info('Cache stats before clearing', stats);
  
  queryCache.clear();
  
  logger.info('Cache cleared successfully');
}

main();
```

ثم أضف:
```json
{
  "scripts": {
    "cache:clear": "node scripts/clear-cache.js",
    "cache:stats": "node scripts/cache-stats.js"
  }
}
```

### 3. Cleanup Script
إنشاء ملف `scripts/cleanup.js`:

```javascript
#!/usr/bin/env node

const { fileStorage } = require('../lib/file-storage');
const { activityLog } = require('../lib/activity-log');
const { logger } = require('../lib/logger');

async function main() {
  logger.info('Starting cleanup...');
  
  // Clean temp files older than 7 days
  const deletedFiles = await fileStorage.cleanup('temp', 7);
  logger.info(`Deleted ${deletedFiles} temp files`);
  
  // Clean old activity logs (30 days)
  const deletedLogs = activityLog.clearOldActivities(30);
  logger.info(`Deleted ${deletedLogs} old activity logs`);
  
  // Clean old backups (keep 5)
  const deletedBackups = await backupService.cleanupOldBackups(5);
  logger.info(`Deleted ${deletedBackups} old backups`);
  
  logger.info('Cleanup completed');
}

main();
```

ثم أضف:
```json
{
  "scripts": {
    "cleanup": "node scripts/cleanup.js",
    "cleanup:files": "node scripts/cleanup-files.js",
    "cleanup:logs": "node scripts/cleanup-logs.js"
  }
}
```

### 4. Health Check Script
إنشاء ملف `scripts/health-check.js`:

```javascript
#!/usr/bin/env node

const { prisma } = require('../lib/db');
const { fileStorage } = require('../lib/file-storage');
const { logger } = require('../lib/logger');

async function main() {
  logger.info('Running health checks...');
  
  const checks = {
    database: false,
    storage: false,
  };

  // Check database
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = true;
    logger.info('✅ Database is healthy');
  } catch (error) {
    logger.error('❌ Database check failed', error);
  }

  // Check storage
  try {
    const stats = await fileStorage.getStats();
    checks.storage = true;
    logger.info('✅ Storage is healthy', {
      totalFiles: stats.totalFiles,
      totalSize: fileStorage.formatSize(stats.totalSize),
    });
  } catch (error) {
    logger.error('❌ Storage check failed', error);
  }

  // Overall status
  const healthy = Object.values(checks).every(check => check === true);
  
  if (healthy) {
    logger.info('🎉 All systems healthy');
    process.exit(0);
  } else {
    logger.error('⚠️ Some systems are unhealthy');
    process.exit(1);
  }
}

main();
```

ثم أضف:
```json
{
  "scripts": {
    "health": "node scripts/health-check.js"
  }
}
```

### 5. Seed Data Script
إنشاء ملف `scripts/seed.js`:

```javascript
#!/usr/bin/env node

const { prisma } = require('../lib/db');
const { logger } = require('../lib/logger');
const bcrypt = require('bcryptjs');

async function main() {
  logger.info('Seeding database...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@samalogistics.com' },
    update: {},
    create: {
      email: 'admin@samalogistics.com',
      name: 'Admin',
      password: hashedPassword,
      role: 'ADMIN',
      isActive: true,
    },
  });

  logger.info('Admin user created', { email: admin.email });

  // Create sample services
  const services = [
    {
      titleEn: 'Air Freight',
      titleAr: 'الشحن الجوي',
      descriptionEn: 'Fast and reliable air freight services',
      descriptionAr: 'خدمات الشحن الجوي السريعة والموثوقة',
      slug: 'air-freight',
      isActive: true,
    },
    {
      titleEn: 'Sea Freight',
      titleAr: 'الشحن البحري',
      descriptionEn: 'Cost-effective sea freight solutions',
      descriptionAr: 'حلول الشحن البحري الفعالة من حيث التكلفة',
      slug: 'sea-freight',
      isActive: true,
    },
  ];

  for (const service of services) {
    await prisma.service.upsert({
      where: { slug: service.slug },
      update: service,
      create: service,
    });
  }

  logger.info('Sample services created');

  logger.info('Seeding completed successfully');
}

main()
  .catch((error) => {
    logger.error('Seeding failed', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

ثم أضف:
```json
{
  "scripts": {
    "seed": "node scripts/seed.js"
  }
}
```

---

## 🎯 استخدام الـ Scripts

### Development
```bash
# Start development server
npm run dev

# Start with Turbo mode (faster)
npm run dev:turbo

# Type check
npm run type-check

# Lint and fix
npm run lint:fix

# Format code
npm run format
```

### Database
```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Open Prisma Studio
npm run db:studio

# Seed database
npm run seed

# Create backup
npm run backup
```

### Maintenance
```bash
# Clear cache
npm run cache:clear

# Cleanup old files
npm run cleanup

# Health check
npm run health

# View logs
npm run logs
```

### Build & Deploy
```bash
# Build for production
npm run build

# Analyze bundle
npm run build:analyze

# Start production server
npm run start:prod
```

---

## 🔄 Cron Jobs (للإنتاج)

### Linux/Mac Crontab

```bash
# Edit crontab
crontab -e

# Add these lines:

# Backup every day at 2 AM
0 2 * * * cd /path/to/sama-2026 && npm run backup

# Cleanup every week on Sunday at 3 AM
0 3 * * 0 cd /path/to/sama-2026 && npm run cleanup

# Health check every hour
0 * * * * cd /path/to/sama-2026 && npm run health
```

### Using PM2

```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start npm --name "sama-logistics" -- start

# Schedule backup (using PM2 ecosystem)
pm2 start npm --name "sama-backup" --cron "0 2 * * *" -- run backup

# Monitor
pm2 monit

# View logs
pm2 logs sama-logistics
```

---

## 📊 Monitoring Scripts

### Log Viewer Script
إنشاء ملف `scripts/view-logs.js`:

```javascript
#!/usr/bin/env node

const { logger } = require('../lib/logger');

function main() {
  const args = process.argv.slice(2);
  const type = args[0] || 'all';
  const count = parseInt(args[1]) || 50;

  console.log(`\n📋 Viewing ${type} logs (last ${count}):\n`);

  switch (type) {
    case 'error':
      const errors = logger.getErrorLogs(count);
      console.log(JSON.stringify(errors, null, 2));
      break;
      
    case 'warn':
      const warnings = logger.getLogsByLevel('warn', count);
      console.log(JSON.stringify(warnings, null, 2));
      break;
      
    case 'stats':
      const stats = logger.getStats();
      console.log('Statistics:');
      console.log(`  Debug: ${stats.debug}`);
      console.log(`  Info: ${stats.info}`);
      console.log(`  Warn: ${stats.warn}`);
      console.log(`  Error: ${stats.error}`);
      console.log(`  Fatal: ${stats.fatal}`);
      break;
      
    default:
      const recent = logger.getRecentLogs(count);
      console.log(JSON.stringify(recent, null, 2));
  }
}

main();
```

ثم أضف:
```json
{
  "scripts": {
    "logs": "node scripts/view-logs.js",
    "logs:errors": "node scripts/view-logs.js error",
    "logs:stats": "node scripts/view-logs.js stats"
  }
}
```

---

## 🎉 الخلاصة

مع هذه الـ Scripts، يمكنك:

✅ **إدارة** المشروع بكفاءة
✅ **صيانة** قاعدة البيانات والملفات
✅ **مراقبة** صحة النظام
✅ **نسخ احتياطي** تلقائي
✅ **تنظيف** الملفات والسجلات القديمة
✅ **تطوير** بسرعة وفعالية

---

**نصيحة**: قم بإنشاء ملف `Makefile` لتسهيل الوصول للـ scripts:

```makefile
.PHONY: dev build start clean backup health

dev:
	npm run dev

build:
	npm run build

start:
	npm run start

clean:
	npm run cleanup

backup:
	npm run backup

health:
	npm run health
```

ثم استخدم:
```bash
make dev
make backup
make health
```

---

Created with ❤️ for **Sama Logistics**
