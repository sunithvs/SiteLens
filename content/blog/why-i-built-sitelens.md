---
title: "Why I built SiteLens"
description: "I kept opening competitor sitemaps in my browser to study their content strategy. The nested XML was a mess. So I built a tool. My team uses it every day now."
date: 2026-04-18
readTime: "5 min read"
tags: [founder, sitemap]
---

## The thing I did every week

Every time my team picked a new niche, I had to study what our competitors were publishing. The fastest way to see that is the sitemap. Every URL the site wants Google to see, in one file.

So I would open `https://competitor.com/sitemap.xml` in a browser tab.

Then I would find a `<sitemap>` tag pointing to another sitemap. Then another. Then another. Some sites had ten nested sitemaps. News sites had fifty.

I was scrolling through raw XML in a browser tab. Search was useless. Ctrl+F would jump around random `<loc>` tags. There was no way to filter by path. No way to see how many URLs were under `/blog/` versus `/product/`. No way to export a clean list.

I tried the usual tools. Most wanted a login. Most charged money. Most could only handle one layer of sitemap. One or two had a tree view but it broke on sites with 10,000 URLs.

None of them felt like they were built by someone who actually reads sitemaps for work.

## What I wanted

A single page. Paste a URL. See the whole tree. Click any node to drill in. Search any URL. Filter by path. Export a CSV. Free.

No login. No install. No 500-URL cap.

That was the brief.

## What SiteLens does

Here is the whole flow.

1. You paste a domain.
2. It reads `robots.txt` to find the declared sitemap.
3. If there is no sitemap listed there, it tries the usual spots (`/sitemap.xml`, `/sitemap_index.xml`, `/wp-sitemap.xml`).
4. It parses the XML and walks through nested sitemaps until it finds every URL.
5. It shows the whole thing as a tree, table, or grid.

Then you can do real work on top of that tree:

- Search and filter URLs
- Check content freshness based on `lastmod`
- Flag stale URLs that have not been updated in a year
- Validate the XML for common bugs
- Group URLs by path pattern (`/blog/*`, `/products/*`)
- Run a broken-link check across every URL in the sitemap
- Export CSV or JSON

All of it runs in the browser. No data leaves the current session.

## Why the competitor angle matters

When you look at a sitemap, you see the shape of someone's content strategy.

You see which categories they invested in. You see which ones they abandoned. You see the publishing velocity from the `lastmod` dates. You see the depth of their content hub. You see whether they redirect old URLs or just leave them floating.

A sitemap is not marketing material. It is what the site is telling Google. It is honest.

If you are doing SEO, content strategy, or competitive research, the sitemap is the first place to look. Before Ahrefs. Before Semrush. Before any paid tool. The raw truth is sitting in a file anyone can read.

## What my team does with it

My team uses SiteLens every day for a few jobs:

- **Before writing a blog post.** Check what the top 3 ranking sites have already published on the topic. Pull their `/blog/` URLs into a list. See what angles are covered and what is missing.
- **When a client onboards.** Scan their sitemap first. Find stale URLs. Find broken links. Find stuff they forgot was still live.
- **Before migrating a site.** Export the sitemap as JSON. Save it as a baseline. Migrate. Scan again. Diff.
- **Debugging indexation.** If Google is not indexing something, half the time the URL is not even in the sitemap. Half of the other half has a `noindex` or a canonical pointing elsewhere. SiteLens catches both.

None of this is rocket science. It is just faster when the tool is built for the job instead of being a 1% feature in a bigger crawler.

## What is next

I am shipping updates in public. The next three features I want to build:

- **Sitemap diff.** Compare two scans of the same site. See what was added, removed, or moved. Useful before and after migrations.
- **hreflang audit.** For sites with translations. Check that every language pair matches and that `x-default` is set.
- **Bulk SEO analyze.** Run the per-URL SEO check on every URL in a sitemap at once. Titles, descriptions, H1s, canonicals, all in one table.

If any of those would help your work, let me know. I build based on what people actually use, not what sounds good on a roadmap doc.

## Try it

Open the scanner, paste any site, and you will see the whole tree in a few seconds. It is free and there is no signup. The only state is what your browser keeps in localStorage.

Poke around. If something is broken or missing, tell me. The whole reason this tool exists is that I got tired of using tools built by people who did not care about this job.
