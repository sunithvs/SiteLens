import { NextRequest, NextResponse } from 'next/server';
import { SitemapScanner } from '@/lib/sitemap-scanner';

export async function POST(req: NextRequest) {
    try {
        const { url } = await req.json();

        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        // Basic validation
        let targetUrl = url;
        if (!targetUrl.startsWith('http')) {
            targetUrl = `https://${targetUrl}`;
        }

        // 1. Fetch robots.txt
        const robotsUrl = new URL('/robots.txt', targetUrl).toString();
        console.log(`Fetching robots.txt from: ${robotsUrl}`);

        let initialSitemaps: string[] = [];

        try {
            const robotsRes = await fetch(robotsUrl);
            if (robotsRes.ok) {
                const robotsTxt = await robotsRes.text();
                const lines = robotsTxt.split('\n');
                for (const line of lines) {
                    if (line.toLowerCase().startsWith('sitemap:')) {
                        // Handle "Sitemap: https://example.com/sitemap.xml"
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
            const commonPaths = [
                '/sitemap.xml',
                '/sitemap_index.xml',
                '/sitemap-main.xml',
                '/wp-sitemap.xml'
            ];

            for (const path of commonPaths) {
                const testUrl = new URL(path, targetUrl).toString();
                try {
                    const res = await fetch(testUrl, { method: 'HEAD' });
                    if (res.ok && res.headers.get('content-type')?.includes('xml')) {
                        initialSitemaps.push(testUrl);
                    }
                } catch (e) {
                    // ignore
                }
            }
        }

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

    } catch (error) {
        console.error('Scan error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
