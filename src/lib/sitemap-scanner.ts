import { XMLParser } from 'fast-xml-parser';
import { gunzip } from 'zlib';
import { promisify } from 'util';

const doGunzip = promisify(gunzip);

export interface SitemapNode {
    url: string;
    type: 'sitemap' | 'url';
    children?: SitemapNode[];
    lastmod?: string;
    changefreq?: string;
    priority?: number;
    depth: number;
}

export interface ScanResult {
    nodes: SitemapNode[];
    totalUrls: number;
    totalSitemaps: number;
    errors: string[];
}

const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_"
});

const MAX_DEPTH = 3;
const MAX_URLS = 10000;
const CONCURRENT_LIMIT = 5;

export class SitemapScanner {
    private visited = new Set<string>();
    private totalUrls = 0;
    private totalSitemaps = 0;
    private errors: string[] = [];

    async scan(rootUrls: string[]): Promise<ScanResult> {
        const nodes: SitemapNode[] = [];

        for (const url of rootUrls) {
            const node = await this.processUrl(url, 0);
            if (node) {
                nodes.push(node);
            }
        }

        return {
            nodes,
            totalUrls: this.totalUrls,
            totalSitemaps: this.totalSitemaps,
            errors: this.errors
        };
    }

    private async processUrl(url: string, depth: number): Promise<SitemapNode | null> {
        if (this.visited.has(url)) return null;
        this.visited.add(url);

        if (depth > MAX_DEPTH) return null;
        if (this.totalUrls >= MAX_URLS) return null;

        try {
            console.log(`Scanning: ${url} (Depth: ${depth})`);
            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'XML-Nexus-Bot/1.0'
                },
                signal: AbortSignal.timeout(10000) // Increased timeout for large files
            });

            if (!response.ok) {
                this.errors.push(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
                return null;
            }

            const buffer = await response.arrayBuffer();
            let xmlText = '';

            // Check for GZIP magic number (1f 8b)
            const bytes = new Uint8Array(buffer);
            if (bytes.length > 1 && bytes[0] === 0x1f && bytes[1] === 0x8b) {
                try {
                    const decompressed = await doGunzip(buffer);
                    xmlText = decompressed.toString('utf-8');
                } catch (err: any) {
                    this.errors.push(`Failed to decompress ${url}: ${err.message}`);
                    return null;
                }
            } else {
                xmlText = new TextDecoder().decode(buffer);
            }

            // Basic validation
            if (!xmlText.trim().startsWith('<')) {
                // Sometimes there might be whitespace or BOM
                if (!xmlText.trim().includes('<')) {
                    this.errors.push(`Invalid XML at ${url}`);
                    return null;
                }
            }

            const parsed = parser.parse(xmlText);

            // Check for Sitemap Index
            if (parsed.sitemapindex && parsed.sitemapindex.sitemap) {
                this.totalSitemaps++;
                const children: SitemapNode[] = [];
                let sitemaps = parsed.sitemapindex.sitemap;
                if (!Array.isArray(sitemaps)) sitemaps = [sitemaps];

                // Process children
                const childPromises = sitemaps.map((s: any) => {
                    const loc = s.loc;
                    return this.processUrl(loc, depth + 1);
                });

                const results = await Promise.all(childPromises);
                results.forEach(r => {
                    if (r) children.push(r);
                });

                return {
                    url,
                    type: 'sitemap',
                    depth,
                    children,
                    lastmod: parsed.sitemapindex.lastmod
                };
            }
            // Check for Urlset
            else if (parsed.urlset && parsed.urlset.url) {
                this.totalSitemaps++; // It is a sitemap file itself
                let urls = parsed.urlset.url;
                if (!Array.isArray(urls)) urls = [urls];

                const children: SitemapNode[] = [];

                for (const u of urls) {
                    if (this.totalUrls >= MAX_URLS) break;

                    this.totalUrls++;
                    children.push({
                        url: u.loc,
                        type: 'url',
                        depth: depth + 1,
                        lastmod: u.lastmod,
                        changefreq: u.changefreq,
                        priority: u.priority
                    });
                }

                return {
                    url,
                    type: 'sitemap',
                    depth,
                    children, // These are terminal URLs
                    lastmod: parsed.urlset.lastmod
                };
            } else {
                this.errors.push(`Unknown XML format at ${url}`);
                return null;
            }

        } catch (error: any) {
            this.errors.push(`Error scanning ${url}: ${error.message}`);
            return null;
        }
    }
}
