import { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabaseClient';

export const revalidate = 86400; // Cache for 1 day

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://site.radr.in';

    // 1. Fetch scanned sites from Supabase
    // 1. Fetch scanned sites from Supabase
    let sites: { site_url: string; created_at: string }[] = [];
    try {
        const { data, error } = await supabase
            .from('scanned_sites')
            .select('site_url, created_at')
            .order('created_at', { ascending: false });

        if (error) throw error;
        sites = data || [];
    } catch (e) {
        console.error('Sitemap generation error:', e);
        // Fallback to empty array to ensure sitemap still generates with static routes
    }

    // 2. Map scanned sites to sitemap entries
    const siteEntries: MetadataRoute.Sitemap = (sites || [])
        .filter((site) => site.site_url)
        .map((site) => ({
            url: `${baseUrl}/site/${encodeURIComponent(site.site_url)}`,
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
