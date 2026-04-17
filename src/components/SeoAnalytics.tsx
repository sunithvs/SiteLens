'use client';

import React, { useMemo, useState } from 'react';
import { ScanResult } from '@/lib/sitemap-scanner';
import { FreshnessHeatmap } from '@/components/FreshnessHeatmap';
import { clsx } from 'clsx';
import {
    Activity, AlertTriangle, CheckCircle, Clock, Info, Layers, Link2, Loader2, XCircle
} from 'lucide-react';
import {
    validate,
    clusterByPattern,
    bucketByFreshness,
    terminalUrls,
    ValidationIssue,
    UrlCluster,
    FreshnessBucket,
} from '@/lib/seo-analysis';

type Tab = 'freshness' | 'validation' | 'patterns' | 'stale' | 'links';

interface Props {
    result: ScanResult;
}

interface LinkStatus {
    url: string;
    status: number | null;
    ok: boolean;
    redirectedTo?: string;
    error?: string;
}

export function SeoAnalytics({ result }: Props) {
    const [tab, setTab] = useState<Tab>('freshness');

    const issues = useMemo(() => validate(result), [result]);
    const clusters = useMemo(() => clusterByPattern(result), [result]);
    const staleBuckets = useMemo(() => bucketByFreshness(result), [result]);
    const urls = useMemo(() => terminalUrls(result), [result]);

    const errorCount = issues.filter((i) => i.severity === 'error').length;
    const warningCount = issues.filter((i) => i.severity === 'warning').length;
    const staleCount = staleBuckets.find((b) => b.tone === 'stale')!.count +
        staleBuckets.find((b) => b.tone === 'very-stale')!.count;

    const [linkResults, setLinkResults] = useState<LinkStatus[]>([]);
    const [linkLoading, setLinkLoading] = useState(false);
    const [linkError, setLinkError] = useState<string | null>(null);
    const [linkTruncated, setLinkTruncated] = useState(0);

    const runLinkCheck = async () => {
        setLinkLoading(true);
        setLinkError(null);
        setLinkResults([]);
        try {
            const res = await fetch('/api/check-links', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ urls }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.error || 'Failed to check');
            setLinkResults(data.results || []);
            setLinkTruncated(data.truncated || 0);
        } catch (e: any) {
            setLinkError(e?.message || 'Failed to check links');
        } finally {
            setLinkLoading(false);
        }
    };

    const linkStats = useMemo(() => {
        if (!linkResults.length) return null;
        return {
            ok: linkResults.filter((r) => r.ok).length,
            redirected: linkResults.filter((r) => r.ok && r.redirectedTo).length,
            errors: linkResults.filter((r) => !r.ok).length,
        };
    }, [linkResults]);

    const tabs: Array<{ id: Tab; label: string; icon: React.ElementType; badge?: number }> = [
        { id: 'freshness', label: 'Freshness', icon: Clock },
        { id: 'validation', label: 'Validation', icon: AlertTriangle, badge: errorCount + warningCount || undefined },
        { id: 'patterns', label: 'URL Patterns', icon: Layers },
        { id: 'stale', label: 'Stale URLs', icon: Activity, badge: staleCount || undefined },
        { id: 'links', label: 'Broken Links', icon: Link2 },
    ];

    return (
        <div className="h-full flex flex-col gap-4">
            {/* Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 -mb-1 flex-none">
                {tabs.map(({ id, label, icon: Icon, badge }) => (
                    <button
                        key={id}
                        onClick={() => setTab(id)}
                        className={clsx(
                            'inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all border',
                            tab === id
                                ? 'bg-[#d4ff5e] text-black border-[#d4ff5e]'
                                : 'bg-[#141414] text-neutral-300 border-neutral-800 hover:border-neutral-600 hover:text-white'
                        )}
                    >
                        <Icon size={14} />
                        {label}
                        {badge !== undefined && (
                            <span className={clsx(
                                'inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5 rounded-full text-[10px] font-bold',
                                tab === id ? 'bg-black/20 text-black' : 'bg-[#ff9330]/20 text-[#ff9330]'
                            )}>
                                {badge}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="flex-1 min-h-0 overflow-auto">
                {tab === 'freshness' && <FreshnessHeatmap result={result} />}
                {tab === 'validation' && <ValidationPanel issues={issues} />}
                {tab === 'patterns' && <PatternsPanel clusters={clusters} />}
                {tab === 'stale' && <StalePanel buckets={staleBuckets} />}
                {tab === 'links' && (
                    <LinksPanel
                        urls={urls}
                        results={linkResults}
                        loading={linkLoading}
                        error={linkError}
                        truncated={linkTruncated}
                        stats={linkStats}
                        onRun={runLinkCheck}
                    />
                )}
            </div>
        </div>
    );
}

// ——— Validation tab ———
function ValidationPanel({ issues }: { issues: ValidationIssue[] }) {
    return (
        <div className="space-y-3">
            {issues.map((issue, i) => {
                const Icon = issue.severity === 'error' ? XCircle : issue.severity === 'warning' ? AlertTriangle : issue.type === 'clean' ? CheckCircle : Info;
                const tint =
                    issue.severity === 'error' ? 'text-red-400 bg-red-500/10 border-red-900/40' :
                    issue.severity === 'warning' ? 'text-[#ff9330] bg-[#ff9330]/10 border-[#ff9330]/30' :
                    issue.type === 'clean' ? 'text-[#d4ff5e] bg-[#d4ff5e]/10 border-[#d4ff5e]/30' :
                    'text-neutral-400 bg-neutral-800/60 border-neutral-800';
                return (
                    <div key={i} className={clsx('p-5 rounded-2xl border', tint.split(' ')[1], tint.split(' ')[2])}>
                        <div className="flex items-start gap-3">
                            <Icon size={20} className={clsx('flex-shrink-0 mt-0.5', tint.split(' ')[0])} />
                            <div className="flex-1 min-w-0">
                                <div className={clsx('font-semibold text-sm', tint.split(' ')[0])}>
                                    {issue.message}
                                </div>
                                <div className="text-[10px] text-neutral-500 uppercase tracking-wider mt-1 font-mono">
                                    {issue.type}
                                </div>
                                {issue.urls && issue.urls.length > 0 && (
                                    <ul className="mt-3 space-y-1 font-mono text-xs">
                                        {issue.urls.map((u, j) => (
                                            <li key={j} className="text-neutral-400 truncate">{u}</li>
                                        ))}
                                        {issue.count !== undefined && issue.count > issue.urls.length && (
                                            <li className="text-neutral-600 italic">…and {issue.count - issue.urls.length} more</li>
                                        )}
                                    </ul>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

// ——— Patterns tab ———
function PatternsPanel({ clusters }: { clusters: UrlCluster[] }) {
    const total = clusters.reduce((sum, c) => sum + c.count, 0) || 1;
    return (
        <div className="bg-[#141414] rounded-3xl border border-neutral-800 overflow-hidden">
            <div className="px-5 py-4 border-b border-neutral-800">
                <h3 className="font-bold text-white tracking-tight">URL Patterns</h3>
                <p className="text-xs text-neutral-500 mt-1">Grouped by first path segment</p>
            </div>
            <div className="divide-y divide-neutral-800">
                {clusters.map((c) => {
                    const pct = (c.count / total) * 100;
                    return (
                        <div key={c.pattern} className="p-5">
                            <div className="flex items-center justify-between mb-2 gap-3">
                                <div className="font-mono text-sm text-white truncate">{c.pattern}</div>
                                <div className="flex items-center gap-3 flex-shrink-0">
                                    <span className="font-black text-lg text-[#d4ff5e]">{c.count}</span>
                                    <span className="text-xs text-neutral-500 font-mono w-12 text-right">{pct.toFixed(1)}%</span>
                                </div>
                            </div>
                            <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-[#d4ff5e] rounded-full"
                                    style={{ width: `${pct}%` }}
                                />
                            </div>
                            <div className="mt-3 space-y-0.5">
                                {c.samples.map((s) => (
                                    <div key={s} className="text-xs text-neutral-500 font-mono truncate">{s}</div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ——— Stale tab ———
function StalePanel({ buckets }: { buckets: FreshnessBucket[] }) {
    const [open, setOpen] = useState<string | null>(null);
    const tone: Record<FreshnessBucket['tone'], string> = {
        fresh: 'text-[#d4ff5e] bg-[#d4ff5e]/10 border-[#d4ff5e]/30',
        recent: 'text-[#a3e635] bg-[#a3e635]/10 border-[#a3e635]/30',
        stale: 'text-[#ff9330] bg-[#ff9330]/10 border-[#ff9330]/30',
        'very-stale': 'text-red-400 bg-red-500/10 border-red-900/40',
        unknown: 'text-neutral-400 bg-neutral-800/60 border-neutral-800',
    };
    return (
        <div className="space-y-3">
            {buckets.map((b) => (
                <div key={b.label} className={clsx('rounded-2xl border', tone[b.tone])}>
                    <button
                        onClick={() => setOpen(open === b.label ? null : b.label)}
                        disabled={b.count === 0}
                        className="w-full flex items-center justify-between gap-3 p-5 text-left disabled:cursor-default"
                    >
                        <div>
                            <div className="font-semibold text-sm">{b.label}</div>
                            <div className="text-[10px] text-neutral-500 uppercase tracking-wider mt-1 font-mono">
                                {b.count === 0 ? 'empty' : open === b.label ? 'click to collapse' : 'click to view URLs'}
                            </div>
                        </div>
                        <div className="text-3xl font-black">{b.count}</div>
                    </button>
                    {open === b.label && b.count > 0 && (
                        <div className="px-5 pb-5 max-h-48 overflow-auto">
                            <ul className="space-y-1 font-mono text-xs">
                                {b.urls.slice(0, 100).map((u) => (
                                    <li key={u} className="text-neutral-400 truncate">{u}</li>
                                ))}
                                {b.urls.length > 100 && (
                                    <li className="text-neutral-600 italic">…and {b.urls.length - 100} more</li>
                                )}
                            </ul>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

// ——— Links tab ———
function LinksPanel({
    urls, results, loading, error, truncated, stats, onRun,
}: {
    urls: string[];
    results: LinkStatus[];
    loading: boolean;
    error: string | null;
    truncated: number;
    stats: { ok: number; redirected: number; errors: number } | null;
    onRun: () => void;
}) {
    if (!urls.length) {
        return <div className="p-8 text-center text-neutral-500">No terminal URLs to check.</div>;
    }

    return (
        <div className="space-y-4">
            <div className="bg-[#141414] rounded-3xl border border-neutral-800 p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h3 className="font-bold text-white tracking-tight">Broken Link Checker</h3>
                    <p className="text-xs text-neutral-500 mt-1">
                        HEAD-ping each terminal URL in parallel. Max 200 URLs per run.
                    </p>
                </div>
                <button
                    onClick={onRun}
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#d4ff5e] hover:bg-[#e7ff8a] text-black font-bold rounded-full transition-colors disabled:opacity-50"
                >
                    {loading ? <Loader2 size={15} className="animate-spin" /> : <Link2 size={15} />}
                    {loading ? 'Checking…' : results.length ? 'Re-run check' : `Check ${Math.min(urls.length, 200)} URLs`}
                </button>
            </div>

            {error && (
                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-900/40 text-red-400 text-sm">
                    {error}
                </div>
            )}

            {truncated > 0 && (
                <div className="p-3 rounded-2xl bg-[#ff9330]/10 border border-[#ff9330]/30 text-[#ff9330] text-xs font-mono">
                    {truncated} URL{truncated > 1 ? 's' : ''} skipped (200 limit)
                </div>
            )}

            {stats && (
                <div className="grid grid-cols-3 gap-3">
                    <div className="p-4 rounded-2xl bg-[#d4ff5e]/10 border border-[#d4ff5e]/30">
                        <div className="text-[10px] text-neutral-500 uppercase tracking-wider">OK</div>
                        <div className="text-3xl font-black text-[#d4ff5e] mt-1">{stats.ok}</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-[#ff9330]/10 border border-[#ff9330]/30">
                        <div className="text-[10px] text-neutral-500 uppercase tracking-wider">Redirected</div>
                        <div className="text-3xl font-black text-[#ff9330] mt-1">{stats.redirected}</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-red-500/10 border border-red-900/40">
                        <div className="text-[10px] text-neutral-500 uppercase tracking-wider">Errors</div>
                        <div className="text-3xl font-black text-red-400 mt-1">{stats.errors}</div>
                    </div>
                </div>
            )}

            {results.length > 0 && (
                <div className="bg-[#141414] rounded-3xl border border-neutral-800 overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-[#1a1a1a] text-[10px] text-neutral-500 uppercase tracking-wider">
                            <tr>
                                <th className="px-4 py-3 text-left font-semibold">Status</th>
                                <th className="px-4 py-3 text-left font-semibold">URL</th>
                                <th className="px-4 py-3 text-left font-semibold">Note</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-800">
                            {results.map((r) => (
                                <tr key={r.url} className="hover:bg-[#1a1a1a]">
                                    <td className="px-4 py-2.5">
                                        <span className={clsx(
                                            'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold font-mono',
                                            r.ok
                                                ? 'bg-[#d4ff5e]/10 text-[#d4ff5e]'
                                                : r.status
                                                    ? 'bg-red-500/10 text-red-400'
                                                    : 'bg-neutral-800 text-neutral-500'
                                        )}>
                                            {r.status ?? 'ERR'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2.5 font-mono text-xs text-white truncate max-w-[400px]">{r.url}</td>
                                    <td className="px-4 py-2.5 text-xs text-neutral-400">
                                        {r.error ? r.error : r.redirectedTo ? <span className="font-mono truncate block max-w-[320px]">→ {r.redirectedTo}</span> : '—'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
