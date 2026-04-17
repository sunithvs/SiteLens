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
            { name: '< 7 Days', value: buckets['< 7 Days'], color: '#d4ff5e' },
            { name: '< 30 Days', value: buckets['< 30 Days'], color: '#a3e635' },
            { name: '< 6 Months', value: buckets['< 6 Months'], color: '#facc15' },
            { name: '< 1 Year', value: buckets['< 1 Year'], color: '#ff9330' },
            { name: '> 1 Year', value: buckets['> 1 Year'], color: '#ef4444' },
        ];

        return { data, buckets, totalWithDate: totalWithDate.count };
    }, [result]);

    const missingDatePercentage = result.totalUrls > 0
        ? Math.round((stats.buckets['No Date'] / result.totalUrls) * 100)
        : 0;

    return (
        <div className="bg-[#141414] p-5 md:p-6 rounded-3xl border border-neutral-800 h-full flex flex-col">
            <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
                <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2 tracking-tight">
                        <Clock size={18} className="text-[#d4ff5e]" />
                        Content Freshness
                    </h3>
                    <p className="text-xs text-neutral-500 mt-1">
                        Distribution of content age based on lastmod
                    </p>
                </div>
                {missingDatePercentage > 50 && (
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#ff9330]/10 text-[#ff9330] border border-[#ff9330]/30 rounded-full text-xs font-medium">
                        <AlertCircle size={12} />
                        {missingDatePercentage}% URLs missing dates
                    </div>
                )}
            </div>

            <div className="flex-1 min-h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.data} layout="vertical" margin={{ left: 10, right: 30, top: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#262626" />
                        <XAxis type="number" hide />
                        <YAxis
                            dataKey="name"
                            type="category"
                            axisLine={false}
                            tickLine={false}
                            width={80}
                            tick={{ fill: '#737373', fontSize: 11, fontWeight: 500 }}
                        />
                        <Tooltip
                            cursor={{ fill: 'transparent' }}
                            contentStyle={{
                                backgroundColor: '#1c1c1c',
                                borderRadius: '12px',
                                border: '1px solid #262626',
                                color: '#fafafa'
                            }}
                        />
                        <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={28}>
                            {stats.data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="mt-5 grid grid-cols-2 md:grid-cols-5 gap-2 border-t border-neutral-800 pt-4">
                {stats.data.map((item) => (
                    <div key={item.name} className="bg-[#0a0a0a] border border-neutral-800 p-2.5 rounded-2xl text-center">
                        <div className="text-[10px] text-neutral-500 uppercase tracking-wider mb-1">{item.name}</div>
                        <div className="font-black text-xl" style={{ color: item.color }}>
                            {item.value.toLocaleString()}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-3 text-xs text-center text-neutral-500 font-mono">
                {stats.totalWithDate.toLocaleString()} with dates
                {stats.buckets['No Date'] > 0 && ` · ${stats.buckets['No Date'].toLocaleString()} missing`}
            </div>
        </div>
    );
}
