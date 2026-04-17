import React from 'react';
import { clsx } from 'clsx';

interface LogoMarkProps extends React.SVGProps<SVGSVGElement> {
    /** Tile background variant. `lime` matches main brand pill. */
    variant?: 'lime' | 'dark' | 'mono';
}

/**
 * SiteLens mark — lime rounded square with a lens-and-tree glyph.
 * Combines the lens/discovery idea with the sitemap tree structure.
 */
export function LogoMark({
    className = 'w-8 h-8',
    variant = 'lime',
    ...props
}: LogoMarkProps) {
    const bg =
        variant === 'lime' ? '#d4ff5e' :
        variant === 'dark' ? '#0a0a0a' :
        '#ffffff';
    const fg =
        variant === 'lime' ? '#0a0a0a' :
        variant === 'dark' ? '#d4ff5e' :
        '#0a0a0a';

    return (
        <svg
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            aria-label="SiteLens"
            {...props}
        >
            <rect width="32" height="32" rx="8" fill={bg} />
            {/* lens */}
            <circle cx="13.5" cy="13.5" r="5" stroke={fg} strokeWidth="2.5" fill="none" />
            {/* handle */}
            <line
                x1="17.8"
                y1="17.8"
                x2="23"
                y2="23"
                stroke={fg}
                strokeWidth="2.75"
                strokeLinecap="round"
            />
        </svg>
    );
}

interface LogoProps {
    className?: string;
    /** size in px; default 32 */
    size?: number;
    /** show wordmark alongside icon */
    showWord?: boolean;
    variant?: 'lime' | 'dark' | 'mono';
    wordClassName?: string;
}

/**
 * Full brand lockup — mark + wordmark.
 */
export function Logo({
    className,
    size = 32,
    showWord = true,
    variant = 'lime',
    wordClassName,
}: LogoProps) {
    return (
        <span className={clsx('inline-flex items-center gap-2', className)}>
            <LogoMark
                variant={variant}
                style={{ width: size, height: size }}
            />
            {showWord && (
                <span className={clsx('font-black text-lg tracking-tight text-white leading-none', wordClassName)}>
                    Site<span className="text-[#d4ff5e]">Lens</span>
                </span>
            )}
        </span>
    );
}

// Back-compat: default export keeps the old icon-only API working.
// Callers that used <Logo className="w-8 h-8" /> as icon-only still get icon-only.
export default LogoMark;
