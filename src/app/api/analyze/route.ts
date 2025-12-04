import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function POST(req: Request) {
    try {
        const { url } = await req.json();

        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'XML-Nexus-Bot/1.0 (SEO Analyzer)'
            },
            signal: AbortSignal.timeout(10000)
        });

        const html = await response.text();
        const $ = cheerio.load(html);

        const title = $('title').text() || '';
        const description = $('meta[name="description"]').attr('content') || '';
        const h1 = $('h1').first().text().trim() || '';
        const canonical = $('link[rel="canonical"]').attr('href') || '';
        const robots = $('meta[name="robots"]').attr('content') || '';
        const ogTitle = $('meta[property="og:title"]').attr('content') || '';
        const ogDescription = $('meta[property="og:description"]').attr('content') || '';
        const ogImage = $('meta[property="og:image"]').attr('content') || '';

        // Word count (rough estimate)
        const text = $('body').text().replace(/\s+/g, ' ').trim();
        const wordCount = text.split(' ').length;

        const data = {
            statusCode: response.status,
            title,
            titleLength: title.length,
            description,
            descriptionLength: description.length,
            h1,
            canonical,
            robots,
            ogTitle,
            ogDescription,
            ogImage,
            wordCount
        };

        return NextResponse.json(data);

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
