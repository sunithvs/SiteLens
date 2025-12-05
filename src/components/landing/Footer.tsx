import React from 'react';
import { Globe, Code2 } from 'lucide-react';

export function Footer() {
    return (
        <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 pt-16 pb-8">
            <div className="container mx-auto px-4">
                <div className="grid md:grid-cols-4 gap-8 mb-12">
                    <div className="col-span-1 md:col-span-2">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">SiteLens</h3>
                        <p className="text-gray-600 dark:text-gray-400 max-w-sm">
                            The advanced sitemap explorer and visualizer for modern web development.
                            Built to help you understand and optimize your website structure.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Product</h4>
                        <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                            <li><a href="#" className="hover:text-blue-600 transition-colors">Features</a></li>
                            <li><a href="#" className="hover:text-blue-600 transition-colors">How it Works</a></li>
                            <li><a href="#" className="hover:text-blue-600 transition-colors">FAQ</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Connect</h4>
                        <div className="flex gap-4">
                            <a
                                href="http://devb.io/sunithvs?utm_source=sitelens"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-400 hover:opacity-80 transition-opacity"
                                title="Developer Profile"
                            >
                                <img
                                    src="https://raw.githubusercontent.com/sunithvs/devb.io/refs/heads/main/docs/images/logo-white.png"
                                    alt="devb.io"
                                    className="h-8 w-auto object-contain transition-opacity invert dark:invert-0"
                                />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-100 dark:border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
                    <p>© {new Date().getFullYear()} SiteLens. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
