'use client';

import { useState } from 'react';
import { SitemapTree } from '@/components/SitemapTree';
import { SitemapNode, ScanResult } from '@/lib/sitemap-scanner';
import { Search, Loader2, AlertCircle } from 'lucide-react';

export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<SitemapNode | null>(null);

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

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      {/* Header & Input */}
      <div className="max-w-4xl mx-auto mb-8 text-center">
        <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">XML Nexus</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Sitemap Explorer & Visualizer
        </p>

        <form onSubmit={handleScan} className="flex gap-2 max-w-xl mx-auto">
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
          <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg flex items-center justify-center gap-2">
            <AlertCircle size={20} />
            {error}
          </div>
        )}
      </div>

      {/* Results */}
      {result && (
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-300px)]">
          {/* Sidebar - Tree */}
          <div className="md:col-span-1 bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden flex flex-col border border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <h2 className="font-semibold text-gray-900 dark:text-white">Sitemap Structure</h2>
              <div className="text-xs text-gray-500 mt-1">
                {result.totalSitemaps} sitemaps, {result.totalUrls} URLs found
              </div>
            </div>
            <div className="flex-1 overflow-auto p-2 text-gray-900 dark:text-gray-200">
              {result.nodes.map((node, i) => (
                <SitemapTree
                  key={i}
                  node={node}
                  onSelect={setSelectedNode}
                  selectedNode={selectedNode}
                />
              ))}
            </div>
          </div>

          {/* Main - Details */}
          <div className="md:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 overflow-auto text-gray-900 dark:text-gray-200">
            {selectedNode ? (
              <div>
                <h2 className="text-xl font-bold mb-4 break-all">{selectedNode.url}</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="text-sm text-gray-500">Type</div>
                    <div className="font-medium capitalize">{selectedNode.type}</div>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="text-sm text-gray-500">Depth</div>
                    <div className="font-medium">{selectedNode.depth}</div>
                  </div>
                  {selectedNode.lastmod && (
                    <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div className="text-sm text-gray-500">Last Modified</div>
                      <div className="font-medium">{selectedNode.lastmod}</div>
                    </div>
                  )}
                  {selectedNode.changefreq && (
                    <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div className="text-sm text-gray-500">Change Frequency</div>
                      <div className="font-medium">{selectedNode.changefreq}</div>
                    </div>
                  )}
                  {selectedNode.priority && (
                    <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div className="text-sm text-gray-500">Priority</div>
                      <div className="font-medium">{selectedNode.priority}</div>
                    </div>
                  )}
                </div>

                {selectedNode.children && (
                  <div className="mt-6">
                    <h3 className="font-semibold mb-2">Children ({selectedNode.children.length})</h3>
                    <div className="max-h-60 overflow-auto border border-gray-200 dark:border-gray-700 rounded-lg p-2">
                      {selectedNode.children.map((child, i) => (
                        <div key={i} className="py-1 px-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded text-sm truncate">
                          {child.url}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                Select a node to view details
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
