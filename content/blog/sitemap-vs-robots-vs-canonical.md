---
title: "Sitemap vs robots.txt vs canonical: what each one actually does"
description: "Three different files, three different jobs. Everyone mixes them up and bad things happen. Here is what each one controls and how they fight each other."
date: 2026-03-16
readTime: "7 min read"
tags: [seo, guide]
---

## The three tools

When you tell Google what to do with your site, you have three main tools. Each does a different job.

- **sitemap.xml**: here is the list of URLs I want you to know about
- **robots.txt**: here is what you are allowed and not allowed to crawl
- **canonical tag**: for these two similar URLs, this one is the real version

They look related. They are. But they control different layers.

## sitemap.xml

A sitemap is a suggestion. It says "these are the URLs I care about, please consider crawling them."

Google does not have to crawl them. It does not have to index them. The sitemap is a hint, not a command.

What it is for:
- Helping Google discover URLs that are not well-linked internally
- Providing lastmod hints so Google knows what changed recently
- Structuring large sites into digestible chunks

What it is not for:
- Forcing Google to index anything
- Blocking anything
- Overriding a noindex tag

## robots.txt

Robots.txt controls crawling. Not indexing. Big difference.

If I say `Disallow: /admin/` in robots.txt, Google will not crawl `/admin/` pages. It will not fetch them.

But if someone else links to `/admin/login` and that link gets indexed, Google may still list the URL in search results with no description, just because the URL exists. You blocked crawling, not indexing.

What robots.txt is for:
- Preventing server load from crawlers on admin, staging, and huge parameter pages
- Declaring where your sitemap is
- User-agent specific rules (block bad bots)

What it is not for:
- Preventing a URL from appearing in search results (use noindex for that)
- Protecting private content (anyone can read robots.txt)

## canonical tag

A canonical tells Google "of all the URLs that show this content, the real one is this URL."

```html
<link rel="canonical" href="https://example.com/products/widget" />
```

Use it when you have:
- Tracking parameters (`?utm_source=twitter`) that create duplicate URLs
- Print versions or mobile versions
- Faceted navigation that generates many URL variations of the same product
- Similar products that share content

What canonical is for:
- Consolidating ranking signals to one URL
- Preventing duplicate content issues
- Picking a preferred version

What it is not for:
- Blocking crawl (use robots.txt)
- Preventing indexing (use noindex)

## The fights

Now for the fun part. When these three disagree, bad things happen.

### Fight 1: URL in sitemap but blocked by robots.txt

You have `/blog/*` in your sitemap. Your robots.txt says `Disallow: /blog/`.

What happens: Google sees the sitemap, tries to crawl the URL, robots.txt blocks it. Google logs a warning in Search Console and cannot index the page.

**Fix:** pick one. Either unblock in robots.txt and let Google crawl, or remove from the sitemap.

### Fight 2: URL in sitemap but has noindex

Sitemap says "please index this page." The page's HTML has `<meta name="robots" content="noindex">`.

What happens: Google crawls the page, reads the noindex, does not index it. Wasted crawl budget. Confusing signal.

**Fix:** if you want it indexed, remove the noindex. If you do not, remove from the sitemap.

### Fight 3: Sitemap URL has different canonical

Sitemap lists `https://example.com/product/widget`. The page at that URL has a canonical pointing to `https://example.com/products/widget` (different path).

What happens: Google sees the sitemap URL, visits it, sees the canonical points elsewhere, and usually indexes the canonical URL instead. The sitemap URL is ignored.

**Fix:** the sitemap should always list the canonical URL, not the alternate.

### Fight 4: Canonical points to a URL that is blocked by robots.txt

You canonical page A to page B. Robots.txt blocks page B.

What happens: Google cannot crawl page B to verify it exists. The canonical is ignored. Page A may or may not get indexed depending on mood.

**Fix:** the canonical target must be crawlable.

## The simple rule

Each tool has one job. Use the right one:

- Want Google to know about a URL? Put it in the sitemap.
- Want to block crawling of some part of the site? Use robots.txt.
- Want a URL to not appear in search? Use noindex.
- Have duplicate URLs showing the same content? Use canonical to pick the real one.

If you find yourself stacking multiple signals on the same URL, you probably misunderstood which tool controls what.

## How SiteLens catches conflicts

The validation tab in SiteLens flags some of these automatically:

- URLs in the sitemap that return a non-200 status
- Sitemap URLs with mixed http and https
- Duplicate loc tags

I am working on adding:

- URL in sitemap that is blocked by robots.txt
- URL in sitemap whose page has a canonical pointing elsewhere
- URL in sitemap whose page has noindex

That last one needs to fetch every page, which is slower. It will probably live in the Bulk SEO Analyze tab when I ship it.

## Quick reference

| Tool | Controls | Goes where |
|---|---|---|
| sitemap.xml | Discovery hints | XML file, declared in robots.txt |
| robots.txt | Crawling allowed or blocked | Plain text at `/robots.txt` |
| meta robots noindex | Indexing allowed or blocked | `<meta>` in page HTML |
| canonical | Preferred URL among duplicates | `<link rel="canonical">` in HTML |

## The takeaway

Sitemap, robots, and canonical are not interchangeable. Most SEO bugs I find in audits come from someone using one when they meant another. If you catch yourself stacking them on the same URL, stop and think about which layer you actually need to control.

Quick audit: scan your site in [SiteLens](/) and check the validation tab for obvious conflicts. Then spot-check the top 10 URLs manually for canonical and noindex mismatches.
