'use client';

import React, { useState } from 'react';
import { Search, Loader2, AlertCircle, ArrowRight, Sparkles, History } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { SitemapVisualization } from '@/components/SitemapVisualization';
import { Logo } from '@/components/Logo';

export function Hero() {
    const [inputMode, setInputMode] = useState<'url' | 'xml'>('url');
    const [url, setUrl] = useState('');
    const [xmlContent, setXmlContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [manualResult, setManualResult] = useState<any>(null);
    const router = useRouter();

    const handleScan = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setManualResult(null);

        if (inputMode === 'url') {
            if (!url) return;
            setLoading(true);
            try {
                let targetUrl = url.trim();
                const domainRegex = /^(https?:\/\/)?([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}(:\d{1,5})?(\/.*)?$/;
                if (!domainRegex.test(targetUrl) && !targetUrl.includes('localhost')) {
                    throw new Error('Please enter a valid website URL (e.g., example.com)');
                }
                if (!targetUrl.startsWith('http')) {
                    targetUrl = `https://${targetUrl}`;
                }
                try {
                    new URL(targetUrl);
                } catch (e) {
                    throw new Error('Invalid URL format');
                }
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
            if (!xmlContent) return;
            setLoading(true);
            try {
                const res = await fetch('/api/scan', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        url: 'http://manual-input',
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
            <section className="relative pt-8 md:pt-10 pb-20 md:pb-28 overflow-hidden">
                {/* Top Nav */}
                <nav className="container mx-auto px-4 mb-16 md:mb-24 flex items-center justify-between">
                    <Logo size={32} />

                    <div className="flex items-center gap-2">
                        <Link
                            href="/blog"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm text-neutral-400 hover:text-white transition-colors"
                        >
                            Blog
                        </Link>
                        <Link
                            href="/history"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#141414] border border-neutral-800 hover:border-neutral-600 text-sm text-neutral-300 hover:text-white transition-colors"
                        >
                            <History size={15} />
                            <span className="hidden sm:inline">History</span>
                        </Link>
                    </div>
                </nav>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-5xl mx-auto text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#141414] border border-neutral-800 text-sm font-medium text-neutral-300 mb-8">
                            <Sparkles size={14} className="text-[#d4ff5e]" />
                            <span>New — Deep SEO Analysis</span>
                        </div>

                        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white mb-6 tracking-[-0.04em] leading-[0.95]">
                            Visualize your<br />
                            <span className="italic font-black text-[#d4ff5e]">sitemap</span>
                            {' '}
                            <span className="inline-flex items-center -mx-1 px-4 py-1 bg-[#ff9330] text-black rounded-full text-4xl sm:text-5xl md:text-6xl lg:text-7xl align-middle">
                                instantly
                            </span>
                        </h1>

                        <p className="text-base md:text-xl text-neutral-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                            Enter any URL to see its structure, analyze SEO, and uncover hidden pages. No sign-up required.
                        </p>

                        {/* Input Mode Toggle — pill style */}
                        <div className="flex justify-center mb-5">
                            <div className="bg-[#141414] border border-neutral-800 p-1 rounded-full inline-flex">
                                <button
                                    onClick={() => setInputMode('url')}
                                    className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${inputMode === 'url'
                                        ? 'bg-[#d4ff5e] text-black'
                                        : 'text-neutral-400 hover:text-white'
                                        }`}
                                >
                                    Website URL
                                </button>
                                <button
                                    onClick={() => setInputMode('xml')}
                                    className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${inputMode === 'xml'
                                        ? 'bg-[#d4ff5e] text-black'
                                        : 'text-neutral-400 hover:text-white'
                                        }`}
                                >
                                    Manual XML
                                </button>
                            </div>
                        </div>

                        <div className="max-w-2xl mx-auto relative">
                            <form onSubmit={handleScan} className="relative flex flex-col gap-4">
                                {inputMode === 'url' ? (
                                    <div className="relative flex items-center bg-[#141414] border border-neutral-800 focus-within:border-[#d4ff5e]/40 rounded-full p-1.5 pl-5 shadow-[0_0_60px_rgba(212,255,94,0.08)] transition-colors">
                                        <Search size={18} className="text-neutral-500 flex-shrink-0" />
                                        <input
                                            type="text"
                                            value={url}
                                            onChange={(e) => setUrl(e.target.value)}
                                            placeholder="Enter your website URL (e.g., example.com)"
                                            className="flex-1 min-w-0 px-3 py-2 text-base md:text-lg bg-transparent text-white placeholder:text-neutral-500 outline-none"
                                        />
                                        <button
                                            type="submit"
                                            disabled={loading || !url}
                                            className="flex-shrink-0 px-5 md:px-7 py-3 bg-[#d4ff5e] hover:bg-[#e7ff8a] text-black rounded-full font-bold text-sm md:text-base transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
                                        >
                                            {loading ? <Loader2 className="animate-spin" size={18} /> : (
                                                <>
                                                    Scan <ArrowRight size={16} />
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
                                            className="w-full p-5 text-sm font-mono rounded-3xl border border-neutral-800 focus:border-[#d4ff5e]/40 bg-[#141414] text-white placeholder:text-neutral-500 outline-none transition-colors resize-y"
                                        />
                                        <div className="mt-3 text-right">
                                            <button
                                                type="submit"
                                                disabled={loading || !xmlContent}
                                                className="px-7 py-3 bg-[#d4ff5e] hover:bg-[#e7ff8a] text-black rounded-full font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
                                            >
                                                {loading ? <Loader2 className="animate-spin" size={18} /> : (
                                                    <>
                                                        Analyze XML <ArrowRight size={16} />
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                        <p className="mt-3 text-xs text-neutral-500 text-left">
                                            Use this if the website blocks our scanner. Open the sitemap in your browser (e.g. <code className="text-[#d4ff5e]">domain.com/sitemap.xml</code>), view source, copy all, and paste here.
                                        </p>
                                    </div>
                                )}
                            </form>

                            {error && (
                                <div className="mt-4 p-3 bg-[#2a1414] border border-red-900/50 text-red-400 rounded-2xl flex items-center gap-2 text-sm">
                                    <AlertCircle size={16} />
                                    {error}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Glow blobs */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none z-0">
                    <div className="absolute top-40 left-10 w-72 h-72 bg-[#d4ff5e]/10 rounded-full blur-3xl animate-blob" />
                    <div className="absolute top-20 right-10 w-72 h-72 bg-[#ff9330]/10 rounded-full blur-3xl animate-blob animation-delay-2000" />
                    <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-[#d4ff5e]/5 rounded-full blur-3xl animate-blob animation-delay-4000" />
                </div>
            </section>

            {manualResult && (
                <section id="manual-results" className="py-12 bg-[#0a0a0a] min-h-screen border-t border-neutral-800">
                    <div className="container mx-auto px-4">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-3xl font-black tracking-tight text-white">Analysis Results</h2>
                            <button
                                onClick={() => {
                                    setManualResult(null);
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                className="text-sm text-neutral-500 hover:text-white px-4 py-2 rounded-full border border-neutral-800 hover:border-neutral-600 transition-colors"
                            >
                                Clear Results
                            </button>
                        </div>
                        <div className="bg-[#141414] rounded-3xl border border-neutral-800 overflow-hidden h-[800px] flex flex-col">
                            <SitemapVisualization result={manualResult} />
                        </div>
                    </div>
                </section>
            )}
        </>
    );
}
