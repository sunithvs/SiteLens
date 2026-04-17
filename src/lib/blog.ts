import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { marked } from 'marked';

const CONTENT_DIR = path.join(process.cwd(), 'content', 'blog');

export interface BlogMeta {
    slug: string;
    title: string;
    description: string;
    date: string;
    readTime: string;
    tags: string[];
    cover?: string;
}

export interface BlogPost extends BlogMeta {
    html: string;
    raw: string;
}

function readFiles(): string[] {
    if (!fs.existsSync(CONTENT_DIR)) return [];
    return fs
        .readdirSync(CONTENT_DIR)
        .filter((f) => f.endsWith('.md') || f.endsWith('.mdx'));
}

function parseFile(fileName: string): BlogPost {
    const full = path.join(CONTENT_DIR, fileName);
    const raw = fs.readFileSync(full, 'utf8');
    const { data, content } = matter(raw);
    const slug = fileName.replace(/\.(md|mdx)$/, '');
    const html = marked.parse(content, { async: false }) as string;
    return {
        slug,
        title: data.title ?? slug,
        description: data.description ?? '',
        date: data.date ?? '',
        readTime: data.readTime ?? '',
        tags: Array.isArray(data.tags) ? data.tags : [],
        cover: data.cover,
        html,
        raw: content,
    };
}

export function getAllPosts(): BlogMeta[] {
    return readFiles()
        .map(parseFile)
        .sort((a, b) => (a.date < b.date ? 1 : -1))
        .map(({ html, raw, ...rest }) => rest);
}

export function getPost(slug: string): BlogPost | null {
    const files = readFiles();
    const match = files.find((f) => f.replace(/\.(md|mdx)$/, '') === slug);
    if (!match) return null;
    return parseFile(match);
}
