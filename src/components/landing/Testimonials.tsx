import React from 'react';
import { Star } from 'lucide-react';

const TESTIMONIALS = [
    {
        name: 'Sarah Chen',
        role: 'SEO Specialist',
        content: 'SiteLens has completely changed how I audit client websites. The visual tree view makes it so easy to spot structural issues immediately.',
        initials: 'SC',
        accent: 'lime',
    },
    {
        name: 'Mike Ross',
        role: 'Frontend Developer',
        content: 'I use this tool to verify my sitemap generation logic. It\'s fast, accurate, and the UI is just beautiful. Highly recommended!',
        initials: 'MR',
        accent: 'orange',
    },
    {
        name: 'Alex Rivera',
        role: 'Product Manager',
        content: 'The best way to visualize our massive e-commerce site structure. The deep SEO analysis feature is a game changer for quick checks.',
        initials: 'AR',
        accent: 'white',
    }
];

const avatarStyles = {
    lime: 'bg-[#d4ff5e] text-black',
    orange: 'bg-[#ff9330] text-black',
    white: 'bg-white text-black',
};

export function Testimonials() {
    return (
        <section className="py-20 md:py-28 bg-[#0a0a0a] border-t border-neutral-900">
            <div className="container mx-auto px-4">
                <div className="max-w-3xl mb-14 md:mb-16">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#141414] border border-neutral-800 text-xs font-medium text-neutral-400 mb-5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#d4ff5e]" />
                        LOVED BY
                    </div>
                    <h2 className="text-4xl md:text-6xl font-black text-white tracking-[-0.03em] leading-[1]">
                        Developers &<br />
                        <span className="italic text-[#d4ff5e]">SEO experts</span>
                    </h2>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                    {TESTIMONIALS.map((t, index) => (
                        <div key={index} className="bg-[#141414] p-6 md:p-7 rounded-3xl border border-neutral-800 hover:border-neutral-700 transition-colors flex flex-col">
                            <div className="flex gap-1 text-[#d4ff5e] mb-5">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={14} fill="currentColor" />
                                ))}
                            </div>
                            <p className="text-neutral-300 mb-6 leading-relaxed text-sm flex-1">
                                "{t.content}"
                            </p>
                            <div className="flex items-center gap-3 pt-4 border-t border-neutral-800">
                                <div className={`w-10 h-10 rounded-full ${avatarStyles[t.accent as keyof typeof avatarStyles]} flex items-center justify-center font-bold text-sm`}>
                                    {t.initials}
                                </div>
                                <div>
                                    <div className="font-semibold text-white text-sm">{t.name}</div>
                                    <div className="text-xs text-neutral-500">{t.role}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
