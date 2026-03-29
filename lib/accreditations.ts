/**
 * ═══ SAMA Logistics — Accreditations (Source of Truth) ═══
 * 
 * ديناميكي بالكامل — يسحب من قاعدة البيانات عبر API.
 * يُستخدم في Server Components مع cache: 'no-store' للتحديث الفوري.
 * 
 * لإضافة/حذف اعتماد: استخدم الداشبورد /dashboard/accreditations
 */

export interface Accreditation {
    id: string;
    logo: string;
    order: number;
}

/**
 * Fetch accreditations from API (Server-side, always fresh).
 * Falls back to empty array on error.
 */
export async function getAccreditations(): Promise<Accreditation[]> {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const res = await fetch(`${baseUrl}/api/cms/accreditations`, {
            cache: 'no-store',
        });
        if (!res.ok) return [];
        return res.json();
    } catch {
        return [];
    }
}
