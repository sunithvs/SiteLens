import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const { url } = await req.json();

        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'SiteLens-Bot/1.0'
            },
            signal: AbortSignal.timeout(5000)
        });

        if (!response.ok) {
            return NextResponse.json({ error: `Failed to fetch URL: ${response.status}` }, { status: response.status });
        }

        const html = await response.text();

        const decodeEntities = (s: string) =>
            s
                .replace(/&amp;/g, '&')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/&quot;/g, '"')
                .replace(/&#39;/g, "'")
                .replace(/&apos;/g, "'")
                .replace(/&nbsp;/g, ' ')
                .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)))
                .replace(/&#x([0-9a-fA-F]+);/g, (_, n) => String.fromCharCode(parseInt(n, 16)));

        // Simple regex parsing for title and description
        // Note: A real HTML parser like cheerio would be more robust, but regex is faster/lighter for this simple need
        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        const title = titleMatch ? decodeEntities(titleMatch[1].trim()) : '';

        const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i) ||
            html.match(/<meta[^>]*content=["']([^"']*)["'][^>]*name=["']description["'][^>]*>/i);
        const description = descMatch ? decodeEntities(descMatch[1].trim()) : '';

        return NextResponse.json({
            title,
            description
        });

    } catch (error: any) {
        console.error('Metadata fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch metadata' }, { status: 500 });
    }
}
