import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Task, User, Project, Column, Notification, TaskStatus } from '../types';
import { MOCK_USERS, MOCK_PROJECTS, INITIAL_TASKS, BOARD_COLUMNS } from '../constants';

interface AppState {
  user: User | null;
  users: User[];
  tasks: Task[];
  projects: Project[];
  columns: Column[];
  notifications: Notification[];
  isDarkMode: boolean;
  activeTaskId: string | null;
  sidebarOpen: boolean;
}

interface AppContextType extends AppState {
  login: (email: string, password?: string) => Promise<void>;
  loginDemo: () => void; // New function
  logout: () => void;
  toggleTheme: () => void;
  toggleSidebar: () => void;
  
  // Task Actions
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'timeTracked' | 'isTracking' | 'attachments'>) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  moveTask: (taskId: string, newStatus: string) => void;
  setActiveDragTask: (taskId: string | null) => void;
  toggleTimeTracking: (taskId: string) => void;

  // Project Actions
  addProject: (project: Omit<Project, 'id' | 'members'>) => void;
  updateProject: (projectId: string, updates: Partial<Project>) => void;
  deleteProject: (projectId: string) => void;
  toggleProjectMember: (projectId: string, userId: string) => void;

  // Column Actions
  addColumn: (title: string) => void;
  updateColumn: (columnId: string, title: string) => void;
  deleteColumn: (columnId: string) => void;

  // Team Actions
  addUser: (user: Omit<User, 'id'>) => void;
  updateUser: (userId: string, updates: Partial<User>) => void;

  // Notifications
  addNotification: (notification: Omit<Notification, 'id' | 'date' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [columns, setColumns] = useState<Column[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  // --- Theme Logic ---
  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true);
    }
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // --- Fetch Data on Mount / Auth Change ---
  useEffect(() => {
    if (isDemo) return; // Skip supabase fetch if in demo mode
    if (!isSupabaseConfigured) return; // Skip if no config

    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchProfile(session.user.id);
        fetchInitialData();
      }
    }).catch(err => console.error("Session check failed", err));

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchProfile(session.user.id);
        fetchInitialData();
      } else if (!isDemo) {
        setUser(null);
        setTasks([]);
        setProjects([]);
      }
    });

    return () => subscription.unsubscribe();
  }, [isDemo]);

  // --- Data Fetching Helpers ---
  const fetchProfile = async (userId: string) => {
    if (!isSupabaseConfigured) return;
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (data) {
      setUser({
        id: data.id,
        email: data.email,
        name: data.name,
        role: data.role as any,
        avatarUrl: data.avatar_url
      });
    }
  };

  const fetchInitialData = async () => {
    if (!isSupabaseConfigured) return;
    
    // 1. Fetch Users (Profiles)
    const { data: usersData } = await supabase.from('profiles').select('*');
    if (usersData) {
      setUsers(usersData.map((u: any) => ({
        id: u.id,
        email: u.email,
        name: u.name,
        role: u.role,
        avatarUrl: u.avatar_url
      })));
    }

    // 2. Fetch Columns
    const { data: colsData } = await supabase.from('columns').select('*').order('order');
    if (colsData) setColumns(colsData);

    // 3. Fetch Projects
    const { data: projData } = await supabase.from('projects').select('*');
    if (projData) {
      setProjects(projData.map((p: any) => ({
        id: p.id,
        name: p.name,
        clientName: p.client_name,
        budget: p.budget,
        color: p.color,
        members: p.members || []
      })));
    }

    // 4. Fetch Tasks
    const { data: tasksData } = await supabase.from('tasks').select('*');
    if (tasksData) {
      setTasks(tasksData.map((t: any) => ({
        id: t.id,
        title: t.title,
        description: t.description,
        status: t.status,
        priority: t.priority,
        projectId: t.project_id,
        assignees: t.assignees || [],
        dueDate: t.due_date,
        timeTracked: t.time_tracked,
        isTracking: t.is_tracking,
        tags: t.tags || [],
        createdAt: t.created_at,
        subtasks: [], // Subtasks unimplemented in DB for brevity, defaulting empty
        attachments: [] 
      })));
    }
  };

  // --- Auth Logic ---
  const login = async (email: string, password?: string) => {
    if (!isSupabaseConfigured) {
      alert("Configuração do Supabase ausente. Use o Modo Demonstração.");
      return;
    }

    if (!password) {
       alert("Senha necessária para autenticação real.");
       return;
    }
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      throw error;
    }
  };

  const loginDemo = () => {
    setIsDemo(true);
    setUser(MOCK_USERS[0]); // Admin user
    setUsers(MOCK_USERS);
    setTasks(INITIAL_TASKS);
    setProjects(MOCK_PROJECTS);
    setColumns(BOARD_COLUMNS);
    addNotification({ title: 'Modo Demonstração', message: 'Você está visualizando dados de exemplo.', type: 'info' });
  };

  const logout = async () => {
    if (isDemo) {
      setIsDemo(false);
      setUser(null);
      setTasks([]);
      setProjects([]);
    } else {
      if (isSupabaseConfigured) {
        await supabase.auth.signOut();
      }
      setUser(null);
    }
  };

  const toggleTheme = () => setIsDarkMode(!isDarkMode);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // --- Task Logic ---
  const addTask = async (newTaskData: Omit<Task, 'id' | 'createdAt' | 'timeTracked' | 'isTracking' | 'attachments'>) => {
    if (isDemo || !isSupabaseConfigured) {
      const newTask: Task = {
        ...newTaskData,
        id: `t${Date.now()}`,
        createdAt: new Date().toISOString(),
        timeTracked: 0,
        isTracking: false,
        attachments: [],
        subtasks: []
      };
      setTasks(prev => [...prev, newTask]);
      addNotification({ title: 'Nova Tarefa', message: `Tarefa "${newTask.title}" criada.`, type: 'info' });
      return;
    }

    const dbTask = {
      title: newTaskData.title,
      description: newTaskData.description,
      status: newTaskData.status,
      priority: newTaskData.priority,
      project_id: newTaskData.projectId,
      assignees: newTaskData.assignees,
      due_date: newTaskData.dueDate || null,
      tags: newTaskData.tags,
      time_tracked: 0,
      is_tracking: false
    };

    const { data, error } = await supabase.from('tasks').insert(dbTask).select().single();

    if (data && !error) {
      const newTask: Task = {
        ...newTaskData,
        id: data.id,
        createdAt: data.created_at,
        timeTracked: 0,
        isTracking: false,
        attachments: [],
        subtasks: []
      };
      setTasks(prev => [...prev, newTask]);
      addNotification({ title: 'Nova Tarefa', message: `Tarefa "${newTask.title}" criada.`, type: 'info' });
    }
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updates } : t));

    if (isDemo || !isSupabaseConfigured) return;

    // Map camelCase to snake_case for DB
    const dbUpdates: any = {};
    if (updates.title) dbUpdates.title = updates.title;
    if (updates.description) dbUpdates.description = updates.description;
    if (updates.status) dbUpdates.status = updates.status;
    if (updates.priority) dbUpdates.priority = updates.priority;
    if (updates.projectId) dbUpdates.project_id = updates.projectId;
    if (updates.assignees) dbUpdates.assignees = updates.assignees;
    if (updates.dueDate) dbUpdates.due_date = updates.dueDate;
    if (updates.timeTracked !== undefined) dbUpdates.time_tracked = updates.timeTracked;
    if (updates.isTracking !== undefined) dbUpdates.is_tracking = updates.isTracking;

    await supabase.from('tasks').update(dbUpdates).eq('id', taskId);
  };

  const deleteTask = async (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
    if (!isDemo && isSupabaseConfigured) {
      await supabase.from('tasks').delete().eq('id', taskId);
    }
  };

  const moveTask = async (taskId: string, newStatus: string) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    if (!isDemo && isSupabaseConfigured) {
      await supabase.from('tasks').update({ status: newStatus }).eq('id', taskId);
    }
  };

  const toggleTimeTracking = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    const newStatus = !task.isTracking;
    
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) return { ...t, isTracking: newStatus };
      return t;
    }));

    if (!isDemo && isSupabaseConfigured) {
      await supabase.from('tasks').update({ is_tracking: newStatus }).eq('id', taskId);
    }
  };

  // Timer Interval for isTracking tasks
  useEffect(() => {
    const interval = setInterval(() => {
      setTasks(prev => {
        const hasTracking = prev.some(t => t.isTracking);
        if(!hasTracking) return prev;

        return prev.map(t => {
          if (t.isTracking) {
             return { ...t, timeTracked: t.timeTracked + 1 };
          }
          return t;
        });
      });
    }, 1000);

    const syncInterval = setInterval(() => {
      if (isDemo || !isSupabaseConfigured) return;
      tasks.forEach(t => {
        if(t.isTracking) {
           updateTask(t.id, { timeTracked: t.timeTracked });
        }
      });
    }, 30000);

    return () => {
      clearInterval(interval);
      clearInterval(syncInterval);
    };
  }, [tasks, isDemo]); 

  // --- Project Logic ---
  const addProject = async (projectData: Omit<Project, 'id' | 'members'>) => {
    if (isDemo || !isSupabaseConfigured) {
      const newProject: Project = { 
        ...projectData, 
        id: `p${Date.now()}`,
        members: [user?.id || '']
      };
      setProjects([...projects, newProject]);
      addNotification({ title: 'Novo Projeto', message: `Projeto "${newProject.name}" criado.`, type: 'success' });
      return;
    }

    const dbProject = {
      name: projectData.name,
      client_name: projectData.clientName,
      budget: projectData.budget,
      color: projectData.color,
      members: [user?.id]
    };

    const { data } = await supabase.from('projects').insert(dbProject).select().single();
    if (data) {
      const newProject: Project = { 
        ...projectData, 
        id: data.id,
        members: [user?.id || '']
      };
      setProjects([...projects, newProject]);
      addNotification({ title: 'Novo Projeto', message: `Projeto "${newProject.name}" criado.`, type: 'success' });
    }
  };

  const updateProject = async (projectId: string, updates: Partial<Project>) => {
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, ...updates } : p));
    
    if (isDemo || !isSupabaseConfigured) return;

    const dbUpdates: any = {};
    if (updates.name) dbUpdates.name = updates.name;
    if (updates.clientName) dbUpdates.client_name = updates.clientName;
    if (updates.budget) dbUpdates.budget = updates.budget;
    if (updates.color) dbUpdates.color = updates.color;
    if (updates.members) dbUpdates.members = updates.members;

    await supabase.from('projects').update(dbUpdates).eq('id', projectId);
  };

  const deleteProject = async (projectId: string) => {
    setProjects(prev => prev.filter(p => p.id !== projectId));
    setTasks(prev => prev.filter(t => t.projectId !== projectId));
    if (!isDemo && isSupabaseConfigured) {
      await supabase.from('projects').delete().eq('id', projectId);
    }
  };

  const toggleProjectMember = async (projectId: string, userId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    const isMember = project.members.includes(userId);
    const newMembers = isMember 
      ? project.members.filter(id => id !== userId) 
      : [...project.members, userId];

    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, members: newMembers } : p));
    if (!isDemo && isSupabaseConfigured) {
      await supabase.from('projects').update({ members: newMembers }).eq('id', projectId);
    }
  };

  // --- Column Logic ---
  const addColumn = async (title: string) => {
    const newId = title.toLowerCase().replace(/\s+/g, '_');
    const order = columns.length + 1;
    const newColumn: Column = { id: newId, title };
    
    setColumns([...columns, newColumn]);
    if (!isDemo && isSupabaseConfigured) {
      await supabase.from('columns').insert({ id: newId, title, order });
    }
  };

  const updateColumn = async (columnId: string, title: string) => {
    setColumns(prev => prev.map(c => c.id === columnId ? { ...c, title } : c));
    if (!isDemo && isSupabaseConfigured) {
      await supabase.from('columns').update({ title }).eq('id', columnId);
    }
  };

  const deleteColumn = async (columnId: string) => {
    if (confirm('Tem certeza? Tarefas nesta coluna serão movidas para o Backlog.')) {
      setColumns(prev => prev.filter(c => c.id !== columnId));
      
      const fallbackColumn = columns[0].id === columnId ? columns[1]?.id : columns[0].id;
      
      if (fallbackColumn) {
        setTasks(prev => prev.map(t => t.status === columnId ? { ...t, status: fallbackColumn } : t));
        if (!isDemo && isSupabaseConfigured) {
          await supabase.from('tasks').update({ status: fallbackColumn }).eq('status', columnId);
        }
      }
      
      if (!isDemo && isSupabaseConfigured) {
        await supabase.from('columns').delete().eq('id', columnId);
      }
    }
  };

  // --- User Logic ---
  const addUser = async (userData: Omit<User, 'id'>) => {
    if(isDemo || !isSupabaseConfigured) {
      const newUser: User = { ...userData, id: `u${Date.now()}` };
      setUsers([...users, newUser]);
      return;
    }
    alert("Para adicionar usuários reais, use o painel de Autenticação do Supabase ou implemente uma função de convite via email.");
  };

  const updateUser = async (userId: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updates } : u));
    if (user?.id === userId) {
      setUser(prev => prev ? { ...prev, ...updates } : null);
    }
    
    if (isDemo || !isSupabaseConfigured) {
        addNotification({ title: 'Usuário Atualizado', message: 'Dados salvos localmente (Demo).', type: 'info' });
        return;
    }

    const dbUpdates: any = {};
    if (updates.name) dbUpdates.name = updates.name;
    if (updates.role) dbUpdates.role = updates.role;
    if (updates.avatarUrl) dbUpdates.avatar_url = updates.avatarUrl;

    await supabase.from('profiles').update(dbUpdates).eq('id', userId);
    addNotification({ title: 'Usuário Atualizado', message: 'Dados salvos.', type: 'info' });
  };

  // --- Notification Logic ---
  const addNotification = (notif: Omit<Notification, 'id' | 'date' | 'read'>) => {
    const newNotification: Notification = {
      ...notif,
      id: `n${Date.now()}`,
      date: new Date().toISOString(),
      read: false
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <AppContext.Provider value={{
      user, users, tasks, projects, columns, isDarkMode, activeTaskId, sidebarOpen, notifications,
      login, loginDemo, logout, toggleTheme, toggleSidebar,
      addTask, updateTask, deleteTask, moveTask, setActiveDragTask: setActiveTaskId, toggleTimeTracking,
      addProject, updateProject, deleteProject, toggleProjectMember,
      addColumn, updateColumn, deleteColumn,
      addUser, updateUser,
      addNotification, markAsRead, markAllAsRead
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};