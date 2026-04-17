'use client';

import React from 'react';
import { SitemapNode } from '@/lib/sitemap-scanner';
import { FileText, Folder } from 'lucide-react';

interface SitemapTableProps {
    nodes: SitemapNode[];
    onSelect: (node: SitemapNode) => void;
    selectedNode?: SitemapNode | null;
}

export function SitemapTable({ nodes, onSelect, selectedNode }: SitemapTableProps) {
    // Flatten the tree for table view
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
        <div className="overflow-auto h-full rounded-2xl border border-neutral-800">
            <table className="w-full text-left text-sm text-neutral-400">
                <thead className="text-xs text-neutral-500 uppercase bg-[#141414] sticky top-0 tracking-wider">
                    <tr>
                        <th scope="col" className="px-5 py-3 font-semibold">URL</th>
                        <th scope="col" className="px-5 py-3 font-semibold">Type</th>
                        <th scope="col" className="px-5 py-3 font-semibold">Last Modified</th>
                        <th scope="col" className="px-5 py-3 font-semibold">Priority</th>
                    </tr>
                </thead>
                <tbody className="bg-[#0f0f0f]">
                    {flatList.map((node, index) => (
                        <tr
                            key={`${node.url}-${index}`}
                            onClick={() => onSelect(node)}
                            className={`border-b border-neutral-900 hover:bg-[#141414] cursor-pointer transition-colors ${selectedNode?.url === node.url ? 'bg-[#d4ff5e]/5' : ''}`}
                        >
                            <td className="px-5 py-3 font-medium text-white whitespace-nowrap flex items-center gap-2.5">
                                {node.type === 'sitemap' ? <Folder size={14} className="text-[#d4ff5e]" /> : <FileText size={14} className="text-neutral-500" />}
                                <span className="truncate max-w-xs font-mono text-xs" title={node.url}>{node.url}</span>
                            </td>
                            <td className="px-5 py-3">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${node.type === 'sitemap' ? 'bg-[#d4ff5e]/10 text-[#d4ff5e]' : 'bg-neutral-800 text-neutral-400'}`}>
                                    {node.type}
                                </span>
                            </td>
                            <td className="px-5 py-3 font-mono text-xs">{node.lastmod || '—'}</td>
                            <td className="px-5 py-3 font-mono text-xs">{node.priority || '—'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
