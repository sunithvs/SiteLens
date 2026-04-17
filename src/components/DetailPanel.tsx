'use client';

import React, { useEffect, useState } from 'react';
import { SitemapNode } from '@/lib/sitemap-scanner';
import { ExternalLink, Loader2, RefreshCw, Search, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { clsx } from 'clsx';

interface DetailPanelProps {
    node: SitemapNode | null;
}

interface Metadata {
    title?: string;
    description?: string;
    loading: boolean;
    error?: string;
}

interface SeoData {
    statusCode: number;
    title: string;
    titleLength: number;
    description: string;
    descriptionLength: number;
    h1: string;
    canonical: string;
    robots: string;
    ogTitle: string;
    ogDescription: string;
    ogImage: string;
    wordCount: number;
    loading: boolean;
    error?: string;
}

export function DetailPanel({ node }: DetailPanelProps) {
    const [metadata, setMetadata] = useState<Metadata>({ loading: false });
    const [seoData, setSeoData] = useState<SeoData | null>(null);
    const [iframeKey, setIframeKey] = useState(0);

    useEffect(() => {
        if (node && node.type === 'url') {
            fetchMetadata(node.url);
            setSeoData(null); // Reset SEO data on node change
        } else {
            setMetadata({ loading: false });
            setSeoData(null);
        }
    }, [node]);

    const fetchMetadata = async (url: string) => {
        setMetadata({ loading: true });
        try {
            const res = await fetch('/api/metadata', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setMetadata({
                title: data.title,
                description: data.description,
                loading: false
            });
        } catch (err: any) {
            setMetadata({ loading: false, error: err.message });
        }
    };

    const runSeoAnalysis = async () => {
        if (!node) return;
        setSeoData({ ...seoData!, loading: true } as any);
        try {
            const res = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: node.url }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setSeoData({ ...data, loading: false });
        } catch (err: any) {
            setSeoData({ loading: false, error: err.message } as any);
        }
    };

    const refreshPreview = () => {
        setIframeKey(prev => prev + 1);
    };

    if (!node) {
        return (
            <div className="h-full flex items-center justify-center text-gray-400">
                Select a node to view details
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col lg:flex-row gap-5 overflow-y-auto lg:overflow-hidden">
            {/* Left Column: Data & Analysis */}
            <div className="flex-1 lg:flex-1 flex flex-col lg:overflow-y-auto lg:pr-2 min-w-0">
                <div className="mb-6">
                    <div className="flex items-start justify-between gap-4 mb-5">
                        <h2 className="text-lg md:text-xl font-bold break-all text-white font-mono">{node.url}</h2>
                        <a
                            href={node.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#d4ff5e] text-black hover:bg-[#e7ff8a] transition-colors flex-shrink-0"
                            title="Open in new tab"
                        >
                            <ExternalLink size={16} />
                        </a>
                    </div>

                    {/* Metadata Section */}
                    {node.type === 'url' && (
                        <div className="bg-[#1a1a1a] rounded-2xl p-5 mb-5 border border-neutral-800">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-bold text-white text-sm tracking-wide uppercase">Metadata</h3>
                                {metadata.loading && <Loader2 size={16} className="animate-spin text-[#d4ff5e]" />}
                            </div>

                            {metadata.error ? (
                                <div className="text-sm text-red-400">{metadata.error}</div>
                            ) : (
                                <div className="space-y-4">
                                    <div>
                                        <div className="text-[10px] text-neutral-500 uppercase font-semibold tracking-wider mb-1">Title</div>
                                        <div className="text-sm text-white">{metadata.title || '—'}</div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-neutral-500 uppercase font-semibold tracking-wider mb-1">Description</div>
                                        <div className="text-sm text-neutral-400 line-clamp-3">{metadata.description || '—'}</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* SEO Analysis Section */}
                    {node.type === 'url' && (
                        <div className="bg-[#1a1a1a] rounded-2xl p-5 mb-5 border border-neutral-800">
                            <div className="flex items-center justify-between mb-4 gap-3">
                                <h3 className="font-bold text-white flex items-center gap-2 text-sm tracking-wide uppercase">
                                    <Search size={14} className="text-[#d4ff5e]" />
                                    SEO Analysis
                                </h3>
                                {!seoData && (
                                    <button
                                        onClick={runSeoAnalysis}
                                        className="px-4 py-2 bg-[#d4ff5e] text-black text-xs font-bold rounded-full hover:bg-[#e7ff8a] transition-colors"
                                    >
                                        Run Analysis
                                    </button>
                                )}
                                {seoData?.loading && <Loader2 size={18} className="animate-spin text-[#d4ff5e]" />}
                            </div>

                            {seoData && !seoData.loading && !seoData.error && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="p-3 bg-[#0a0a0a] rounded-xl border border-neutral-800">
                                            <div className="text-[10px] text-neutral-500 uppercase tracking-wider">Status</div>
                                            <div className={clsx("font-black text-2xl mt-1", seoData.statusCode === 200 ? "text-[#d4ff5e]" : "text-red-400")}>
                                                {seoData.statusCode}
                                            </div>
                                        </div>
                                        <div className="p-3 bg-[#0a0a0a] rounded-xl border border-neutral-800">
                                            <div className="text-[10px] text-neutral-500 uppercase tracking-wider">Words</div>
                                            <div className="font-black text-2xl text-white mt-1">{seoData.wordCount}</div>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div>
                                            <div className="flex items-center justify-between text-[10px] text-neutral-500 uppercase tracking-wider mb-1">
                                                <span>Title Length ({seoData.titleLength})</span>
                                                {seoData.titleLength >= 50 && seoData.titleLength <= 60 ? (
                                                    <CheckCircle size={12} className="text-[#d4ff5e]" />
                                                ) : (
                                                    <AlertTriangle size={12} className="text-[#ff9330]" />
                                                )}
                                            </div>
                                            <div className="text-sm text-white">{seoData.title}</div>
                                        </div>
                                        <div>
                                            <div className="flex items-center justify-between text-[10px] text-neutral-500 uppercase tracking-wider mb-1">
                                                <span>Description ({seoData.descriptionLength})</span>
                                                {seoData.descriptionLength >= 150 && seoData.descriptionLength <= 160 ? (
                                                    <CheckCircle size={12} className="text-[#d4ff5e]" />
                                                ) : (
                                                    <AlertTriangle size={12} className="text-[#ff9330]" />
                                                )}
                                            </div>
                                            <div className="text-sm text-neutral-300">{seoData.description}</div>
                                        </div>
                                        <div>
                                            <div className="text-[10px] text-neutral-500 uppercase tracking-wider mb-1">H1 Tag</div>
                                            <div className="text-sm text-white font-medium">{seoData.h1 || <span className="text-neutral-600 italic">Missing</span>}</div>
                                        </div>
                                        <div>
                                            <div className="text-[10px] text-neutral-500 uppercase tracking-wider mb-1">Canonical</div>
                                            <div className="text-xs text-neutral-400 font-mono bg-[#0a0a0a] p-2 rounded-lg border border-neutral-800 break-all">{seoData.canonical || '—'}</div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {seoData?.error && (
                                <div className="text-red-400 text-sm">{seoData.error}</div>
                            )}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-4 bg-[#1a1a1a] rounded-2xl border border-neutral-800">
                            <div className="text-[10px] text-neutral-500 uppercase tracking-wider">Type</div>
                            <div className="font-semibold capitalize text-white mt-1">{node.type}</div>
                        </div>
                        <div className="p-4 bg-[#1a1a1a] rounded-2xl border border-neutral-800">
                            <div className="text-[10px] text-neutral-500 uppercase tracking-wider">Depth</div>
                            <div className="font-semibold text-white mt-1">{node.depth}</div>
                        </div>
                        {node.lastmod && (
                            <div className="p-4 bg-[#1a1a1a] rounded-2xl border border-neutral-800">
                                <div className="text-[10px] text-neutral-500 uppercase tracking-wider">Last Modified</div>
                                <div className="font-medium text-white mt-1 text-sm">{node.lastmod}</div>
                            </div>
                        )}
                        {node.priority && (
                            <div className="p-4 bg-[#1a1a1a] rounded-2xl border border-neutral-800">
                                <div className="text-[10px] text-neutral-500 uppercase tracking-wider">Priority</div>
                                <div className="font-medium text-white mt-1">{node.priority}</div>
                            </div>
                        )}
                    </div>

                    {/* Children List for Sitemaps */}
                    {node.children && (
                        <div className="mt-6 pt-5 border-t border-neutral-800">
                            <h3 className="font-bold mb-3 text-white text-sm tracking-wide uppercase">Children ({node.children.length})</h3>
                            <div className="max-h-60 overflow-auto border border-neutral-800 rounded-2xl p-2 bg-[#1a1a1a]">
                                {node.children.map((child, i) => (
                                    <div key={i} className="py-1.5 px-3 hover:bg-neutral-800 rounded-lg text-sm truncate text-neutral-300 font-mono text-xs">
                                        {child.url}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Right Column: Desktop Preview */}
            {node.type === 'url' && (
                <div className="flex-none lg:flex-1 lg:max-w-[50%] flex flex-col min-h-[500px] lg:min-h-0 pb-6 lg:pb-0">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-white text-sm tracking-wide uppercase">Desktop Preview</h3>
                        <button
                            onClick={refreshPreview}
                            className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-[#1a1a1a] border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-600 transition-colors"
                            title="Refresh Preview"
                        >
                            <RefreshCw size={14} />
                        </button>
                    </div>

                    <div className="flex-1 flex flex-col bg-[#1a1a1a] rounded-2xl border border-neutral-800 overflow-hidden">
                        <div className="bg-[#0a0a0a] border-b border-neutral-800 p-2 flex items-center gap-2">
                            <div className="flex gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                                <div className="w-2.5 h-2.5 rounded-full bg-[#d4ff5e]" />
                            </div>
                            <div className="flex-1 bg-[#141414] rounded-full px-3 py-1 text-xs text-neutral-500 truncate mx-3 text-center font-mono border border-neutral-800">
                                {node.url}
                            </div>
                        </div>
                        <div className="flex-1 relative bg-white">
                            <iframe
                                key={iframeKey}
                                src={node.url}
                                className="w-full h-full absolute inset-0"
                                sandbox="allow-scripts allow-same-origin"
                                title="Preview"
                            />
                        </div>
                    </div>
                    <p className="text-xs text-neutral-500 mt-2 text-center">
                        Note: Some sites may block iframe embedding via X-Frame-Options.
                    </p>
                </div>
            )}
        </div>
    );
}
