'use client';

import { useState, useMemo, useEffect } from 'react';
import Fuse from 'fuse.js';
import { SitemapTree } from '@/components/SitemapTree';
import { SitemapTable } from '@/components/SitemapTable';
import { SitemapGrid } from '@/components/SitemapGrid';
import { DetailPanel } from '@/components/DetailPanel';
import { StatsDashboard } from '@/components/StatsDashboard';
import { SeoAnalytics } from '@/components/SeoAnalytics';
import { SitemapNode, ScanResult } from '@/lib/sitemap-scanner';
import { Search, LayoutList, Grid, ListTree, ArrowLeft, Maximize2, Minimize2, AlertTriangle, Activity, Download, FileJson, FileSpreadsheet } from 'lucide-react';
import { clsx } from 'clsx';
import { toCsv, toJson, download, sanitizeSlug } from '@/lib/export';

type ViewMode = 'tree' | 'table' | 'grid' | 'seo';

interface SitemapVisualizationProps {
    result: ScanResult;
    loading?: boolean;
}

export function SitemapVisualization({ result, loading }: SitemapVisualizationProps) {
    const [selectedNode, setSelectedNode] = useState<SitemapNode | null>(null);
    const [viewMode, setViewMode] = useState<ViewMode>('tree');
    const [searchQuery, setSearchQuery] = useState('');
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [exportOpen, setExportOpen] = useState(false);

    const exportName = useMemo(() => {
        try {
            const firstUrl = result.nodes[0]?.url;
            if (firstUrl) {
                return sanitizeSlug(new URL(firstUrl).hostname);
            }
        } catch { /* noop */ }
        return 'sitelens-export';
    }, [result]);

    const handleExportCsv = () => {
        download(`${exportName}.csv`, toCsv(result), 'text/csv;charset=utf-8');
        setExportOpen(false);
    };
    const handleExportJson = () => {
        download(`${exportName}.json`, toJson(result), 'application/json');
        setExportOpen(false);
    };

    // Sync detail view with browser back button: push a dummy history entry when
    // opening a detail, pop it (closing the detail) when the user presses back.
    useEffect(() => {
        if (!selectedNode) return;
        const handler = () => setSelectedNode(null);
        window.history.pushState({ sitelensDetail: true }, '');
        window.addEventListener('popstate', handler);
        return () => {
            window.removeEventListener('popstate', handler);
            // If detail is being closed programmatically (not via popstate),
            // roll back the dummy history entry so browser back still works correctly.
            if (window.history.state?.sitelensDetail) {
                window.history.back();
            }
        };
    }, [selectedNode]);

    const filteredNodes = useMemo(() => {
        if (!result) return [];
        if (!searchQuery) return result.nodes;

        // Flatten all nodes for Fuse searching
        const allNodes: SitemapNode[] = [];
        const traverse = (nodes: SitemapNode[]) => {
            nodes.forEach(node => {
                allNodes.push(node);
                if (node.children) traverse(node.children);
            });
        };
        traverse(result.nodes);

        const fuse = new Fuse(allNodes, {
            keys: ['url'],
            threshold: 0.4, // Adjust for fuzziness
            distance: 100,
        });

        const searchResults = fuse.search(searchQuery);
        const matchedUrls = new Set(searchResults.map(r => r.item.url));

        // Recursive filter for tree
        const filterTree = (nodes: SitemapNode[]): SitemapNode[] => {
            return nodes.reduce<SitemapNode[]>((acc, node) => {
                const children = node.children ? filterTree(node.children) : [];
                // Keep node if it matches OR if it has matching children
                if (matchedUrls.has(node.url) || children.length > 0) {
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
            <div className="fixed inset-0 z-50 bg-[#0a0a0a] p-4 md:p-8 flex flex-col h-screen overflow-hidden">
                <div className="max-w-7xl mx-auto w-full h-full flex flex-col">
                    <div className="mb-4 flex items-center gap-3">
                        <button
                            onClick={() => setSelectedNode(null)}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#141414] border border-neutral-800 hover:border-neutral-600 text-neutral-300 hover:text-white font-medium text-sm transition-colors"
                        >
                            <ArrowLeft size={16} />
                            Back
                        </button>
                        <h1 className="text-xl md:text-2xl font-black text-white truncate tracking-tight">
                            Details
                        </h1>
                    </div>

                    <div className="flex-1 bg-[#141414] rounded-3xl border border-neutral-800 overflow-hidden p-5 md:p-6">
                        <DetailPanel node={selectedNode} />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <div className="flex-1 flex flex-col max-w-[1920px] mx-auto w-full h-full p-4 gap-4 overflow-y-auto">

                {/* Stats Dashboard */}
                <div className="flex-none">
                    <StatsDashboard result={result} loading={loading} />
                </div>

                {/* Error Report */}
                {result.errors.length > 0 && (
                    <div className="flex-none">
                        <div className="bg-[#1a1010] border border-red-900/40 rounded-3xl p-5">
                            <h3 className="flex items-center gap-2 text-red-300 font-semibold mb-3 text-sm">
                                <AlertTriangle size={16} />
                                {result.nodes.length > 0
                                    ? `Partial Success — ${result.errors.length} sitemaps failed to load`
                                    : `Scan Failed — ${result.errors.length} errors found`}
                            </h3>
                            <ul className="space-y-1 max-h-32 overflow-y-auto">
                                {result.errors.map((err, i) => (
                                    <li key={i} className="text-xs text-red-400/80 font-mono break-all">
                                        {err}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                {/* Toolbar & Content Container */}
                <div className={clsx(
                    "flex-1 flex flex-col bg-[#141414] rounded-3xl border border-neutral-800 overflow-hidden transition-all duration-300",
                    isFullScreen ? "fixed inset-0 z-[100] rounded-none border-0" : "min-h-[500px]"
                )}>
                    {/* Toolbar */}
                    <div className="flex-none p-4 md:p-5 border-b border-neutral-800 flex flex-col lg:flex-row gap-3 lg:gap-4 lg:justify-between lg:items-center">
                        <div className="flex items-center gap-4 w-full lg:w-auto">
                            <div>
                                <h2 className="font-bold text-white tracking-tight text-lg">
                                    {viewMode === 'seo' ? 'SEO Analysis' : 'Structure'}
                                </h2>
                                <div className="text-xs text-neutral-500 mt-0.5 font-mono">
                                    {result.totalSitemaps} sitemaps · {result.totalUrls} URLs
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
                            {/* Search */}
                            <div className="relative w-full sm:flex-1 lg:flex-none lg:w-64">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" size={15} />
                                <input
                                    type="text"
                                    placeholder="Filter URLs..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-full border border-neutral-800 bg-[#0a0a0a] text-sm outline-none focus:border-[#d4ff5e]/40 text-white placeholder:text-neutral-500 transition-colors"
                                />
                            </div>

                            <div className="flex items-center gap-2 justify-between sm:justify-start">
                                {/* View Toggles — pill style */}
                                <div className="flex items-center gap-1 bg-[#0a0a0a] border border-neutral-800 p-1 rounded-full flex-shrink-0">
                                    <button
                                        onClick={() => setViewMode('tree')}
                                        className={clsx("p-2 rounded-full transition-all", viewMode === 'tree' ? "bg-[#d4ff5e] text-black" : "text-neutral-500 hover:text-white")}
                                        title="Tree View"
                                    >
                                        <ListTree size={16} />
                                    </button>
                                    <button
                                        onClick={() => setViewMode('table')}
                                        className={clsx("p-2 rounded-full transition-all", viewMode === 'table' ? "bg-[#d4ff5e] text-black" : "text-neutral-500 hover:text-white")}
                                        title="Table View"
                                    >
                                        <LayoutList size={16} />
                                    </button>
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        className={clsx("p-2 rounded-full transition-all", viewMode === 'grid' ? "bg-[#d4ff5e] text-black" : "text-neutral-500 hover:text-white")}
                                        title="Grid View"
                                    >
                                        <Grid size={16} />
                                    </button>
                                    <button
                                        onClick={() => setViewMode('seo')}
                                        className={clsx("p-2 rounded-full transition-all", viewMode === 'seo' ? "bg-[#ff9330] text-black" : "text-neutral-500 hover:text-white")}
                                        title="SEO Analysis"
                                    >
                                        <Activity size={16} />
                                    </button>
                                </div>

                                <div className="relative">
                                    <button
                                        onClick={() => setExportOpen(!exportOpen)}
                                        className={clsx(
                                            "inline-flex items-center gap-1.5 pl-3 pr-3 py-2 rounded-full transition-all border text-xs font-semibold",
                                            exportOpen
                                                ? "bg-[#d4ff5e] text-black border-[#d4ff5e]"
                                                : "bg-[#0a0a0a] border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-600"
                                        )}
                                        title="Export"
                                    >
                                        <Download size={14} />
                                        <span>Export</span>
                                    </button>
                                    {exportOpen && (
                                        <>
                                            <div
                                                className="fixed inset-0 z-40"
                                                onClick={() => setExportOpen(false)}
                                            />
                                            <div className="absolute right-0 mt-2 w-56 bg-[#141414] border border-neutral-800 rounded-2xl shadow-xl z-50 overflow-hidden">
                                                <button
                                                    onClick={handleExportCsv}
                                                    className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm text-neutral-200 hover:bg-[#1c1c1c]"
                                                >
                                                    <FileSpreadsheet size={16} className="text-[#d4ff5e]" />
                                                    <div>
                                                        <div className="font-semibold">Export CSV</div>
                                                        <div className="text-xs text-neutral-500">Flat URL list</div>
                                                    </div>
                                                </button>
                                                <div className="h-px bg-neutral-800" />
                                                <button
                                                    onClick={handleExportJson}
                                                    className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm text-neutral-200 hover:bg-[#1c1c1c]"
                                                >
                                                    <FileJson size={16} className="text-[#ff9330]" />
                                                    <div>
                                                        <div className="font-semibold">Export JSON</div>
                                                        <div className="text-xs text-neutral-500">Full tree structure</div>
                                                    </div>
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>

                                <button
                                    onClick={() => setIsFullScreen(!isFullScreen)}
                                    className={clsx(
                                        "p-2.5 rounded-full transition-all border",
                                        isFullScreen
                                            ? "bg-[#d4ff5e] text-black border-[#d4ff5e]"
                                            : "bg-[#0a0a0a] border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-600"
                                    )}
                                    title={isFullScreen ? "Exit Full Screen" : "Full Screen"}
                                >
                                    {isFullScreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 overflow-auto p-3 md:p-4 text-neutral-200 min-h-0 bg-[#0f0f0f]">
                        {viewMode === 'seo' ? (
                            <div className="h-full p-1">
                                <SeoAnalytics result={result} />
                            </div>
                        ) : (
                            <>
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
                                    <div className="p-8 text-center text-neutral-500">
                                        No results matching "{searchQuery}"
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
