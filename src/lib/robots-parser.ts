/**
 * Minimal robots.txt parser. Implements core directives per the Google spec:
 * https://developers.google.com/search/docs/crawling-indexing/robots/robots_txt
 *
 * Returns structured rules plus an `isAllowed(url, userAgent)` matcher that
 * follows the longest-match (most specific) rule, with allow winning on a tie.
 */

export interface RobotsRule {
    type: 'allow' | 'disallow';
    path: string;
}

export interface UserAgentGroup {
    userAgents: string[];
    rules: RobotsRule[];
    crawlDelay?: number;
}

export interface ParsedRobots {
    raw: string;
    groups: UserAgentGroup[];
    sitemaps: string[];
    host?: string;
    /** Lines we could not parse, with line number and value. */
    unknownLines: Array<{ line: number; value: string }>;
    /** Syntax warnings (duplicates, malformed, etc.) */
    warnings: string[];
}

export function parseRobots(raw: string): ParsedRobots {
    const sitemaps: string[] = [];
    const groups: UserAgentGroup[] = [];
    const unknownLines: Array<{ line: number; value: string }> = [];
    const warnings: string[] = [];
    let host: string | undefined;

    let current: UserAgentGroup | null = null;
    let lastDirective: string | null = null;
    const lines = raw.split(/\r?\n/);

    for (let i = 0; i < lines.length; i++) {
        const lineNo = i + 1;
        let line = lines[i];
        // strip comments
        const hashIdx = line.indexOf('#');
        if (hashIdx >= 0) line = line.slice(0, hashIdx);
        line = line.trim();
        if (!line) continue;

        const colon = line.indexOf(':');
        if (colon < 0) {
            unknownLines.push({ line: lineNo, value: line });
            continue;
        }
        const key = line.slice(0, colon).trim().toLowerCase();
        const value = line.slice(colon + 1).trim();

        switch (key) {
            case 'user-agent': {
                // If last directive was a rule, start a new group
                if (!current || (lastDirective !== 'user-agent' && current.rules.length > 0)) {
                    current = { userAgents: [value], rules: [] };
                    groups.push(current);
                } else {
                    current.userAgents.push(value);
                }
                lastDirective = 'user-agent';
                break;
            }
            case 'allow':
            case 'disallow': {
                if (!current) {
                    // rule without a UA group — implicitly applies to *
                    current = { userAgents: ['*'], rules: [] };
                    groups.push(current);
                }
                current.rules.push({ type: key, path: value });
                lastDirective = key;
                break;
            }
            case 'crawl-delay': {
                const n = Number(value);
                if (current && !isNaN(n)) current.crawlDelay = n;
                else if (!current) warnings.push(`crawl-delay at line ${lineNo} has no user-agent context`);
                lastDirective = key;
                break;
            }
            case 'sitemap': {
                if (value) sitemaps.push(value);
                lastDirective = key;
                break;
            }
            case 'host': {
                host = value;
                lastDirective = key;
                break;
            }
            default: {
                unknownLines.push({ line: lineNo, value: `${key}: ${value}` });
            }
        }
    }

    if (groups.length === 0 && sitemaps.length === 0) {
        warnings.push('robots.txt is empty or contains no directives');
    }

    // Duplicate sitemap warning
    const seen = new Set<string>();
    for (const s of sitemaps) {
        if (seen.has(s)) warnings.push(`Duplicate sitemap declared: ${s}`);
        seen.add(s);
    }

    return { raw, groups, sitemaps, host, unknownLines, warnings };
}

/**
 * Match user-agent against rule's user-agent value. Case-insensitive substring,
 * `*` matches all.
 */
function uaMatches(ruleUa: string, ua: string): boolean {
    if (ruleUa === '*') return true;
    return ua.toLowerCase().includes(ruleUa.toLowerCase());
}

/**
 * Pick the most specific group for the given user agent. Most specific = the
 * group with a longest non-wildcard match. Falls back to `*` group.
 */
