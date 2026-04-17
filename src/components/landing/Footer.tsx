import React from 'react';
import { Logo } from '@/components/Logo';

export function Footer() {
    return (
        <footer className="bg-[#0a0a0a] border-t border-neutral-900 pt-16 pb-10">
            <div className="container mx-auto px-4">
                <div className="grid md:grid-cols-4 gap-10 mb-12">
                    <div className="col-span-1 md:col-span-2">
                        <div className="mb-5">
                            <Logo size={32} />
                        </div>
                        <p className="text-neutral-400 max-w-sm leading-relaxed text-sm">
                            The advanced sitemap explorer and visualizer for modern web development. Built to help you understand and optimize your website structure.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Product</h4>
                        <ul className="space-y-3 text-neutral-400 text-sm">
                            <li><a href="#" className="hover:text-[#d4ff5e] transition-colors">Features</a></li>
                            <li><a href="#" className="hover:text-[#d4ff5e] transition-colors">How it Works</a></li>
                            <li><a href="#" className="hover:text-[#d4ff5e] transition-colors">FAQ</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Connect</h4>
                        <div className="flex flex-col gap-3">
                            <a
                                href="http://devb.io/sunithvs?utm_source=sitelens"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-neutral-400 hover:text-white transition-colors"
                                title="Developer Profile"
                            >
                                <img
                                    src="https://raw.githubusercontent.com/sunithvs/devb.io/refs/heads/main/docs/images/logo-white.png"
                                    alt="devb.io"
                                    className="h-8 w-auto object-contain"
                                />
                            </a>
                            <a
                                href="https://buymeacoffee.com/sunithvs"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#141414] border border-neutral-800 hover:border-[#d4ff5e]/50 text-sm text-neutral-300 hover:text-white transition-colors w-fit"
                                title="Buy Me a Coffee"
                            >
                                <span>☕</span>
                                <span className="font-medium">Buy me a coffee</span>
                            </a>
                        </div>
                    </div>
                </div>

                <div className="border-t border-neutral-900 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-neutral-500">
                    <p>© {new Date().getFullYear()} SiteLens. All rights reserved.</p>
                    <p className="font-mono">built for the web.</p>
                </div>
            </div>
        </footer>
    );
}
