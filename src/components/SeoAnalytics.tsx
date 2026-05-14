'use client';

import React, { useMemo, useState } from 'react';
import { ScanResult } from '@/lib/sitemap-scanner';
import { FreshnessHeatmap } from '@/components/FreshnessHeatmap';
import { clsx } from 'clsx';
import {
    Activity, AlertTriangle, CheckCircle, Clock, Info, Layers, Link2, Loader2, ShieldCheck, XCircle
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

type Tab = 'freshness' | 'validation' | 'patterns' | 'stale' | 'links' | 'robots';

interface RobotsRule {
    type: string;
    path: string;
}

interface RobotsGroup {
    userAgents: string[];
    rules: RobotsRule[];
    crawlDelay?: number;
}

interface RobotsIssue {
    severity: 'error' | 'warning' | 'info';
    type: string;
    message: string;
}

interface RobotsUrlCheck {
    url: string;
    allowed: boolean;
    matchedRule?: { type: string; path: string };
}

interface RobotsResponse {
    url: string;
    fetched: boolean;
    status?: number;
    error?: string;
    userAgent?: string;
    parsed?: {
        raw: string;
        groups: RobotsGroup[];
        sitemaps: string[];
        host?: string;
        unknownLines: Array<{ line: number; value: string }>;
        warnings: string[];
    } | null;
    issues?: RobotsIssue[];
    urlChecks?: RobotsUrlCheck[];
    truncated?: number;
}

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

    // robots.txt audit state
    const [robotsData, setRobotsData] = useState<RobotsResponse | null>(null);
    const [robotsLoading, setRobotsLoading] = useState(false);
    const [robotsError, setRobotsError] = useState<string | null>(null);
    const [robotsUa, setRobotsUa] = useState('Googlebot');

    const siteOrigin = useMemo(() => {
        const first = result.nodes[0]?.url;
        if (!first) return '';
        try { return new URL(first).origin; } catch { return ''; }
    }, [result]);

    const runRobotsCheck = async () => {
        if (!siteOrigin) {
            setRobotsError('Could not determine site origin from scan result');
            return;
        }
        setRobotsLoading(true);
        setRobotsError(null);
        setRobotsData(null);
        try {
            const res = await fetch('/api/check-robots', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ site: siteOrigin, urls, userAgent: robotsUa }),
            });
            const data: RobotsResponse = await res.json();
            if (!res.ok && !data?.fetched) throw new Error((data as { error?: string })?.error || 'Failed to check robots');
            setRobotsData(data);
        } catch (e: unknown) {
            setRobotsError(e instanceof Error ? e.message : 'Failed to check robots');
        } finally {
            setRobotsLoading(false);
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

    const robotsBlocked = robotsData?.urlChecks?.filter((c) => !c.allowed).length || 0;

    const tabs: Array<{ id: Tab; label: string; icon: React.ElementType; badge?: number }> = [
        { id: 'freshness', label: 'Freshness', icon: Clock },
        { id: 'validation', label: 'Validation', icon: AlertTriangle, badge: errorCount + warningCount || undefined },
        { id: 'patterns', label: 'URL Patterns', icon: Layers },
        { id: 'stale', label: 'Stale URLs', icon: Activity, badge: staleCount || undefined },
        { id: 'links', label: 'Broken Links', icon: Link2 },
        { id: 'robots', label: 'Robots.txt', icon: ShieldCheck, badge: robotsBlocked || undefined },
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
                {tab === 'robots' && (
                    <RobotsPanel
                        data={robotsData}
                        loading={robotsLoading}
                        error={robotsError}
                        userAgent={robotsUa}
                        onUserAgentChange={setRobotsUa}
                        siteOrigin={siteOrigin}
                        urlCount={urls.length}
                        onRun={runRobotsCheck}
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

// ——— Robots.txt tab ———
function RobotsPanel({
    data, loading, error, userAgent, onUserAgentChange, siteOrigin, urlCount, onRun,
}: {
    data: RobotsResponse | null;
    loading: boolean;
    error: string | null;
    userAgent: string;
    onUserAgentChange: (v: string) => void;
    siteOrigin: string;
    urlCount: number;
    onRun: () => void;
}) {
    const blocked = data?.urlChecks?.filter((c) => !c.allowed) || [];
    const allowed = data?.urlChecks?.filter((c) => c.allowed) || [];

    return (
        <div className="space-y-4">
            {/* Controls */}
            <div className="bg-[#141414] rounded-3xl border border-neutral-800 p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="min-w-0">
                    <h3 className="font-bold text-white tracking-tight">Robots.txt Audit</h3>
                    <p className="text-xs text-neutral-500 mt-1 font-mono truncate">
                        {siteOrigin ? `${siteOrigin}/robots.txt` : 'No origin detected from scan'}
                    </p>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                    <label className="text-xs text-neutral-400 inline-flex items-center gap-2">
                        Crawler:
                        <select
                            value={userAgent}
                            onChange={(e) => onUserAgentChange(e.target.value)}
                            className="bg-[#0a0a0a] border border-neutral-800 rounded-full px-3 py-1.5 text-xs text-white outline-none focus:border-[#d4ff5e]/40"
                        >
                            <option value="Googlebot">Googlebot</option>
                            <option value="Googlebot-Image">Googlebot-Image</option>
                            <option value="Bingbot">Bingbot</option>
                            <option value="DuckDuckBot">DuckDuckBot</option>
                            <option value="*">Any (*)</option>
                        </select>
                    </label>
                    <button
                        onClick={onRun}
                        disabled={loading || !siteOrigin}
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#d4ff5e] hover:bg-[#e7ff8a] text-black font-bold rounded-full transition-colors disabled:opacity-50 text-sm"
                    >
                        {loading ? <Loader2 size={15} className="animate-spin" /> : <ShieldCheck size={15} />}
                        {loading ? 'Checking…' : data ? 'Re-run' : `Audit ${urlCount} URLs`}
                    </button>
                </div>
            </div>

            {error && (
                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-900/40 text-red-400 text-sm">
                    {error}
                </div>
            )}

            {data && !data.fetched && (
                <div className="p-5 rounded-2xl bg-[#ff9330]/10 border border-[#ff9330]/30 text-[#ff9330] text-sm">
                    <div className="font-semibold mb-1">robots.txt not loaded</div>
                    <div className="text-neutral-300 text-xs">{data.error}</div>
                </div>
            )}

            {data?.fetched && data.parsed && (
                <>
                    {/* Issue list */}
                    {data.issues && data.issues.length > 0 && (
                        <div className="space-y-2">
                            {data.issues.map((iss, i) => {
                                const Icon = iss.severity === 'error' ? XCircle : iss.severity === 'warning' ? AlertTriangle : Info;
                                const tone =
                                    iss.severity === 'error' ? 'text-red-400 bg-red-500/10 border-red-900/40' :
                                    iss.severity === 'warning' ? 'text-[#ff9330] bg-[#ff9330]/10 border-[#ff9330]/30' :
                                    'text-neutral-400 bg-neutral-800/40 border-neutral-800';
                                return (
                                    <div key={i} className={clsx('p-4 rounded-2xl border flex items-start gap-3', tone)}>
                                        <Icon size={16} className="flex-shrink-0 mt-0.5" />
                                        <div className="min-w-0 flex-1">
                                            <div className="text-sm font-semibold">{iss.message}</div>
                                            <div className="text-[10px] text-neutral-500 uppercase tracking-wider mt-1 font-mono">{iss.type}</div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Summary stats */}
                    {data.urlChecks && data.urlChecks.length > 0 && (
                        <div className="grid grid-cols-3 gap-3">
                            <div className="p-4 rounded-2xl bg-[#d4ff5e]/10 border border-[#d4ff5e]/30">
                                <div className="text-[10px] text-neutral-500 uppercase tracking-wider">Allowed</div>
                                <div className="text-3xl font-black text-[#d4ff5e] mt-1">{allowed.length}</div>
                            </div>
                            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-900/40">
                                <div className="text-[10px] text-neutral-500 uppercase tracking-wider">Blocked</div>
                                <div className="text-3xl font-black text-red-400 mt-1">{blocked.length}</div>
                            </div>
                            <div className="p-4 rounded-2xl bg-[#141414] border border-neutral-800">
                                <div className="text-[10px] text-neutral-500 uppercase tracking-wider">Sitemaps</div>
                                <div className="text-3xl font-black text-white mt-1">{data.parsed.sitemaps.length}</div>
                            </div>
                        </div>
                    )}

                    {/* Blocked URLs */}
                    {blocked.length > 0 && (
                        <div className="bg-[#141414] rounded-3xl border border-red-900/40 overflow-hidden">
                            <div className="px-5 py-3 border-b border-neutral-800 flex items-center gap-2">
                                <XCircle size={16} className="text-red-400" />
                                <h4 className="font-bold text-white text-sm">URLs in sitemap blocked by robots.txt ({blocked.length})</h4>
                            </div>
                            <div className="max-h-80 overflow-auto">
                                <table className="w-full text-xs">
                                    <thead className="bg-[#1a1a1a] text-[10px] text-neutral-500 uppercase tracking-wider sticky top-0">
                                        <tr>
                                            <th className="px-4 py-2 text-left font-semibold">URL</th>
                                            <th className="px-4 py-2 text-left font-semibold">Blocked by rule</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-800">
                                        {blocked.map((c) => (
                                            <tr key={c.url}>
                                                <td className="px-4 py-2 font-mono text-white truncate max-w-[400px]">{c.url}</td>
                                                <td className="px-4 py-2 font-mono text-red-400">
                                                    {c.matchedRule ? `${c.matchedRule.type} ${c.matchedRule.path}` : '—'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Parsed groups */}
                    <div className="bg-[#141414] rounded-3xl border border-neutral-800 overflow-hidden">
                        <div className="px-5 py-3 border-b border-neutral-800">
                            <h4 className="font-bold text-white text-sm">Detected rules</h4>
                        </div>
                        <div className="divide-y divide-neutral-800">
                            {data.parsed.groups.map((g, i) => (
                                <div key={i} className="p-5">
                                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                                        {g.userAgents.map((ua) => (
                                            <span key={ua} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-[#d4ff5e]/10 text-[#d4ff5e] border border-[#d4ff5e]/30">
                                                {ua}
                                            </span>
                                        ))}
                                        {g.crawlDelay !== undefined && (
                                            <span className="text-[10px] text-neutral-500 font-mono">
                                                crawl-delay: {g.crawlDelay}s
                                            </span>
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        {g.rules.map((r, j) => (
                                            <div key={j} className="flex items-center gap-3 text-xs font-mono">
                                                <span className={clsx(
                                                    'inline-block w-20 px-2 py-0.5 rounded text-center font-bold',
                                                    r.type === 'allow' ? 'bg-[#d4ff5e]/10 text-[#d4ff5e]' : 'bg-red-500/10 text-red-400'
                                                )}>
                                                    {r.type}
                                                </span>
                                                <span className="text-neutral-300 truncate">{r.path || '(empty)'}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Sitemaps declared */}
                    {data.parsed.sitemaps.length > 0 && (
                        <div className="bg-[#141414] rounded-3xl border border-neutral-800 p-5">
                            <h4 className="font-bold text-white text-sm mb-3">Declared sitemaps</h4>
                            <ul className="space-y-1 font-mono text-xs">
                                {data.parsed.sitemaps.map((s) => (
                                    <li key={s} className="text-[#d4ff5e] truncate">{s}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Raw robots.txt */}
                    <details className="bg-[#141414] rounded-3xl border border-neutral-800 overflow-hidden group">
                        <summary className="px-5 py-4 cursor-pointer text-sm font-bold text-white flex items-center justify-between">
                            Raw robots.txt
                            <span className="text-[10px] text-neutral-500 font-mono">{data.parsed.raw.split('\n').length} lines</span>
                        </summary>
                        <pre className="px-5 pb-5 text-xs text-neutral-300 font-mono whitespace-pre-wrap break-all overflow-auto max-h-96">
                            {data.parsed.raw}
                        </pre>
                    </details>
                </>
            )}
        </div>
    );
}
