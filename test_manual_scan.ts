import { SitemapScanner } from './src/lib/sitemap-scanner';

const sampleXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
   <url>
      <loc>https://flightpoints.com/</loc>
      <lastmod>2024-01-01</lastmod>
      <changefreq>daily</changefreq>
      <priority>1.0</priority>
   </url>
   <url>
      <loc>https://flightpoints.com/about</loc>
   </url>
</urlset>`;

async function test() {
    console.log('Testing scanContent...');
    const scanner = new SitemapScanner();
    const result = await scanner.scanContent(sampleXml, 'https://flightpoints.com');

    console.log('Result:', JSON.stringify(result, null, 2));

    if (result.nodes.length === 1 && result.nodes[0].children?.length === 2) {
        console.log('SUCCESS: Parsed 2 URLs correctly.');
    } else {
        console.error('FAILURE: Unexpected result structure.');
        process.exit(1);
    }
}

test();
