'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { clsx } from 'clsx';

const FAQS = [
    {
        question: 'What is a Sitemap?',
        answer: 'A sitemap is a file where you provide information about the pages, videos, and other files on your site, and the relationships between them. Search engines like Google read this file to more intelligently crawl your site.'
    },
    {
        question: 'Does XML Nexus store my data?',
        answer: 'No. XML Nexus scans your sitemap in real-time. We do not store your sitemap data or crawl results permanently. Everything is processed on-the-fly for your session.'
    },
    {
        question: 'Can I scan large sitemaps?',
        answer: 'Yes! XML Nexus is optimized for performance and can handle sitemaps with thousands of URLs. It uses a recursive scanning engine to handle nested sitemaps efficiently.'
    },
    {
        question: 'Is it free to use?',
        answer: 'Yes, XML Nexus is completely free to use for analyzing public sitemaps.'
    }
];

export function FAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <section className="py-24 bg-white dark:bg-gray-900">
            <div className="container mx-auto px-4 max-w-3xl">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        Frequently Asked Questions
                    </h2>
                </div>

                <div className="space-y-4">
                    {FAQS.map((faq, index) => (
                        <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                            <button
                                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                className="w-full flex items-center justify-between p-6 text-left bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                            >
                                <span className="font-semibold text-gray-900 dark:text-white">{faq.question}</span>
                                {openIndex === index ? (
                                    <ChevronUp className="text-gray-500" size={20} />
                                ) : (
                                    <ChevronDown className="text-gray-500" size={20} />
                                )}
                            </button>
                            <div
                                className={clsx(
                                    "bg-gray-50 dark:bg-gray-800/50 px-6 text-gray-600 dark:text-gray-300 transition-all duration-300 ease-in-out",
                                    openIndex === index ? "max-h-48 py-6 opacity-100" : "max-h-0 py-0 opacity-0"
                                )}
                            >
                                {faq.answer}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
