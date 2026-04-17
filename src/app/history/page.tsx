'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Clock, Trash2, ArrowUpRight, Search } from 'lucide-react';
import { useHistory } from '@/hooks/useHistory';
import { Logo } from '@/components/Logo';

export default function HistoryPage() {
    const { history, clearHistory } = useHistory();
    const router = useRouter();

    const goBack = () => {
        if (typeof window !== 'undefined' && window.history.length > 1) {
            router.back();
        } else {
            router.push('/');
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
            {/* Header */}
            <header className="bg-[#0a0a0a] border-b border-neutral-900 sticky top-0 z-10">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={goBack}
                            className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-[#141414] border border-neutral-800 hover:border-neutral-600 text-neutral-400 hover:text-white transition-colors"
                            title="Back"
                        >
                            <ArrowLeft size={16} />
                        </button>
                        <Logo
                            size={32}
                            wordClassName="text-lg"
                        />
                        <span className="hidden md:inline text-neutral-600 font-light text-lg">/</span>
                        <span className="hidden md:inline font-semibold text-white tracking-tight">History</span>
                    </div>

                    {history.length > 0 && (
                        <button
                            onClick={() => {
                                if (confirm('Are you sure you want to clear your history?')) {
                                    clearHistory();
                                }
                            }}
                            className="inline-flex items-center gap-2 px-4 py-2 text-red-400 hover:bg-red-500/10 border border-red-900/50 rounded-full transition-colors text-sm font-medium"
                        >
                            <Trash2 size={14} />
                            <span className="hidden sm:inline">Clear History</span>
                        </button>
                    )}
                </div>
            </header>

            {/* Content */}
            <main className="flex-1 container mx-auto px-4 py-10 md:py-16">
                {history.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-20 h-20 bg-[#141414] border border-neutral-800 rounded-3xl flex items-center justify-center mb-6">
                            <Clock className="text-neutral-500" size={36} />
                        </div>
                        <h2 className="text-3xl md:text-4xl font-black text-white mb-3 tracking-tight">No history yet</h2>
                        <p className="text-neutral-400 max-w-md mb-8">
                            Your recent sitemap scans will appear here. Start by scanning a website URL.
                        </p>
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-[#d4ff5e] hover:bg-[#e7ff8a] text-black rounded-full font-bold transition-colors"
                        >
                            <Search size={16} />
                            Start Scanning
                        </Link>
                    </div>
                ) : (
                    <div className="max-w-5xl mx-auto">
                        <div className="mb-8">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#141414] border border-neutral-800 text-xs font-medium text-neutral-400 mb-4">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#d4ff5e]" />
                                {history.length} SCAN{history.length > 1 ? 'S' : ''}
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black tracking-[-0.03em] leading-[1]">
                                Your <span className="italic text-[#d4ff5e]">recent</span> scans
                            </h1>
                        </div>
                        <div className="grid gap-3 md:grid-cols-2">
                            {history.map((item) => (
                                <Link
                                    key={item.url}
                                    href={`/site/${encodeURIComponent(item.url)}`}
                                    className="group block bg-[#141414] rounded-3xl border border-neutral-800 p-5 hover:border-neutral-700 hover:bg-[#1a1a1a] transition-all"
                                >
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-4 min-w-0">
                                            <div className="w-11 h-11 rounded-2xl bg-[#d4ff5e] flex items-center justify-center flex-shrink-0 text-black font-black text-lg uppercase">
                                                {(item.title || item.url).charAt(0)}
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="font-bold text-white truncate text-base">
                                                    {item.title || item.url}
                                                </h3>
                                                <p className="text-xs text-neutral-500 truncate font-mono mt-0.5">
                                                    {item.url}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 flex-shrink-0">
                                            <span className="text-xs text-neutral-500 hidden sm:block font-mono">
                                                {new Date(item.timestamp).toLocaleDateString(undefined, {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </span>
                                            <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-[#1c1c1c] group-hover:bg-[#d4ff5e] group-hover:text-black text-neutral-400 transition-all">
                                                <ArrowUpRight size={14} />
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
