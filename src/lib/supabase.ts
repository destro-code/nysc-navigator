// Compatibility shim for legacy imports. NYSC Navigator is frontend-only;
// no network requests or Supabase credentials are used.
export const supabase = {
  auth: {
    onAuthStateChange: (_callback: unknown) => ({ data: { subscription: { unsubscribe() {} } } }),
  },
};
