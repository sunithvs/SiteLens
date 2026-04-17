import React from 'react';

interface JsonLdProps {
    data: object | object[];
}

/**
 * Renders one or more JSON-LD blocks as inline <script type="application/ld+json">.
 * Safe for server components.
 */
export function JsonLd({ data }: JsonLdProps) {
    const blocks = Array.isArray(data) ? data : [data];
    return (
        <>
            {blocks.map((block, i) => (
                <script
                    key={i}
                    type="application/ld+json"
                    // Intentional: JSON-LD requires inline JSON. No HTML execution risk.
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(block) }}
                />
            ))}
        </>
    );
}
