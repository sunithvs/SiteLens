'use client';

import { useEffect, use } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ScanResult } from '@/lib/sitemap-scanner';
import { Loader2, AlertCircle } from 'lucide-react';
import { useHistory } from '@/hooks/useHistory';
import { Logo } from '@/components/Logo';
import Link from 'next/link';
import { SitemapVisualization } from '@/components/SitemapVisualization';

type ViewMode = 'tree' | 'table' | 'grid';

export default function SiteExplorer({ params }: { params: Promise<{ url: string[] }> }) {
    // Unwrap params using React.use()
    const { url } = use(params);

    const rawUrl = url.map(decodeURIComponent).join('/');
    // Fix protocol if it got messed up (e.g. https:/example.com)
    const targetUrl = rawUrl.replace(/^(https?):\/([^\/])/, '$1://$2');

    const { addToHistory } = useHistory();
    const { data: result, isLoading: loading, error: queryError } = useQuery({
        queryKey: ['scan', targetUrl],
        queryFn: async () => {
            const res = await fetch('/api/scan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: targetUrl }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to scan');
            }

            return data.result as ScanResult;
        },
        enabled: !!targetUrl,
        staleTime: 1000 * 60 * 10, // 10 minutes
    });

    const error = queryError ? (queryError as Error).message : null;

    useEffect(() => {
        if (result) {
            // Add to history on success
            addToHistory(targetUrl);

            // Try to fetch metadata in background to update title
            fetch('/api/metadata', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: targetUrl }),
            })
                .then(res => res.json())
                .then(meta => {
                    if (meta.title) {
                        addToHistory(targetUrl, meta.title);
                    }
                })
                .catch(err => console.error('Failed to fetch metadata for history', err));
        }
    }, [result, targetUrl, addToHistory]);

    return (
        <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900 overflow-hidden">
            {/* Sticky Header */}
            <div className="flex-none bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 z-50">
                <div className="max-w-[1920px] mx-auto px-4 h-16 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity flex-shrink-0">
                            <Logo className="w-8 h-8" />
                            <span className="font-bold text-xl hidden sm:block text-gray-900 dark:text-white">SiteLens</span>
                        </Link>
                        <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 hidden sm:block" />
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-[200px] sm:max-w-md" title={targetUrl}>
                            {targetUrl}
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <a
                            href="https://buymeacoffee.com/sunithvs"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-yellow-400/10 hover:bg-yellow-400/20 text-yellow-600 dark:text-yellow-400 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                        >
                            <span className="text-lg">☕</span>
                            <span className="hidden sm:inline">Buy me a coffee</span>
                        </a>
                    </div>
                </div>
            </div>

            {loading && (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-500 min-h-[400px]">
                    <Loader2 className="animate-spin mb-4" size={48} />
                    <p>Scanning sitemap...</p>
                </div>
            )}

            {error && (
                <div className="flex-1 flex flex-col items-center justify-center text-red-500 min-h-[400px]">
                    <AlertCircle className="mb-4" size={48} />
                    <p className="text-lg font-medium">Scan Failed</p>
                    <p className="text-sm opacity-80">{error}</p>
                    <Link href="/" className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        Try Another URL
                    </Link>
                </div>
            )}

            {/* Results */}
            {!loading && !error && result && (
                <SitemapVisualization result={result} />
            )}
        </div>
    );
}

