
import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { 
  Project, 
  Task, 
  Comment, 
  Note, 
  CheckItem, 
  CalendarEvent 
} from '../types';
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ProjectContextType {
  projects: Project[];
  tasks: Task[];
  comments: Comment[];
  notes: Note[];
  checkItems: CheckItem[];
  events: CalendarEvent[];
  currentProject: Project | null;
  loading: boolean;
  
  // Project methods
  addProject: (name: string, description: string) => Promise<Project>;
  updateProject: (project: Project) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  setCurrentProject: (project: Project | null) => void;
  
  // Task methods
  addTask: (projectId: string, title: string, description: string, status: Task['status'], dueDate?: string) => Promise<Task>;
  updateTask: (task: Task) => Promise<void>;
  updateTaskStatus: (taskId: string, status: Task['status']) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  getProjectTasks: (projectId: string) => Task[];
  
  // Comment methods
  addComment: (taskId: string, content: string) => Promise<Comment>;
  deleteComment: (id: string) => Promise<void>;
  getTaskComments: (taskId: string) => Comment[];
  
  // Note methods
  addNote: (projectId: string, title: string, content: string) => Promise<Note>;
  updateNote: (note: Note) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  getProjectNotes: (projectId: string) => Note[];
  
  // CheckItem methods
  addCheckItem: (noteId: string, content: string) => Promise<CheckItem>;
  toggleCheckItem: (id: string) => Promise<void>;
  deleteCheckItem: (id: string) => Promise<void>;
  getNoteCheckItems: (noteId: string) => CheckItem[];
  
  // Calendar event methods
  addEvent: (projectId: string, title: string, description: string, startDate: string, endDate: string) => Promise<CalendarEvent>;
  updateEvent: (event: CalendarEvent) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  getProjectEvents: (projectId: string) => CalendarEvent[];

  // Board column methods
  addBoardColumn: (projectId: string, name: string) => Promise<any>;
  updateBoardColumn: (columnId: string, name: string) => Promise<void>;
  deleteBoardColumn: (columnId: string) => Promise<void>;
  getProjectBoardColumns: (projectId: string) => any[];
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [checkItems, setCheckItems] = useState<CheckItem[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [boardColumns, setBoardColumns] = useState<any[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch all data on initial load
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        // Fetch projects
        const { data: projectsData, error: projectsError } = await supabase
          .from('projects')
          .select('*');
          
        if (projectsError) throw projectsError;
        setProjects(projectsData);
        
        // Fetch tasks
        const { data: tasksData, error: tasksError } = await supabase
          .from('tasks')
          .select('*');
          
        if (tasksError) throw tasksError;
        setTasks(tasksData);
        
        // Fetch comments
        const { data: commentsData, error: commentsError } = await supabase
          .from('comments')
          .select('*');
          
        if (commentsError) throw commentsError;
        setComments(commentsData);
        
        // Fetch notes
        const { data: notesData, error: notesError } = await supabase
          .from('notes')
          .select('*');
          
        if (notesError) throw notesError;
        setNotes(notesData);
        
        // Fetch check items
        const { data: checkItemsData, error: checkItemsError } = await supabase
          .from('check_items')
          .select('*');
          
        if (checkItemsError) throw checkItemsError;
        setCheckItems(checkItemsData);
        
        // Fetch events
        const { data: eventsData, error: eventsError } = await supabase
          .from('events')
          .select('*');
          
        if (eventsError) throw eventsError;
        setEvents(eventsData);

        // Fetch board columns
        const { data: columnsData, error: columnsError } = await supabase
          .from('board_columns')
          .select('*')
          .order('position');
          
        if (columnsError) throw columnsError;
        setBoardColumns(columnsData);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to fetch data from database");
      } finally {
        setLoading(false);
      }
    };
    
    fetchAllData();
    
    // Subscribe to realtime changes
    const projectsSubscription = supabase
      .channel('public:projects')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, payload => {
        if (payload.eventType === 'INSERT') {
          setProjects(prev => [...prev, payload.new as Project]);
        } else if (payload.eventType === 'UPDATE') {
          setProjects(prev => prev.map(p => p.id === payload.new.id ? payload.new as Project : p));
          if (currentProject?.id === payload.new.id) {
            setCurrentProject(payload.new as Project);
          }
        } else if (payload.eventType === 'DELETE') {
          setProjects(prev => prev.filter(p => p.id !== payload.old.id));
          if (currentProject?.id === payload.old.id) {
            setCurrentProject(null);
          }
        }
      })
      .subscribe();
      
    // Add more subscriptions for other tables as needed
    
    return () => {
      supabase.removeChannel(projectsSubscription);
      // Remove other channels
    };
  }, []);

  // Project methods
  const addProject = async (name: string, description: string): Promise<Project> => {
    try {
      const newProject = {
        name,
        description,
      };
      
      const { data, error } = await supabase
        .from('projects')
        .insert(newProject)
        .select()
        .single();
      
      if (error) throw error;
      
      // Create default board columns for this project
      const defaultColumns = [
        { name: 'To Do', position: 0, project_id: data.id },
        { name: 'In Progress', position: 1, project_id: data.id },
        { name: 'Review', position: 2, project_id: data.id },
        { name: 'Done', position: 3, project_id: data.id }
      ];
      
      await supabase.from('board_columns').insert(defaultColumns);
      
      toast.success("Project created successfully");
      return data;
    } catch (error) {
      console.error("Error adding project:", error);
      toast.error("Failed to create project");
      throw error;
    }
  };

  const updateProject = async (project: Project): Promise<void> => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({
          name: project.name,
          description: project.description
        })
        .eq('id', project.id);
        
      if (error) throw error;
      
      toast.success("Project updated successfully");
    } catch (error) {
      console.error("Error updating project:", error);
      toast.error("Failed to update project");
      throw error;
    }
  };

  const deleteProject = async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      // Related items will be deleted automatically through CASCADE
      
      if (currentProject && currentProject.id === id) {
        setCurrentProject(null);
      }
      
      toast.success("Project deleted successfully");
    } catch (error) {
      console.error("Error deleting project:", error);
      toast.error("Failed to delete project");
      throw error;
    }
  };

  // Task methods
  const addTask = async (projectId: string, title: string, description: string, status: Task['status'], dueDate?: string): Promise<Task> => {
    try {
      let columnId;
      const defaultColumn = boardColumns.find(col => col.project_id === projectId && col.name.toLowerCase().includes('to do'));
      
      if (defaultColumn) {
        columnId = defaultColumn.id;
      }
      
      const newTask = {
        project_id: projectId,
        title,
        description,
        status,
        column_id: columnId,
        due_date: dueDate || null,
      };
      
      const { data, error } = await supabase
        .from('tasks')
        .insert(newTask)
        .select()
        .single();
        
      if (error) throw error;
      
      setTasks([...tasks, data]);
      toast.success("Task added successfully");
      return data;
    } catch (error) {
      console.error("Error adding task:", error);
      toast.error("Failed to add task");
      throw error;
    }
  };

  const updateTask = async (task: Task): Promise<void> => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          title: task.title,
          description: task.description,
          status: task.status,
          column_id: task.column_id,
          position: task.position,
          due_date: task.due_date
        })
        .eq('id', task.id);
        
      if (error) throw error;
      
      setTasks(tasks.map(t => t.id === task.id ? task : t));
      toast.success("Task updated successfully");
    } catch (error) {
      console.error("Error updating task:", error);
      toast.error("Failed to update task");
      throw error;
    }
  };

  const updateTaskStatus = async (taskId: string, status: Task['status']): Promise<void> => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;
      
      const { error } = await supabase
        .from('tasks')
        .update({ status })
        .eq('id', taskId);
        
      if (error) throw error;
      
      setTasks(tasks.map(t => t.id === taskId ? { ...t, status } : t));
    } catch (error) {
      console.error("Error updating task status:", error);
      toast.error("Failed to update task status");
      throw error;
    }
  };

  const deleteTask = async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      // Comments will be deleted through CASCADE
      
      setTasks(tasks.filter(t => t.id !== id));
      toast.success("Task deleted successfully");
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("Failed to delete task");
      throw error;
    }
  };

  const getProjectTasks = (projectId: string): Task[] => {
    return tasks.filter(task => task.project_id === projectId);
  };

  // Comment methods
  const addComment = async (taskId: string, content: string): Promise<Comment> => {
    try {
      const newComment = {
        task_id: taskId,
        content,
      };
      
      const { data, error } = await supabase
        .from('comments')
        .insert(newComment)
        .select()
        .single();
        
      if (error) throw error;
      
      setComments([...comments, data]);
      toast.success("Comment added");
      return data;
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Failed to add comment");
      throw error;
    }
  };

  const deleteComment = async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      setComments(comments.filter(c => c.id !== id));
      toast.success("Comment deleted");
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast.error("Failed to delete comment");
      throw error;
    }
  };

  const getTaskComments = (taskId: string): Comment[] => {
    return comments.filter(comment => comment.task_id === taskId);
  };

  // Note methods
  const addNote = async (projectId: string, title: string, content: string): Promise<Note> => {
    try {
      const newNote = {
        project_id: projectId,
        title,
        content,
      };
      
      const { data, error } = await supabase
        .from('notes')
        .insert(newNote)
        .select()
        .single();
        
      if (error) throw error;
      
      setNotes([...notes, data]);
      toast.success("Note created successfully");
      return data;
    } catch (error) {
      console.error("Error adding note:", error);
      toast.error("Failed to create note");
      throw error;
    }
  };

  const updateNote = async (note: Note): Promise<void> => {
    try {
      const { error } = await supabase
        .from('notes')
        .update({
          title: note.title,
          content: note.content
        })
        .eq('id', note.id);
        
      if (error) throw error;
      
      setNotes(notes.map(n => n.id === note.id ? note : n));
      toast.success("Note updated successfully");
    } catch (error) {
      console.error("Error updating note:", error);
      toast.error("Failed to update note");
      throw error;
    }
  };

  const deleteNote = async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      // CheckItems will be deleted through CASCADE
      
      setNotes(notes.filter(n => n.id !== id));
      setCheckItems(checkItems.filter(c => c.note_id !== id));
      toast.success("Note deleted successfully");
    } catch (error) {
      console.error("Error deleting note:", error);
      toast.error("Failed to delete note");
      throw error;
    }
  };

  const getProjectNotes = (projectId: string): Note[] => {
    return notes.filter(note => note.project_id === projectId);
  };

  // CheckItem methods
  const addCheckItem = async (noteId: string, content: string): Promise<CheckItem> => {
    try {
      const newCheckItem = {
        note_id: noteId,
        content,
        checked: false,
      };
      
      const { data, error } = await supabase
        .from('check_items')
        .insert(newCheckItem)
        .select()
        .single();
        
      if (error) throw error;
      
      setCheckItems([...checkItems, data]);
      return data;
    } catch (error) {
      console.error("Error adding check item:", error);
      toast.error("Failed to add check item");
      throw error;
    }
  };

  const toggleCheckItem = async (id: string): Promise<void> => {
    try {
      const item = checkItems.find(item => item.id === id);
      if (!item) return;
      
      const { error } = await supabase
        .from('check_items')
        .update({ checked: !item.checked })
        .eq('id', id);
        
      if (error) throw error;
      
      setCheckItems(
        checkItems.map(item => 
          item.id === id ? { ...item, checked: !item.checked } : item
        )
      );
    } catch (error) {
      console.error("Error toggling check item:", error);
      toast.error("Failed to update check item");
      throw error;
    }
  };

  const deleteCheckItem = async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('check_items')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      setCheckItems(checkItems.filter(item => item.id !== id));
    } catch (error) {
      console.error("Error deleting check item:", error);
      toast.error("Failed to delete check item");
      throw error;
    }
  };

  const getNoteCheckItems = (noteId: string): CheckItem[] => {
    return checkItems.filter(item => item.note_id === noteId);
  };

  // Calendar event methods
  const addEvent = async (projectId: string, title: string, description: string, startDate: string, endDate: string): Promise<CalendarEvent> => {
    try {
      const newEvent = {
        project_id: projectId,
        title,
        description,
        start_date: startDate,
        end_date: endDate,
      };
      
      const { data, error } = await supabase
        .from('events')
        .insert(newEvent)
        .select()
        .single();
        
      if (error) throw error;
      
      setEvents([...events, data]);
      toast.success("Event added to calendar");
      return data;
    } catch (error) {
      console.error("Error adding event:", error);
      toast.error("Failed to add event");
      throw error;
    }
  };

  const updateEvent = async (event: CalendarEvent): Promise<void> => {
    try {
      const { error } = await supabase
        .from('events')
        .update({
          title: event.title,
          description: event.description,
          start_date: event.start_date,
          end_date: event.end_date
        })
        .eq('id', event.id);
        
      if (error) throw error;
      
      setEvents(events.map(e => e.id === event.id ? event : e));
      toast.success("Event updated successfully");
    } catch (error) {
      console.error("Error updating event:", error);
      toast.error("Failed to update event");
      throw error;
    }
  };

  const deleteEvent = async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      setEvents(events.filter(e => e.id !== id));
      toast.success("Event deleted successfully");
    } catch (error) {
      console.error("Error deleting event:", error);
      toast.error("Failed to delete event");
      throw error;
    }
  };

  const getProjectEvents = (projectId: string): CalendarEvent[] => {
    return events.filter(event => event.project_id === projectId);
  };

  // Board column methods
  const addBoardColumn = async (projectId: string, name: string): Promise<any> => {
    try {
      // Get the highest position for this project
      const projectColumns = boardColumns.filter(col => col.project_id === projectId);
      const position = projectColumns.length > 0 
        ? Math.max(...projectColumns.map(col => col.position)) + 1 
        : 0;
      
      const newColumn = {
        project_id: projectId,
        name,
        position
      };
      
      const { data, error } = await supabase
        .from('board_columns')
        .insert(newColumn)
        .select()
        .single();
        
      if (error) throw error;
      
      setBoardColumns([...boardColumns, data]);
      toast.success("Column added successfully");
      return data;
    } catch (error) {
      console.error("Error adding board column:", error);
      toast.error("Failed to add column");
      throw error;
    }
  };

  const updateBoardColumn = async (columnId: string, name: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('board_columns')
        .update({ name })
        .eq('id', columnId);
        
      if (error) throw error;
      
      setBoardColumns(boardColumns.map(col => 
        col.id === columnId ? { ...col, name } : col
      ));
      toast.success("Column updated successfully");
    } catch (error) {
      console.error("Error updating board column:", error);
      toast.error("Failed to update column");
      throw error;
    }
  };

  const deleteBoardColumn = async (columnId: string): Promise<void> => {
    try {
      // First update any tasks in this column to have null column_id
      await supabase
        .from('tasks')
        .update({ column_id: null })
        .eq('column_id', columnId);
      
      // Then delete the column
      const { error } = await supabase
        .from('board_columns')
        .delete()
        .eq('id', columnId);
        
      if (error) throw error;
      
      setBoardColumns(boardColumns.filter(col => col.id !== columnId));
      toast.success("Column deleted successfully");
    } catch (error) {
      console.error("Error deleting board column:", error);
      toast.error("Failed to delete column");
      throw error;
    }
  };

  const getProjectBoardColumns = (projectId: string) => {
    return boardColumns
      .filter(column => column.project_id === projectId)
      .sort((a, b) => a.position - b.position);
  };

  const value = {
    projects,
    tasks,
    comments,
    notes,
    checkItems,
    events,
    currentProject,
    loading,
    addProject,
    updateProject,
    deleteProject,
    setCurrentProject,
    addTask,
    updateTask,
    updateTaskStatus,
    deleteTask,
    getProjectTasks,
    addComment,
    deleteComment,
    getTaskComments,
    addNote,
    updateNote,
    deleteNote,
    getProjectNotes,
    addCheckItem,
    toggleCheckItem,
    deleteCheckItem,
    getNoteCheckItems,
    addEvent,
    updateEvent,
    deleteEvent,
    getProjectEvents,
    addBoardColumn,
    updateBoardColumn,
    deleteBoardColumn,
    getProjectBoardColumns,
  };

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
};

export const useProjects = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
};
