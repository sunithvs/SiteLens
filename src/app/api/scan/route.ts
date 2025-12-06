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
                                sendEvent({ type: 'info', message: 'Robots.txt check failed, scanning root...' });
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
