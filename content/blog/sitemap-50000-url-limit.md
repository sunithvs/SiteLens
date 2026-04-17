---
title: "The 50,000 URL sitemap limit, and the other specs nobody reads"
description: "Sitemaps have real limits in the official spec. Most people ignore them until their site breaks. Here is the full list of what matters and what does not."
date: 2026-03-10
readTime: "6 min read"
tags: [sitemap, spec]
---

## The spec exists

There is an official sitemap protocol. You can read it at sitemaps.org. It is short. Most sitemap generators ignore parts of it.

Here is what actually matters.

## The hard limits

**50,000 URLs per sitemap file.** Go over and Google ignores the whole file. Not a warning. Silent drop. Your extra URLs do not get indexed and you will not know why.

**50 MB uncompressed per file.** This matches the URL limit for most sites. If you have unusually long URLs or lots of image metadata, you can hit 50 MB before 50,000 URLs.

**2,048 characters per URL.** Each `<loc>` has a max length. Most URLs are nowhere near this. Ecommerce faceted URLs sometimes are.

**50,000 entries per sitemap index.** The index file that lists other sitemaps has the same 50,000 cap. If you need more, you need a nested index.

All of these come from the spec. Google and Bing both enforce them.

## How to split a large sitemap

If you have 100,000 URLs, you need at least two sitemap files plus an index.

```
sitemap.xml (index, lists the 2 children)
sitemap-1.xml (URLs 1 to 50,000)
sitemap-2.xml (URLs 50,001 to 100,000)
```

The index looks like this:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>https://example.com/sitemap-1.xml</loc>
    <lastmod>2026-03-10</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://example.com/sitemap-2.xml</loc>
    <lastmod>2026-03-10</lastmod>
  </sitemap>
</sitemapindex>
```

Most CMS platforms do this automatically when you cross the threshold. Custom generators often forget.

## The lastmod format

`<lastmod>` must be in W3C Datetime format. Which is ISO 8601 with specific rules.

Valid:
- `2026-03-10` (date only)
- `2026-03-10T14:30:00+00:00` (date with time and timezone)
- `2026-03-10T14:30:00Z` (Z suffix for UTC)

Invalid:
- `03/10/2026` (US format)
- `10-03-2026` (UK format)  
- `March 10, 2026` (text)
- `2026-03-10 14:30:00` (missing T separator)

Invalid dates get ignored silently.

## Priority and changefreq are mostly ignored

The `<priority>` field is supposed to signal which URLs matter most on your site. It ranges from 0.0 to 1.0.

Google publicly said they do not use priority anymore. Bing probably does not either. Do not rely on it to boost anything.

The `<changefreq>` field tells Google how often the page changes (`always`, `hourly`, `daily`, `weekly`, `monthly`, `yearly`, `never`).

Also mostly ignored. Google uses its own signals to decide recrawl frequency.

You can keep these fields if your generator adds them automatically. Do not spend time manually setting them. They are not doing what you think.

## lastmod actually does matter

Unlike priority and changefreq, Google does use `<lastmod>`.

If you provide an accurate lastmod, Google can prioritize fresh content for crawl. But there is a catch: Google has said they only trust lastmod if it is accurate.

If every URL in your sitemap has today's date because your generator uses the build time instead of the content time, Google stops trusting the signal. Once you lose trust, you lose it for a long time.

**Practical rule:** either set lastmod correctly, or do not set it at all. Fake lastmod dates are worse than no lastmod.

## Encoding and escaping

URLs with special characters need URL encoding plus XML entity escaping.

A URL like:
```
https://example.com/search?q=pants&color=blue
```

Should appear in XML as:
```xml
<loc>https://example.com/search?q=pants&amp;color=blue</loc>
```

The `&` becomes `&amp;`. If you forget, the XML parser chokes and the whole file is invalid.

Other characters to escape: `<`, `>`, `"`, `'`. Most generators handle this. Hand-written XML does not.

## Gzip compression

You can serve sitemaps gzipped. Saves bandwidth on big ones. The file extension becomes `.xml.gz`.

Serve it with `Content-Type: application/gzip` and `Content-Encoding: gzip`. Google reads both gzipped and plain sitemaps.

Watch out: some CDNs double-compress and break the file. Test it by downloading with curl.

## Robots.txt declaration

Every sitemap should be declared in robots.txt:

```
Sitemap: https://example.com/sitemap.xml
```

You can have multiple Sitemap lines. One per sitemap or one per index, whichever you prefer.

This is the canonical way to tell crawlers where your sitemap lives. Google Search Console submissions are useful too, but robots.txt reaches all crawlers.

## What SiteLens checks

When you scan a site, SiteLens validates most of these automatically:

- File size (warns if any sitemap is over 50 MB)
- URL count per file (warns if any sitemap has more than 50,000 URLs)
- lastmod format (flags unparseable dates)
- Priority range (flags values outside 0.0 to 1.0)
- Mixed http and https (flags scheme inconsistency)
- Duplicate loc (flags repeated URLs)

You can see all flags at once in the Validation tab after a scan.

## Quick spec reference

| Rule | Value |
|---|---|
| Max URLs per file | 50,000 |
| Max file size | 50 MB uncompressed |
| Max URL length | 2,048 chars |
| Max entries per index | 50,000 |
| Priority range | 0.0 to 1.0 |
| Date format | ISO 8601 / W3C Datetime |
| Encoding | UTF-8 |
| Required fields | `<loc>` |
| Optional fields | `<lastmod>`, `<changefreq>`, `<priority>` |

## The practical takeaway

Most sites are nowhere near any of these limits. If you have under 10,000 URLs and a properly generated sitemap, you can ignore this post.

If you are on a big site (ecommerce, news, marketplace) or if you write your own sitemap generator, these rules matter. A silently dropped sitemap is one of the harder SEO bugs to find because nothing in Search Console screams about it.

Test your own: paste your site into [SiteLens](/) and check the Validation tab. It will tell you if anything is over limit or malformed.
