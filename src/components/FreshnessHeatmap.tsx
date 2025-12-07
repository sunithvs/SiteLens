'use client';

import { useMemo } from 'react';
import { ScanResult, SitemapNode } from '@/lib/sitemap-scanner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Calendar, Clock, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';

interface FreshnessHeatmapProps {
    result: ScanResult;
}

export function FreshnessHeatmap({ result }: FreshnessHeatmapProps) {
    const stats = useMemo(() => {
        const now = new Date();
        const buckets = {
            '< 7 Days': 0,
            '< 30 Days': 0,
            '< 6 Months': 0,
            '< 1 Year': 0,
            '> 1 Year': 0,
            'No Date': 0
        };

        const totalWithDate = { count: 0 };

        const processNode = (nodes: SitemapNode[]) => {
            nodes.forEach(node => {
                if (node.type === 'url') {
                    if (!node.lastmod) {
                        buckets['No Date']++;
                    } else {
                        try {
                            const date = new Date(node.lastmod);
                            const diffTime = Math.abs(now.getTime() - date.getTime());
                            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                            if (diffDays <= 7) buckets['< 7 Days']++;
                            else if (diffDays <= 30) buckets['< 30 Days']++;
                            else if (diffDays <= 180) buckets['< 6 Months']++;
                            else if (diffDays <= 365) buckets['< 1 Year']++;
                            else buckets['> 1 Year']++;

                            totalWithDate.count++;
                        } catch (e) {
                            buckets['No Date']++;
                        }
                    }
                }
                if (node.children) processNode(node.children);
            });
        };

        processNode(result.nodes);

        const data = [
            { name: '< 7 Days', value: buckets['< 7 Days'], color: '#10b981' }, // Green
            { name: '< 30 Days', value: buckets['< 30 Days'], color: '#34d399' },
            { name: '< 6 Months', value: buckets['< 6 Months'], color: '#fbbf24' }, // Yellow
            { name: '< 1 Year', value: buckets['< 1 Year'], color: '#f59e0b' }, // Orange
            { name: '> 1 Year', value: buckets['> 1 Year'], color: '#ef4444' }, // Red
        ];

        return { data, buckets, totalWithDate: totalWithDate.count };
    }, [result]);

    const missingDatePercentage = result.totalUrls > 0
        ? Math.round((stats.buckets['No Date'] / result.totalUrls) * 100)
        : 0;

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <Clock size={20} className="text-blue-500" />
                        Content Freshness
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Distribution of content age based on lastmod
                    </p>
                </div>
                {missingDatePercentage > 50 && (
                    <div className="flex items-center gap-2 px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full text-xs font-medium">
                        <AlertCircle size={14} />
                        {missingDatePercentage}% URLs missing dates
                    </div>
                )}
            </div>

            <div className="flex-1 min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.data} layout="vertical" margin={{ left: 20, right: 30, top: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e5e7eb" opacity={0.5} />
                        <XAxis type="number" hide />
                        <YAxis
                            dataKey="name"
                            type="category"
                            axisLine={false}
                            tickLine={false}
                            width={80}
                            tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 500 }}
                        />
                        <Tooltip
                            cursor={{ fill: 'transparent' }}
                            contentStyle={{
                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                borderRadius: '8px',
                                border: 'none',
                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                color: '#1f2937'
                            }}
                        />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32}>
                            {stats.data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Legend / Insight */}
            <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-2 border-t border-gray-100 dark:border-gray-700 pt-4">
                {stats.data.map((item) => (
                    <div key={item.name} className="bg-gray-50 dark:bg-gray-900/50 p-2 rounded text-center">
                        <div className="text-xs text-gray-500 mb-1">{item.name}</div>
                        <div className="font-bold text-gray-900 dark:text-white" style={{ color: item.color }}>
                            {item.value.toLocaleString()}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-4 text-xs text-center text-gray-400">
                Total URLs with dates: {stats.totalWithDate.toLocaleString()}
                {stats.buckets['No Date'] > 0 && ` • Missing dates: ${stats.buckets['No Date'].toLocaleString()}`}
            </div>
        </div>
    );
}
