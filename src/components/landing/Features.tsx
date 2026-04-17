import React from 'react';
import { Network, Search, Zap, Layout, FileJson, BarChart3 } from 'lucide-react';

const FEATURES = [
    {
        icon: Network,
        title: 'Visual Sitemap Explorer',
        description: 'Navigate your sitemap like a file system. Understand your site structure at a glance with our interactive tree view.',
        accent: 'lime',
    },
    {
        icon: Search,
        title: 'Deep SEO Analysis',
        description: 'Analyze individual pages for SEO best practices. Check meta tags, word counts, and status codes on demand.',
        accent: 'orange',
    },
    {
        icon: BarChart3,
        title: 'Data Visualization',
        description: 'Get insights into your content distribution. Visualize file types, depth levels, and more with beautiful charts.',
        accent: 'lime',
    },
    {
        icon: Layout,
        title: 'Responsive Design',
        description: 'Works perfectly on desktop, tablet, and mobile. Inspect your sitemaps from anywhere, anytime.',
        accent: 'neutral',
    },
    {
        icon: FileJson,
        title: 'Metadata Inspection',
        description: 'Instantly fetch and verify titles and descriptions for any URL in your sitemap without leaving the app.',
        accent: 'orange',
    },
    {
        icon: Zap,
        title: 'Lightning Fast',
        description: 'Built with Next.js for incredible performance. Handles large sitemaps with thousands of URLs with ease.',
        accent: 'lime',
    }
];

const accentStyles = {
    lime: 'bg-[#d4ff5e] text-black',
    orange: 'bg-[#ff9330] text-black',
    neutral: 'bg-white text-black',
};

export function Features() {
    return (
        <section className="py-20 md:py-28 bg-[#0a0a0a]">
            <div className="container mx-auto px-4">
                <div className="max-w-3xl mb-14 md:mb-20">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#141414] border border-neutral-800 text-xs font-medium text-neutral-400 mb-5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#d4ff5e]" />
                        FEATURES
                    </div>
                    <h2 className="text-4xl md:text-6xl font-black text-white mb-5 tracking-[-0.03em] leading-[1]">
                        Everything you need to<br />
                        master your <span className="italic text-[#d4ff5e]">sitemap</span>
                    </h2>
                    <p className="text-base md:text-lg text-neutral-400 max-w-2xl">
                        SiteLens provides a comprehensive suite of tools to help you visualize, analyze, and optimize your website's structure.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {FEATURES.map((feature, index) => {
                        const Icon = feature.icon;
                        return (
                            <div
                                key={index}
                                className="group relative p-6 md:p-7 rounded-3xl bg-[#141414] border border-neutral-800 hover:border-neutral-700 hover:bg-[#1a1a1a] transition-all"
                            >
                                <div className={`w-12 h-12 rounded-2xl ${accentStyles[feature.accent as keyof typeof accentStyles]} flex items-center justify-center mb-5`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2 tracking-tight">
                                    {feature.title}
                                </h3>
                                <p className="text-neutral-400 leading-relaxed text-sm">
                                    {feature.description}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
