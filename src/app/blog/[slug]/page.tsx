import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { getAllPosts, getPost } from '@/lib/blog';

interface Props {
    params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
    return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const post = getPost(slug);
    if (!post) return { title: 'Post not found' };
    return {
        title: post.title,
        description: post.description,
        openGraph: {
            title: post.title,
            description: post.description,
            type: 'article',
            publishedTime: post.date,
            tags: post.tags,
            images: [{ url: '/og-image.png', width: 1200, height: 630 }],
        },
        twitter: {
            card: 'summary_large_image',
            title: post.title,
            description: post.description,
            images: ['/og-image.png'],
        },
    };
}

function formatDate(d: string) {
    if (!d) return '';
    const date = new Date(d);
    if (isNaN(date.getTime())) return d;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default async function BlogPostPage({ params }: Props) {
    const { slug } = await params;
    const post = getPost(slug);
    if (!post) notFound();

    const others = getAllPosts().filter((p) => p.slug !== slug).slice(0, 3);

    return (
        <main className="min-h-screen bg-[#0a0a0a] text-white">
            <nav className="container mx-auto px-4 pt-8 flex items-center justify-between">
                <Link href="/"><Logo size={32} /></Link>
                <Link
                    href="/blog"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#141414] border border-neutral-800 hover:border-neutral-600 text-sm text-neutral-300 hover:text-white transition-colors"
                >
                    <ArrowLeft size={14} />
                    All posts
                </Link>
            </nav>

            <article className="container mx-auto px-4 pt-12 pb-24 max-w-3xl">
                <header className="mb-10">
                    <div className="flex items-center gap-3 mb-5 flex-wrap">
                        <span className="text-xs text-neutral-500 font-mono">{formatDate(post.date)}</span>
                        <span className="text-neutral-700">·</span>
                        <span className="text-xs text-neutral-500">{post.readTime}</span>
                        {post.tags.map((tag) => (
                            <span key={tag} className="text-[10px] uppercase tracking-wider text-neutral-400 bg-[#141414] px-2 py-0.5 rounded-full border border-neutral-800">
                                {tag}
                            </span>
                        ))}
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-white tracking-[-0.03em] leading-[1] mb-5">
                        {post.title}
                    </h1>
                    <p className="text-lg text-neutral-400 leading-relaxed">
                        {post.description}
                    </p>
                </header>

                <div
                    className="prose-sitelens"
                    dangerouslySetInnerHTML={{ __html: post.html }}
                />

                {/* CTA */}
                <div className="mt-14 p-6 md:p-8 bg-[#141414] border border-neutral-800 rounded-3xl">
                    <div className="flex items-start gap-4 flex-col md:flex-row md:items-center md:justify-between">
                        <div>
                            <h3 className="text-xl font-bold text-white tracking-tight mb-1">Try SiteLens on any site</h3>
                            <p className="text-sm text-neutral-400">Paste a URL, get a sitemap tree, validation report, and stale-URL check in seconds.</p>
                        </div>
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#d4ff5e] hover:bg-[#e7ff8a] text-black rounded-full font-bold text-sm transition-colors flex-shrink-0"
                        >
                            Open the scanner
                            <ArrowUpRight size={14} />
                        </Link>
                    </div>
                </div>

                {/* Related posts */}
                {others.length > 0 && (
                    <section className="mt-16 pt-10 border-t border-neutral-900">
                        <h2 className="text-2xl font-black text-white tracking-tight mb-6">Keep reading</h2>
                        <div className="grid gap-3">
                            {others.map((p) => (
                                <Link
                                    key={p.slug}
                                    href={`/blog/${p.slug}`}
                                    className="group p-5 rounded-3xl bg-[#141414] border border-neutral-800 hover:border-neutral-700 transition-all"
                                >
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="min-w-0">
                                            <h3 className="font-bold text-white group-hover:text-[#d4ff5e] transition-colors mb-1">
                                                {p.title}
                                            </h3>
                                            <p className="text-xs text-neutral-500 font-mono">{formatDate(p.date)} · {p.readTime}</p>
                                        </div>
                                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#1c1c1c] group-hover:bg-[#d4ff5e] group-hover:text-black text-neutral-400 transition-all flex-shrink-0">
                                            <ArrowUpRight size={13} />
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}
            </article>
        </main>
    );
}
