'use client';

import React, { useState } from 'react';
import { ChevronRight, ChevronDown, FileText, Folder, Globe } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { SitemapNode } from '@/lib/sitemap-scanner';

interface SitemapTreeProps {
    node: SitemapNode;
    onSelect: (node: SitemapNode) => void;
    selectedNode?: SitemapNode | null;
}

export function SitemapTree({ node, onSelect, selectedNode }: SitemapTreeProps) {
    const [isOpen, setIsOpen] = useState(true);
    const hasChildren = node.children && node.children.length > 0;
    const isSelected = selectedNode?.url === node.url;

    const handleToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsOpen(!isOpen);
    };

    const handleSelect = (e: React.MouseEvent) => {
        e.stopPropagation();
        onSelect(node);
    };

    return (
        <div className="pl-4">
            <div
                className={twMerge(
                    "flex items-center gap-2 py-1 px-2 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors",
                    isSelected && "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                )}
                onClick={handleSelect}
            >
                <button
                    onClick={handleToggle}
                    className={clsx("p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700", !hasChildren && "invisible")}
                >
                    {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </button>

                {node.type === 'sitemap' ? (
                    <Folder size={16} className="text-yellow-500" />
                ) : (
                    <FileText size={16} className="text-gray-500" />
                )}

                <span className="truncate text-sm font-medium">{node.url}</span>

                {node.children && (
                    <span className="text-xs text-gray-400 ml-auto">
                        {node.children.length}
                    </span>
                )}
            </div>

            {hasChildren && isOpen && (
                <div className="border-l border-gray-200 dark:border-gray-800 ml-3">
                    {node.children!.map((child, index) => (
                        <SitemapTree
                            key={`${child.url}-${index}`}
                            node={child}
                            onSelect={onSelect}
                            selectedNode={selectedNode}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
