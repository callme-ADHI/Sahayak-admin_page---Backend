/**
 * integrations/supabase/client.ts
 * ================================
 * DEPRECATED — This project is now fully connected to the Django REST API backend.
 * All data fetching goes through src/api.ts (Axios + JWT).
 *
 * This file is intentionally left as a harmless stub so that any
 * stale import that was missed during migration crashes at import time
 * with a clear message, rather than silently connecting to old data.
 *
 * If you see this error:
 *   "SupabaseDeprecatedError: Supabase has been removed from this project"
 * → Find the file that imported from this module and replace it with api.ts.
 */

class SupabaseDeprecatedError extends Error {
  constructor(method: string) {
    super(
      `[MIGRATION] supabase.${method}() was called, but Supabase has been removed from this project.\n` +
      `All API calls must use src/api.ts (Axios → Django REST backend).\n` +
      `Find the caller and replace it with: import { api } from '@/api';`
    );
    this.name = 'SupabaseDeprecatedError';
  }
}

const supabaseStub: any = new Proxy({}, {
  get(_target, prop: string) {
    if (prop === 'then') return undefined; // not a promise
    return (..._args: any[]) => {
      throw new SupabaseDeprecatedError(prop);
    };
  },
});

/** @deprecated Use `import { api } from '@/api'` instead */
export const supabase = supabaseStub;