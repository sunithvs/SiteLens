'use client';

import { useState, useMemo } from 'react';
import { SitemapTree } from '@/components/SitemapTree';
import { SitemapTable } from '@/components/SitemapTable';
import { SitemapGrid } from '@/components/SitemapGrid';
import { DetailModal } from '@/components/DetailModal';
import { SitemapNode, ScanResult } from '@/lib/sitemap-scanner';
import { Search, Loader2, AlertCircle, LayoutList, Grid, ListTree } from 'lucide-react';
import { clsx } from 'clsx';

type ViewMode = 'tree' | 'table' | 'grid';

export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<SitemapNode | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('tree');
  const [searchQuery, setSearchQuery] = useState('');

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setSelectedNode(null);

    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
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

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8 flex flex-col h-screen">
      {/* Header & Input */}
      <div className="max-w-4xl mx-auto w-full mb-6 text-center flex-shrink-0">
        <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">XML Nexus</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Sitemap Explorer & Visualizer
        </p>

        <form onSubmit={handleScan} className="flex gap-2 max-w-xl mx-auto mb-6">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter domain URL (e.g., example.com)"
            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
            Scan
          </button>
        </form>

        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-lg flex items-center justify-center gap-2">
            <AlertCircle size={20} />
            {error}
          </div>
        )}
      </div>

      {/* Controls & Results */}
      {result && (
        <div className="flex-1 flex flex-col min-h-0 max-w-7xl mx-auto w-full gap-4">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
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

          {/* Main Content Area - Full Width */}
          <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden flex flex-col border border-gray-200 dark:border-gray-700 min-h-0">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center">
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

      {/* Detail Modal */}
      <DetailModal
        node={selectedNode}
        onClose={() => setSelectedNode(null)}
      />
    </main>
  );
}
