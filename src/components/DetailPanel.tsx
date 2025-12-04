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
        <div className="h-full flex flex-col overflow-y-auto pr-2">
            <div className="mb-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                    <h2 className="text-xl font-bold break-all text-gray-900 dark:text-white">{node.url}</h2>
                    <a
                        href={node.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg dark:text-blue-400 dark:hover:bg-blue-900/30"
                        title="Open in new tab"
                    >
                        <ExternalLink size={20} />
                    </a>
                </div>

                {/* Metadata Section */}
                {node.type === 'url' && (
                    <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4 mb-6 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-gray-900 dark:text-white">Metadata</h3>
                            {metadata.loading && <Loader2 size={16} className="animate-spin text-blue-500" />}
                        </div>

                        {metadata.error ? (
                            <div className="text-sm text-red-500">{metadata.error}</div>
                        ) : (
                            <div className="space-y-3">
                                <div>
                                    <div className="text-xs text-gray-500 uppercase font-semibold">Title</div>
                                    <div className="text-sm text-gray-900 dark:text-gray-200">{metadata.title || '-'}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500 uppercase font-semibold">Description</div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">{metadata.description || '-'}</div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* SEO Analysis Section */}
                {node.type === 'url' && (
                    <div className="bg-blue-50 dark:bg-blue-900/10 rounded-lg p-4 mb-6 border border-blue-100 dark:border-blue-900/30">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                <Search size={18} className="text-blue-500" />
                                SEO Analysis
                            </h3>
                            {!seoData && (
                                <button
                                    onClick={runSeoAnalysis}
                                    className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                                >
                                    Run Analysis
                                </button>
                            )}
                            {seoData?.loading && <Loader2 size={18} className="animate-spin text-blue-500" />}
                        </div>

                        {seoData && !seoData.loading && !seoData.error && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-3 bg-white dark:bg-gray-800 rounded border border-gray-100 dark:border-gray-700">
                                        <div className="text-xs text-gray-500 uppercase">Status Code</div>
                                        <div className={clsx("font-bold", seoData.statusCode === 200 ? "text-green-600" : "text-red-600")}>
                                            {seoData.statusCode}
                                        </div>
                                    </div>
                                    <div className="p-3 bg-white dark:bg-gray-800 rounded border border-gray-100 dark:border-gray-700">
                                        <div className="text-xs text-gray-500 uppercase">Word Count</div>
                                        <div className="font-bold text-gray-900 dark:text-white">{seoData.wordCount}</div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div>
                                        <div className="flex items-center justify-between text-xs text-gray-500 uppercase mb-1">
                                            <span>Title Length ({seoData.titleLength})</span>
                                            {seoData.titleLength >= 50 && seoData.titleLength <= 60 ? (
                                                <CheckCircle size={14} className="text-green-500" />
                                            ) : (
                                                <AlertTriangle size={14} className="text-yellow-500" />
                                            )}
                                        </div>
                                        <div className="text-sm text-gray-900 dark:text-white">{seoData.title}</div>
                                    </div>
                                    <div>
                                        <div className="flex items-center justify-between text-xs text-gray-500 uppercase mb-1">
                                            <span>Description Length ({seoData.descriptionLength})</span>
                                            {seoData.descriptionLength >= 150 && seoData.descriptionLength <= 160 ? (
                                                <CheckCircle size={14} className="text-green-500" />
                                            ) : (
                                                <AlertTriangle size={14} className="text-yellow-500" />
                                            )}
                                        </div>
                                        <div className="text-sm text-gray-900 dark:text-white">{seoData.description}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500 uppercase mb-1">H1 Tag</div>
                                        <div className="text-sm text-gray-900 dark:text-white font-medium">{seoData.h1 || <span className="text-gray-400 italic">Missing</span>}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500 uppercase mb-1">Canonical</div>
                                        <div className="text-xs text-gray-600 dark:text-gray-400 font-mono bg-gray-100 dark:bg-gray-800 p-1 rounded break-all">{seoData.canonical || '-'}</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {seoData?.error && (
                            <div className="text-red-500 text-sm">{seoData.error}</div>
                        )}
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <div className="text-xs text-gray-500 uppercase">Type</div>
                        <div className="font-medium capitalize text-gray-900 dark:text-white">{node.type}</div>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <div className="text-xs text-gray-500 uppercase">Depth</div>
                        <div className="font-medium text-gray-900 dark:text-white">{node.depth}</div>
                    </div>
                    {node.lastmod && (
                        <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div className="text-xs text-gray-500 uppercase">Last Modified</div>
                            <div className="font-medium text-gray-900 dark:text-white">{node.lastmod}</div>
                        </div>
                    )}
                    {node.priority && (
                        <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div className="text-xs text-gray-500 uppercase">Priority</div>
                            <div className="font-medium text-gray-900 dark:text-white">{node.priority}</div>
                        </div>
                    )}
                </div>
            </div>

            {/* Preview Section */}
            {node.type === 'url' && (
                <div className="flex-1 flex flex-col min-h-0 border-t border-gray-200 dark:border-gray-700 pt-4">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white">Live Preview</h3>
                        <button
                            onClick={refreshPreview}
                            className="p-1.5 text-gray-500 hover:bg-gray-100 rounded dark:hover:bg-gray-700"
                            title="Refresh Preview"
                        >
                            <RefreshCw size={16} />
                        </button>
                    </div>
                    <div className="flex-1 bg-white rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden relative min-h-[300px]">
                        <iframe
                            key={iframeKey}
                            src={node.url}
                            className="w-full h-full"
                            sandbox="allow-scripts allow-same-origin"
                            title="Preview"
                        />
                        <div className="absolute inset-0 pointer-events-none bg-transparent" />
                    </div>
                    <p className="text-xs text-gray-400 mt-2 text-center">
                        Note: Some sites may block iframe embedding via X-Frame-Options.
                    </p>
                </div>
            )}

            {/* Children List for Sitemaps */}
            {node.children && (
                <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
                    <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Children ({node.children.length})</h3>
                    <div className="max-h-60 overflow-auto border border-gray-200 dark:border-gray-700 rounded-lg p-2 bg-gray-50 dark:bg-gray-800/50">
                        {node.children.map((child, i) => (
                            <div key={i} className="py-1 px-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-sm truncate text-gray-700 dark:text-gray-300">
                                {child.url}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
