/**
 * Granular Permission System for SAMA Logistics
 * 
 * Defines all available permissions and helpers to check them.
 * ADMIN always has all permissions. EMPLOYEE permissions are configurable.
 * CLIENT has a fixed set (dashboard, shipments, quotes).
 */

// ─── Permission Definitions ──────────────────────────────────────────────────

export interface PermissionDef {
  key: string;
  labelAr: string;
  labelEn: string;
  route: string; // The dashboard route this permission guards
}

export const PERMISSIONS: PermissionDef[] = [
  { key: 'view_dashboard',   labelAr: 'لوحة التحكم',         labelEn: 'Dashboard',          route: '/dashboard' },
  { key: 'view_messages',    labelAr: 'الرسائل',             labelEn: 'Messages',           route: '/dashboard/messages' },
  { key: 'view_shipments',   labelAr: 'الشحنات',             labelEn: 'Shipments',          route: '/dashboard/shipments' },
  { key: 'manage_careers',   labelAr: 'التوظيف',             labelEn: 'Recruitment',        route: '/dashboard/careers' },
  { key: 'view_quotes',      labelAr: 'عروض الأسعار',        labelEn: 'Quotes',             route: '/dashboard/quotes' },
  { key: 'view_customers',   labelAr: 'العملاء',             labelEn: 'Customers',          route: '/dashboard/customers' },
  { key: 'view_analytics',   labelAr: 'التحليلات',           labelEn: 'Analytics',          route: '/dashboard/analytics' },
  { key: 'view_inventory',   labelAr: 'المخزون',             labelEn: 'Inventory',          route: '/dashboard/inventory' },
  { key: 'manage_blog',      labelAr: 'إدارة المدونة',       labelEn: 'Blog Management',    route: '/dashboard/blog' },
  { key: 'manage_website',   labelAr: 'إعدادات الموقع',      labelEn: 'Website Settings',   route: '/dashboard/website-settings' },
];

/** All permission keys as a constant array */
export const ALL_PERMISSION_KEYS = PERMISSIONS.map(p => p.key);

/** Default permissions for a newly-created EMPLOYEE (all enabled) */
export const DEFAULT_EMPLOYEE_PERMISSIONS: string[] = [...ALL_PERMISSION_KEYS];

/** Fixed permissions for CLIENT role */
export const CLIENT_PERMISSIONS: string[] = ['view_dashboard', 'view_shipments', 'view_quotes'];

// ─── Helper Functions ────────────────────────────────────────────────────────

/**
 * Check if a user with a given role and permissions list has a specific permission.
 * - ADMIN → always true
 * - CLIENT → checks against fixed CLIENT_PERMISSIONS
 * - EMPLOYEE → checks against their stored permissions array
 */
export function hasPermission(
  role: string,
  permissions: string[],
  requiredPermission: string
): boolean {
  if (role === 'ADMIN') return true;
  if (role === 'CLIENT') return CLIENT_PERMISSIONS.includes(requiredPermission);
  // EMPLOYEE
  return permissions.includes(requiredPermission);
}

/**
 * Get the permission key that guards a specific route.
 * Returns null if no permission is required (e.g., the route is not protected).
 */
export function getPermissionForRoute(pathname: string): string | null {
  // Match exact or prefix — e.g., /dashboard/messages/123 → view_messages
  // Sort by route length descending so more-specific routes match first
  const sorted = [...PERMISSIONS].sort((a, b) => b.route.length - a.route.length);
  for (const perm of sorted) {
    if (perm.route === '/dashboard') {
      // Only exact match for dashboard root
      if (pathname === '/dashboard' || pathname === '/dashboard/') {
        return perm.key;
      }
    } else if (pathname.startsWith(perm.route)) {
      return perm.key;
    }
  }
  return null;
}

/**
 * Parse JSON permissions string from database into an array.
 * Returns default employee permissions if parsing fails.
 */
export function parsePermissions(permissionsJson: string | null | undefined): string[] {
  if (!permissionsJson) return DEFAULT_EMPLOYEE_PERMISSIONS;
  try {
    const parsed = JSON.parse(permissionsJson);
    if (Array.isArray(parsed)) return parsed;
    return DEFAULT_EMPLOYEE_PERMISSIONS;
  } catch {
    return DEFAULT_EMPLOYEE_PERMISSIONS;
  }
}
