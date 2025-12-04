Product Requirement Document (PRD)

Project Name: XML Nexus (Sitemap Explorer & Visualizer)

Version: 1.0

Status: Draft

Platform: Web (Next.js)

1. Executive Summary

XML Nexus is a web-based utility tool built on Next.js designed for SEO specialists, developers, and QA engineers. It allows users to input a domain URL, automatically discover sitemap locations (via heuristics and robots.txt), and perform a recursive Depth-First Search (DFS) to traverse sitemap indices. The tool visualizes the hierarchy of sitemaps and URLs, providing a deep dive into a website's architectural structure as presented to search engines.

2. Problem Statement

Visibility: Sitemaps are often nested (sitemap_index.xml pointing to post_sitemap.xml). Viewing them manually in a browser is tedious and lacks structural context.

Discovery: Sitemaps aren't always at /sitemap.xml. Finding them requires checking robots.txt or guessing naming conventions.

Validation: It is difficult to quickly identify if a sitemap chain is broken or if specific URLs are missing from the structure without a recursive scraper.

3. Target Audience

SEO Specialists: Auditing site structure and ensuring all pages are indexed.

Web Developers: Debugging sitemap generation logic.

Competitor Analysts: Understanding how competitors structure their content.

4. Functional Requirements

4.1. Input & Discovery Module

Base URL Input: User enters a domain (e.g., example.com).

Robots.txt Parsing: The system must first fetch example.com/robots.txt to parse the Sitemap: directive.

Heuristic Fallback: If no sitemap is declared in robots.txt, the system must attempt to fetch common locations:

/sitemap.xml

/sitemap_index.xml

/sitemap-main.xml

/wp-sitemap.xml (WordPress)

Manual Override: Option for the user to input a specific full URL to a sitemap if auto-discovery fails.

4.2. The Recursive Engine (DFS)

XML Parsing: The backend must fetch and parse XML content.

Link Classification: The parser must distinguish between:

Child Sitemaps: <sitemap><loc>...</loc></sitemap> tags (Requires recursion).

Terminal URLs: <url><loc>...</loc></url> tags (End of the line).

DFS Logic:

Fetch the root XML.

If it contains Child Sitemaps, immediately recursively fetch those URLs.

Maintain a "Visited" set to prevent infinite loops.

Concurrency Control: Limit concurrent fetches to prevent banning by the target server (e.g., max 5 concurrent requests).

Depth Control: Allow users to set a "Max Depth" (default: 3) to prevent timeouts on massive sites.

4.3. Data Visualization & Output

Tree View: A collapsible/expandable directory tree showing the hierarchy.

Level 1: Root Sitemap

Level 2: Child Sitemaps

Level 3: Page URLs

Stats Dashboard:

Total Sitemaps found.

Total Pages (Terminal URLs) found.

Scan duration.

Search/Filter: Real-time filtering of the results list (e.g., "Find all URLs containing /blog/").

4.4. Export Functionality

CSV Export: Download a flat list of all discovered terminal URLs.

JSON Export: Download the full hierarchical tree structure.

5. Technical Architecture

5.1. Tech Stack

Framework: Next.js 14+ (App Router).

Language: TypeScript.

Styling: Tailwind CSS (for a responsive, clean UI).

State Management: React Context or Zustand (to manage the recursive tree state).

Icons: Lucide-React.

5.2. Backend / API Handling (Crucial)

CORS Proxying: Browsers block Cross-Origin XML requests. All fetching must happen server-side via Next.js API Routes (/api/scan).

XML Parser: Use fast-xml-parser or xml2js in the Node.js environment.

Streaming Responses: For large sites, a single HTTP response might time out. The API should ideally use Server Sent Events (SSE) or Streaming UI to push results to the client as they are found, rather than waiting for the whole scan to finish.

5.3. Error Handling Strategy

HTTP Errors: Handle 404s (Sitemap not found) and 403s (Forbidden/WAF blocks) gracefully.

Invalid XML: Detect and flag malformed XML files.

Timeouts: Implement a hard timeout per request (e.g., 5000ms).

6. UI/UX Design Specifications

6.1. Landing Page

Hero Section: Large input field "Enter Domain URL".

Action Button: "Start Exploration".

Options Toggle: "Advanced Options" (Max Depth, User-Agent selection).

6.2. The Dashboard (Post-Scan)

Layout: Two-column layout.

Left Sidebar: The Interactive Tree View (File explorer style).

Right Panel: Details pane. When a node is clicked:

If Sitemap: Show metadata (Last Modified, # of children).

If URL: Show metadata (Priority, Changefreq, Last Mod) and a "Visit" link.

6.3. Progress Indicators

Since DFS can take time, a progress log is required:

Scanning root... Found 5 sub-sitemaps.

Scanning sub-sitemap 1... Found 50 URLs.

7. Roadmap & Phasing

Phase 1: MVP (Minimum Viable Product)

Basic robots.txt + /sitemap.xml discovery.

Server-side proxy to bypass CORS.

Recursive fetching (limit depth 2).

JSON tree output visualization.

Phase 2: Usability

CSV Export.

Streaming UI (Real-time tree updates).

Search/Filter functionality within the results.

Phase 3: Advanced

Broken Link Checker: Optionally ping terminal URLs to see if they return 404.

Visual Graph: Use a library like react-flow to show a node-based graph instead of a list.

History: Save previous scans using LocalStorage.

8. Data Constraints

Max URLs: Cap result set at 10,000 URLs for browser performance protection.

Max Depth: Cap recursion at 5 levels.