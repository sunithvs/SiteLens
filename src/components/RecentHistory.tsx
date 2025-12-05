'use client';

import React from 'react';
import Link from 'next/link';
import { Clock, ArrowRight, ExternalLink } from 'lucide-react';
import { useHistory } from '@/hooks/useHistory';

export function RecentHistory() {
    const { history } = useHistory();
    const recent = history.slice(0, 5);

    if (recent.length === 0) {
        return null;
    }

    return (
        <section className="py-12 bg-gray-50 dark:bg-gray-900/50 border-y border-gray-200 dark:border-gray-800">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-2">
                        <Clock className="text-blue-600 dark:text-blue-400" size={24} />
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Recent Researches</h2>
                    </div>
                    <Link
                        href="/history"
                        className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
                    >
                        See All <ArrowRight size={16} />
                    </Link>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {recent.map((item) => (
                        <Link
                            key={item.url}
                            href={`/site/${encodeURIComponent(item.url)}`}
                            className="group block p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-md hover:border-blue-500/30 transition-all"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0 flex-1">
                                    <h3 className="font-medium text-gray-900 dark:text-white truncate mb-1">
                                        {item.title || item.url}
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                        {item.url}
                                    </p>
                                </div>
                                <ExternalLink size={16} className="text-gray-400 group-hover:text-blue-500 transition-colors flex-shrink-0 mt-1" />
                            </div>
                            <div className="mt-3 text-xs text-gray-400 dark:text-gray-500">
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
