
const url = 'https://flightpoints.com/sitemap.xml';

async function testFetch(userAgent) {
    console.log(`Testing with User-Agent: ${userAgent}`);
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': userAgent
            },
            signal: AbortSignal.timeout(10000)
        });

        console.log(`Status: ${response.status}`);
        const text = await response.text();
        console.log(`First 100 chars: ${text.substring(0, 100)}`);

        if (text.trim().startsWith('<!DOCTYPE html>') || text.trim().startsWith('<html')) {
            console.log('Result: RECEIVED HTML (Likely blocked or error page)');
        } else if (text.trim().startsWith('<?xml') || text.trim().startsWith('<urlset') || text.trim().startsWith('<sitemapindex')) {
            console.log('Result: RECEIVED XML (Success)');
        } else {
            console.log('Result: UNKNOWN CONTENT');
        }
        console.log('---');
    } catch (e) {
        console.error(`Error: ${e.message}`);
    }
}

async function run() {
    // Test with current User-Agent
    await testFetch('XML-Nexus-Bot/1.0');

    // Test with a browser User-Agent
    await testFetch('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    // Test with Browser UA + Accept Header
    console.log('Testing with Browser UA + Accept Header');
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'application/xml, text/xml, */*; q=0.01'
            },
            signal: AbortSignal.timeout(10000)
        });

        console.log(`Status: ${response.status}`);
        const text = await response.text();
        console.log(`First 100 chars: ${text.substring(0, 100)}`);

        if (text.trim().startsWith('<!DOCTYPE html>') || text.trim().startsWith('<html')) {
            console.log('Result: RECEIVED HTML');
        } else if (text.trim().startsWith('<?xml') || text.trim().startsWith('<urlset') || text.trim().startsWith('<sitemapindex')) {
            console.log('Result: RECEIVED XML (Success)');
        } else {
            console.log('Result: UNKNOWN CONTENT');
        }
    } catch (e) {
        console.error(`Error: ${e.message}`);
    }

    // Test with Googlebot UA
    console.log('Testing with Googlebot UA');
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
                'Accept': 'application/xml, text/xml, */*; q=0.01'
            },
            signal: AbortSignal.timeout(10000)
        });

        console.log(`Status: ${response.status}`);
        const text = await response.text();
        console.log(`First 100 chars: ${text.substring(0, 100)}`);

        if (text.trim().startsWith('<!DOCTYPE html>') || text.trim().startsWith('<html')) {
            console.log('Result: RECEIVED HTML');
        } else if (text.trim().startsWith('<?xml') || text.trim().startsWith('<urlset') || text.trim().startsWith('<sitemapindex')) {
            console.log('Result: RECEIVED XML (Success)');
        } else {
            console.log('Result: UNKNOWN CONTENT');
        }
    } catch (e) {
        console.error(`Error: ${e.message}`);
    }

    // Test with Full Browser Headers
    console.log('Testing with Full Browser Headers');
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
                'Sec-Ch-Ua-Mobile': '?0',
                'Sec-Ch-Ua-Platform': '"macOS"',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'none',
                'Sec-Fetch-User': '?1',
                'Upgrade-Insecure-Requests': '1'
            },
            signal: AbortSignal.timeout(10000)
        });

        console.log(`Status: ${response.status}`);
        const text = await response.text();
        console.log(`First 100 chars: ${text.substring(0, 100)}`);

        if (text.trim().startsWith('<!DOCTYPE html>') || text.trim().startsWith('<html')) {
            console.log('Result: RECEIVED HTML');
        } else if (text.trim().startsWith('<?xml') || text.trim().startsWith('<urlset') || text.trim().startsWith('<sitemapindex')) {
            console.log('Result: RECEIVED XML (Success)');
        } else {
            console.log('Result: UNKNOWN CONTENT');
        }
    } catch (e) {
        console.error(`Error: ${e.message}`);
    }
}

run();
