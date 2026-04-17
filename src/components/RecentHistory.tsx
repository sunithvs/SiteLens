'use client';

import React from 'react';
import Link from 'next/link';
import { Clock, ArrowRight, ArrowUpRight } from 'lucide-react';
import { useHistory } from '@/hooks/useHistory';

export function RecentHistory() {
    const { history } = useHistory();
    const recent = history.slice(0, 6);

    if (recent.length === 0) {
        return null;
    }

    return (
        <section className="py-16 md:py-20 bg-[#0a0a0a] border-t border-neutral-900">
            <div className="container mx-auto px-4">
                <div className="flex items-end justify-between mb-8 gap-4 flex-wrap">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#141414] border border-neutral-800 text-xs font-medium text-neutral-400 mb-4">
                            <Clock size={12} className="text-[#d4ff5e]" />
                            RECENT
                        </div>
                        <h2 className="text-3xl md:text-5xl font-black text-white tracking-[-0.03em] leading-[1]">
                            Your recent <span className="italic text-[#d4ff5e]">scans</span>
                        </h2>
                    </div>
                    <Link
                        href="/history"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#141414] border border-neutral-800 hover:border-neutral-600 text-sm text-neutral-300 hover:text-white font-medium transition-colors"
                    >
                        See all <ArrowRight size={14} />
                    </Link>
                </div>

                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {recent.map((item) => (
                        <Link
                            key={item.url}
                            href={`/site/${encodeURIComponent(item.url.replace(/^https?:\/\//, '').replace(/\/$/, ''))}`}
                            className="group relative p-5 bg-[#141414] rounded-3xl border border-neutral-800 hover:border-neutral-700 hover:bg-[#1a1a1a] transition-all"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0 flex-1">
                                    <h3 className="font-bold text-white truncate mb-1 text-base">
                                        {item.title || item.url}
                                    </h3>
                                    <p className="text-sm text-neutral-500 truncate font-mono">
                                        {item.url}
                                    </p>
                                </div>
                                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#1c1c1c] group-hover:bg-[#d4ff5e] group-hover:text-black text-neutral-400 transition-all flex-shrink-0">
                                    <ArrowUpRight size={14} />
                                </span>
                            </div>
                            <div className="mt-4 pt-4 border-t border-neutral-800 text-xs text-neutral-500">
                                {new Date(item.timestamp).toLocaleDateString(undefined, {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
