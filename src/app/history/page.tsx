'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Clock, Trash2, ExternalLink, Search } from 'lucide-react';
import { useHistory } from '@/hooks/useHistory';
import { Logo } from '@/components/Logo';

export default function HistoryPage() {
    const { history, clearHistory } = useHistory();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
            {/* Header */}
            <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/"
                            className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-600 dark:text-gray-300"
                        >
                            <ArrowLeft size={20} />
                        </Link>
                        <div className="flex items-center gap-2">
                            <Logo className="w-8 h-8" />
                            <span className="font-bold text-xl hidden sm:block text-gray-900 dark:text-white">History</span>
                        </div>
                    </div>

                    {history.length > 0 && (
                        <button
                            onClick={() => {
                                if (confirm('Are you sure you want to clear your history?')) {
                                    clearHistory();
                                }
                            }}
                            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-sm font-medium"
                        >
                            <Trash2 size={16} />
                            Clear History
                        </button>
                    )}
                </div>
            </header>

            {/* Content */}
            <main className="flex-1 container mx-auto px-4 py-8">
                {history.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
                            <Clock className="text-gray-400" size={40} />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No History Yet</h2>
                        <p className="text-gray-500 dark:text-gray-400 max-w-md mb-8">
                            Your recent sitemap scans will appear here. Start by scanning a website URL.
                        </p>
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors shadow-lg shadow-blue-500/20"
                        >
                            <Search size={18} />
                            Start Scanning
                        </Link>
                    </div>
                ) : (
                    <div className="max-w-4xl mx-auto space-y-4">
                        {history.map((item) => (
                            <Link
                                key={item.url}
                                href={`/site/${encodeURIComponent(item.url)}`}
                                className="group block bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md hover:border-blue-500/30 transition-all"
                            >
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-4 min-w-0">
                                        <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0 text-blue-600 dark:text-blue-400 font-bold text-lg uppercase">
                                            {(item.title || item.url).charAt(0)}
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="font-medium text-gray-900 dark:text-white truncate text-lg">
                                                {item.title || item.url}
                                            </h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                                {item.url}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 flex-shrink-0">
                                        <span className="text-sm text-gray-400 dark:text-gray-500 hidden sm:block">
                                            {new Date(item.timestamp).toLocaleDateString(undefined, {
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </span>
                                        <ExternalLink size={18} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
