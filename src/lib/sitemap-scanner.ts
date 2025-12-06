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

    async scan(rootUrls: string[], onProgress?: (node: SitemapNode) => void): Promise<ScanResult> {
        const nodes: SitemapNode[] = [];

        // Recursive helper that knows about the callback
        const processWithCallback = async (url: string, depth: number) => {
            const node = await this.processUrl(url, depth);
            if (node) {
                if (onProgress) onProgress(node);
                nodes.push(node);

                // If it is a sitemap index, we don't emit the index itself if we want to emit children? 
                // Actually, let's emit every node we find.

                // NOTE: The current processUrl is recursive and returns a tree. 
                // To fully stream, we might need to refactor traversal to be iterative or emit inside processUrl.
                // However, `processUrl` returns the *completed* subtree.
                // Ideally, we want to emit as soon as we know about a URL.

                // For now, let's keep the tree structure but emit the *root* of the sub-scan when it's ready?
                // No, that defeats the purpose for huge sitemaps. 

                // Let's modify processUrl to take the callback too, and emit "leaf" nodes (URLs) immediately.
            }
            return node;
        };

        // Wait, processUrl builds the whole tree. If we want streaming, we need to pass the callback DOWN.
        this.onProgressCallback = onProgress;

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

    async scanContent(content: string, baseUrl: string, onProgress?: (node: SitemapNode) => void): Promise<ScanResult> {
        this.onProgressCallback = onProgress;
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

    // Helper property to store callback during recursion
    private onProgressCallback?: (node: SitemapNode) => void;

    private async parseXml(xmlText: string, url: string, depth: number): Promise<SitemapNode | null> {
        // ... (validation code kept same as before, see next chunk for modification inside parsing)
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
                if (r) {
                    children.push(r);
                    // Note: We don't emit 'sitemap' container nodes here because their children are already emitted? 
                    // Or should we?
                    // If we emit the container, it contains all children, which is huge duplication if we already emitted children.
                    // Let's ONLY emit LEAD nodes (Type URL) immediately.

                    // Actually, for the Graph/Tree view, we need the structure. 
                    // Let's emit the node with empty children initially? No that's complex.

                    // Strategy: Emit "Url" nodes immediately. "Sitemap" nodes are emitted when fully processed (recursive unwind).
                    // This allows the table/grid to fill up, even if the tree waits a bit.
                    // BUT, if we want the tree to build progressively, we need to emit "Parent" then "Child".

                    // Current architecture: `processUrl` returns the FULL tree. 
                    // To support streaming *structure*, we'd need to emit "Start Sitemap X" then "Url A", "Url B", "End Sitemap X".

                    // Let's stick to simple FLATTENED streaming for now? 
                    // The user said "show whatever data is fetched". Likely they care about the URLs found.
                    // Let's emit every node that is type='url'.
                }
            });

            const sitemapNode: SitemapNode = {
                url,
                type: 'sitemap',
                depth,
                children,
                lastmod: parsed.sitemapindex.lastmod
            };

            // Emit the Container Sitemap Node (after children are processed)
            // This might be too late for huge sitemaps, but strictly speaking 'sitemapindex' usually contains just a few sitemaps.
            if (this.onProgressCallback) this.onProgressCallback(sitemapNode);

            return sitemapNode;
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
                const urlNode: SitemapNode = {
                    url: u.loc,
                    type: 'url',
                    depth: depth + 1,
                    lastmod: u.lastmod,
                    changefreq: u.changefreq,
                    priority: u.priority
                };
                children.push(urlNode);

                // STREAM: Emit this URL immediately!
                if (this.onProgressCallback) this.onProgressCallback(urlNode);
            }

            const sitemapNode: SitemapNode = {
                url,
                type: 'sitemap',
                depth,
                children, // These are terminal URLs
                lastmod: parsed.urlset.lastmod
            };

            // Emit the sitemap itself (contains children, duplicates data but allows tree construction if client handles dedup)
            if (this.onProgressCallback) this.onProgressCallback(sitemapNode);

            return sitemapNode;
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
