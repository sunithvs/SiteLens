'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowUpRight } from 'lucide-react';

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
        <section className="py-10 md:py-14 bg-[#0a0a0a]">
            <div className="container mx-auto px-4">
                <p className="text-center text-xs font-semibold text-neutral-500 uppercase tracking-[0.2em] mb-5">
                    Try these popular websites
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                    {SAMPLES.map((sample) => (
                        <button
                            key={sample.name}
                            onClick={() => handleSampleClick(sample.url)}
                            className="group inline-flex items-center gap-2 pl-5 pr-1 py-1 bg-[#141414] border border-neutral-800 rounded-full hover:border-[#d4ff5e]/50 hover:bg-[#1a1a1a] transition-all text-neutral-200 font-medium text-sm"
                        >
                            {sample.name}
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#d4ff5e] text-black group-hover:scale-110 transition-transform">
                                <ArrowUpRight size={14} />
                            </span>
                        </button>
                    ))}
                </div>
            </div>
        </section>
    );
}
