import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'History',
    description: 'Your recent SiteLens sitemap scans.',
    robots: {
        index: false,
        follow: true,
        googleBot: { index: false, follow: true },
    },
};

export default function HistoryLayout({ children }: { children: React.ReactNode }) {
    return children;
}
