---
title: "Broken links in your sitemap are telling Google you do not know your own site"
description: "A 404 in your sitemap is a worse signal than you think. Here is why they happen, how to find them, and how to stop them coming back."
date: 2026-03-04
readTime: "6 min read"
tags: [seo, sitemap]
---

## What a broken link in a sitemap means

A sitemap is a list of URLs you want Google to crawl and index. Every one of those URLs should work.

A 404 in the sitemap says: "please index this page, also it does not exist." That is a mixed signal. Google logs it as a crawl error. Do this often enough and Google starts trusting your sitemap less.

That matters because sitemap hints only work when Google trusts them.

## Why they happen

I see the same patterns on every client site.

**1. Stale CMS exports.** You delete a blog post in WordPress. Yoast regenerates the sitemap, but only after the next publish or a cron job. For a few hours or days, the URL is gone but still in the sitemap.

**2. Slug changes without redirects.** Someone edits a post and changes the URL slug. The sitemap updates to the new slug. But the old slug is now a 404 and nobody redirected it. Internal links still point to the old one.

**3. Products going out of stock.** Ecommerce platforms sometimes return 404 for unavailable products instead of showing "out of stock." The sitemap still has them.

**4. Staging URLs in production.** A dev environment sitemap gets copied to production. Now your live sitemap has URLs like `staging.example.com/page` that never work.

**5. Hash-based redirects.** The URL works in a browser because JavaScript redirects the user. But the raw HTTP response is a 404 or an empty page. Google sees the 404.

## How to find them

Three ways.

**Quick and free:** use SiteLens. Scan the sitemap, go to SEO Analysis, open the Broken Links tab, click "Check N URLs." It does a HEAD request on up to 200 URLs in parallel. You see status, redirect targets, and errors in a table.

**Built into Google:** Search Console, under Coverage, shows "Submitted URL not found (404)." That is exactly this problem, but it only covers URLs Google has tried to crawl. New 404s take a few days to show up.

**Dev path:** a small script with `curl` or Python's `requests` library. Loop over the URL list, HEAD each one, log status codes. Takes an afternoon to write. Good if you want to run it on a schedule.

## Soft 404s

A soft 404 is when a page returns a 200 status code but the content says "page not found." The server technically says the page exists but the page itself tells the user it does not.

These are worse than normal 404s because:
- Crawlers see a 200 and do not know anything is wrong
- Users land on a dead page and bounce
- Google eventually figures it out and flags it as soft 404, but it takes longer

Common causes:
- Ecommerce "product unavailable" pages
- Old WordPress plugins that show "nothing found" instead of returning 404
- Custom 404 pages that accidentally return 200

A HEAD request check will miss soft 404s. You need to actually fetch and inspect the content, which is slower.

SiteLens currently only catches hard 404s. Soft 404 detection is on the list for the Bulk SEO Analyze feature I am building.

## Redirect chains

Not a broken link, but worth mentioning in the same breath.

If your sitemap has `https://example.com/old-url` and that URL 301s to `https://example.com/new-url`, the sitemap is wasting Google's crawl by sending it through a redirect.

Worse: chains. `/old-url` 301s to `/middle-url` which 301s to `/new-url`. Google follows up to a few hops and then gives up.

**Fix:** always put the final canonical URL in the sitemap. If you redirect A to B, put B in the sitemap, not A.

SiteLens flags URLs that were reached through a redirect in the Broken Links tab. If you see a `→` arrow pointing to a different URL, that is a redirect chain. Update the sitemap to use the target directly.

## How to stop them coming back

Fixing once is easy. Keeping it clean over time requires process.

**Regenerate the sitemap on every deploy.** Not on a cron. Not when a post is published. On every deploy. If your sitemap generator is cached, invalidate the cache.

**Validate in CI.** Every new sitemap should be validated before going live. SiteLens has an API endpoint you can hit (`POST /api/check-links` with a URL list) to automate this.

**Monitor weekly.** Set a reminder. Scan your own sitemap once a week. Look at the broken links count. If it goes above zero, fix it same day.

**Redirect everything.** Any time you delete a page or change a URL, set up a 301. Every time. No exceptions. Your sitemap should never list a URL that does not work.

## What my process looks like

Every Monday I scan the top five sites my team is working on. Each takes about two minutes:

1. Open SiteLens
2. Paste the site
3. Wait for the scan (usually under 10 seconds for most sites)
4. Open the Broken Links tab
5. Click "Check 200 URLs"
6. Fix anything red

If the same site has broken links two weeks in a row, I know something in their process is broken. I dig into why and fix it at the source.

For my own sites I run this weekly. For clients I run it before every handoff.

## The short version

A broken link in your sitemap costs you:

- Crawl budget
- Google's trust in your sitemap
- User clicks that land on dead pages

Fix them. Keep them fixed. The tools to find them are free now. There is no excuse.

If you have not checked yours in the last month, [scan it in SiteLens](/) right now. Three clicks, thirty seconds. You will find something.
