import xmlrpc from 'xmlrpc';
import { prisma } from '@/lib/db';

// ─── Database-Only Credentials ──────────────────────────────────────────────────
export async function getOdooCredentials() {
    const settings = await prisma.odooSettings.findUnique({ where: { id: 'default' } });
    
    if (!settings || !settings.url || !settings.database || !settings.username) {
        throw new Error('[odooClient] Odoo credentials not configured. Go to Dashboard → Settings → Odoo ERP to set them up.');
    }

    return {
        ODOO_URL: settings.url,
        ODOO_DB: settings.database,
        ODOO_USERNAME: settings.username,
        ODOO_PASSWORD: settings.password || undefined,
    };
}

// ─── Timeout Helper ─────────────────────────────────────────────────────────
const ODOO_TIMEOUT_MS = 12_000; // 12 seconds for auth
const ODOO_DATA_TIMEOUT_MS = 25_000; // 25 seconds for data operations (search_read, etc.)

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
    const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`Odoo timeout: "${label}" exceeded ${ms}ms`)), ms)
    );
    return Promise.race([promise, timeout]);
}

// ─── UID Session Cache (in-memory, 55-min TTL) ──────────────────────────────
const UID_CACHE_TTL_MS = 55 * 60 * 1_000; // 55 minutes
let _uidCache: { uid: number; expiresAt: number; url: string } | null = null;

function getCachedUid(currentUrl: string): number | null {
    if (_uidCache && _uidCache.url === currentUrl && Date.now() < _uidCache.expiresAt) {
        return _uidCache.uid;
    }
    _uidCache = null;
    return null;
}

function setCachedUid(uid: number, url: string): void {
    _uidCache = { uid, expiresAt: Date.now() + UID_CACHE_TTL_MS, url };
}

export function invalidateUidCache(): void {
    _uidCache = null;
}

// ─── Data Cache Version (bump on settings change to invalidate all data caches) ─
let _odooDataCacheVersion = 0;

export function getOdooDataCacheVersion(): number {
    return _odooDataCacheVersion;
}

export function bumpOdooDataCacheVersion(): void {
    _odooDataCacheVersion++;
}

// ─── URL Parser ─────────────────────────────────────────────────────────────
const getUrlParts = (url: string) => {
    const match = url.match(/^(https?):\/\/([^/:]+)(?::(\d+))?\/?$/);
    if (!match) throw new Error(`[odooClient] Invalid ODOO_URL: "${url}"`);
    return {
        proto: match[1],
        host: match[2],
        port: match[3] ? parseInt(match[3], 10) : (match[1] === 'https' ? 443 : 80),
    };
};

// ─── Direct Connection Ping Validator ─────────────────────────────────────────
export const testOdooConnection = async (url: string, db: string, username: string, password?: string): Promise<{ success: boolean; message: string }> => {
    try {
        if (!password) {
            return { success: false, message: 'كلمة المرور مطلوبة للاتصال' };
        }
        
        const { proto, host, port } = getUrlParts(url);
        const common = proto === 'https'
            ? xmlrpc.createSecureClient({ host, port, path: '/xmlrpc/2/common' })
            : xmlrpc.createClient({ host, port, path: '/xmlrpc/2/common' });

        const authenticatePromise = new Promise<number>((resolve, reject) => {
            common.methodCall(
                'authenticate',
                [db, username, password, {}],
                (err, uid) => {
                    if (err) return reject(err);
                    if (!uid) return reject(new Error('Authentication failed: Invalid credentials.'));
                    resolve(uid as number);
                }
            );
        });

        await withTimeout(authenticatePromise, ODOO_TIMEOUT_MS, 'authenticate');
        return { success: true, message: 'تم الاتصال بنجاح بـ Odoo!' };
    } catch (e: any) {
        return { success: false, message: e?.message || 'فشل الاتصال: تأكد من صحة الرابط أو اسم البيانات' };
    }
};

