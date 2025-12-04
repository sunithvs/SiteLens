import React from 'react';
import { Star } from 'lucide-react';

const TESTIMONIALS = [
    {
        name: 'Sarah Chen',
        role: 'SEO Specialist',
        content: 'SiteLens has completely changed how I audit client websites. The visual tree view makes it so easy to spot structural issues immediately.',
        initials: 'SC'
    },
    {
        name: 'Mike Ross',
        role: 'Frontend Developer',
        content: 'I use this tool to verify my sitemap generation logic. It\'s fast, accurate, and the UI is just beautiful. Highly recommended!',
        initials: 'MR'
    },
    {
        name: 'Alex Rivera',
        role: 'Product Manager',
        content: 'The best way to visualize our massive e-commerce site structure. The deep SEO analysis feature is a game changer for quick checks.',
        initials: 'AR'
    }
];

export function Testimonials() {
    return (
        <section className="py-24 bg-gray-50 dark:bg-gray-900/50">
            <div className="container mx-auto px-4">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        Loved by Developers & SEOs
                    </h2>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {TESTIMONIALS.map((t, index) => (
                        <div key={index} className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                            <div className="flex gap-1 text-yellow-400 mb-4">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={16} fill="currentColor" />
                                ))}
                            </div>
                            <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                                "{t.content}"
                            </p>
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-sm">
                                    {t.initials}
                                </div>
                                <div>
                                    <div className="font-semibold text-gray-900 dark:text-white">{t.name}</div>
                                    <div className="text-xs text-gray-500">{t.role}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
