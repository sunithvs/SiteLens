'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Loader2 } from 'lucide-react';

export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setLoading(true);

    // Encode the URL to pass it safely as a path segment
    // We use encodeURIComponent to ensure special chars are handled
    // The dynamic route [...url] will catch this.
    const encodedUrl = encodeURIComponent(url);
    router.push(`/site/${encodedUrl}`);
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8 flex flex-col items-center justify-center">
      <div className="max-w-2xl w-full text-center">
        <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">XML Nexus</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
          Sitemap Explorer & Visualizer
        </p>

        <form onSubmit={handleScan} className="flex gap-2 w-full max-w-xl mx-auto">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter domain or sitemap URL (e.g., example.com)"
            className="flex-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white text-lg shadow-sm"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 font-medium text-lg shadow-sm transition-all hover:shadow-md"
          >
            {loading ? <Loader2 className="animate-spin" size={24} /> : <Search size={24} />}
            Scan
          </button>
        </form>

        <div className="mt-8 text-sm text-gray-500 dark:text-gray-500">
          <p>Try: <span className="font-mono bg-gray-100 dark:bg-gray-800 px-1 rounded">seats.aero</span> or <span className="font-mono bg-gray-100 dark:bg-gray-800 px-1 rounded">awardtravelfinder.com</span></p>
        </div>
      </div>
    </main>
  );
}
