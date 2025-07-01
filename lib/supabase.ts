import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabasePublishableKey = process.env.EXPO_PUBLIC_SUPABASE_KEY;

if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error('Missing Supabase environment variables');
}

// Client-side Supabase client - safe for both client and server environments
export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    // Only configure storage and persistence for client environments
    ...(typeof window !== 'undefined' && {
      storage: require('@react-native-async-storage/async-storage').default,
      persistSession: true,
    }),
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});
