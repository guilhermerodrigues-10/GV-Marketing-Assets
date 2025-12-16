import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, File as FileIcon, Trash2, Check, Clock } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { Task, Priority, Attachment } from '../../types';
import { Button } from '../ui/Button';
import { Input, Textarea, Select } from '../ui/Input';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTask: Task | null;
}

export const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, initialTask }) => {
  const { addTask, updateTask, deleteTask, projects, users, columns, user } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Form State
  const [formData, setFormData] = useState<Partial<Task>>({
    title: '',
    description: '',
    priority: Priority.NORMAL,
    status: columns[0]?.id || 'backlog',
    projectId: '',
    assignees: [],
    attachments: [],
    dueDate: ''
  });
  
  // Manual Time Input State
  const [timeSpent, setTimeSpent] = useState({ hours: 0, minutes: 0 });
  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false);

  // Permissions
  const canDeleteTask = user?.role === 'Admin' || user?.role === 'Gerente';

  useEffect(() => {
    // Check if initialTask is a full task (has ID) or just a partial preset (from "Add Task" button with presets)
    if (initialTask?.id) {
      // EDIT MODE
      setFormData({
        ...initialTask,
        dueDate: initialTask.dueDate ? new Date(initialTask.dueDate).toISOString().split('T')[0] : ''
      });

      // Calculate Hours and Minutes from total seconds
      const totalSeconds = initialTask.timeTracked || 0;
      const h = Math.floor(totalSeconds / 3600);
      const m = Math.floor((totalSeconds % 3600) / 60);
      setTimeSpent({ hours: h, minutes: m });

    } else {
      // CREATE MODE (with possible presets)
      setFormData({
        title: '',
        description: '',
        priority: Priority.NORMAL,
        // Use preset status if available, else default
        status: initialTask?.status || columns[0]?.id || 'backlog',
        // Use preset projectId if available, else default
        projectId: initialTask?.projectId || projects[0]?.id || '',
        assignees: [users[0].id],
        attachments: [],
        dueDate: '',
        ...initialTask // Apply any other presets passed
      });
      setTimeSpent({ hours: 0, minutes: 0 });
    }
  }, [initialTask, isOpen, projects, users, columns]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert Hours/Minutes back to total seconds
    const totalSeconds = (Number(timeSpent.hours) * 3600) + (Number(timeSpent.minutes) * 60);

    const processedData = {
      ...formData,
      timeTracked: totalSeconds,
      dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : ''
    };

    if (initialTask?.id) {
      updateTask(initialTask.id, processedData);
    } else {
      addTask(processedData as any);
    }
    onClose();
  };

  const handleDelete = () => {
    if (initialTask?.id && confirm('Tem certeza que deseja excluir esta tarefa?')) {
      deleteTask(initialTask.id);
      onClose();
    }
  };

  const toggleAssignee = (userId: string) => {
    const currentAssignees = formData.assignees || [];
    if (currentAssignees.includes(userId)) {
      setFormData({ ...formData, assignees: currentAssignees.filter(id => id !== userId) });
    } else {
      setFormData({ ...formData, assignees: [...currentAssignees, userId] });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const newAttachment: Attachment = {
        id: `att${Date.now()}`,
        name: file.name,
        type: file.type,
        url: URL.createObjectURL(file) // Create a fake local URL
      };
      setFormData({ ...formData, attachments: [...(formData.attachments || []), newAttachment] });
    }
  };

  const removeAttachment = (attId: string) => {
    setFormData({ ...formData, attachments: (formData.attachments || []).filter(a => a.id !== attId) });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-800">
        <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {initialTask?.id ? 'Editar Tarefa' : 'Nova Tarefa'}
          </h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-2">
              <Input 
                label="Título da Tarefa" 
                value={formData.title} 
                onChange={e => setFormData({...formData, title: e.target.value})}
                required
                placeholder="ex: Corrigir layout da home"
              />
            </div>

            <Select 
              label="Status" 
              options={columns.map(c => ({ label: c.title, value: c.id }))}
              value={formData.status}
              onChange={e => setFormData({...formData, status: e.target.value})}
            />

            <Select 
              label="Prioridade" 
              options={Object.values(Priority).map(p => ({ label: p, value: p }))}
              value={formData.priority}
              onChange={e => setFormData({...formData, priority: e.target.value as Priority})}
            />

            <Select 
              label="Projeto" 
              options={projects.map(p => ({ label: p.name, value: p.id }))}
              value={formData.projectId}
              onChange={e => setFormData({...formData, projectId: e.target.value})}
            />

            <div className="col-span-1">
              <Input 
                type="date"
                label="Data de Entrega (Opcional)" 
                value={formData.dueDate}
                onChange={e => setFormData({...formData, dueDate: e.target.value})}
              />
            </div>

            {/* Time Tracking Manual Input */}
            <div className="col-span-1">
               <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tempo Gasto</label>
               <div className="flex items-center space-x-2">
                 <div className="relative w-full">
                    <Input 
                       type="number" 
                       min="0"
                       value={timeSpent.hours}
                       onChange={(e) => setTimeSpent({ ...timeSpent, hours: Math.max(0, parseInt(e.target.value) || 0) })}
                       className="pr-8"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-medium pointer-events-none">H</span>
                 </div>
                 <div className="relative w-full">
                    <Input 
                       type="number" 
                       min="0"
                       max="59"
                       value={timeSpent.minutes}
                       onChange={(e) => setTimeSpent({ ...timeSpent, minutes: Math.min(59, Math.max(0, parseInt(e.target.value) || 0)) })}
                       className="pr-8"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-medium pointer-events-none">M</span>
                 </div>
               </div>
            </div>

            {/* Custom Multi-Select for Assignees */}
            <div className="col-span-2 relative">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Responsáveis</label>
              <div 
                className="w-full rounded-lg border border-slate-300 bg-white dark:bg-slate-900 dark:border-slate-700 px-3 py-2 text-sm cursor-pointer min-h-[42px] flex flex-wrap gap-1"
                onClick={() => setShowAssigneeDropdown(!showAssigneeDropdown)}
              >
                {formData.assignees && formData.assignees.length > 0 ? (
                  formData.assignees.map(id => {
                    const u = users.find(user => user.id === id);
                    return u ? (
                      <span key={id} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {u.name}
                      </span>
                    ) : null;
                  })
                ) : (
                  <span className="text-slate-400">Selecione responsáveis...</span>
                )}
              </div>
              
              {showAssigneeDropdown && (
                <div className="absolute z-10 mt-1 w-full bg-white dark:bg-slate-800 shadow-lg max-h-48 rounded-md py-1 text-base ring-1 ring-slate-200 dark:ring-slate-700 overflow-auto focus:outline-none sm:text-sm border border-slate-200 dark:border-slate-700">
                  {users.map(u => (
                    <div 
                      key={u.id}
                      className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-900 dark:text-white"
                      onClick={() => toggleAssignee(u.id)}
                    >
                      <div className="flex items-center">
                        <img src={u.avatarUrl} alt="" className="h-6 w-6 flex-shrink-0 rounded-full mr-2" />
                        <span className="font-normal block truncate">{u.name}</span>
                      </div>
                      {formData.assignees?.includes(u.id) && (
                        <span className="text-primary-500 absolute inset-y-0 right-0 flex items-center pr-4">
                          <Check size={16} />
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="col-span-2">
              <Textarea 
                label="Descrição" 
                rows={5}
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                placeholder="Adicione instruções detalhadas..."
              />
            </div>

            {/* Attachments Section */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Anexos</label>
              <div className="space-y-3">
                 <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    onChange={handleFileUpload}
                 />
                 <div className="flex flex-wrap gap-2">
                    {formData.attachments?.map(att => (
                       <div key={att.id} className="flex items-center p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm border border-slate-200 dark:border-slate-700">
                          <FileIcon size={14} className="mr-2 text-primary-500" />
                          <span className="truncate max-w-[150px] mr-2 dark:text-white">{att.name}</span>
                          <button type="button" onClick={() => removeAttachment(att.id)} className="text-slate-400 hover:text-red-500">
                             <Trash2 size={14} />
                          </button>
                       </div>
                    ))}
                    <button 
                       type="button" 
                       onClick={() => fileInputRef.current?.click()}
                       className="flex items-center px-3 py-2 border border-dashed border-slate-300 dark:border-slate-600 rounded-lg text-slate-500 hover:text-primary-500 hover:border-primary-500 text-sm transition-colors"
                    >
                       <Upload size={14} className="mr-2" /> Upload
                    </button>
                 </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
             {initialTask?.id && canDeleteTask ? (
               <Button type="button" variant="danger" onClick={handleDelete}>Excluir</Button>
             ) : (
               <div></div>
             )}
             <div className="flex space-x-3">
               <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
               <Button type="submit">Salvar</Button>
             </div>
          </div>
        </form>
      </div>
      {/* Overlay to close assignee dropdown if clicked outside */}
      {showAssigneeDropdown && <div className="fixed inset-0 z-0" onClick={() => setShowAssigneeDropdown(false)} style={{backgroundColor: 'transparent'}}></div>}
    </div>
  );
};