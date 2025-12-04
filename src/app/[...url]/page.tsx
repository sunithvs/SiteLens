import { redirect } from 'next/navigation';

export default async function CatchAll({ params }: { params: Promise<{ url: string[] }> }) {
    const { url } = await params;

    // Reconstruct the URL from the catch-all segments
    // Example: /https://example.com -> ['https:', 'example.com'] (browsers might strip //)
    // or /https%3A%2F%2Fexample.com -> ['https%3A%2F%2Fexample.com']

    const rawPath = url.map(decodeURIComponent).join('/');

    // Heuristic to fix protocol if browser stripped slashes
    // e.g. https:/example.com -> https://example.com
    let targetUrl = rawPath.replace(/^(https?):\/([^\/])/, '$1://$2');

    // If no protocol, assume https if it looks like a domain
    if (!targetUrl.startsWith('http')) {
        // If it's just "example.com", treat as "https://example.com"
        // But we should be careful not to catch random paths that aren't URLs
        if (targetUrl.includes('.')) {
            targetUrl = `https://${targetUrl}`;
        }
    }

    const encodedUrl = encodeURIComponent(targetUrl);

    redirect(`/site/${encodedUrl}`);
}
