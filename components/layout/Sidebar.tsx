import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Kanban, Calendar, Settings, PieChart, Users, Folder } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

export const Sidebar: React.FC = () => {
  const { sidebarOpen, user } = useApp();

  // Define items with required roles
  // If requiredRoles is undefined, everyone can access
  const allNavItems = [
    { icon: LayoutDashboard, label: 'Painel', path: '/' },
    { icon: Kanban, label: 'Quadro Kanban', path: '/board' },
    { icon: Folder, label: 'Projetos', path: '/projects' },
    { 
      icon: PieChart, 
      label: 'Relatórios', 
      path: '/reports',
      requiredRoles: ['Admin', 'Gerente'] 
    },
    { icon: Users, label: 'Equipe', path: '/team' },
    { icon: Calendar, label: 'Calendário', path: '/calendar' },
  ];

  // Filter items based on current user role
  const navItems = allNavItems.filter(item => {
    if (!item.requiredRoles) return true;
    return user && item.requiredRoles.includes(user.role);
  });

  return (
    <aside 
      className={`
        fixed top-0 left-0 z-40 h-screen transition-transform bg-white border-r border-slate-200 dark:bg-black dark:border-slate-800
        ${sidebarOpen ? 'w-64 translate-x-0' : 'w-20 -translate-x-full md:translate-x-0'}
      `}
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className={`h-20 flex items-center px-6 border-b border-slate-200 dark:border-slate-800 ${sidebarOpen ? 'justify-start' : 'justify-center'}`}>
          <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0">
             {/* Placeholder for uploaded logo or styled text */}
             <span className="text-primary-500 font-bold text-2xl italic" style={{ fontFamily: 'serif' }}>GV</span>
          </div>
          {sidebarOpen && (
             <div className="ml-3 flex flex-col justify-center">
                <span className="text-xl font-bold text-primary-500 leading-none" style={{ fontFamily: 'serif' }}>GV</span>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 tracking-widest mt-1">MARKETING</span>
             </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex items-center px-3 py-2.5 rounded-lg transition-colors group
                ${isActive 
                  ? 'bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-500' 
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-900'}
                ${!sidebarOpen && 'justify-center'}
              `}
            >
              <item.icon size={20} className={`${sidebarOpen ? 'mr-3' : 'mr-0'}`} />
              {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
              {!sidebarOpen && (
                <div className="absolute left-full rounded-md px-2 py-1 ml-6 bg-slate-900 text-white text-xs invisible opacity-0 -translate-x-3 transition-all group-hover:visible group-hover:opacity-100 group-hover:translate-x-0 z-50 whitespace-nowrap">
                  {item.label}
                </div>
              )}
            </NavLink>
          ))}
        </div>

        {/* Footer Settings */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800">
          <NavLink
            to="/settings"
            className={`
              flex items-center px-3 py-2.5 rounded-lg transition-colors text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-900
              ${!sidebarOpen && 'justify-center'}
            `}
          >
            <Settings size={20} className={`${sidebarOpen ? 'mr-3' : 'mr-0'}`} />
            {sidebarOpen && <span className="text-sm font-medium">Configurações</span>}
          </NavLink>
        </div>
      </div>
    </aside>
  );
};