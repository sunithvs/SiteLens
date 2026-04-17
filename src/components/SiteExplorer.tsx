'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { SitemapVisualization } from '@/components/SitemapVisualization';
import { Loader2, AlertCircle } from 'lucide-react';
import { useSitemapStream } from '@/hooks/useSitemapStream';
import { LogoMark } from '@/components/Logo';
import { saveSiteAction } from '@/actions/sites';
import { useHistory } from '@/hooks/useHistory';

interface SiteExplorerProps {
    url: string;
}

export default function SiteExplorer({ url }: SiteExplorerProps) {
    const router = useRouter();

    const { startScan, result, loading, error, logs } = useSitemapStream();
    const { addToHistory } = useHistory();
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
            addToHistory(url);
        }
    }, [result, loading, url, addToHistory]);

    const goBack = () => {
        router.push('/');
    };

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-[#0a0a0a]">
                <div className="bg-[#141414] border border-red-900/50 rounded-3xl p-8 max-w-md w-full text-center">
                    <div className="w-14 h-14 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-5 text-red-400">
                        <AlertCircle size={26} />
                    </div>
                    <h1 className="text-2xl font-black text-white mb-2 tracking-tight">Scan Failed</h1>
                    <p className="text-neutral-400 mb-6 font-mono text-sm break-all">{error}</p>
                    <button
                        onClick={goBack}
                        className="inline-flex items-center justify-center px-6 py-3 bg-[#d4ff5e] text-black rounded-full hover:bg-[#e7ff8a] transition-colors font-bold"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    if (!result && loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-[#0a0a0a]">
                <div className="flex flex-col items-center gap-5">
                    <div className="relative">
                        <div className="absolute inset-0 bg-[#d4ff5e]/20 rounded-full blur-xl animate-pulse" />
                        <Loader2 className="w-14 h-14 text-[#d4ff5e] animate-spin relative" />
                    </div>
                    <div className="text-center">
                        <h2 className="text-xl font-bold text-white">Connecting to scanner…</h2>
                        <p className="text-neutral-500 text-sm font-mono mt-1">{url}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen bg-[#0a0a0a] flex flex-col">
            <header className="flex-none bg-[#0a0a0a] border-b border-neutral-900 px-4 md:px-6 py-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 overflow-hidden min-w-0">
                    <button
                        onClick={goBack}
                        className="flex-shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-full bg-[#141414] border border-neutral-800 hover:border-neutral-600 text-neutral-400 hover:text-white transition-colors"
                        title="Back"
                    >
                        ←
                    </button>
                    <div className="flex items-center gap-2 min-w-0">
                        <LogoMark className="w-7 h-7 flex-shrink-0" />
                        <h1 className="text-base md:text-lg font-bold text-white truncate">
                            {url}
                        </h1>
                        {loading && (
                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#d4ff5e] bg-[#d4ff5e]/10 border border-[#d4ff5e]/20 px-3 py-1 rounded-full flex-shrink-0">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#d4ff5e] animate-pulse" />
                                Scanning
                            </span>
                        )}
                    </div>
                </div>
            </header>

            <main className="flex-1 min-h-0 relative">
                {loading && logs.length > 0 && (
                    <div className="absolute top-2 right-2 z-50 pointer-events-none max-w-sm w-full">
                        <div className="bg-[#141414] border border-neutral-800 backdrop-blur text-neutral-300 text-xs font-mono p-3 rounded-2xl animate-fade-in shadow-xl">
                            {logs[logs.length - 1]}
                        </div>
                    </div>
                )}

                {result && <SitemapVisualization result={result} loading={loading} />}
            </main>
        </div>
    );
}
