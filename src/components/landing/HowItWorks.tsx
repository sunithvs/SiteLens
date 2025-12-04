import React from 'react';
import { ArrowRight } from 'lucide-react';

const STEPS = [
    {
        number: '01',
        title: 'Enter URL',
        description: 'Paste your website URL or direct sitemap link. We automatically detect robots.txt and sitemaps.'
    },
    {
        number: '02',
        title: 'Scan & Visualize',
        description: 'Our engine crawls your sitemap recursively, building a visual tree of your entire website structure.'
    },
    {
        number: '03',
        title: 'Analyze & Optimize',
        description: 'Drill down into specific URLs, check SEO metrics, and identify opportunities for improvement.'
    }
];

export function HowItWorks() {
    return (
        <section className="py-24 bg-gray-50 dark:bg-gray-900/50">
            <div className="container mx-auto px-4">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        How it works
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                        Get started in seconds. No sign-up required.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 relative">
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-0.5 bg-gray-200 dark:bg-gray-700 z-0"></div>

                    {STEPS.map((step, index) => (
                        <div key={index} className="relative z-10 text-center">
                            <div className="w-24 h-24 mx-auto bg-white dark:bg-gray-800 rounded-full border-4 border-gray-50 dark:border-gray-900 shadow-lg flex items-center justify-center mb-6">
                                <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">{step.number}</span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                                {step.title}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 max-w-xs mx-auto">
                                {step.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
