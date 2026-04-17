import { NextRequest, NextResponse } from 'next/server';

interface LinkStatus {
    url: string;
    status: number | null;
    ok: boolean;
    redirectedTo?: string;
    error?: string;
}

const CONCURRENCY = 8;
const MAX_URLS = 200;
const REQUEST_TIMEOUT_MS = 8000;

async function checkOne(url: string): Promise<LinkStatus> {
    try {
        const res = await fetch(url, {
            method: 'HEAD',
            redirect: 'follow',
            headers: { 'User-Agent': 'SiteLens-Bot/1.0' },
            signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        });
        return {
            url,
            status: res.status,
            ok: res.ok,
            redirectedTo: res.url !== url ? res.url : undefined,
        };
    } catch (e: any) {
        // Some servers reject HEAD — retry with GET
        try {
            const res = await fetch(url, {
                method: 'GET',
                redirect: 'follow',
                headers: { 'User-Agent': 'SiteLens-Bot/1.0' },
                signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
            });
            return {
                url,
                status: res.status,
                ok: res.ok,
                redirectedTo: res.url !== url ? res.url : undefined,
            };
        } catch (err: any) {
            return {
                url,
                status: null,
                ok: false,
                error: err?.name === 'TimeoutError' ? 'timeout' : err?.message || 'network error',
            };
        }
    }
}

async function runBatched(urls: string[]): Promise<LinkStatus[]> {
    const results: LinkStatus[] = [];
    let i = 0;
    const workers = Array.from({ length: CONCURRENCY }, async () => {
        while (i < urls.length) {
            const idx = i++;
            const result = await checkOne(urls[idx]);
            results[idx] = result;
        }
    });
    await Promise.all(workers);
    return results;
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const urls: string[] = Array.isArray(body?.urls) ? body.urls : [];
        if (!urls.length) {
            return NextResponse.json({ error: 'urls array required' }, { status: 400 });
        }
        const limited = urls.slice(0, MAX_URLS);
        const results = await runBatched(limited);
        return NextResponse.json({
            results,
            truncated: urls.length > MAX_URLS ? urls.length - MAX_URLS : 0,
        });
    } catch (err: any) {
        return NextResponse.json({ error: err?.message || 'Failed to check links' }, { status: 500 });
    }
}
