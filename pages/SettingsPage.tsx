import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Bell, Lock, User, Monitor, Save } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user, isDarkMode, toggleTheme, updateUser } = useApp();
  
  // Local state for profile form
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    avatarUrl: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl || ''
      });
    }
  }, [user]);

  const handleSaveProfile = () => {
    if (user) {
      updateUser(user.id, formData);
      alert('Perfil atualizado com sucesso!');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Configurações</h1>
        <p className="text-slate-500 dark:text-slate-400">Gerencie suas preferências e perfil</p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
         <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center">
            <User className="mr-3 text-primary-500" size={20}/>
            <h2 className="font-bold text-slate-900 dark:text-white">Perfil</h2>
         </div>
         <div className="p-6 space-y-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
               <div className="relative group cursor-pointer">
                 <img 
                   src={formData.avatarUrl || "https://via.placeholder.com/150"} 
                   alt="Avatar" 
                   className="w-24 h-24 rounded-full object-cover border-4 border-primary-100 dark:border-primary-900"
                 />
                 <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                   <span className="text-white text-xs font-medium">Alterar</span>
                 </div>
               </div>
               <div className="flex-1 w-full">
                 <Input 
                    label="URL da Foto de Perfil" 
                    value={formData.avatarUrl}
                    onChange={(e) => setFormData({...formData, avatarUrl: e.target.value})}
                    placeholder="https://..."
                 />
                 <p className="text-xs text-slate-400 mt-1">Cole a URL de uma imagem para alterar seu avatar.</p>
               </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <Input 
                 label="Nome Completo" 
                 value={formData.name} 
                 onChange={(e) => setFormData({...formData, name: e.target.value})}
               />
               <Input 
                 label="Email" 
                 value={formData.email} 
                 onChange={(e) => setFormData({...formData, email: e.target.value})}
               />
            </div>
            
            <div className="flex justify-end pt-4">
              <Button onClick={handleSaveProfile}>
                <Save size={16} className="mr-2" />
                Salvar Alterações
              </Button>
            </div>
         </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
         <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center">
            <Monitor className="mr-3 text-purple-500" size={20}/>
            <h2 className="font-bold text-slate-900 dark:text-white">Aparência</h2>
         </div>
         <div className="p-6 flex items-center justify-between">
            <div>
               <h3 className="font-medium text-slate-900 dark:text-white">Modo Escuro</h3>
               <p className="text-sm text-slate-500">Alternar entre tema claro (Branco) e escuro (Preto)</p>
            </div>
            <button 
              onClick={toggleTheme}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isDarkMode ? 'bg-primary-500' : 'bg-slate-200'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isDarkMode ? 'translate-x-6' : 'translate-x-1'}`}/>
            </button>
         </div>
      </div>
    </div>
  );
};