// ─── Connect / Authenticate ──────────────────────────────────────────────────
export const connectToOdoo = async (): Promise<number> => {
    const creds = await getOdooCredentials();

    const cached = getCachedUid(creds.ODOO_URL);
    if (cached !== null) return cached;

    if (!creds.ODOO_PASSWORD) {
        throw new Error('[odooClient] ODOO_PASSWORD environment variable or database setting is not set.');
    }

    const { proto, host, port } = getUrlParts(creds.ODOO_URL);

    const common = proto === 'https'
        ? xmlrpc.createSecureClient({ host, port, path: '/xmlrpc/2/common' })
        : xmlrpc.createClient({ host, port, path: '/xmlrpc/2/common' });

    const authenticatePromise = new Promise<number>((resolve, reject) => {
        common.methodCall(
            'authenticate',
            [creds.ODOO_DB, creds.ODOO_USERNAME, creds.ODOO_PASSWORD, {}],
            (err, uid) => {
                if (err) return reject(err);
                if (!uid) return reject(new Error('[odooClient] Authentication failed: no UID returned.'));
                resolve(uid as number);
            }
        );
    });

    const uid = await withTimeout(authenticatePromise, ODOO_TIMEOUT_MS, 'authenticate');
    setCachedUid(uid, creds.ODOO_URL);
    return uid;
};

// ─── Execute KW ─────────────────────────────────────────────────────────────
export const executeKw = async (
    uid: number,
    model: string,
    method: string,
    args: unknown[] = [],
    kwargs: Record<string, unknown> = {}
): Promise<unknown> => {
    const creds = await getOdooCredentials();
    
    if (!creds.ODOO_PASSWORD) {
        throw new Error('[odooClient] ODOO_PASSWORD environment variable or database setting is not set.');
    }

    const { proto, host, port } = getUrlParts(creds.ODOO_URL);
    const models = proto === 'https'
        ? xmlrpc.createSecureClient({ host, port, path: '/xmlrpc/2/object' })
        : xmlrpc.createClient({ host, port, path: '/xmlrpc/2/object' });

    const execPromise = new Promise<unknown>((resolve, reject) => {
        models.methodCall(
            'execute_kw',
            [creds.ODOO_DB, uid, creds.ODOO_PASSWORD, model, method, args, kwargs],
            (err, value) => {
                if (err) {
                    const e = err as any;
                    if (e?.message?.includes('AccessDenied') || e?.faultCode === 3) {
                        invalidateUidCache();
                    }
                    return reject(err);
                }
                resolve(value);
            }
        );
    });

    return withTimeout(execPromise, ODOO_DATA_TIMEOUT_MS, `${model}.${method}`);
};
// ─── High-level helpers ──────────────────────────────────────────────────────

export const getCustomers = async (limit = 20) => {
    try {
        const uid = await connectToOdoo();
        return executeKw(uid, 'res.partner', 'search_read',
            [[['customer_rank', '>', 0]]],
            { fields: ['name', 'email', 'phone', 'city', 'country_id', 'image_128', 'function', 'parent_name'], limit, order: 'id desc' }
        );
    } catch (e) {
        console.error('[odooClient] getCustomers failed:', e);
        return [];
    }
};

export const getFeaturedPartners = async () => {
    try {
        const uid = await connectToOdoo();

        const tags = await executeKw(uid, 'res.partner.category', 'search_read',
            [[['name', 'in', ['publish', 'puplish', 'Publish', 'Puplish', 'PUBLISH', 'PUPLISH']]]],
            { fields: ['id', 'name'] }
        ) as { id: number; name: string }[];

        if (!tags || tags.length === 0) {
            console.warn('[odooClient] ⚠️  No "publish" tag found in Odoo.');
            return [];
        }

        const tagIds = tags.map(t => t.id);

        return executeKw(uid, 'res.partner', 'search_read',
            [[['category_id', 'in', tagIds], ['image_128', '!=', false]]],
            { fields: ['name', 'image_128'] }
        );
    } catch (e) {
        console.error('[odooClient] getFeaturedPartners failed:', e);
        return [];
    }
};

export const getSalesStatsRaw = async () => {
    try {
        const uid = await connectToOdoo();
        return executeKw(uid, 'sale.order', 'search_read',
            [[['state', 'in', ['sale', 'done']]]],
            { fields: ['name', 'amount_total', 'state', 'date_order', 'partner_id', 'invoice_ids'], limit: 500, order: 'date_order desc' }
        );
    } catch (e) {
        console.error('[odooClient] getSalesStatsRaw failed:', e);
        return [];
    }
};
