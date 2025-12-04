'use client';

import React from 'react';
import { SitemapNode } from '@/lib/sitemap-scanner';
import { FileText, Folder } from 'lucide-react';

interface SitemapGridProps {
    nodes: SitemapNode[];
    onSelect: (node: SitemapNode) => void;
    selectedNode?: SitemapNode | null;
}

export function SitemapGrid({ nodes, onSelect, selectedNode }: SitemapGridProps) {
    // Flatten the tree for grid view
    const flattenNodes = (nodes: SitemapNode[]): SitemapNode[] => {
        let flat: SitemapNode[] = [];
        for (const node of nodes) {
            flat.push(node);
            if (node.children) {
                flat = flat.concat(flattenNodes(node.children));
            }
        }
        return flat;
    };

    const flatList = flattenNodes(nodes);

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 p-4 overflow-auto h-full">
            {flatList.map((node, index) => (
                <div
                    key={`${node.url}-${index}`}
                    onClick={() => onSelect(node)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md flex flex-col items-center text-center gap-2
            ${selectedNode?.url === node.url
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400'
                            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-300'
                        }`}
                >
                    {node.type === 'sitemap' ? (
                        <Folder size={32} className="text-yellow-500 mb-1" />
                    ) : (
                        <FileText size={32} className="text-gray-400 mb-1" />
                    )}

                    <div className="w-full">
                        <div className="text-xs font-medium text-gray-900 dark:text-white truncate w-full" title={node.url}>
                            {node.url.split('/').pop() || node.url}
                        </div>
                        <div className="text-[10px] text-gray-500 truncate w-full mt-1">
                            {node.url}
                        </div>
                    </div>

                    <div className="mt-auto pt-2 flex gap-2 text-[10px] text-gray-400">
                        {node.lastmod && <span>{new Date(node.lastmod).toLocaleDateString()}</span>}
                    </div>
                </div>
            ))}
        </div>
    );
}
