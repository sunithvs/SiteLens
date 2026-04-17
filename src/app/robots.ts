import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://site.radr.in';

    return {
        rules: [
            {
                userAgent: '*',
                allow: ['/', '/blog', '/blog/*'],
                disallow: [
                    '/api/',
                    '/history',
                    // /site/[...url] is a live per-user scan, not indexable content.
                    // Enabling indexing here would create thin pages for every URL ever scanned.
                    '/site/',
                ],
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
        host: baseUrl,
    };
}
