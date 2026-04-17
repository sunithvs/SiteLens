/**
 * JSON-LD schema builders. Return plain JS objects. The <JsonLd /> component
 * renders them as <script type="application/ld+json">.
 */

const SITE_NAME = 'SiteLens';
const SITE_LOGO = '/favicon.svg';

export function baseUrl(): string {
    return process.env.NEXT_PUBLIC_APP_URL || 'https://site.radr.in';
}

export function organizationSchema() {
    const url = baseUrl();
    return {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        '@id': `${url}#organization`,
        name: SITE_NAME,
        url,
        logo: `${url}${SITE_LOGO}`,
        sameAs: ['https://github.com/sunithvs/SiteLens'],
    };
}

export function websiteSchema() {
    const url = baseUrl();
    return {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        '@id': `${url}#website`,
        name: SITE_NAME,
        url,
        description:
            'Scan, visualize, and audit any website sitemap. Check broken links, analyze SEO, validate XML, and export results.',
        publisher: { '@id': `${url}#organization` },
    };
}

export function softwareApplicationSchema() {
    const url = baseUrl();
    return {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: SITE_NAME,
        applicationCategory: 'DeveloperApplication',
        operatingSystem: 'Web',
        url,
        description:
            'Free sitemap explorer and SEO visualizer. Scan any website, check broken links, audit XML, and export URLs.',
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
        },
        aggregateRating: undefined, // populate when real reviews exist
        publisher: { '@id': `${url}#organization` },
    };
}

export interface ArticleSchemaInput {
    slug: string;
    title: string;
    description: string;
    date: string;
    tags?: string[];
    image?: string;
}

export function articleSchema(input: ArticleSchemaInput) {
    const url = baseUrl();
    const articleUrl = `${url}/blog/${input.slug}`;
    return {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        '@id': articleUrl,
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': articleUrl,
        },
        headline: input.title,
        description: input.description,
        image: input.image ? `${url}${input.image}` : `${url}/og-image.png`,
        url: articleUrl,
        datePublished: input.date,
        dateModified: input.date,
        author: { '@id': `${url}#organization` },
        publisher: { '@id': `${url}#organization` },
        keywords: input.tags?.join(', '),
        isPartOf: { '@id': `${url}#website` },
    };
}

export interface BreadcrumbCrumb {
    name: string;
    url: string;
}

export function breadcrumbSchema(crumbs: BreadcrumbCrumb[]) {
    const url = baseUrl();
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: crumbs.map((c, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: c.name,
            item: c.url.startsWith('http') ? c.url : `${url}${c.url}`,
        })),
    };
}

export interface FaqItem {
    question: string;
    answer: string;
}

export function faqSchema(items: FaqItem[]) {
    return {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: items.map((i) => ({
            '@type': 'Question',
            name: i.question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: i.answer,
            },
        })),
    };
}
