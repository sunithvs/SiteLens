import { NextRequest, NextResponse } from 'next/server';
import { SitemapScanner } from '@/lib/sitemap-scanner';

export const runtime = 'nodejs';
// Increase max duration for streaming
export const maxDuration = 300;

export async function POST(req: NextRequest) {
    try {
        const { url, content } = await req.json();

        if (!url && !content) {
            return NextResponse.json({ error: 'URL or Content is required' }, { status: 400 });
        }

        const encoder = new TextEncoder();

        // Create a streaming response
        const stream = new ReadableStream({
            async start(controller) {
                const scanner = new SitemapScanner();

                // Helper to push JSON line
                const sendEvent = (data: any) => {
                    try {
                        controller.enqueue(encoder.encode(JSON.stringify(data) + '\n'));
                    } catch (e) {
                        // Controller might be closed if client disconnects
                        console.error('Error enqueuing event:', e);
                    }
                };

                const onProgress = (node: any) => {
                    // Send regular progress update
                    // We strip outgoing children to avoid massive payloads for non-leaf nodes being repeated
                    const nodePayload = { ...node };
                    if (nodePayload.children) {
                        nodePayload.children = undefined;
                    }
                    sendEvent({ type: 'node', data: nodePayload });
                };

                try {
                    let result;
                    if (content) {
                        console.log(`Scanning manual content for ${url || 'manual-input'}`);
                        result = await scanner.scanContent(content, url || 'http://manual-input', onProgress);
                    } else {
                        // Regular URL scan
                        let targetUrl = url.trim();
                        if (!targetUrl.startsWith('http')) {
                            targetUrl = `https://${targetUrl}`;
                        }

                        let targets = [targetUrl];

                        // Simple heuristic: if it doesn't end in .xml, check robots.txt
                        if (!targetUrl.toLowerCase().endsWith('.xml') && !targetUrl.includes('sitemap')) {
                            sendEvent({ type: 'info', message: 'Checking robots.txt...' });
                            // Check robots.txt first
                            try {
                                const urlObj = new URL(targetUrl);
                                const robotsUrl = new URL('/robots.txt', urlObj.origin).toString();
                                const robotsRes = await fetch(robotsUrl, { signal: AbortSignal.timeout(5000) });
                                if (robotsRes.ok) {
                                    const robotsTxt = await robotsRes.text();
                                    const maps = robotsTxt.match(/Sitemap: (.*)/gi);
                                    if (maps) {
                                        targets = maps.map(m => m.replace(/Sitemap: /i, '').trim());
                                        sendEvent({ type: 'info', message: `Found ${targets.length} sitemaps in robots.txt` });
                                    }
                                }
                            } catch (e) {
                                console.log('Robots check failed', e);
                                sendEvent({ type: 'info', message: 'Robots.txt check failed' });
                            }

                            // If no sitemaps found yet, try standard paths
                            if (targets.length === 1 && targets[0] === targetUrl) {
                                sendEvent({ type: 'info', message: 'Checking standard sitemap locations...' });
                                const commonPaths = [
                                    '/sitemap.xml',
                                    '/sitemap_index.xml',
                                    '/sitemap/sitemap.xml',
                                    '/wp-sitemap.xml'
                                ];

                                const foundSitemaps: string[] = [];
                                const urlObj = new URL(targetUrl);

                                // We need to check these one by one or in parallel? Parallel is faster.
                                await Promise.all(commonPaths.map(async (path) => {
                                    try {
                                        const testUrl = new URL(path, urlObj.origin).toString();
                                        const res = await fetch(testUrl, {
                                            method: 'HEAD',
                                            headers: { 'User-Agent': 'XML-Nexus-Bot/1.0' },
                                            signal: AbortSignal.timeout(3000)
                                        });
                                        // Check if it exists and is XMLish (or just 200 OK)
                                        if (res.ok) {
                                            const type = res.headers.get('content-type') || '';
                                            if (type.includes('xml') || type.includes('text/plain') || testUrl.endsWith('.xml')) {
                                                foundSitemaps.push(testUrl);
                                            }
                                        }
                                    } catch (e) {
                                        // ignore errors
                                    }
                                }));

                                if (foundSitemaps.length > 0) {
                                    targets = foundSitemaps;
                                    sendEvent({ type: 'info', message: `Found ${targets.length} sitemaps via heuristics` });
                                } else {
                                    // If we still found nothing, and the input was just a domain,
                                    // we might be about to scan the homepage HTML.
                                    // We should warn about this or fail?

                                    // If the user explicitly typed a full URL like `https://example.com/foo`, maybe they think it's a sitemap?
                                    // But usually users type `example.com`.

                                    // Let's TRY to scan the targetUrl, but if it fails validation in scanner, it will error out.
                                    // The user's error was "Invalid Sitemap format... found <html>".
                                    // This is correct behavior if no sitemap exists.
                                    // But we can give a BETTER error message here in the API?

                                    sendEvent({ type: 'info', message: 'No sitemaps found. Attempting to scan input URL directly...' });
                                }
                            }
                        }

                        sendEvent({ type: 'info', message: `Scanning ${targets.length} targets...` });
                        result = await scanner.scan(targets, onProgress);
                    }

                    // Send final complete event with full stats/structure
                    sendEvent({ type: 'complete', result });

                } catch (err: any) {
                    console.error('Scan error:', err);
                    sendEvent({ type: 'error', error: err.message });
                } finally {
                    controller.close();
                }
            }
        });

        return new NextResponse(stream, {
            headers: {
                'Content-Type': 'application/x-ndjson',
                'Transfer-Encoding': 'chunked'
            }
        });

    } catch (error: any) {
        console.error('Route error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
