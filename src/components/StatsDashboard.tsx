'use client';

import React, { useMemo } from 'react';
import { ScanResult, SitemapNode } from '@/lib/sitemap-scanner';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { FileText, FolderTree, AlertTriangle, Link as LinkIcon, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';

interface StatsDashboardProps {
    result: ScanResult;
    loading?: boolean;
}

const COLORS = ['#d4ff5e', '#ff9330', '#a78bfa', '#f472b6', '#60a5fa', '#fb7185'];

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
            return <div className="h-10 w-20 bg-neutral-800 rounded-lg animate-pulse" />;
        }
        return <div className="text-4xl font-black text-white tracking-tight">{value.toLocaleString()}</div>;
    };

    const statCard = (label: string, icon: React.ReactNode, iconBg: string, value: number, highlight = false) => (
        <div className={clsx(
            "p-5 rounded-3xl border relative overflow-hidden",
            highlight ? "bg-[#d4ff5e] border-[#d4ff5e] text-black" : "bg-[#141414] border-neutral-800"
        )}>
            <div className="flex items-start justify-between gap-3 mb-4">
                <div className={clsx("text-xs font-semibold uppercase tracking-wider", highlight ? "text-black/70" : "text-neutral-500")}>
                    {label}
                </div>
                <div className={clsx("w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0", iconBg)}>
                    {icon}
                </div>
            </div>
            <div className={highlight ? "text-black" : ""}>
                {highlight ? (
                    loading && value === 0
                        ? <div className="h-10 w-20 bg-black/10 rounded-lg animate-pulse" />
                        : <div className="text-4xl font-black tracking-tight">{value.toLocaleString()}</div>
                ) : (
                    showLoading(value)
                )}
            </div>
        </div>
    );

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-2">
            {statCard(
                'Total URLs',
                <LinkIcon size={16} />,
                'bg-black/10 text-black',
                result.totalUrls,
                true
            )}
            {statCard(
                'Sitemaps',
                <FolderTree size={16} className="text-[#d4ff5e]" />,
                'bg-[#d4ff5e]/10',
                result.totalSitemaps
            )}
            {statCard(
                'Max Depth',
                <FileText size={16} className="text-[#ff9330]" />,
                'bg-[#ff9330]/10',
                stats.maxDepth
            )}
            <div className="p-5 rounded-3xl border bg-[#141414] border-neutral-800 relative overflow-hidden">
                <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Errors</div>
                    <div className={clsx("w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0",
                        result.errors.length > 0 ? "bg-red-500/10 text-red-400" : "bg-neutral-800 text-neutral-500")}>
                        <AlertTriangle size={16} />
                    </div>
                </div>
                <div className={clsx("text-4xl font-black tracking-tight", result.errors.length > 0 ? "text-red-400" : "text-white")}>
                    {result.errors.length}
                </div>
            </div>

            {/* Charts */}
            <div className="col-span-2 lg:col-span-2 bg-[#141414] p-5 rounded-3xl border border-neutral-800">
                <h3 className="font-bold text-white mb-4 tracking-tight">File Type Distribution</h3>
                <div className="h-56">
                    {loading && stats.fileTypeData.length === 0 ? (
                        <div className="w-full h-full flex items-center justify-center">
                            <Loader2 className="w-8 h-8 text-neutral-700 animate-spin" />
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={stats.fileTypeData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={55}
                                    outerRadius={80}
                                    paddingAngle={4}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {stats.fileTypeData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1c1c1c', borderRadius: '12px', border: '1px solid #262626', color: '#fff' }}
                                    itemStyle={{ color: '#fafafa' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </div>
                {stats.fileTypeData.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-3 mt-3">
                        {stats.fileTypeData.map((entry, index) => (
                            <div key={entry.name} className="inline-flex items-center gap-2 text-xs text-neutral-400 bg-[#0a0a0a] border border-neutral-800 px-3 py-1 rounded-full">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                <span className="font-mono">{entry.name}</span>
                                <span className="text-neutral-600">({entry.value})</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="col-span-2 lg:col-span-2 bg-[#141414] p-5 rounded-3xl border border-neutral-800">
                <h3 className="font-bold text-white mb-4 tracking-tight">Structure Depth</h3>
                <div className="h-56">
                    {loading && stats.depthData.length === 0 ? (
                        <div className="w-full h-full flex items-center justify-center">
                            <Loader2 className="w-8 h-8 text-neutral-700 animate-spin" />
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.depthData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#262626" />
                                <XAxis dataKey="depth" axisLine={false} tickLine={false} tick={{ fill: '#737373', fontSize: 11 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#737373', fontSize: 11 }} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(212, 255, 94, 0.08)' }}
                                    contentStyle={{ backgroundColor: '#1c1c1c', borderRadius: '12px', border: '1px solid #262626', color: '#fff' }}
                                />
                                <Bar dataKey="count" fill="#d4ff5e" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>
        </div>
    );
}
