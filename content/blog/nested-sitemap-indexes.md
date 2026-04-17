---
title: "Nested sitemap indexes, and why most tools fail at them"
description: "Big sites chain sitemaps three or four layers deep. A lot of free tools stop at layer one. Here is how the spec actually works and how to read them properly."
date: 2026-04-06
readTime: "7 min read"
tags: [sitemap, dev]
---

## Sitemap vs sitemap index vs urlset

Three terms. They mean different things.

- A **urlset** is a sitemap that lists actual page URLs. The leaf file.
- A **sitemap index** is a file that links to other sitemap files. It is a directory, not a list of pages.
- A **sitemap** (the generic word) is either of the above depending on context.

The XML root tag tells you which one you are looking at.

```xml
<urlset xmlns="...">
  <url>
    <loc>https://example.com/page</loc>
  </url>
</urlset>
```

That is a urlset. Actual pages.

```xml
<sitemapindex xmlns="...">
  <sitemap>
    <loc>https://example.com/sitemap-posts.xml</loc>
  </sitemap>
  <sitemap>
    <loc>https://example.com/sitemap-products.xml</loc>
  </sitemap>
</sitemapindex>
```

That is a sitemap index. A list of sitemaps.

## Why big sites chain them

The hard limit is 50,000 URLs per sitemap file. An ecommerce site with 300,000 products needs six sitemap files minimum. A news site publishing 500 articles a day fills a sitemap in three months.

So they split:

- `sitemap.xml` is the index
- `sitemap-posts-1.xml` has posts 1 through 50,000
- `sitemap-posts-2.xml` has posts 50,001 through 100,000
- `sitemap-products-1.xml` has products 1 through 50,000
- and so on

Now the index has ten children. That is still fine.

But what if you have more than 50,000 sitemaps? The sitemap index file itself has the same 50,000 entry limit. So now you need a sitemap index of sitemap indexes.

```
sitemap.xml (index of indexes)
  -> sitemap-index-1.xml (index of urlsets)
       -> sitemap-posts-1.xml (urlset)
       -> sitemap-posts-2.xml (urlset)
       ...
  -> sitemap-index-2.xml (index of urlsets)
       -> ...
```

Three levels deep before you hit actual URLs. Some sites go four or five levels.

## Why most free tools break

I tried a lot of sitemap viewers before building SiteLens. Here is what I kept running into.

- Some tools only parse the first file. You paste the root sitemap and get a list of links to other sitemaps, which is useless.
- Some follow one level of nesting and stop. You see the posts sitemap but not the individual posts.
- Some try to flatten everything into one list and crash on sites with 100,000 URLs.
- Some time out after 30 seconds and give up halfway through.

The only tools that handle deep nesting properly are paid ones that charge $50 to $300 a month.

## How to handle it correctly

The algorithm is depth-first search.

1. Fetch the root URL.
2. Parse it as XML.
3. Look at the root tag.
4. If it is a `<urlset>`, collect the URLs.
5. If it is a `<sitemapindex>`, take each child `<sitemap>` loc and recurse.
6. Keep a set of URLs you have already visited to avoid loops (yes, I have seen sitemaps that link to themselves).

In pseudocode:

```
function scan(url, visited):
    if url in visited: return
    visited.add(url)
    content = fetch(url)
    xml = parse(content)
    if xml is urlset:
        return [url for url in xml.urls]
    if xml is sitemapindex:
        results = []
        for child in xml.sitemaps:
            results += scan(child.loc, visited)
        return results
```

That is the core. The production version adds:

- Concurrency control so you do not hammer the target server (I use 5 concurrent fetches max)
- Per-request timeout (10 seconds)
- Depth cap (default 5 levels, because if you are deeper than that something is wrong)
- Error tolerance: if one sitemap fails, keep scanning the others and report the failure at the end

## What SiteLens does

I built SiteLens specifically for this. Paste any URL and it walks the whole tree, no matter how deep. You see each layer as a folder node in the tree view. You can collapse and expand them.

A few real examples I tested it on:

- A news site with 40 sitemaps under one index, about 250,000 URLs total. Scans in about 15 seconds.
- An ecommerce site with a three-level index structure, 80,000 URLs. About 8 seconds.
- A WordPress site with 12 sub-sitemaps (posts, pages, categories, tags, authors). Under 3 seconds.

If a sitemap in the chain fails (404, timeout, malformed XML), SiteLens keeps going and shows you exactly which one failed in the errors panel. Partial data is better than no data.

## Testing your own nested setup

If you run a big site, check this:

1. Paste your root sitemap URL into SiteLens
2. Look at the tree. Does it match your mental model?
3. Check the total URL count. Does it match what you have in the CMS?
4. Look for errors. Any sitemap that failed to load is one Google also cannot read.

Common bugs I see:

- A sub-sitemap 404s because the path changed and the index was not updated
- A sub-sitemap returns HTML instead of XML because it got wrapped in a redirect chain
- A sub-sitemap has the wrong content type header and some parsers reject it
- A sub-sitemap is served gzipped with the wrong extension

## The short version

Nested sitemap indexes are fine. The spec supports them. They are the only way to handle a big site.

The problem is that a lot of tools pretend they work but silently only read the first layer. If you are doing SEO on a site bigger than 50,000 URLs, use a tool that actually recurses. Otherwise you are auditing a tenth of your site and calling it done.

Paste your site into [SiteLens](/) if you want to check yours.
