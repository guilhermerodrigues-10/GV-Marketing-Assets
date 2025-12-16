import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { AlertCircle, UserCheck } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, loginDemo } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      await login(email, password);
      // Redirect handled by AppContext state change
    } catch (err: any) {
      setError('Falha ao entrar. Verifique suas credenciais.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-800">
        <div className="p-8 text-center bg-black border-b-4 border-primary-500">
          <div className="flex flex-col items-center justify-center mb-4">
             <span className="text-primary-500 font-bold text-5xl italic mb-2" style={{ fontFamily: 'serif' }}>GV</span>
             <span className="text-white font-bold tracking-[0.3em] text-sm">MARKETING</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Bem-vindo</h1>
          <p className="text-slate-400">Acesse sua área exclusiva</p>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-100 border border-red-200 text-red-700 rounded-lg text-sm flex items-center">
                <AlertCircle size={16} className="mr-2" />
                {error}
              </div>
            )}

            <Input 
              label="Endereço de Email" 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="seu@email.com"
            />
            
            <Input 
              label="Senha" 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />

            <div className="flex items-center justify-between text-sm">
               <label className="flex items-center text-slate-600 dark:text-slate-400 cursor-pointer">
                 <input type="checkbox" className="mr-2 rounded border-slate-300 text-primary-500 focus:ring-primary-500" />
                 Lembrar-me
               </label>
               <a href="#" className="text-primary-500 hover:text-primary-600 font-medium">Esqueceu a senha?</a>
            </div>

            <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
              Entrar
            </Button>
          </form>

          <div className="mt-4 flex flex-col items-center space-y-4">
             <div className="w-full flex items-center">
               <div className="flex-1 border-t border-slate-200 dark:border-slate-700"></div>
               <span className="px-3 text-xs text-slate-400 uppercase">Ou teste o sistema</span>
               <div className="flex-1 border-t border-slate-200 dark:border-slate-700"></div>
             </div>
             
             <Button 
                type="button" 
                variant="outline" 
                className="w-full" 
                onClick={loginDemo}
             >
                <UserCheck size={16} className="mr-2" />
                Modo Demonstração (Sem Senha)
             </Button>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
             <p className="text-xs text-slate-500 mb-2">
               Não tem conta? Contate o administrador.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};