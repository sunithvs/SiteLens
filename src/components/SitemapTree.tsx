'use client';

import React, { useState } from 'react';
import { ChevronRight, ChevronDown, FileText, Folder, FolderOpen, FileCode, Image as ImageIcon, File } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { SitemapNode } from '@/lib/sitemap-scanner';

interface SitemapTreeProps {
    node: SitemapNode;
    onSelect: (node: SitemapNode) => void;
    selectedNode?: SitemapNode | null;
    level?: number;
}

export function SitemapTree({ node, onSelect, selectedNode, level = 0 }: SitemapTreeProps) {
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

    const getIcon = () => {
        if (node.type === 'sitemap') {
            return isOpen ? <FolderOpen size={16} className="text-blue-500" /> : <Folder size={16} className="text-blue-500" />;
        }

        const ext = node.url.split('.').pop()?.toLowerCase();
        if (ext === 'xml') return <FileCode size={16} className="text-orange-500" />;
        if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext || '')) return <ImageIcon size={16} className="text-purple-500" />;
        if (['pdf'].includes(ext || '')) return <FileText size={16} className="text-red-500" />;

        return <File size={16} className="text-gray-400" />;
    };

    return (
        <div>
            <div
                className={twMerge(
                    "flex items-center gap-1.5 py-1 px-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors select-none",
                    isSelected && "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                )}
                style={{ paddingLeft: `${level * 12 + 8}px` }}
                onClick={handleSelect}
            >
                <button
                    onClick={handleToggle}
                    className={clsx("p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400", !hasChildren && "invisible")}
                >
                    {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </button>

                {getIcon()}

                <span className="truncate text-sm font-medium opacity-90">{node.url}</span>

                {node.children && (
                    <span className="text-xs text-gray-400 ml-auto">
                        {node.children.length}
                    </span>
                )}
            </div>

            {hasChildren && isOpen && (
                <div className="relative">
                    {/* Indentation Guide */}
                    <div
                        className="absolute left-0 top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-800"
                        style={{ left: `${level * 12 + 15}px` }}
                    />
                    <div>
                        {node.children!.map((child, index) => (
                            <SitemapTree
                                key={`${child.url}-${index}`}
                                node={child}
                                onSelect={onSelect}
                                selectedNode={selectedNode}
                                level={level + 1}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
