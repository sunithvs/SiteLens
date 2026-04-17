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
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col items-start gap-3
            ${selectedNode?.url === node.url
                            ? 'border-[#d4ff5e] bg-[#d4ff5e]/5'
                            : 'border-neutral-800 bg-[#141414] hover:border-neutral-700 hover:bg-[#1a1a1a]'
                        }`}
                >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${node.type === 'sitemap' ? 'bg-[#d4ff5e] text-black' : 'bg-neutral-800 text-neutral-400'}`}>
                        {node.type === 'sitemap' ? <Folder size={18} /> : <FileText size={18} />}
                    </div>

                    <div className="w-full min-w-0">
                        <div className="text-sm font-semibold text-white truncate w-full" title={node.url}>
                            {node.url.split('/').pop() || node.url}
                        </div>
                        <div className="text-[10px] text-neutral-500 truncate w-full mt-1 font-mono">
                            {node.url}
                        </div>
                    </div>

                    {node.lastmod && (
                        <div className="mt-auto text-[10px] text-neutral-500 font-mono">
                            {new Date(node.lastmod).toLocaleDateString()}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
