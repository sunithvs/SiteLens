import { ScanResult, SitemapNode } from '@/lib/sitemap-scanner';

export function flattenUrls(nodes: SitemapNode[]): SitemapNode[] {
    const flat: SitemapNode[] = [];
    const traverse = (items: SitemapNode[]) => {
        for (const n of items) {
            flat.push(n);
            if (n.children) traverse(n.children);
        }
    };
    traverse(nodes);
    return flat;
}

function csvEscape(v: unknown): string {
    if (v === null || v === undefined) return '';
    const s = String(v);
    if (s.includes(',') || s.includes('"') || s.includes('\n')) {
        return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
}

export function toCsv(result: ScanResult): string {
    const all = flattenUrls(result.nodes);
    const rows = [
        ['url', 'type', 'depth', 'lastmod', 'priority', 'changefreq'].join(','),
        ...all.map((n) =>
            [n.url, n.type, n.depth, n.lastmod || '', n.priority || '', (n as any).changefreq || '']
                .map(csvEscape)
                .join(',')
        ),
    ];
    return rows.join('\n');
}

export function toJson(result: ScanResult): string {
    return JSON.stringify(result, null, 2);
}

export function download(filename: string, content: string, mime: string) {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

export function sanitizeSlug(s: string): string {
    return s.replace(/[^a-z0-9._-]/gi, '-').toLowerCase().slice(0, 60) || 'sitemap';
}
