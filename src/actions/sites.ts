'use server';

import { supabase } from '@/lib/supabaseClient';

export interface SiteResult {
    pages: number;
    status: string;
    nodes?: any[];
    [key: string]: any;
}

export async function saveSiteAction(originalUrl: string, sitemapUrl: string | undefined, result: any) {
    try {
        // Clean the URL: remove protocol (http:// or https://)
        const cleanUrl = originalUrl.replace(/^https?:\/\//, '');

        // Ensure result has pages and status
        const enrichedResult = {
            pages: result.nodes?.length || 0,
            status: 'ok',
            ...result
        };

        // Check if site already exists
        const { data: existingSite } = await supabase
            .from('scanned_sites')
            .select('id')
            .eq('site_url', cleanUrl)
            .single();

        let error;

        if (existingSite) {
            // Update existing site
            const { error: updateError } = await supabase
                .from('scanned_sites')
                .update({
                    sitemap_url: sitemapUrl || originalUrl,
                    result: enrichedResult,
                    created_at: new Date().toISOString() // Update timestamp to show it was recently scanned
                })
                .eq('id', existingSite.id);
            error = updateError;
        } else {
            // Insert new site
            const { error: insertError } = await supabase
                .from('scanned_sites')
                .insert({
                    site_url: cleanUrl,
                    sitemap_url: sitemapUrl || originalUrl,
                    result: enrichedResult
                });
            error = insertError;
        }

        if (error) {
            console.error('Error inserting site:', error);
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (error: any) {
        console.error('Error in saveSiteAction:', error);
        return { success: false, error: error.message };
    }
}

export async function getSitesAction() {
    try {
        const { data, error } = await supabase
            .from('scanned_sites')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            throw error;
        }

        return { success: true, data };
    } catch (error: any) {
        console.error('Error in getSitesAction:', error);
        return { success: false, error: error.message };
    }
}
