import React from 'react';

const STEPS = [
    {
        number: '01',
        title: 'Enter URL',
        description: 'Paste your website URL or direct sitemap link. We automatically detect robots.txt and sitemaps.',
        badge: 'Input',
    },
    {
        number: '02',
        title: 'Scan & Visualize',
        description: 'Our engine crawls your sitemap recursively, building a visual tree of your entire website structure.',
        badge: 'Process',
    },
    {
        number: '03',
        title: 'Analyze & Optimize',
        description: 'Drill down into specific URLs, check SEO metrics, and identify opportunities for improvement.',
        badge: 'Output',
    }
];

export function HowItWorks() {
    return (
        <section className="py-20 md:py-28 bg-[#0a0a0a] border-t border-neutral-900">
            <div className="container mx-auto px-4">
                <div className="max-w-3xl mb-14 md:mb-16">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#141414] border border-neutral-800 text-xs font-medium text-neutral-400 mb-5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#ff9330]" />
                        HOW IT WORKS
                    </div>
                    <h2 className="text-4xl md:text-6xl font-black text-white mb-5 tracking-[-0.03em] leading-[1]">
                        Get started in <span className="italic text-[#d4ff5e]">seconds</span>.
                    </h2>
                    <p className="text-base md:text-lg text-neutral-400">
                        No sign-up required.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                    {STEPS.map((step, index) => (
                        <div
                            key={index}
                            className="relative p-6 md:p-8 rounded-3xl bg-[#141414] border border-neutral-800 hover:border-neutral-700 transition-colors overflow-hidden"
                        >
                            {/* Number watermark */}
                            <div className="absolute -top-6 -right-2 text-[10rem] font-black text-neutral-900/80 pointer-events-none leading-none select-none">
                                {step.number}
                            </div>

                            <div className="relative z-10">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1c1c1c] border border-neutral-800 text-xs font-medium text-neutral-400 mb-6">
                                    Step {step.number}
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">
                                    {step.title}
                                </h3>
                                <p className="text-neutral-400 leading-relaxed text-sm max-w-xs">
                                    {step.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
