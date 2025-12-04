'use client';

import { useState, useEffect, useMemo, use } from 'react';
import { SitemapTree } from '@/components/SitemapTree';
import { SitemapTable } from '@/components/SitemapTable';
import { SitemapGrid } from '@/components/SitemapGrid';
import { DetailPanel } from '@/components/DetailPanel';
import { StatsDashboard } from '@/components/StatsDashboard';
import { SitemapNode, ScanResult } from '@/lib/sitemap-scanner';
import { Search, Loader2, AlertCircle, LayoutList, Grid, ListTree, ArrowLeft, Home } from 'lucide-react';
import { clsx } from 'clsx';
import Link from 'next/link';

type ViewMode = 'tree' | 'table' | 'grid';

export default function SiteExplorer({ params }: { params: Promise<{ url: string[] }> }) {
    // Unwrap params using React.use()
    const { url } = use(params);
    // Reconstruct URL from params
    // If params.url is ['https%3A%2F%2Fexample.com'], we decode it.
    // If it's ['https:', 'example.com'], we join it.
    // To be safe, we'll assume the landing page encodes the URL component if it's complex, 
    // or we try to reconstruct.
    // Let's assume we pass the encoded URL as a single segment for reliability, 
    // OR we handle the array.

    const rawUrl = url.map(decodeURIComponent).join('/');
    // Fix protocol if it got messed up (e.g. https:/example.com)
    const targetUrl = rawUrl.replace(/^(https?):\/([^\/])/, '$1://$2');

    const [loading, setLoading] = useState(true);
    const [result, setResult] = useState<ScanResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [selectedNode, setSelectedNode] = useState<SitemapNode | null>(null);
    const [viewMode, setViewMode] = useState<ViewMode>('tree');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const scan = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch('/api/scan', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ url: targetUrl }),
                });

                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.error || 'Failed to scan');
                }

                setResult(data.result);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (targetUrl) {
            scan();
        }
    }, [targetUrl]);

    const filteredNodes = useMemo(() => {
        if (!result) return [];
        if (!searchQuery) return result.nodes;

        const lowerQuery = searchQuery.toLowerCase();
        const matches = (node: SitemapNode) => node.url.toLowerCase().includes(lowerQuery);

        // Recursive filter for tree
        const filterTree = (nodes: SitemapNode[]): SitemapNode[] => {
            return nodes.reduce<SitemapNode[]>((acc, node) => {
                const children = node.children ? filterTree(node.children) : [];
                if (matches(node) || children.length > 0) {
                    acc.push({ ...node, children });
                }
                return acc;
            }, []);
        };

        return filterTree(result.nodes);
    }, [result, searchQuery]);

    // Full-screen Details View
    if (selectedNode) {
        return (
            <main className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8 flex flex-col h-screen">
                <div className="max-w-7xl mx-auto w-full h-full flex flex-col">
                    <div className="mb-4 flex items-center gap-4">
                        <button
                            onClick={() => setSelectedNode(null)}
                            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors flex items-center gap-2 text-gray-700 dark:text-gray-300 font-medium"
                        >
                            <ArrowLeft size={20} />
                            Back to List
                        </button>
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white truncate">
                            Details
                        </h1>
                    </div>

                    <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden p-6">
                        <DetailPanel node={selectedNode} />
                    </div>
                </div>
            </main>
        );
    }

    return (
        <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900 overflow-hidden">
            {/* Sticky Header */}
            <div className="flex-none bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 z-50">
                <div className="max-w-[1920px] mx-auto px-4 h-16 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity flex-shrink-0">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                                SL
                            </div>
                            <span className="font-bold text-xl hidden sm:block text-gray-900 dark:text-white">SiteLens</span>
                        </Link>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-md" title={targetUrl}>
                            Scanning: {targetUrl}
                        </p>
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

            {/* Controls & Results */}
            {!loading && !error && result && (
                <div className="flex-1 flex flex-col max-w-7xl mx-auto w-full gap-6">
                    {/* Stats Dashboard */}
                    <StatsDashboard result={result} />

                    {/* Toolbar */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 sticky top-4 z-10">
                        {/* Search */}
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="text"
                                placeholder="Filter URLs..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-900 text-sm outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                            />
                        </div>

                        {/* View Toggles */}
                        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
                            <button
                                onClick={() => setViewMode('tree')}
                                className={clsx("p-2 rounded-md transition-all", viewMode === 'tree' ? "bg-white dark:bg-gray-600 shadow-sm text-blue-600 dark:text-blue-400" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300")}
                                title="Tree View"
                            >
                                <ListTree size={18} />
                            </button>
                            <button
                                onClick={() => setViewMode('table')}
                                className={clsx("p-2 rounded-md transition-all", viewMode === 'table' ? "bg-white dark:bg-gray-600 shadow-sm text-blue-600 dark:text-blue-400" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300")}
                                title="Table View"
                            >
                                <LayoutList size={18} />
                            </button>
                            <button
                                onClick={() => setViewMode('grid')}
                                className={clsx("p-2 rounded-md transition-all", viewMode === 'grid' ? "bg-white dark:bg-gray-600 shadow-sm text-blue-600 dark:text-blue-400" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300")}
                                title="Grid View"
                            >
                                <Grid size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Main Content Area - Fixed Height with Scroll */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden flex flex-col border border-gray-200 dark:border-gray-700 h-[600px] md:h-[700px]">
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center flex-shrink-0">
                            <div>
                                <h2 className="font-semibold text-gray-900 dark:text-white">Structure</h2>
                                <div className="text-xs text-gray-500 mt-1">
                                    {result.totalSitemaps} sitemaps, {result.totalUrls} URLs
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-auto p-2 text-gray-900 dark:text-gray-200">
                            {viewMode === 'tree' && (
                                filteredNodes.map((node, i) => (
                                    <SitemapTree
                                        key={i}
                                        node={node}
                                        onSelect={setSelectedNode}
                                        selectedNode={selectedNode}
                                    />
                                ))
                            )}
                            {viewMode === 'table' && (
                                <SitemapTable
                                    nodes={filteredNodes}
                                    onSelect={setSelectedNode}
                                    selectedNode={selectedNode}
                                />
                            )}
                            {viewMode === 'grid' && (
                                <SitemapGrid
                                    nodes={filteredNodes}
                                    onSelect={setSelectedNode}
                                    selectedNode={selectedNode}
                                />
                            )}
                            {filteredNodes.length === 0 && (
                                <div className="p-8 text-center text-gray-400">
                                    No results found matching "{searchQuery}"
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
