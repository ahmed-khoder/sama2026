import xmlrpc from 'xmlrpc';

// ─── Env Config (no hardcoded fallbacks for secrets) ───────────────────────
const ODOO_URL = process.env.ODOO_URL || 'https://samalogs.co/';
const ODOO_DB = process.env.ODOO_DB || 'sama';
const ODOO_USERNAME = process.env.ODOO_USERNAME || 'next';
const ODOO_PASSWORD = process.env.ODOO_PASSWORD;   // ← no fallback; must be in .env

if (!ODOO_PASSWORD) {
    console.warn('[odooClient] ⚠️  ODOO_PASSWORD is not set in environment variables.');
}

// ─── Timeout Helper ─────────────────────────────────────────────────────────
const ODOO_TIMEOUT_MS = 8_000; // 8 seconds

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
    const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`Odoo timeout: "${label}" exceeded ${ms}ms`)), ms)
    );
    return Promise.race([promise, timeout]);
}

// ─── UID Session Cache (in-memory, 55-min TTL) ──────────────────────────────
// NOTE: This is per-process. On multi-instance deployments (Vercel serverless), each
// cold-start will re-authenticate once, then cache for the lifetime of the instance.
// For true shared caching, replace with Redis (e.g. Upstash).
const UID_CACHE_TTL_MS = 55 * 60 * 1_000; // 55 minutes

let _uidCache: { uid: number; expiresAt: number } | null = null;

function getCachedUid(): number | null {
    if (_uidCache && Date.now() < _uidCache.expiresAt) {
        return _uidCache.uid;
    }
    _uidCache = null;
    return null;
}

function setCachedUid(uid: number): void {
    _uidCache = { uid, expiresAt: Date.now() + UID_CACHE_TTL_MS };
}

/** Call this to force re-authentication on the next request (e.g. after a 401 from Odoo). */
export function invalidateUidCache(): void {
    _uidCache = null;
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

// ─── Connect / Authenticate ──────────────────────────────────────────────────
/**
 * Returns a valid authenticated UID, using the in-memory cache where possible.
 * Wraps authenticate in an 8-second timeout guard.
 */
export const connectToOdoo = async (): Promise<number> => {
    const cached = getCachedUid();
    if (cached !== null) return cached;

    if (!ODOO_PASSWORD) {
        throw new Error('[odooClient] ODOO_PASSWORD environment variable is not set.');
    }

    const { proto, host, port } = getUrlParts(ODOO_URL);

    const common = proto === 'https'
        ? xmlrpc.createSecureClient({ host, port, path: '/xmlrpc/2/common' })
        : xmlrpc.createClient({ host, port, path: '/xmlrpc/2/common' });

    const authenticatePromise = new Promise<number>((resolve, reject) => {
        common.methodCall(
            'authenticate',
            [ODOO_DB, ODOO_USERNAME, ODOO_PASSWORD, {}],
            (err, uid) => {
                if (err) return reject(err);
                if (!uid) return reject(new Error('[odooClient] Authentication failed: no UID returned.'));
                resolve(uid as number);
            }
        );
    });

    const uid = await withTimeout(authenticatePromise, ODOO_TIMEOUT_MS, 'authenticate');
    setCachedUid(uid);
    return uid;
};

// ─── Execute KW ─────────────────────────────────────────────────────────────
/**
 * Calls Odoo's execute_kw via XML-RPC with an 8-second timeout.
 * On an access-denied / session-expired response, invalidates the UID cache automatically.
 */
export const executeKw = async (
    uid: number,
    model: string,
    method: string,
    args: unknown[] = [],
    kwargs: Record<string, unknown> = {}
): Promise<unknown> => {
    if (!ODOO_PASSWORD) {
        throw new Error('[odooClient] ODOO_PASSWORD environment variable is not set.');
    }

    const { proto, host, port } = getUrlParts(ODOO_URL);
    const models = proto === 'https'
        ? xmlrpc.createSecureClient({ host, port, path: '/xmlrpc/2/object' })
        : xmlrpc.createClient({ host, port, path: '/xmlrpc/2/object' });

    const execPromise = new Promise<unknown>((resolve, reject) => {
        models.methodCall(
            'execute_kw',
            [ODOO_DB, uid, ODOO_PASSWORD, model, method, args, kwargs],
            (err, value) => {
                if (err) {
                    // If the session expired, drop the UID cache so the next call re-auths
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

    return withTimeout(execPromise, ODOO_TIMEOUT_MS, `${model}.${method}`);
};

// ─── High-level helpers ──────────────────────────────────────────────────────

export const getCustomers = async (limit = 20) => {
    const uid = await connectToOdoo();
    return executeKw(uid, 'res.partner', 'search_read',
        [[['customer_rank', '>', 0]]],
        { fields: ['name', 'email', 'phone', 'city', 'country_id', 'image_128', 'function', 'parent_name'], limit, order: 'id desc' }
    );
};

export const getFeaturedPartners = async () => {
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
};

export const getSalesStatsRaw = async () => {
    const uid = await connectToOdoo();
    // Intentionally flexible — the sales lib builds up from this
    return executeKw(uid, 'sale.order', 'search_read',
        [[['state', 'in', ['sale', 'done']]]],
        { fields: ['name', 'amount_total', 'state', 'date_order', 'partner_id', 'invoice_ids'], limit: 500, order: 'date_order desc' }
    );
};
