'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { SitemapVisualization } from '@/components/SitemapVisualization';
import { Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useSitemapStream } from '@/hooks/useSitemapStream';
import { saveSiteAction } from '@/actions/sites';

interface SiteExplorerProps {
    url: string;
}

export default function SiteExplorer({ url }: SiteExplorerProps) {
    const router = useRouter();

    const { startScan, result, loading, error, logs } = useSitemapStream();
    const hasStartedRef = useRef(false);

    // Redirect if URL has protocol or trailing slash
    useEffect(() => {
        if (url) {
            let cleanUrl = url;
            let needsRedirect = false;

            if (/^https?:\/\//.test(cleanUrl)) {
                cleanUrl = cleanUrl.replace(/^https?:\/\//, '');
                needsRedirect = true;
            }

            if (cleanUrl.endsWith('/')) {
                cleanUrl = cleanUrl.slice(0, -1);
                needsRedirect = true;
            }

            if (needsRedirect) {
                router.replace(`/site/${encodeURIComponent(cleanUrl)}`);
            }
        }
    }, [url, router]);

    useEffect(() => {
        if (url && !hasStartedRef.current && !/^https?:\/\//.test(url)) { // Only scan if we are not redirecting (clean url)
            hasStartedRef.current = true;
            // Fix protocol if missing
            let targetUrl = url;
            if (!targetUrl.startsWith('http')) {
                // If it looks like a domain, prepend https
                targetUrl = `https://${targetUrl}`;
            }
            startScan(targetUrl);
        }
    }, [url, startScan]);

    const hasSavedRef = useRef(false);

    useEffect(() => {
        if (result && !loading && !hasSavedRef.current) {
            hasSavedRef.current = true;
            saveSiteAction(url, undefined, result);
        }
    }, [result, loading, url]);

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50 dark:bg-black">
                <div className="bg-white dark:bg-gray-900 border border-red-200 dark:border-red-800 rounded-2xl p-8 max-w-md w-full shadow-xl text-center">
                    <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600 dark:text-red-400">
                        <AlertCircle size={24} />
                    </div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Scan Failed</h1>
                    <p className="text-gray-600 dark:text-gray-300 mb-6 font-mono text-sm break-all">{error}</p>
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center px-6 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:opacity-90 transition-opacity font-medium"
                    >
                        Try Another URL
                    </Link>
                </div>
            </div>
        );
    }

    // While loading initial data (before any result), show loader
    // Once we have a result (even partial), show the visualization
    if (!result && loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50 dark:bg-black">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                    <div className="text-center">
                        <h2 className="text-lg font-medium text-gray-900 dark:text-white">Connecting to Scanner...</h2>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Target: {url}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen bg-gray-50 dark:bg-black flex flex-col">
            <header className="flex-none bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4 overflow-hidden">
                    <Link href="/" className="flex-shrink-0 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
                        ← Back
                    </Link>
                    <div className="flex flex-col min-w-0">
                        <h1 className="text-lg font-bold text-gray-900 dark:text-white truncate flex items-center gap-2">
                            {url}
                            {loading && <span className="text-xs font-normal text-blue-500 bg-blue-100 dark:bg-blue-900/30 px-2 py-0.5 rounded-full animate-pulse">Scanning...</span>}
                        </h1>
                    </div>
                </div>
            </header>

            <main className="flex-1 min-h-0 relative">
                {/* Streaming Logs Overlay (Optional, tiny) */}
                {loading && logs.length > 0 && (
                    <div className="absolute top-2 right-2 z-50 pointer-events-none max-w-sm w-full">
                        <div className="bg-black/70 backdrop-blur text-white text-xs p-2 rounded mb-1 animate-fade-in shadow-lg border border-white/10">
                            {logs[logs.length - 1]}
                        </div>
                    </div>
                )}

                {result && <SitemapVisualization result={result} loading={loading} />}
            </main>
        </div>
    );
}
