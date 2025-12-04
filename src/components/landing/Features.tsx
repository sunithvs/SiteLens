import React from 'react';
import { Network, Search, Zap, Layout, FileJson, BarChart3 } from 'lucide-react';

const FEATURES = [
    {
        icon: <Network className="w-6 h-6 text-blue-600" />,
        title: 'Visual Sitemap Explorer',
        description: 'Navigate your sitemap like a file system. Understand your site structure at a glance with our interactive tree view.'
    },
    {
        icon: <Search className="w-6 h-6 text-purple-600" />,
        title: 'Deep SEO Analysis',
        description: 'Analyze individual pages for SEO best practices. Check meta tags, word counts, and status codes on demand.'
    },
    {
        icon: <BarChart3 className="w-6 h-6 text-green-600" />,
        title: 'Data Visualization',
        description: 'Get insights into your content distribution. Visualize file types, depth levels, and more with beautiful charts.'
    },
    {
        icon: <Layout className="w-6 h-6 text-orange-600" />,
        title: 'Responsive Design',
        description: 'Works perfectly on desktop, tablet, and mobile. Inspect your sitemaps from anywhere, anytime.'
    },
    {
        icon: <FileJson className="w-6 h-6 text-pink-600" />,
        title: 'Metadata Inspection',
        description: 'Instantly fetch and verify titles and descriptions for any URL in your sitemap without leaving the app.'
    },
    {
        icon: <Zap className="w-6 h-6 text-yellow-600" />,
        title: 'Lightning Fast',
        description: 'Built with Next.js for incredible performance. Handles large sitemaps with thousands of URLs with ease.'
    }
];

export function Features() {
    return (
        <section className="py-24 bg-white dark:bg-gray-900">
            <div className="container mx-auto px-4">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        Everything you need to master your sitemap
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                        SiteLens provides a comprehensive suite of tools to help you visualize, analyze, and optimize your website's structure.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {FEATURES.map((feature, index) => (
                        <div key={index} className="p-6 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-shadow">
                            <div className="w-12 h-12 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm mb-4">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                {feature.title}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
