import { ScanResult, SitemapNode } from '@/lib/sitemap-scanner';
import { flattenUrls } from '@/lib/export';

export interface ValidationIssue {
    severity: 'error' | 'warning' | 'info';
    type: string;
    message: string;
    urls?: string[];
    count?: number;
}

const SITEMAP_URL_LIMIT = 50000;

export function validate(result: ScanResult): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    const all = flattenUrls(result.nodes);
    const urls = all.filter((n) => n.type === 'url');

    // Duplicate loc
    const seen = new Map<string, number>();
    for (const n of urls) {
        seen.set(n.url, (seen.get(n.url) || 0) + 1);
    }
    const dupes = [...seen.entries()].filter(([, c]) => c > 1);
    if (dupes.length) {
        issues.push({
            severity: 'warning',
            type: 'duplicate-loc',
            message: `${dupes.length} duplicate URL${dupes.length > 1 ? 's' : ''} found across sitemaps`,
            urls: dupes.slice(0, 10).map(([u]) => u),
            count: dupes.length,
        });
    }

    // Mixed http/https
    const httpCount = urls.filter((n) => n.url.startsWith('http://')).length;
    const httpsCount = urls.filter((n) => n.url.startsWith('https://')).length;
    if (httpCount > 0 && httpsCount > 0) {
        issues.push({
            severity: 'warning',
            type: 'mixed-scheme',
            message: `Mixed http/https URLs: ${httpCount} http · ${httpsCount} https`,
            urls: urls.filter((n) => n.url.startsWith('http://')).slice(0, 10).map((n) => n.url),
            count: httpCount,
        });
    }

    // Invalid priority
    const badPriority = urls.filter(
        (n) => n.priority !== undefined && (Number(n.priority) < 0 || Number(n.priority) > 1 || Number.isNaN(Number(n.priority)))
    );
    if (badPriority.length) {
        issues.push({
            severity: 'error',
            type: 'invalid-priority',
            message: `${badPriority.length} URL${badPriority.length > 1 ? 's' : ''} with invalid priority (must be 0.0–1.0)`,
            urls: badPriority.slice(0, 10).map((n) => n.url),
            count: badPriority.length,
        });
    }

    // Per-sitemap URL limit
    const sitemaps = all.filter((n) => n.type === 'sitemap');
    const overLimit = sitemaps.filter((s) => (s.children?.filter((c) => c.type === 'url').length || 0) > SITEMAP_URL_LIMIT);
    if (overLimit.length) {
        issues.push({
            severity: 'error',
            type: 'over-url-limit',
            message: `${overLimit.length} sitemap${overLimit.length > 1 ? 's' : ''} exceed the 50,000 URL limit`,
            urls: overLimit.slice(0, 10).map((s) => s.url),
            count: overLimit.length,
        });
    }

    // Malformed lastmod
    const badDate = urls.filter((n) => n.lastmod && isNaN(new Date(n.lastmod).getTime()));
    if (badDate.length) {
        issues.push({
            severity: 'warning',
            type: 'invalid-lastmod',
            message: `${badDate.length} URL${badDate.length > 1 ? 's' : ''} with unparseable lastmod dates`,
            urls: badDate.slice(0, 10).map((n) => n.url),
            count: badDate.length,
        });
    }

    // Scan errors from result
    if (result.errors.length > 0) {
        issues.push({
            severity: 'error',
            type: 'scan-errors',
            message: `${result.errors.length} sitemap${result.errors.length > 1 ? 's' : ''} failed to load during scan`,
            urls: result.errors.slice(0, 10),
            count: result.errors.length,
        });
    }

    if (issues.length === 0) {
        issues.push({
            severity: 'info',
            type: 'clean',
            message: 'No structural issues detected',
        });
    }

    return issues;
}

// ——— URL pattern clustering ———
export interface UrlCluster {
    pattern: string;
    count: number;
    samples: string[];
}

export function clusterByPattern(result: ScanResult): UrlCluster[] {
    const urls = flattenUrls(result.nodes).filter((n) => n.type === 'url');
    const map = new Map<string, { count: number; samples: string[] }>();

    for (const n of urls) {
        let pattern: string;
        try {
            const u = new URL(n.url);
            const parts = u.pathname.split('/').filter(Boolean);
            if (parts.length === 0) {
                pattern = '/';
            } else {
                // First non-empty segment gets literal treatment, rest become {slug}
                const first = parts[0];
                if (parts.length === 1) {
                    pattern = `/${first}`;
                } else {
                    pattern = `/${first}/{slug}${parts.length > 2 ? '/...' : ''}`;
                }
            }
        } catch {
            pattern = '(invalid)';
        }
        const entry = map.get(pattern) || { count: 0, samples: [] };
        entry.count++;
        if (entry.samples.length < 3) entry.samples.push(n.url);
        map.set(pattern, entry);
    }

    return [...map.entries()]
        .map(([pattern, { count, samples }]) => ({ pattern, count, samples }))
        .sort((a, b) => b.count - a.count);
}

// ——— Stale URL report ———
export interface FreshnessBucket {
    label: string;
    count: number;
    urls: string[];
    tone: 'fresh' | 'recent' | 'stale' | 'very-stale' | 'unknown';
}

export function bucketByFreshness(result: ScanResult): FreshnessBucket[] {
    const urls = flattenUrls(result.nodes).filter((n) => n.type === 'url');
    const now = Date.now();
    const day = 86400000;
    const buckets: Record<string, { urls: string[]; tone: FreshnessBucket['tone'] }> = {
        'Fresh (< 30 days)': { urls: [], tone: 'fresh' },
        'Recent (30–90 days)': { urls: [], tone: 'recent' },
        'Stale (90–365 days)': { urls: [], tone: 'stale' },
        'Very stale (> 1 year)': { urls: [], tone: 'very-stale' },
        'No lastmod': { urls: [], tone: 'unknown' },
    };
    for (const n of urls) {
        if (!n.lastmod) {
            buckets['No lastmod'].urls.push(n.url);
            continue;
        }
        const t = new Date(n.lastmod).getTime();
        if (isNaN(t)) {
            buckets['No lastmod'].urls.push(n.url);
            continue;
        }
        const age = (now - t) / day;
        if (age < 30) buckets['Fresh (< 30 days)'].urls.push(n.url);
        else if (age < 90) buckets['Recent (30–90 days)'].urls.push(n.url);
        else if (age < 365) buckets['Stale (90–365 days)'].urls.push(n.url);
        else buckets['Very stale (> 1 year)'].urls.push(n.url);
    }
    return Object.entries(buckets).map(([label, v]) => ({
        label,
        count: v.urls.length,
        urls: v.urls,
        tone: v.tone,
    }));
}

// ——— Terminal URL extraction for link checker ———
export function terminalUrls(result: ScanResult): string[] {
    return flattenUrls(result.nodes)
        .filter((n) => n.type === 'url')
        .map((n) => n.url);
}
