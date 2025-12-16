import React from 'react';
import { useApp } from '../contexts/AppContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { TaskStatus } from '../types';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export const ReportsPage: React.FC = () => {
  const { tasks, projects, users, columns } = useApp();

  // Data 1: Tasks by User (Workload)
  const workloadData = users.map(u => ({
    name: u.name,
    tasks: tasks.filter(t => t.assignees.includes(u.id)).length
  }));

  // Data 2: Project Costs (Budget vs Actual - Mocked Actual)
  const financialData = projects.map(p => {
    // Mock: calculate cost based on task hours * hourly rate (assume $50/h)
    const projectTasks = tasks.filter(t => t.projectId === p.id);
    const hours = projectTasks.reduce((acc, t) => acc + (t.timeTracked / 3600), 0);
    const actualCost = hours * 50;
    return {
      name: p.name,
      budget: p.budget,
      actual: Math.round(actualCost),
    };
  });

  // Data 3: Completion Velocity (Mocked over last 5 weeks)
  const velocityData = [
    { name: 'Semana 1', completed: 4 },
    { name: 'Semana 2', completed: 7 },
    { name: 'Semana 3', completed: 5 },
    { name: 'Semana 4', completed: 11 },
    { name: 'Semana Atual', completed: tasks.filter(t => t.status === TaskStatus.DONE || t.status === 'done').length }
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Relatórios Avançados</h1>
          <p className="text-slate-500 dark:text-slate-400">Análise de desempenho e custos</p>
        </div>
        <div className="flex gap-2">
            <button className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50">Exportar PDF</button>
            <button className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50">Exportar Excel</button>
        </div>
      </div>

      {/* Row 1: Workload & Costs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Workload */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
           <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Carga de Trabalho por Membro</h3>
           <div className="h-80">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={workloadData} layout="vertical">
                 <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.2} />
                 <XAxis type="number" stroke="#94a3b8" />
                 <YAxis dataKey="name" type="category" width={100} stroke="#94a3b8" tick={{fontSize: 12}} />
                 <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }} />
                 <Bar dataKey="tasks" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} name="Tarefas" />
               </BarChart>
             </ResponsiveContainer>
           </div>
        </div>

        {/* Financial */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
           <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Orçamento vs Realizado</h3>
           <div className="h-80">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={financialData}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                 <XAxis dataKey="name" stroke="#94a3b8" tick={{fontSize: 10}} />
                 <YAxis stroke="#94a3b8" />
                 <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }} />
                 <Bar dataKey="budget" fill="#10b981" radius={[4, 4, 0, 0]} name="Orçamento" />
                 <Bar dataKey="actual" fill="#ef4444" radius={[4, 4, 0, 0]} name="Custo Atual" />
               </BarChart>
             </ResponsiveContainer>
           </div>
        </div>
      </div>

      {/* Row 2: Velocity Area Chart */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
         <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Velocidade da Equipe (Tarefas Concluídas)</h3>
         <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={velocityData}>
                <defs>
                  <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }} />
                <Area type="monotone" dataKey="completed" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorCompleted)" name="Concluídas" />
              </AreaChart>
            </ResponsiveContainer>
         </div>
      </div>
    </div>
  );
};