---
title: "Stale URLs in your sitemap are eating your crawl budget"
description: "Google only crawls so much of your site each day. If half your sitemap is five years old, you are wasting the budget. Here is how to find and fix it."
date: 2026-04-02
readTime: "6 min read"
tags: [seo, sitemap]
---

## What is crawl budget

Google does not crawl every URL on your site every day. It picks how many pages to crawl based on your site's size, your server speed, and how much it trusts your content.

That is your crawl budget. A number of pages per day, roughly.

If your sitemap has 10,000 URLs and half of them have not been updated in four years, Google spends half its crawl budget re-checking old pages. That is half your budget not being spent on your new content.

This is not a huge problem for small sites. For sites with more than 5,000 URLs, especially ecommerce and news, it matters a lot.

## How to spot stale URLs

The `<lastmod>` field in the sitemap is the honest signal. If a URL says `2019-03-15`, it has not been touched in five years.

Four buckets I use when auditing:

- **Fresh**: updated in the last 30 days
- **Recent**: 30 to 90 days
- **Stale**: 90 to 365 days
- **Very stale**: over a year old
- **No lastmod**: no date at all, which is its own problem

A healthy content site should have most URLs in fresh or recent. A blog archive naturally trends stale, which is fine, but the sitemap should reflect that instead of claiming everything is current.

## The lying lastmod problem

Here is a trap I see all the time.

A site's CMS generates the sitemap. The `<lastmod>` for every URL is today's date. Every URL. Every day.

This happens when the sitemap generator uses the file system timestamp of the sitemap itself, or some kind of cache date, instead of the actual last time the page content changed.

Google has seen this pattern a lot. They now mostly ignore the lastmod field if they do not trust it.

How to check: pick a page you know has not changed in a year. Look at its lastmod in the sitemap. If it says today, your sitemap is lying.

**Fix:** configure the sitemap plugin properly. In WordPress, Yoast and Rank Math both have a setting for this. In custom CMS, make sure the generator reads from the page's actual update timestamp, not from the sitemap build time.

## What SiteLens does about this

I added a Stale URLs tab to SiteLens because I got tired of eyeballing the `lastmod` column in a spreadsheet.

You paste the site, go to the SEO Analysis tab, click Stale URLs. You see five buckets with counts. Click any bucket to see the actual URLs.

Most sites I audit have surprising results. A client last month had 3,200 URLs, of which 1,800 were marked "very stale" (over a year old). They did not realize half their sitemap was old pagination pages and archived blog categories.

## What to do with stale URLs

For each stale URL, three options:

1. **Refresh the content.** If the page is still valuable, update it. This is the best outcome. Google likes fresh content and re-indexes.
2. **Redirect it.** If the page is replaced by something newer, 301 the old URL to the new one and remove it from the sitemap.
3. **Noindex and remove.** If the page is no longer needed but you want to keep it live (for internal links or old visitors), add `noindex` and drop it from the sitemap.

Do not just delete pages. Broken links everywhere.

## Simple workflow

Here is what I do on a new audit:

1. Scan the site in SiteLens.
2. Open Stale URLs tab.
3. Copy the "very stale" bucket to a spreadsheet.
4. Go through it row by row. For each URL: refresh, redirect, or noindex.
5. Regenerate the sitemap.
6. Re-submit in Search Console.

This usually takes half a day for a site with a couple thousand URLs. The impact on crawl budget shows up in GSC within a month.

## One more thing

Empty archive pages and date-based archive pages (like `/2019/04/`) are often the biggest source of stale URLs. They are auto-generated and nobody cleans them up.

Most are low-value. If you do not actively want them indexed, pull them out of the sitemap. Yoast has a toggle for this per post type and per taxonomy.

## The quick version

If you have not looked at your own sitemap in the last six months, scan it in [SiteLens](/). Go to Stale URLs. See how bad it is. Most sites are worse than the owner thinks.

Fix the very stale bucket first. That is where the biggest crawl budget savings are.
