import { NextRequest, NextResponse } from 'next/server';
import { SitemapScanner } from '@/lib/sitemap-scanner';

export async function POST(req: NextRequest) {
    try {
        const { url, content } = await req.json();

        if (!url && !content) {
            return NextResponse.json({ error: 'URL or Content is required' }, { status: 400 });
        }

        // 3. Scan Content directly if provided
        if (content) {
            console.log(`Scanning manual content for ${url || 'manual-input'}`);
            const scanner = new SitemapScanner();
            const result = await scanner.scanContent(content, url || 'http://manual-input');
            return NextResponse.json({
                message: 'Scan complete',
                result
            });
        }

        if (!url) {
            return NextResponse.json({ error: 'URL is required if content is not provided' }, { status: 400 });
        }


        // Basic validation
        let targetUrl = url.trim();
        if (!targetUrl.startsWith('http')) {
            targetUrl = `https://${targetUrl}`;
        }

        let initialSitemaps: string[] = [];

        // 0. Check if the input URL itself looks like a sitemap
        const lowerUrl = targetUrl.toLowerCase();
        if (lowerUrl.endsWith('.xml') || lowerUrl.endsWith('.xml.gz') || lowerUrl.includes('sitemap')) {
            console.log(`Input URL looks like a sitemap: ${targetUrl}`);
            initialSitemaps.push(targetUrl);
        }

        // 1. Fetch robots.txt (only if we didn't just get a direct sitemap, OR we want to find MORE)
        // Actually, usually if user gives a domain, we check robots. If they give a sitemap, we might still want to check robots?
        // Let's do both to be safe, but prioritize the direct input.

        try {
            // Construct robots.txt URL safely
            const urlObj = new URL(targetUrl);
            const robotsUrl = new URL('/robots.txt', urlObj.origin).toString();
            console.log(`Fetching robots.txt from: ${robotsUrl}`);

            const robotsRes = await fetch(robotsUrl, {
                headers: {
                    'User-Agent': 'XML-Nexus-Bot/1.0',
                    'Accept': 'text/plain,text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
                },
                signal: AbortSignal.timeout(5000)
            });

            if (robotsRes.ok) {
                const robotsTxt = await robotsRes.text();
                const lines = robotsTxt.split('\n');
                for (const line of lines) {
                    if (line.toLowerCase().startsWith('sitemap:')) {
                        const parts = line.split(/:(.+)/);
                        if (parts.length > 1) {
                            initialSitemaps.push(parts[1].trim());
                        }
                    }
                }
            }
        } catch (e) {
            console.warn('Failed to fetch robots.txt', e);
        }

        // 2. Heuristic fallback
        if (initialSitemaps.length === 0) {
            const urlObj = new URL(targetUrl);
            const commonPaths = [
                '/sitemap.xml',
                '/sitemap_index.xml',
                '/sitemap-main.xml',
                '/wp-sitemap.xml'
            ];

            for (const path of commonPaths) {
                const testUrl = new URL(path, urlObj.origin).toString();
                try {
                    const res = await fetch(testUrl, {
                        method: 'HEAD',
                        headers: { 'User-Agent': 'XML-Nexus-Bot/1.0' },
                        signal: AbortSignal.timeout(3000)
                    });
                    if (res.ok && (res.headers.get('content-type')?.includes('xml') || testUrl.endsWith('.xml'))) {
                        initialSitemaps.push(testUrl);
                    }
                } catch (e) {
                    // ignore
                }
            }
        }

        // Deduplicate
        initialSitemaps = Array.from(new Set(initialSitemaps));

        if (initialSitemaps.length === 0) {
            return NextResponse.json({
                error: 'No sitemaps found via robots.txt or heuristics.',
                scanned: []
            });
        }

        // 3. Recursive Scan
        const scanner = new SitemapScanner();
        const result = await scanner.scan(initialSitemaps);

        return NextResponse.json({
            message: 'Scan complete',
            result
        });

    } catch (error: any) {
        console.error('Scan error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