function pickGroup(parsed: ParsedRobots, userAgent: string): UserAgentGroup | undefined {
    let best: { group: UserAgentGroup; score: number } | null = null;
    for (const g of parsed.groups) {
        for (const ua of g.userAgents) {
            if (!uaMatches(ua, userAgent)) continue;
            // Wildcard scores 0; longer literal UA scores higher
            const score = ua === '*' ? 0 : ua.length;
            if (!best || score > best.score) best = { group: g, score };
        }
    }
    return best?.group;
}

/**
 * Match a path pattern against a URL path. Supports `*` wildcard and `$` end anchor
 * per Google's spec.
 */
function pathMatches(pattern: string, urlPath: string): boolean {
    if (pattern === '') return false; // empty Disallow = allow everything
    // Escape regex special chars except * and $
    const escaped = pattern
        .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
        .replace(/\*/g, '.*');
    const hasEndAnchor = escaped.endsWith('\\$');
    const re = new RegExp('^' + (hasEndAnchor ? escaped.slice(0, -2) + '$' : escaped));
    return re.test(urlPath);
}

export interface AllowedResult {
    allowed: boolean;
    matchedRule?: RobotsRule;
    group?: UserAgentGroup;
}

/**
 * Check whether a URL is allowed for the given user agent.
 * Longest matching path wins; on a tie, allow beats disallow.
 */
export function isAllowed(
    parsed: ParsedRobots,
    url: string,
    userAgent = '*'
): AllowedResult {
    let path: string;
    try {
        const u = new URL(url);
        path = u.pathname + u.search;
    } catch {
        path = url.startsWith('/') ? url : `/${url}`;
    }

    const group = pickGroup(parsed, userAgent);
    if (!group) return { allowed: true };

    let bestRule: RobotsRule | undefined;
    let bestLen = -1;

    for (const rule of group.rules) {
        if (!pathMatches(rule.path, path)) continue;
        const len = rule.path.length;
        if (len > bestLen || (len === bestLen && rule.type === 'allow' && bestRule?.type === 'disallow')) {
            bestRule = rule;
            bestLen = len;
        }
    }

    if (!bestRule) return { allowed: true, group };
    return { allowed: bestRule.type === 'allow', matchedRule: bestRule, group };
}

/**
 * Validate robots.txt for common config issues. Heuristic, not exhaustive.
 */
export function auditRobots(parsed: ParsedRobots): Array<{
    severity: 'error' | 'warning' | 'info';
    type: string;
    message: string;
}> {
    const issues: Array<{ severity: 'error' | 'warning' | 'info'; type: string; message: string }> = [];

    if (parsed.sitemaps.length === 0) {
        issues.push({
            severity: 'warning',
            type: 'no-sitemap',
            message: 'No Sitemap: directive found. Declare your sitemap so search engines can find it.',
        });
    }

    // Disallow / blocks everything for * UA — common deploy bug
    for (const g of parsed.groups) {
        const isStar = g.userAgents.includes('*');
        const blocksRoot = g.rules.some(
            (r) => r.type === 'disallow' && r.path === '/'
        );
        if (isStar && blocksRoot) {
            issues.push({
                severity: 'error',
                type: 'block-all',
                message: '`User-Agent: *` blocks the entire site with `Disallow: /`. The site will not be indexed.',
            });
        }
    }

    // Empty Disallow means allow everything — informational
    for (const g of parsed.groups) {
        const hasEmptyDisallow = g.rules.some((r) => r.type === 'disallow' && r.path === '');
        if (hasEmptyDisallow && g.rules.length === 1) {
            issues.push({
                severity: 'info',
                type: 'open-policy',
                message: `User-Agent ${g.userAgents.join(', ')} allows everything (empty Disallow).`,
            });
        }
    }

    // Unknown directives
    if (parsed.unknownLines.length > 0) {
        issues.push({
            severity: 'warning',
            type: 'unknown-lines',
            message: `${parsed.unknownLines.length} line${parsed.unknownLines.length > 1 ? 's' : ''} could not be parsed. Check syntax.`,
        });
    }

    parsed.warnings.forEach((w) =>
        issues.push({ severity: 'warning', type: 'parse-warning', message: w })
    );

    return issues;
}
