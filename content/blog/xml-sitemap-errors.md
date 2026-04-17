---
title: "XML sitemap errors: the full reference"
description: "Every common sitemap error, what breaks, and how to fix it. Based on real bugs I have seen in client audits."
date: 2026-04-10
readTime: "9 min read"
tags: [sitemap, validation]
---

## Why this matters

A broken sitemap does not always throw an obvious error. Google will often just ignore it. Your pages do not get indexed. You wonder why traffic is flat. Two weeks later you dig in and find a duplicate `<loc>` tag that took the whole thing down.

This post is the full list of errors I check for in every audit, and what each one actually does.

## Error 1: More than 50,000 URLs in one file

The hard spec: one sitemap file can have up to 50,000 URLs and be up to 50 MB uncompressed.

Go over either and Google will ignore the whole file. Not just the extra URLs. The whole file.

**Fix:** split into multiple sitemap files and link them from a `sitemapindex`. Each file can have 50,000. The index itself can link up to 50,000 sitemaps. So you can chain.

## Error 2: Duplicate loc tags

Two sitemap files, both listing the same URL. Or the same URL listed twice in one file.

This does not always break the sitemap, but it is a waste of crawl budget and a sign your sitemap generator is broken.

Worse case: some search engines flag it as a validation error and skip the file.

**Fix:** deduplicate at the source. If your CMS is outputting the same URL in a category sitemap and a post sitemap, pick one.

## Error 3: Invalid priority values

The `<priority>` field must be a number between 0.0 and 1.0.

I have seen:
- `priority` set to `10` (someone thought it was a scale of 1 to 10)
- `priority` with a comma instead of a dot (`0,5` from a German locale)
- `priority` missing entirely but the tag is still there

Google has publicly said they mostly ignore priority now. But invalid values still trigger validator errors in other crawlers, and they are a sign your sitemap generator is not trustworthy.

**Fix:** either set all priorities correctly or leave the field out entirely.

## Error 4: Malformed lastmod dates

The `<lastmod>` field must be in ISO 8601 format. Some examples of what works:

- `2026-04-10`
- `2026-04-10T15:30:00+00:00`
- `2026-04-10T15:30:00Z`

What does not work:
- `04/10/2026`
- `10-04-2026`
- `April 10, 2026`

If Google cannot parse the date, it falls back to the `Last-Modified` HTTP header or just ignores the hint.

**Fix:** use ISO 8601. Most CMS platforms do this right, but custom sitemap generators often get it wrong.

## Error 5: Mixed http and https

Your sitemap has:

```xml
<loc>https://example.com/page-1</loc>
<loc>http://example.com/page-2</loc>
```

This is a problem. Google treats the two as different URLs. Your site has https enabled but you are telling Google to index both schemes.

**Fix:** pick one scheme (almost always https) and use it everywhere in the sitemap.

## Error 6: Sitemap listed in robots.txt but blocked by Disallow

```
User-agent: *
Disallow: /blog/

Sitemap: https://example.com/sitemap.xml
```

And the sitemap contains `/blog/` URLs. Google gets the sitemap, reads the URLs, and then hits robots.txt which says do not crawl those. You are confusing your own crawler.

**Fix:** either unblock the URLs or remove them from the sitemap.

## Error 7: URLs in sitemap that have noindex tags

Your sitemap says "crawl this." The page itself says `<meta name="robots" content="noindex">`. Google follows both instructions, but the signal is mixed. It wastes crawl budget and confuses things.

**Fix:** if a page should not be indexed, take it out of the sitemap. The sitemap is for pages you want indexed.

## Error 8: Canonical URL does not match sitemap URL

Sitemap entry:
```
https://example.com/product/widget
```

But the page itself has:
```html
<link rel="canonical" href="https://example.com/products/widget" />
```

Google sees the conflict and may pick the canonical URL over the sitemap URL, or may just not trust either one.

**Fix:** the sitemap URL should always match the canonical. If you redirect one to the other, use the canonical URL in the sitemap.

## Error 9: Sitemap using unescaped special characters

Ampersands, angle brackets, quotes, and apostrophes need to be escaped in XML.

Wrong:
```xml
<loc>https://example.com/search?q=bananas&type=fruit</loc>
```

Right:
```xml
<loc>https://example.com/search?q=bananas&amp;type=fruit</loc>
```

Most generators handle this. Hand-written or scripted sitemaps often do not.

## Error 10: Empty or unreachable sitemap

Sitemap file exists but returns a 404, 500, or an empty body. Sounds obvious. Happens more than you think, especially after a server migration.

**Fix:** test the URL every time you touch the server config.

## The two-minute check

Paste your sitemap URL into [SiteLens](/) and go to the Validation tab. It checks all ten of these at once and tells you which ones fail and where.

I built this tab because I was running the same mental checklist manually on every client site. The list of errors stays the same. The sites change. May as well automate it.

## Quick reference

| Error | Severity | Google impact |
|---|---|---|
| >50,000 URLs | Critical | Whole file ignored |
| Duplicate loc | Warning | Wasted crawl budget |
| Invalid priority | Warning | Ignored signal |
| Malformed lastmod | Warning | Date hint lost |
| Mixed http/https | Warning | Duplicate URLs indexed |
| robots.txt conflict | Critical | Pages not crawled |
| Noindex on URL in sitemap | Warning | Wasted slot |
| Canonical mismatch | Warning | Signal confusion |
| Unescaped chars | Critical | File fails to parse |
| 404 on sitemap | Critical | No sitemap data |

## What to do next

Run your own sitemap through the validator. Fix the critical ones first. The warnings are worth cleaning up but they do not usually break indexation.

If you find something weird that is not in this list, send it over. I keep adding checks to the validator based on real bugs I see.
