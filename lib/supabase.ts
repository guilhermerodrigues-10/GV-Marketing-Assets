import { createClient } from '@supabase/supabase-js';

// Helper to safely access env vars in different environments (Vite, CRA, Browser)
const getEnv = (key: string) => {
  try {
    // Check for Vite
    if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
      return (import.meta as any).env[key];
    }
    // Check for Node/Webpack/CRA
    if (typeof process !== 'undefined' && process.env) {
      return process.env[key];
    }
  } catch (e) {
    console.warn('Error reading environment variable', e);
  }
  return undefined;
};

// SUAS CREDENCIAIS REAIS (Padrão)
// O sistema usará estas chaves caso não encontre variáveis de ambiente no Docker/Build
const DEFAULT_URL = 'https://hywyqckkahlxevvtzkfw.supabase.co';
const DEFAULT_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5d3lxY2trYWhseGV2dnR6a2Z3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0MDAyMTUsImV4cCI6MjA4MDk3NjIxNX0.Gc8rHZfSIWVNiyUP43eRqCLD6i80CPS7YiiZct0rmHg';

const supabaseUrl = getEnv('VITE_SUPABASE_URL') || DEFAULT_URL;
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY') || DEFAULT_KEY;

// Verifica se as chaves estão presentes (sempre estarão true devido aos padrões acima)
export const isSupabaseConfigured = 
  !!supabaseUrl && 
  !!supabaseAnonKey && 
  supabaseUrl !== 'undefined';

if (!isSupabaseConfigured) {
  console.warn('Supabase URL or Key missing.');
}

// Inicializa o cliente diretamente com suas credenciais
export const supabase = createClient(supabaseUrl, supabaseAnonKey);