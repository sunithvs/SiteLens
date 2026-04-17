import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { getAllPosts } from '@/lib/blog';

export const metadata: Metadata = {
    title: 'Blog',
    description: 'Guides, teardowns, and notes on sitemaps, SEO, and the messy work of running a website.',
};

function formatDate(d: string) {
    if (!d) return '';
    const date = new Date(d);
    if (isNaN(date.getTime())) return d;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function BlogIndexPage() {
    const posts = getAllPosts();

    return (
        <main className="min-h-screen bg-[#0a0a0a] text-white">
            <nav className="container mx-auto px-4 pt-8 flex items-center justify-between">
                <Link href="/"><Logo size={32} /></Link>
                <div className="flex items-center gap-2">
                    <Link
                        href="/history"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#141414] border border-neutral-800 hover:border-neutral-600 text-sm text-neutral-300 hover:text-white transition-colors"
                    >
                        History
                    </Link>
                </div>
            </nav>

            <section className="container mx-auto px-4 py-16 md:py-24 max-w-5xl">
                <div className="mb-12 md:mb-16">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#141414] border border-neutral-800 text-xs font-medium text-neutral-400 mb-5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#d4ff5e]" />
                        BLOG
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-white tracking-[-0.03em] leading-[0.95] mb-5">
                        Notes on sitemaps,<br />
                        <span className="italic text-[#d4ff5e]">SEO</span>, and shipping.
                    </h1>
                    <p className="text-base md:text-lg text-neutral-400 max-w-2xl">
                        Guides, teardowns, and things I learn while building SiteLens and auditing client sites.
                    </p>
                </div>

                <div className="grid gap-4">
                    {posts.map((post) => (
                        <Link
                            key={post.slug}
                            href={`/blog/${post.slug}`}
                            className="group p-6 md:p-7 rounded-3xl bg-[#141414] border border-neutral-800 hover:border-neutral-700 hover:bg-[#1a1a1a] transition-all"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                                        <span className="text-xs text-neutral-500 font-mono">{formatDate(post.date)}</span>
                                        <span className="text-neutral-700">·</span>
                                        <span className="text-xs text-neutral-500">{post.readTime}</span>
                                        {post.tags.slice(0, 2).map((tag) => (
                                            <span key={tag} className="text-[10px] uppercase tracking-wider text-neutral-400 bg-[#1c1c1c] px-2 py-0.5 rounded-full border border-neutral-800">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                    <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight group-hover:text-[#d4ff5e] transition-colors mb-2">
                                        {post.title}
                                    </h2>
                                    <p className="text-sm md:text-base text-neutral-400 leading-relaxed">
                                        {post.description}
                                    </p>
                                </div>
                                <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-[#1c1c1c] group-hover:bg-[#d4ff5e] group-hover:text-black text-neutral-400 transition-all flex-shrink-0">
                                    <ArrowUpRight size={14} />
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>

                {posts.length === 0 && (
                    <div className="p-10 text-center text-neutral-500 bg-[#141414] border border-neutral-800 rounded-3xl">
                        No posts yet. Check back soon.
                    </div>
                )}
            </section>
        </main>
    );
}
