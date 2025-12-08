import { Metadata } from 'next';
import SiteExplorer from '@/components/SiteExplorer';

interface PageProps {
    params: Promise<{ url: string[] | string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const resolvedParams = await params;
    const rawUrl = Array.isArray(resolvedParams.url) ? resolvedParams.url.join('/') : resolvedParams.url;
    const url = decodeURIComponent(rawUrl || '');

    // Clean domain for title (remove protocol and www if possible for cleaner look)
    const domain = url
        .replace(/^https?:\/\//, '')
        .replace(/^www\./, '')
        .split('/')[0];

    // Capitalize first letter of domain if it looks like a name, or keep as is
    const niceDomain = domain.charAt(0).toUpperCase() + domain.slice(1);

    return {
        title: `${niceDomain} Sitemap Explorer - Visual Analysis`,
        description: `Analyze the sitemap of ${url}. Visualize specific pages, check SEO metadata, and explore site structure with our visual sitemap explorer.`,
        openGraph: {
            title: `${niceDomain} Sitemap Explorer - Visual Analysis`,
            description: `Analyze the sitemap of ${url}. Visualize specific pages and check SEO metadata.`,
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: `${niceDomain} Sitemap Explorer`,
            description: `Visual sitemap analysis for ${url}`,
        }
    };
}

export default async function SitePage({ params }: PageProps) {
    const resolvedParams = await params;
    const rawUrl = Array.isArray(resolvedParams.url) ? resolvedParams.url.join('/') : resolvedParams.url;
    const url = decodeURIComponent(rawUrl || '');

    return <SiteExplorer url={url} />;
}
