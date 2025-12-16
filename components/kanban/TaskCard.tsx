import React from 'react';
import { Clock, MessageSquare, Paperclip, MoreHorizontal, Play, Pause, Calendar } from 'lucide-react';
import { Task, Priority } from '../../types';
import { useApp } from '../../contexts/AppContext';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit }) => {
  const { setActiveDragTask, toggleTimeTracking, projects } = useApp();
  
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', task.id);
    e.dataTransfer.effectAllowed = 'move';
    setActiveDragTask(task.id);
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  const priorityColors = {
    [Priority.LOW]: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
    [Priority.NORMAL]: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    [Priority.HIGH]: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
    [Priority.URGENT]: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
  };

  const project = projects.find(p => p.id === task.projectId);

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={() => setActiveDragTask(null)}
      onClick={() => onEdit(task)}
      className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 cursor-pointer active:cursor-grabbing hover:shadow-md hover:border-primary-500 dark:hover:border-primary-500 transition-all group relative"
    >
      <div className="flex justify-between items-start mb-2">
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${priorityColors[task.priority]}`}>
          {task.priority}
        </span>
        <div className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 opacity-0 group-hover:opacity-100 transition-opacity">
          <MoreHorizontal size={16} />
        </div>
      </div>

      <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-1 leading-tight group-hover:text-primary-500 dark:group-hover:text-primary-500 transition-colors">
        {task.title}
      </h4>
      
      {project && (
        <div className="flex items-center mb-3">
          <span className={`w-2 h-2 rounded-full mr-2 ${project.color}`}></span>
          <span className="text-xs text-slate-500 dark:text-slate-400">{project.clientName}</span>
        </div>
      )}

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 dark:border-slate-700">
        <div className="flex items-center space-x-2">
          {/* Mock Avatars */}
          <div className="flex -space-x-2">
            {task.assignees.map((userId, idx) => (
               <div key={idx} className="w-6 h-6 rounded-full bg-slate-200 border-2 border-white dark:border-slate-800 flex items-center justify-center text-[10px] overflow-hidden">
                 <img src={`https://picsum.photos/32/32?random=${userId}`} alt="User" />
               </div>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-3 text-slate-400">
           {/* Date Display (Conditional) */}
           {task.dueDate && (
             <div className="flex items-center text-xs" title="Prazo">
                <Calendar size={14} className="mr-1" />
                {formatDate(task.dueDate)}
             </div>
           )}

           {/* Time Tracker Control */}
           <button 
             onClick={(e) => { e.stopPropagation(); toggleTimeTracking(task.id); }}
             className={`flex items-center text-xs hover:text-primary-500 transition-colors ${task.isTracking ? 'text-primary-500 animate-pulse' : ''}`}
             title="Rastrear Tempo"
            >
             {task.isTracking ? <Pause size={14} className="mr-1"/> : <Play size={14} className="mr-1"/>}
             {task.isTracking || task.timeTracked > 0 ? formatTime(task.timeTracked) : ''}
           </button>
           
           {(task.subtasks?.length ?? 0) > 0 && (
             <div className="flex items-center text-xs">
               <Paperclip size={14} className="mr-1" />
               {task.subtasks.filter(t => t.completed).length}/{task.subtasks.length}
             </div>
           )}
        </div>
      </div>
    </div>
  );
};