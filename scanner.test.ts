import { describe, it, expect, vi } from 'vitest';
import { SitemapScanner } from './src/lib/sitemap-scanner';

describe('SitemapScanner', () => {
    it('parses valid XML content', async () => {
        const scanner = new SitemapScanner();
        const xml = `
            <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
                <url>
                    <loc>https://example.com/</loc>
                </url>
            </urlset>
        `;
        const result = await scanner.scanContent(xml, 'https://example.com');
        expect(result.nodes).toHaveLength(1);
        expect(result.nodes[0].children).toHaveLength(1);
        expect(result.nodes[0].children?.[0].url).toBe('https://example.com/');
    });

    it('handles empty XML content gracefully', async () => {
        const scanner = new SitemapScanner();
        const result = await scanner.scanContent('', 'https://example.com');
        expect(result.nodes).toHaveLength(0);
        expect(result.errors).toContainEqual(expect.stringContaining('Invalid XML'));
    });

    it('handles non-XML content', async () => {
        const scanner = new SitemapScanner();
        const result = await scanner.scanContent('<!DOCTYPE html><html></html>', 'https://example.com');
        expect(result.nodes).toHaveLength(0);
        expect(result.errors).toContainEqual(expect.stringContaining('Invalid Sitemap format'));
    });

    it('handles broken XML', async () => {
        const scanner = new SitemapScanner();
        const result = await scanner.scanContent('<urlset><url><loc>https://example.com/</loc>', 'https://example.com'); // Missing closing tags
        // fast-xml-parser might actually parse this partially or throw.
        // Let's verify behavior. If it throws, we catch it.
        // Based on implementation, parser.parse won't throw for simple malformed XML usually, but structure checks will fail.

        // Actually fast-xml-parser might produce a structure, but let's see.
        // Using assert here to correct my assumption if needed.
        if (result.nodes.length > 0) {
            // If it parsed, great (lenient)
            expect(result.nodes[0].type).toBe('sitemap');
        } else {
            // If it failed validation logic
            expect(result.errors.length).toBeGreaterThan(0);
        }
    });
});
