---
description: How to safely push Prisma schema changes (with automatic database backup)
---

## Safe Database Push

**NEVER run `npx prisma db push` directly.** Always use the safe wrapper script:

// turbo-all

1. Run the safe push script:
```bash
bash prisma/safe-db-push.sh
```

This script automatically:
- Creates a timestamped backup of `dev.db` in `prisma/backups/`
- Verifies the backup integrity (size match)
- Only then runs `npx prisma db push`
- Keeps the last 10 backups

### Restoring a Backup

If something goes wrong, restore from a backup:
```bash
cp prisma/backups/dev_backup_YYYY-MM-DD_HH-MM-SS.db prisma/dev.db
```

Then restart the dev server.

### ⚠️ CRITICAL: Never Use These Commands Directly
- ❌ `npx prisma db push --force-reset`
- ❌ `npx prisma migrate reset`
- ❌ Any command that drops/resets the database
