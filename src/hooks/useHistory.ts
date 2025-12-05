import { useState, useEffect } from 'react';

export interface HistoryItem {
    url: string;
    timestamp: number;
    title?: string;
}

const STORAGE_KEY = 'sitemap-history';
const MAX_HISTORY = 50;

export function useHistory() {
    const [history, setHistory] = useState<HistoryItem[]>([]);

    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                setHistory(JSON.parse(stored));
            } catch (e) {
                console.error('Failed to parse history', e);
            }
        }
    }, []);

    const addToHistory = (url: string, title?: string) => {
        setHistory(prev => {
            // Remove existing entry for this URL if present
            const filtered = prev.filter(item => item.url !== url);

            const newItem: HistoryItem = {
                url,
                timestamp: Date.now(),
                title
            };

            const newHistory = [newItem, ...filtered].slice(0, MAX_HISTORY);

            localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
            return newHistory;
        });
    };

    const clearHistory = () => {
        setHistory([]);
        localStorage.removeItem(STORAGE_KEY);
    };

    return {
        history,
        addToHistory,
        clearHistory
    };
}
