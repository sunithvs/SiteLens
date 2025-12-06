'use client';

import { useState, useMemo } from 'react';
import Fuse from 'fuse.js';
import { SitemapTree } from '@/components/SitemapTree';
import { SitemapTable } from '@/components/SitemapTable';
import { SitemapGrid } from '@/components/SitemapGrid';
import { DetailPanel } from '@/components/DetailPanel';
import { StatsDashboard } from '@/components/StatsDashboard';
import { SitemapNode, ScanResult } from '@/lib/sitemap-scanner';
import { Search, LayoutList, Grid, ListTree, ArrowLeft, Maximize2, Minimize2, AlertTriangle } from 'lucide-react';
import { clsx } from 'clsx';

type ViewMode = 'tree' | 'table' | 'grid';

interface SitemapVisualizationProps {
    result: ScanResult;
}

export function SitemapVisualization({ result }: SitemapVisualizationProps) {
    const [selectedNode, setSelectedNode] = useState<SitemapNode | null>(null);
    const [viewMode, setViewMode] = useState<ViewMode>('tree');
    const [searchQuery, setSearchQuery] = useState('');
    const [isFullScreen, setIsFullScreen] = useState(false);

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
            <div className="fixed inset-0 z-50 bg-gray-50 dark:bg-gray-900 p-4 md:p-8 flex flex-col h-screen overflow-hidden">
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
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <div className="flex-1 flex flex-col max-w-[1920px] mx-auto w-full h-full p-4 gap-4 overflow-y-auto">

                {/* Stats Dashboard - Stacks on mobile */}
                <div className="flex-none">
                    <StatsDashboard result={result} />
                </div>

                {/* Error Report */}
                {result.errors.length > 0 && (
                    <div className="flex-none bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                        <h3 className="flex items-center gap-2 text-red-800 dark:text-red-200 font-medium mb-2">
                            <AlertTriangle size={20} />
                            Scan Errors ({result.errors.length})
                        </h3>
                        <ul className="space-y-1">
                            {result.errors.map((err, i) => (
                                <li key={i} className="text-sm text-red-600 dark:text-red-400 font-mono break-all">
                                    {err}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Toolbar & Content Container */}
                <div className={clsx(
                    "flex-1 flex flex-col bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300",
                    isFullScreen ? "fixed inset-0 z-[100] rounded-none border-0" : "min-h-[500px]"
                )}>
                    {/* Toolbar */}
                    <div className="flex-none p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex flex-col sm:flex-row gap-4 justify-between items-center">
                        <div className="flex items-center gap-4 w-full sm:w-auto">
                            <div>
                                <h2 className="font-semibold text-gray-900 dark:text-white">Structure</h2>
                                <div className="text-xs text-gray-500 mt-1">
                                    {result.totalSitemaps} sitemaps, {result.totalUrls} URLs
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            {/* Search */}
                            <div className="relative flex-1 sm:w-64">
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
                            <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg flex-shrink-0">
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

                            <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />

                            <button
                                onClick={() => setIsFullScreen(!isFullScreen)}
                                className={clsx(
                                    "p-2 rounded-lg transition-all",
                                    isFullScreen
                                        ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                                        : "bg-gray-100 dark:bg-gray-700 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                )}
                                title={isFullScreen ? "Exit Full Screen" : "Full Screen"}
                            >
                                {isFullScreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                            </button>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 overflow-auto p-2 text-gray-900 dark:text-gray-200 min-h-0">
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
        </div>
    );
}
