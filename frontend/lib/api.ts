import { supabase } from './supabase';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  console.log(`[API] Starting fetchWithAuth for ${endpoint}`);
  
  console.log('[API] Calling getSession()...');
  const { data: { session } } = await supabase.auth.getSession();
  console.log('[API] getSession() returned.');
  
  const token = session?.access_token;

  console.log(`[API] Fetching ${endpoint}...`);

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    console.log(`[API] ${endpoint} returned status ${response.status}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`[API] ${endpoint} failed:`, errorData);
      throw new Error(errorData.detail || 'API request failed');
    }

    return response.json();
  } catch (err) {
    console.error(`[API] ${endpoint} error:`, err);
    throw err;
  }
}
