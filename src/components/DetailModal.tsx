'use client';

import React from 'react';
import { X } from 'lucide-react';
import { DetailPanel } from './DetailPanel';
import { SitemapNode } from '@/lib/sitemap-scanner';

interface DetailModalProps {
    node: SitemapNode | null;
    onClose: () => void;
}

export function DetailModal({ node, onClose }: DetailModalProps) {
    if (!node) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="font-semibold text-lg text-gray-900 dark:text-white">Details</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        <X size={20} className="text-gray-500 dark:text-gray-400" />
                    </button>
                </div>

                <div className="flex-1 overflow-auto p-6">
                    <DetailPanel node={node} />
                </div>
            </div>
        </div>
    );
}
