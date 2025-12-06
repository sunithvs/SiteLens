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

const MAX_DEPTH = 50;
const MAX_URLS = 10000000;
const CONCURRENT_LIMIT = 20;

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

    async scanContent(content: string, baseUrl: string): Promise<ScanResult> {
        try {
            const node = await this.parseXml(content, baseUrl, 0);
            if (node) {
                return {
                    nodes: [node],
                    totalUrls: this.totalUrls,
                    totalSitemaps: this.totalSitemaps,
                    errors: this.errors
                };
            }
        } catch (e: any) {
            this.errors.push(`Failed to parse content: ${e.message}`);
        }

        return {
            nodes: [],
            totalUrls: this.totalUrls,
            totalSitemaps: this.totalSitemaps,
            errors: this.errors
        };
    }

    private async parseXml(xmlText: string, url: string, depth: number): Promise<SitemapNode | null> {
        // Basic validation
        if (!xmlText.trim().startsWith('<')) {
            // Sometimes there might be whitespace or BOM
            if (!xmlText.trim().includes('<')) {
                this.errors.push(`Invalid XML at ${url}: Content does not start with '<'`);
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
        }
        // Check for non-standard JCR/Adobe export format
        else if (parsed.sitemap) {
            // Try to extract URLs from this custom format
            const children: SitemapNode[] = [];
            const origin = url.startsWith('http') ? new URL(url).origin : 'http://manual-input';

            // Recursive helper to find "sectionLink" in the JSON structure
            const traverseJSON = (obj: any) => {
                if (!obj || typeof obj !== 'object') return;

                // Check for interesting attributes
                // "ordinarySections": "{\"sectionLink\":\"/content/mm/mo/movies/tv\"}"
                // fast-xml-parser prefixes attributes with "@_"
                const sectionsJson = obj['@_ordinarySections'] || obj.ordinarySections;

                if (sectionsJson) {
                    try {
                        const sections = JSON.parse(sectionsJson);
                        if (sections.sectionLink) {
                            let link = sections.sectionLink as string;
                            // Basic cleanup
                            if (link.startsWith('/content/mm/mo')) {
                                link = link.replace('/content/mm/mo', '');
                            }
                            if (!link.endsWith('.html') && !link.endsWith('/')) {
                                link += '.html';
                            }

                            const fullUrl = new URL(link, origin).toString();

                            if (this.totalUrls < MAX_URLS) {
                                this.totalUrls++;
                                children.push({
                                    url: fullUrl,
                                    type: 'url',
                                    depth: depth + 1
                                });
                            }
                        }
                    } catch (e) {
                        // ignore parsing errors
                    }
                }

                // Traverse children
                for (const key in obj) {
                    traverseJSON(obj[key]);
                }
            };

            traverseJSON(parsed.sitemap);

            if (children.length > 0) {
                return {
                    url,
                    type: 'sitemap',
                    depth,
                    children,
                    lastmod: parsed.sitemap?.['jcr:lastModified'] || new Date().toISOString()
                };
            }

            // If no URLs found, then return the error
            this.errors.push(`Invalid Sitemap at ${url}: Found non-standard root element '<sitemap>' and could not extract any URLs.`);
            return null;
        }
        else {
            // Try to be more helpful with the error
            const rootKeys = Object.keys(parsed);
            const firstKey = rootKeys.length > 0 ? rootKeys[0] : 'unknown';
            this.errors.push(`Invalid Sitemap format at ${url}: Expected <urlset> or <sitemapindex>, found <${firstKey}>.`);
            return null;
        }
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

            return this.parseXml(xmlText, url, depth);

        } catch (error: any) {
            this.errors.push(`Error scanning ${url}: ${error.message}`);
            return null;
        }
    }
}
