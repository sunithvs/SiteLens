import { NextRequest, NextResponse } from 'next/server';
import { parseRobots, auditRobots, isAllowed } from '@/lib/robots-parser';

const REQUEST_TIMEOUT_MS = 8000;
const MAX_URLS_TO_CHECK = 500;

interface CheckBody {
    /** Domain or any URL on the target site. Used to derive robots.txt location. */
    site: string;
    /** Optional list of URLs to test against robots rules. */
    urls?: string[];
    /** Optional user agent to evaluate as. Defaults to Googlebot. */
    userAgent?: string;
}

function robotsUrl(site: string): string {
    let u: URL;
    try {
        u = new URL(site.startsWith('http') ? site : `https://${site}`);
    } catch {
        throw new Error('Invalid site URL');
    }
    return `${u.protocol}//${u.host}/robots.txt`;
}

export async function POST(req: NextRequest) {
    try {
        const body = (await req.json()) as CheckBody;
        if (!body?.site) {
            return NextResponse.json({ error: 'site required' }, { status: 400 });
        }
        const userAgent = body.userAgent || 'Googlebot';
        const url = robotsUrl(body.site);

        let res: Response;
        try {
            res = await fetch(url, {
                headers: { 'User-Agent': 'SiteLens-Bot/1.0' },
                signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
            });
        } catch (e: any) {
            return NextResponse.json({
                error: `Failed to fetch robots.txt: ${e?.message || 'network error'}`,
                fetched: false,
                url,
            }, { status: 200 });
        }

        if (res.status === 404) {
            return NextResponse.json({
                url,
                fetched: false,
                status: 404,
                error: 'robots.txt not found at this URL. Search engines will treat the entire site as allowed.',
                parsed: null,
                issues: [
                    {
                        severity: 'warning',
                        type: 'no-robots',
                        message: 'No robots.txt exists. Site is fully open to all crawlers by default.',
                    },
                ],
            });
        }

        if (!res.ok) {
            return NextResponse.json({
                url,
                fetched: false,
                status: res.status,
                error: `robots.txt returned ${res.status}. Crawlers may treat this as fully allowed or fully blocked depending on status code.`,
            }, { status: 200 });
        }

        const raw = await res.text();
        const parsed = parseRobots(raw);
        const issues = auditRobots(parsed);

        // Per-URL allow/disallow check against the chosen user agent
        let urlChecks: Array<{
            url: string;
            allowed: boolean;
            matchedRule?: { type: string; path: string };
        }> = [];

        if (Array.isArray(body.urls) && body.urls.length > 0) {
            const subset = body.urls.slice(0, MAX_URLS_TO_CHECK);
            urlChecks = subset.map((u) => {
                const result = isAllowed(parsed, u, userAgent);
                return {
                    url: u,
                    allowed: result.allowed,
                    matchedRule: result.matchedRule
                        ? { type: result.matchedRule.type, path: result.matchedRule.path }
                        : undefined,
                };
            });
        }

        return NextResponse.json({
            url,
            fetched: true,
            status: res.status,
            userAgent,
            parsed,
            issues,
            urlChecks,
            truncated: Array.isArray(body.urls) && body.urls.length > MAX_URLS_TO_CHECK
                ? body.urls.length - MAX_URLS_TO_CHECK
                : 0,
        });
    } catch (err: any) {
        return NextResponse.json(
            { error: err?.message || 'Failed to check robots' },
            { status: 500 }
        );
    }
}
