'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ExternalLink } from 'lucide-react';

const SAMPLES = [
    { name: 'sunithvs.com', url: 'https://sunithvs.com' },
];

export function SampleWebsites() {
    const router = useRouter();

    const handleSampleClick = (url: string) => {
        const encodedUrl = encodeURIComponent(url);
        router.push(`/site/${encodedUrl}`);
    };

    return (
        <section className="py-12 border-y border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
            <div className="container mx-auto px-4">
                <p className="text-center text-sm font-semibold text-gray-500 uppercase tracking-wider mb-6">
                    Try these popular websites
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                    {SAMPLES.map((sample) => (
                        <button
                            key={sample.name}
                            onClick={() => handleSampleClick(sample.url)}
                            className="group flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-md transition-all text-gray-700 dark:text-gray-300 font-medium"
                        >
                            {sample.name}
                            <ExternalLink size={14} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
                        </button>
                    ))}
                </div>
            </div>
        </section>
    );
}
