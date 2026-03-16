import { createClient } from '@supabase/supabase-js';

// Puxando as variáveis exatas que você definiu no seu .env
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!;

// Criando e exportando o cliente do Supabase
export const supabase = createClient(supabaseUrl, supabaseKey);