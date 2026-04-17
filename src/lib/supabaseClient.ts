import { createClient, SupabaseClient } from '@supabase/supabase-js';

let _client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) {
        throw new Error('Supabase env vars missing: NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY');
    }
    if (!_client) {
        _client = createClient(url, key);
    }
    return _client;
}

// Proxy so existing callers using `supabase.from(...)` keep working while
// deferring client creation (and env validation) until first actual use.
export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
    get(_, prop) {
        return Reflect.get(getClient(), prop);
    },
});
