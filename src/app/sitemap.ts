import { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabaseClient';

export const revalidate = 86400; // Cache for 1 day

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // 1. Fetch scanned sites from Supabase
    const { data: sites } = await supabase
        .from('scanned_sites')
        .select('site_url, created_at')
        .order('created_at', { ascending: false });

    // 2. Map scanned sites to sitemap entries
    const siteEntries: MetadataRoute.Sitemap = (sites || []).map((site) => ({
        url: `${baseUrl}/site/${site.site_url}`,
        lastModified: new Date(site.created_at),
        changeFrequency: 'daily',
        priority: 0.7,
    }));

    // 3. Define static routes
    const staticRoutes: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: `${baseUrl}/history`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.8,
        },
    ];

    return [...staticRoutes, ...siteEntries];
}
