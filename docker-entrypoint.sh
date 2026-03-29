#!/bin/sh
set -e

# ── Initialize volumes with image data on first run ──

# Database: copy if volume is empty
if [ ! -f /data/db/dev.db ]; then
  echo "📦 Initializing database..."
  cp /app/prisma/dev.db /data/db/dev.db
fi

# Images: copy if volume is empty  
if [ ! -f /data/images/.initialized ]; then
  echo "📦 Copying images to persistent volume..."
  cp -r /app/public/images/* /data/images/ 2>/dev/null || true
  touch /data/images/.initialized
fi

# Uploads: ensure directory exists
if [ ! -f /data/uploads/.initialized ]; then
  echo "📦 Copying uploads to persistent volume..."
  cp -r /app/public/uploads/* /data/uploads/ 2>/dev/null || true
  touch /data/uploads/.initialized
fi

# Create symlinks so the app finds files in the right place
rm -rf /app/prisma/dev.db
ln -sf /data/db/dev.db /app/prisma/dev.db

rm -rf /app/public/images
ln -sf /data/images /app/public/images

rm -rf /app/public/uploads
ln -sf /data/uploads /app/public/uploads

echo "✅ SAMA Logistics starting..."
exec node server.js
