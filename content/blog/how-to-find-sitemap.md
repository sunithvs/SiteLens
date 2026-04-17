---
title: "How to find any website's sitemap (5 methods that still work)"
description: "The sitemap tells you what a site wants Google to see. Here are five ways to find it, ranked by how often they actually work."
date: 2026-04-14
readTime: "6 min read"
tags: [sitemap, guide]
---

## Why you want the sitemap

The sitemap is the fastest way to read what a site is doing. Every URL they want indexed sits in one XML file. No ad copy, no marketing talk, just a list of pages.

If you are doing SEO work, content research, or studying a competitor, this is where you start.

Here are the five ways I actually use to find one.

## Method 1: Try /sitemap.xml first

Ninety percent of the time, the sitemap is at:

```
https://example.com/sitemap.xml
```

Open it in a browser. If you see XML, you found it. If you see a 404, move to method 2.

For WordPress sites it might be at `/wp-sitemap.xml` or `/sitemap_index.xml`. For Shopify it is usually `/sitemap.xml`. For Webflow same. Most CMS platforms default to `/sitemap.xml`.

## Method 2: Check robots.txt

Every site should declare its sitemap in `robots.txt`. Open:

```
https://example.com/robots.txt
```

Look for a line that starts with `Sitemap:`. There can be more than one.

```
User-agent: *
Disallow: /admin

Sitemap: https://example.com/sitemap.xml
Sitemap: https://example.com/news-sitemap.xml
```

If the site owner did their job, this is the source of truth. If they did not, it will be missing or pointing at an old URL.

## Method 3: Google Search Console

If you own the site, this is the best method. Go to Search Console, open the **Sitemaps** report, and every sitemap you have submitted is listed with its status and URL count.

You also get the URLs Google has actually crawled, which is different from what you submitted. If those numbers do not match, something is wrong.

## Method 4: Site operator on Google

If the site owner hid the sitemap and there is nothing in `robots.txt`, search Google directly:

```
site:example.com filetype:xml
```

This sometimes surfaces the sitemap if Google indexed it. Not reliable, but worth trying when the other methods fail.

## Method 5: Just let a tool find it for you

This is what I do now. Paste the domain into SiteLens. It does methods 1 and 2 in parallel, tries the common patterns automatically, and shows you the full tree.

Behind the scenes it tries these in parallel:

- `/robots.txt` parsing for `Sitemap:` directives
- `/sitemap.xml`
- `/sitemap_index.xml`
- `/wp-sitemap.xml`
- `/sitemap-main.xml`
- `/sitemap-1.xml`

If any return valid XML, you see the tree. If not, you get a clear error so you know to look elsewhere.

## Edge cases worth knowing

**Nested sitemap indexes.** Big sites split their sitemaps into multiple files and link them from a parent `sitemap_index.xml`. A single tool needs to follow all those links. Most free validators only read the first level.

**News sitemaps.** Google News has its own sitemap format with time-sensitive fields. They are usually at a separate URL like `/news-sitemap.xml`.

**Image and video sitemaps.** These use extra namespaces (`image:`, `video:`) inside the same file or a separate file.

**Gzipped sitemaps.** Files ending in `.xml.gz`. Every modern tool handles them, but a browser will download instead of showing. Use a tool.

**Manually excluded URLs.** Some sites intentionally keep URLs out of the sitemap even if they are live. That is on purpose, not a bug.

## Quick checklist

| Try | Where | When it works |
|---|---|---|
| `/sitemap.xml` | Browser | Most sites |
| `/robots.txt` | Browser | Sites that declare it properly |
| Search Console | If you own it | Always |
| `site:` operator | Google | As last resort |
| SiteLens | Scanner | Any site, any format |

## The honest answer

If you are going to look at sitemaps more than twice a month, do not keep guessing URLs. Paste a domain into [SiteLens](/) and let the tool handle discovery. It is what I built it for.

If you only need a quick peek, method 1 and 2 will cover you ninety percent of the time.
