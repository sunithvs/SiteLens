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
        <div className="overflow-auto h-full">
            <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 sticky top-0">
                    <tr>
                        <th scope="col" className="px-6 py-3">URL</th>
                        <th scope="col" className="px-6 py-3">Type</th>
                        <th scope="col" className="px-6 py-3">Last Modified</th>
                        <th scope="col" className="px-6 py-3">Priority</th>
                    </tr>
                </thead>
                <tbody>
                    {flatList.map((node, index) => (
                        <tr
                            key={`${node.url}-${index}`}
                            onClick={() => onSelect(node)}
                            className={`bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer ${selectedNode?.url === node.url ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                        >
                            <td className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap flex items-center gap-2">
                                {node.type === 'sitemap' ? <Folder size={16} className="text-yellow-500" /> : <FileText size={16} className="text-gray-500" />}
                                <span className="truncate max-w-xs" title={node.url}>{node.url}</span>
                            </td>
                            <td className="px-6 py-4 capitalize">{node.type}</td>
                            <td className="px-6 py-4">{node.lastmod || '-'}</td>
                            <td className="px-6 py-4">{node.priority || '-'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
