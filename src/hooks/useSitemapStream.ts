import { useState, useCallback, useRef } from 'react';
import { ScanResult, SitemapNode } from '@/lib/sitemap-scanner';

interface SitemapStreamState {
    loading: boolean;
    error: string | null;
    result: ScanResult | null;
    logs: string[];
}

export function useSitemapStream() {
    const [state, setState] = useState<SitemapStreamState>({
        loading: false,
        error: null,
        result: null,
        logs: []
    });

    // We need a ref to accumulate nodes because state updates are async/batched
    const nodesRef = useRef<SitemapNode[]>([]);
    const abortControllerRef = useRef<AbortController | null>(null);

    const startScan = useCallback(async (url: string, content?: string) => {
        // Reset state
        setState({
            loading: true,
            error: null,
            result: { nodes: [], totalUrls: 0, totalSitemaps: 0, errors: [] },
            logs: []
        });
        nodesRef.current = [];

        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();

        try {
            const response = await fetch('/api/scan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url, content }),
                signal: abortControllerRef.current.signal
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Scan failed');
            }

            if (!response.body) throw new Error('No response body');

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');

                // Keep the last partial line in the buffer
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (!line.trim()) continue;
                    try {
                        const event = JSON.parse(line);
                        handleEvent(event);
                    } catch (e) {
                        console.warn('Failed to parse NDJSON line:', line);
                    }
                }
            }

            setState(prev => ({ ...prev, loading: false }));

        } catch (err: any) {
            if (err.name === 'AbortError') {
                console.log('Scan aborted');
                return;
            }
            setState(prev => ({ ...prev, loading: false, error: err.message }));
        }
    }, []);

    const handleEvent = useCallback((event: any) => {
        if (event.type === 'node') {
            const node = event.data;
            nodesRef.current.push(node);

            // Debounce or batch updates if needed, but for now simple state update
            // We reconstruct the result object to trigger re-render
            setState(prev => {
                const currentResult = prev.result!;
                return {
                    ...prev,
                    result: {
                        ...currentResult,
                        // Reconstruct keys explicitly to avoid duplication or spread issues
                        nodes: rebuildTree(nodesRef.current),
                        totalUrls: node.type === 'url' ? currentResult.totalUrls + 1 : currentResult.totalUrls,
                        totalSitemaps: node.type === 'sitemap' ? currentResult.totalSitemaps + 1 : currentResult.totalSitemaps,
                        errors: currentResult.errors
                    }
                };
            });
        }
        else if (event.type === 'info') {
            setState(prev => ({ ...prev, logs: [...prev.logs, event.message] }));
        }
        else if (event.type === 'error') {
            setState(prev => ({
                ...prev,
                result: prev.result ? { ...prev.result, errors: [...prev.result.errors, event.error] } : null
            }));
        }
        else if (event.type === 'complete') {
            // The complete event has the authoritative final structure
            setState(prev => ({ ...prev, result: event.result, loading: false }));
        }
    }, []);

    return { ...state, startScan };
}

// Naive tree re-builder for streaming data
// This assumes nodes arrive somewhat in order, but even if mixed, we can try to attach them.
// If we receive a child, we need to find its parent. But our nodes don't have IDs or ParentIDs!
// Crucial missing piece: The `SitemapNode` structure relies on `children` array.
// But we stripped children in the stream!
// We can't reconstruct the tree without knowing who the parent is.

// FIX: When streaming 'node', we must include `parentId` or path info if we want to reconstruct.
// OR, we rely on the fact that `SitemapScanner` emits parents before children?
// Actually, `SitemapScanner` (recursive) emits children, THEN the parent container.
// That's "Post-Order" traversal.
// That makes it hard to build the tree progressively (parent doesn't exist yet).

// ALTERNATIVE: Modify the scanner to emit "Pre-Order" (Parent, then Children).
// And/Or attach a unique ID to nodes so we can link them?
// Or just return a flat list and let visualization handle it? 
// The current `SitemapVisualization` does `filteredNodes` logic which handles trees.

// LET'S MODIFY THE SCANNER TO EMIT PARENT ID?
// Actually, the simplest for "Progressive" is just to show a list (Grid/Table) filling up.
// Tree view might be broken until "complete".
// But user wants "whatever data is fetched".
// A flat list of URLs is very useful.

// Let's update `rebuildTree` to just put everything at root for now, 
// OR try to guess context? No guessing is bad.

// If we want a proper tree, we need the scanner to be smarter.
// For this iteration, let's treat the stream as a "Flat List of Discoveries".
// And on 'complete', we replace it with the perfect tree.
// This means during scanning, the "Tree View" might look like a flat list of 10,000 items.
// That's acceptable for "Progressive" feedback.
function rebuildTree(nodes: SitemapNode[]): SitemapNode[] {
    // Just return them as a flat list of roots for now.
    // This allows the user to see them appearing.
    // The "Table" and "Grid" views will work perfectly.
    // The "Tree" view will just be one level deep.
    return nodes;
}
