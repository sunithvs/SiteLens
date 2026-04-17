---
title: "How to audit a sitemap before a site migration"
description: "Most ranking drops after a migration are self-inflicted. Start with the sitemap. Here is the checklist I run before every client migration."
date: 2026-03-22
readTime: "8 min read"
tags: [seo, migration]
---

## Why migrations go wrong

A site migration is when you change the domain, the CMS, the URL structure, or all three at once. It is one of the highest-risk things in SEO.

Most ranking drops after a migration are not caused by the migration itself. They are caused by the site losing URLs that were ranking, or those URLs moving to paths that Google does not follow correctly.

The sitemap is the easiest way to catch this before the migration happens. If you compare the pre-migration sitemap with the post-migration one, any URL that disappeared without a redirect is a problem.

## The 12-point checklist

Run this twice. Once a week before the migration. Once the day after. Compare the two.

### Before the migration

**1. Scan the current sitemap.** Use SiteLens or any tool that handles nested indexes. Save the JSON export as a baseline.

**2. Count URLs per section.** Group URLs by path pattern. You should see totals like `/blog/* = 1,200`, `/products/* = 8,500`. These numbers should roughly match after migration.

**3. Identify high-traffic URLs.** Pull your top 200 pages from Google Analytics or Search Console. Verify all 200 are in the current sitemap. If any are missing from the sitemap, fix that first.

**4. Check for stale content.** Run the Stale URLs tab. Decide now whether each very-stale URL should be migrated, redirected, or dropped. Do not just carry them over automatically.

**5. Run the broken-link check.** Any URL that is already 404 on the current site does not need to be migrated. Clean it up now.

**6. Export the full URL list.** CSV format. You will need this as your migration source-of-truth.

### The migration day

**7. Redirect map.** Every old URL that has traffic or backlinks needs a 301 to the new URL. Build this from your CSV export. Every URL should have a target, even if that target is the homepage.

**8. Update robots.txt.** The new site's robots.txt should point to the new sitemap URL. This is missed surprisingly often.

**9. Generate the new sitemap.** Verify it lists the new URLs, not the old ones. Check the URL count matches expectations.

### After the migration

**10. Scan the new sitemap.** Compare the URL count to the baseline. If you are missing more than 2 to 3 percent, something went wrong.

**11. Run the validator.** Check for broken XML, missing loc tags, mixed schemes. New sitemap generators often have bugs on first run.

**12. Broken-link check.** Scan every URL in the new sitemap. Any 404 is a page that did not migrate correctly.

## The one I missed

Last year I was on a migration where the client moved from WordPress to a headless CMS. The dev team built the new sitemap, the client approved it, we launched.

Traffic dropped 40 percent in the first week.

I pulled up the pre-migration JSON export I had saved in SiteLens. The old site had 8,400 URLs across four sitemap files. The new site had 5,200 URLs in one file.

Three thousand URLs had quietly not migrated. They were all legacy blog posts, years old, but many still ranked and pulled in search traffic.

The fix was to restore those URLs at their new paths, update the redirect map, and wait. Traffic came back in about a month.

If I had compared the two sitemaps on migration day instead of a week later, it would have been a 10-minute fix instead of a month of recovery.

## What I do now on every migration

This is the workflow. All of it runs in SiteLens or adjacent tools.

**1. Baseline scan.** The morning I am told a migration is planned, I scan the current sitemap and export JSON. Save it dated.

**2. URL clustering.** Note the count per path pattern. Save this somewhere visible. I usually just screenshot the URL Patterns tab and paste it in a shared doc.

**3. Traffic audit.** Pull top URLs from GSC. Check they are all in the sitemap. Flag any gaps.

**4. Stale cleanup.** Go through very stale URLs. Decide on each. Send the list to the client with a decision column.

**5. Migration day scan.** Within an hour of go-live, scan the new sitemap.

**6. Diff the counts.** Per path pattern, are we within 2 percent of the baseline? If not, find what is missing.

**7. Validation and broken links.** Both tabs. Fix any red flags same-day.

**8. One-week re-scan.** A week later, scan again. Check that any noindex or redirect changes have taken effect and the sitemap matches.

## Why the baseline matters

You cannot find a missing URL if you do not know what was there before.

I have seen migrations where no one saved the pre-migration sitemap. When things broke, the team was guessing what was missing. That guessing took weeks.

Take the export. Save it in a shared folder with the date in the filename. Takes 30 seconds.

## One more thing: the redirect map

Your redirect map should cover every URL in the pre-migration export.

Not just the ones you remember. Not just the blog posts. Every URL. Including the /author/john-smith/ page nobody reads. Including the /tag/summer-sale/ page from 2018.

Because Google remembers. If any of those URLs ever ranked or picked up a backlink, killing them without a redirect loses signal.

## The short version

1. Baseline the sitemap a week before. Save it.
2. Decide what is actually migrating versus getting dropped.
3. Build the redirect map from the full URL list.
4. Scan the new sitemap on migration day. Compare counts.
5. Validate and check broken links.

This is not complicated. It is just a lot of small steps. Most teams skip half of them because nobody owns the sitemap. Make sure someone owns it.

If you want help running the first scan, [paste your site into SiteLens](/) and export the JSON. That is the baseline.
