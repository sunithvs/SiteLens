'use client';

import React, { useState } from 'react';
import { Search, Loader2, AlertCircle, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { SitemapVisualization } from '@/components/SitemapVisualization';

export function Hero() {
    const [inputMode, setInputMode] = useState<'url' | 'xml'>('url');
    const [url, setUrl] = useState('');
    const [xmlContent, setXmlContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [manualResult, setManualResult] = useState<any>(null); // Store result for manual scan
    const router = useRouter();

    const handleScan = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setManualResult(null);

        if (inputMode === 'url') {
            if (!url) return;
            setLoading(true);
            try {
                // Basic validation
                let targetUrl = url.trim();

                // Regex to check for valid domain format at minimum
                const domainRegex = /^(https?:\/\/)?([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}(:\d{1,5})?(\/.*)?$/;
                if (!domainRegex.test(targetUrl) && !targetUrl.includes('localhost')) {
                    throw new Error('Please enter a valid website URL (e.g., example.com)');
                }

                if (!targetUrl.startsWith('http')) {
                    targetUrl = `https://${targetUrl}`;
                }

                // URL constructor validation as a second pass
                try {
                    new URL(targetUrl);
                } catch (e) {
                    throw new Error('Invalid URL format');
                }

                // Encode the URL to handle special characters safely
                // Clean URL for navigation (remove protocol and trailing slash)
                let cleanUrl = targetUrl.replace(/^https?:\/\//, '');
                if (cleanUrl.endsWith('/')) {
                    cleanUrl = cleanUrl.slice(0, -1);
                }
                const encodedUrl = encodeURIComponent(cleanUrl);
                router.push(`/site/${encodedUrl}`);
            } catch (err: any) {
                setError(err.message);
                setLoading(false);
            }
        } else {
            // Manual XML Input
            if (!xmlContent) return;
            setLoading(true);
            try {
                const res = await fetch('/api/scan', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        url: 'http://manual-input', // Dummy URL for the scanner
                        content: xmlContent
                    }),
                });

                const data = await res.json();
                if (!res.ok) {
                    throw new Error(data.error || 'Failed to parse XML');
                }

                if (data.result && data.result.nodes.length === 0 && data.result.errors.length > 0) {
                    throw new Error(data.result.errors[0] || 'No URLs found in the provided XML');
                }

                setManualResult(data.result);
                setLoading(false);

                // Scroll to results
                setTimeout(() => {
                    document.getElementById('manual-results')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);

            } catch (err: any) {
                setError(err.message);
                setLoading(false);
            }
        }
    };

    return (
        <>
            <section className="relative pt-20 pb-32 overflow-hidden">
                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-medium mb-6">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                            </span>
                            New: Deep SEO Analysis
                        </div>

                        <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight">
                            Visualize Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Sitemap</span> Instantly
                        </h1>

                        <p className="text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
                            Enter any URL to see its structure, analyze SEO, and uncover hidden pages.
                            No sign-up required.
                        </p>

                        {/* Input Mode Toggle */}
                        <div className="flex justify-center mb-6">
                            <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-lg inline-flex">
                                <button
                                    onClick={() => setInputMode('url')}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${inputMode === 'url'
                                        ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
                                        }`}
                                >
                                    Website URL
                                </button>
                                <button
                                    onClick={() => setInputMode('xml')}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${inputMode === 'xml'
                                        ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
                                        }`}
                                >
                                    Manual XML Code
                                </button>
                            </div>
                        </div>

                        <div className="max-w-2xl mx-auto relative">
                            <form onSubmit={handleScan} className="relative flex flex-col gap-4">

                                {inputMode === 'url' ? (
                                    <div className="relative flex items-center">
                                        <div className="absolute left-4 text-gray-400 pointer-events-none">
                                            <Search size={20} />
                                        </div>
                                        <input
                                            type="text"
                                            value={url}
                                            onChange={(e) => setUrl(e.target.value)}
                                            placeholder="Enter your website URL (e.g., example.com)"
                                            className="w-full pl-12 pr-32 py-4 text-lg rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                        />
                                        <button
                                            type="submit"
                                            disabled={loading || !url}
                                            className="absolute right-2 top-2 bottom-2 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                        >
                                            {loading ? <Loader2 className="animate-spin" size={20} /> : (
                                                <>
                                                    Scan <ArrowRight size={18} />
                                                </>
                                            )}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="relative">
                                        <textarea
                                            value={xmlContent}
                                            onChange={(e) => setXmlContent(e.target.value)}
                                            placeholder="Paste your XML sitemap content here..."
                                            rows={8}
                                            className="w-full p-4 text-sm font-mono rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-y"
                                        />
                                        <div className="mt-2 text-right">
                                            <button
                                                type="submit"
                                                disabled={loading || !xmlContent}
                                                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
                                            >
                                                {loading ? <Loader2 className="animate-spin" size={20} /> : (
                                                    <>
                                                        Analyze JSON/XML <ArrowRight size={18} />
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-left">
                                            Use this logic if the website blocks our scanner. Open the sitemap in your browser (e.g. <code>domain.com/sitemap.xml</code>), view source, copy all, and paste here.
                                        </p>
                                    </div>
                                )}
                            </form>

                            {error && (
                                <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg flex items-center gap-2 text-sm">
                                    <AlertCircle size={16} />
                                    {error}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Background Elements */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none z-0">
                    <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl mix-blend-multiply dark:mix-blend-screen animate-blob"></div>
                    <div className="absolute top-20 right-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl mix-blend-multiply dark:mix-blend-screen animate-blob animation-delay-2000"></div>
                    <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-pink-500/10 rounded-full blur-3xl mix-blend-multiply dark:mix-blend-screen animate-blob animation-delay-4000"></div>
                </div>
            </section>

            {manualResult && (
                <section id="manual-results" className="py-12 bg-gray-50 dark:bg-gray-900 min-h-screen border-t border-gray-200 dark:border-gray-800">
                    <div className="container mx-auto px-4">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Analysis Results</h2>
                            <button
                                onClick={() => {
                                    setManualResult(null);
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                                Clear Results
                            </button>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden h-[800px] flex flex-col">
                            <SitemapVisualization result={manualResult} />
                        </div>
                    </div>
                </section>
            )}
        </>
    );
}
