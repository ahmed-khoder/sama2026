#!/bin/bash
# ============================================
# SAMA Logistics — Safe Database Push Script
# ============================================
# This script MUST be used instead of raw "npx prisma db push".
# It automatically backs up dev.db before pushing schema changes.
# Usage: bash prisma/safe-db-push.sh
# ============================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
DB_FILE="$SCRIPT_DIR/dev.db"
BACKUP_DIR="$SCRIPT_DIR/backups"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo ""
echo -e "${CYAN}╔══════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║   SAMA Safe Database Push (with Backup)  ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════╝${NC}"
echo ""

# Step 1: Check if dev.db exists
if [ ! -f "$DB_FILE" ]; then
    echo -e "${YELLOW}⚠️  No dev.db found. Skipping backup (fresh database).${NC}"
else
    # Step 2: Create backups directory
    mkdir -p "$BACKUP_DIR"

    # Step 3: Generate timestamped backup name
    TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
    BACKUP_NAME="dev_backup_${TIMESTAMP}.db"
    BACKUP_PATH="$BACKUP_DIR/$BACKUP_NAME"

    # Step 4: Copy database
    echo -e "${YELLOW}📦 Backing up database...${NC}"
    cp "$DB_FILE" "$BACKUP_PATH"

    # Verify backup
    ORIGINAL_SIZE=$(stat -c%s "$DB_FILE" 2>/dev/null || stat -f%z "$DB_FILE" 2>/dev/null)
    BACKUP_SIZE=$(stat -c%s "$BACKUP_PATH" 2>/dev/null || stat -f%z "$BACKUP_PATH" 2>/dev/null)

    if [ "$ORIGINAL_SIZE" = "$BACKUP_SIZE" ]; then
        echo -e "${GREEN}✅ Backup created: ${BACKUP_NAME} (${ORIGINAL_SIZE} bytes)${NC}"
    else
        echo -e "${RED}❌ Backup verification FAILED! Sizes don't match.${NC}"
        echo -e "${RED}   Aborting db push for safety.${NC}"
        exit 1
    fi

    # Step 5: Clean up old backups (keep last 10)
    BACKUP_COUNT=$(ls -1 "$BACKUP_DIR"/dev_backup_*.db 2>/dev/null | wc -l)
    if [ "$BACKUP_COUNT" -gt 10 ]; then
        echo -e "${YELLOW}🧹 Cleaning old backups (keeping last 10)...${NC}"
        ls -1t "$BACKUP_DIR"/dev_backup_*.db | tail -n +11 | xargs rm -f
    fi

    echo ""
fi

# Step 6: Run prisma db push
echo -e "${CYAN}🚀 Running: npx prisma db push${NC}"
echo ""
cd "$PROJECT_DIR"
npx prisma db push

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   ✅ Database push completed safely!     ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════╝${NC}"

# List recent backups
if [ -d "$BACKUP_DIR" ]; then
    echo ""
    echo -e "${CYAN}📋 Recent backups:${NC}"
    ls -1t "$BACKUP_DIR"/dev_backup_*.db 2>/dev/null | head -5 | while read f; do
        SIZE=$(stat -c%s "$f" 2>/dev/null || stat -f%z "$f" 2>/dev/null)
        echo -e "   $(basename "$f")  (${SIZE} bytes)"
    done
fi
echo ""
