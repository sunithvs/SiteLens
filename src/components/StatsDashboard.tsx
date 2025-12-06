'use client';

import React, { useMemo } from 'react';
import { ScanResult, SitemapNode } from '@/lib/sitemap-scanner';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { FileText, FolderTree, AlertTriangle, Link as LinkIcon, Loader2 } from 'lucide-react';

interface StatsDashboardProps {
    result: ScanResult;
    loading?: boolean;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export function StatsDashboard({ result, loading }: StatsDashboardProps) {
    const stats = useMemo(() => {
        const fileTypes: Record<string, number> = {};
        const depthCounts: Record<number, number> = {};
        let maxDepth = 0;

        const traverse = (nodes: SitemapNode[]) => {
            for (const node of nodes) {
                // Depth stats
                depthCounts[node.depth] = (depthCounts[node.depth] || 0) + 1;
                maxDepth = Math.max(maxDepth, node.depth);

                // File type stats (only for URLs)
                if (node.type === 'url') {
                    const ext = node.url.split('.').pop()?.toLowerCase() || 'unknown';
                    // Group common web extensions or long ones as 'other'
                    const key = (ext.length > 4 || ext.includes('/')) ? 'html' : ext;
                    fileTypes[key] = (fileTypes[key] || 0) + 1;
                }

                if (node.children) {
                    traverse(node.children);
                }
            }
        };

        traverse(result.nodes);

        const fileTypeData = Object.entries(fileTypes)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5); // Top 5

        const depthData = Object.entries(depthCounts)
            .map(([depth, count]) => ({ depth: `Level ${depth}`, count }))
            .sort((a, b) => a.depth.localeCompare(b.depth));

        return { fileTypeData, depthData, maxDepth };
    }, [result]);

    const showLoading = (value: number) => {
        if (loading && value === 0) {
            return <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />;
        }
        return <div className="text-2xl font-bold text-gray-900 dark:text-white">{value.toLocaleString()}</div>;
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Summary Cards */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex items-center gap-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400 relative overflow-hidden">
                    <LinkIcon size={24} className="relative z-10" />
                    {loading && <div className="absolute inset-0 animate-ping opacity-20 bg-blue-500 rounded-lg"></div>}
                </div>
                <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Total URLs</div>
                    {showLoading(result.totalUrls)}
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex items-center gap-4">
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-600 dark:text-green-400">
                    <FolderTree size={24} />
                </div>
                <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Sitemaps</div>
                    {showLoading(result.totalSitemaps)}
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex items-center gap-4">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
                    <FileText size={24} />
                </div>
                <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Max Depth</div>
                    {showLoading(stats.maxDepth)}
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex items-center gap-4">
                <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg text-red-600 dark:text-red-400">
                    <AlertTriangle size={24} />
                </div>
                <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Errors</div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{result.errors.length}</div>
                </div>
            </div>

            {/* Charts */}
            <div className="md:col-span-2 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">File Type Distribution</h3>
                <div className="h-64">
                    {loading && stats.fileTypeData.length === 0 ? (
                        <div className="w-full h-full flex items-center justify-center bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                            <Loader2 className="w-8 h-8 text-gray-300 animate-spin" />
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={stats.fileTypeData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {stats.fileTypeData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    itemStyle={{ color: '#374151' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </div>
                {stats.fileTypeData.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-4 mt-2">
                        {stats.fileTypeData.map((entry, index) => (
                            <div key={entry.name} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                <span>{entry.name} ({entry.value})</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="md:col-span-2 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Structure Depth</h3>
                <div className="h-64">
                    {loading && stats.depthData.length === 0 ? (
                        <div className="w-full h-full flex items-center justify-center bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                            <Loader2 className="w-8 h-8 text-gray-300 animate-spin" />
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.depthData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                <XAxis dataKey="depth" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                                    contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>
        </div>
    );
}
