window.SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
window.SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Supabase URL:', window.SUPABASE_URL);
console.log('Supabase ANON exists:', !!window.SUPABASE_ANON);
