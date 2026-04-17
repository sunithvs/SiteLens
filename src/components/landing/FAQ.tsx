'use client';

import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { clsx } from 'clsx';
import { JsonLd } from '@/components/JsonLd';
import { faqSchema } from '@/lib/schema';

const FAQS = [
    {
        question: 'What is a Sitemap?',
        answer: 'A sitemap is a file where you provide information about the pages, videos, and other files on your site, and the relationships between them. Search engines like Google read this file to more intelligently crawl your site.'
    },
    {
        question: 'Does SiteLens store my data?',
        answer: 'No. SiteLens scans your sitemap in real-time. We do not store your sitemap data or crawl results permanently. Everything is processed on-the-fly for your session.'
    },
    {
        question: 'Can I scan large sitemaps?',
        answer: 'Yes! SiteLens is optimized for performance and can handle sitemaps with thousands of URLs. It uses a recursive scanning engine to handle nested sitemaps efficiently.'
    },
    {
        question: 'Is it free to use?',
        answer: 'Yes, SiteLens is completely free to use for analyzing public sitemaps.'
    }
];

export function FAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <section className="py-20 md:py-28 bg-[#0a0a0a] border-t border-neutral-900">
            <JsonLd data={faqSchema(FAQS.map(f => ({ question: f.question, answer: f.answer })))} />
            <div className="container mx-auto px-4 max-w-3xl">
                <div className="mb-12 md:mb-14">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#141414] border border-neutral-800 text-xs font-medium text-neutral-400 mb-5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#ff9330]" />
                        FAQ
                    </div>
                    <h2 className="text-4xl md:text-6xl font-black text-white tracking-[-0.03em] leading-[1]">
                        Questions?<br />
                        We have <span className="italic text-[#d4ff5e]">answers</span>.
                    </h2>
                </div>

                <div className="space-y-3">
                    {FAQS.map((faq, index) => {
                        const open = openIndex === index;
                        return (
                            <div
                                key={index}
                                className={clsx(
                                    "rounded-3xl border overflow-hidden transition-colors",
                                    open ? "bg-[#141414] border-neutral-700" : "bg-[#141414] border-neutral-800 hover:border-neutral-700"
                                )}
                            >
                                <button
                                    onClick={() => setOpenIndex(open ? null : index)}
                                    className="w-full flex items-center justify-between p-5 md:p-6 text-left"
                                >
                                    <span className="font-semibold text-white text-base md:text-lg pr-4">{faq.question}</span>
                                    <div className={clsx(
                                        "w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-colors",
                                        open ? "bg-[#d4ff5e] text-black" : "bg-[#1c1c1c] text-neutral-400"
                                    )}>
                                        {open ? <Minus size={16} /> : <Plus size={16} />}
                                    </div>
                                </button>
                                <div
                                    className={clsx(
                                        "px-5 md:px-6 text-neutral-400 leading-relaxed transition-all duration-300 ease-in-out overflow-hidden",
                                        open ? "max-h-96 pb-6 opacity-100" : "max-h-0 pb-0 opacity-0"
                                    )}
                                >
                                    {faq.answer}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
