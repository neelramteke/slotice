import React, { createContext, useContext, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { 
  Project, 
  Task, 
  Comment, 
  Note, 
  CheckItem, 
  CalendarEvent 
} from '../types';
import { 
  mockProjects, 
  mockTasks, 
  mockComments, 
  mockNotes, 
  mockCheckItems, 
  mockEvents 
} from '../lib/mock-data';
import { toast } from "sonner";

interface ProjectContextType {
  projects: Project[];
  tasks: Task[];
  comments: Comment[];
  notes: Note[];
  checkItems: CheckItem[];
  events: CalendarEvent[];
  currentProject: Project | null;
  
  // Project methods
  addProject: (name: string, description: string) => Project;
  updateProject: (project: Project) => void;
  deleteProject: (id: string) => void;
  setCurrentProject: (project: Project | null) => void;
  
  // Task methods
  addTask: (projectId: string, title: string, description: string, status: Task['status'], dueDate?: string) => void;
  updateTask: (task: Task) => void;
  updateTaskStatus: (taskId: string, status: Task['status']) => void;
  deleteTask: (id: string) => void;
  getProjectTasks: (projectId: string) => Task[];
  
  // Comment methods
  addComment: (taskId: string, content: string) => void;
  deleteComment: (id: string) => void;
  getTaskComments: (taskId: string) => Comment[];
  
  // Note methods
  addNote: (projectId: string, title: string, content: string) => void;
  updateNote: (note: Note) => void;
  deleteNote: (id: string) => void;
  getProjectNotes: (projectId: string) => Note[];
  
  // CheckItem methods
  addCheckItem: (noteId: string, content: string) => void;
  toggleCheckItem: (id: string) => void;
  deleteCheckItem: (id: string) => void;
  getNoteCheckItems: (noteId: string) => CheckItem[];
  
  // Calendar event methods
  addEvent: (projectId: string, title: string, description: string, startDate: string, endDate: string) => void;
  updateEvent: (event: CalendarEvent) => void;
  deleteEvent: (id: string) => void;
  getProjectEvents: (projectId: string) => CalendarEvent[];
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [comments, setComments] = useState<Comment[]>(mockComments);
  const [notes, setNotes] = useState<Note[]>(mockNotes);
  const [checkItems, setCheckItems] = useState<CheckItem[]>(mockCheckItems);
  const [events, setEvents] = useState<CalendarEvent[]>(mockEvents);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);

  // Project methods
  const addProject = (name: string, description: string): Project => {
    const newProject: Project = {
      id: uuidv4(),
      name,
      description,
      created_at: new Date().toISOString(),
    };
    setProjects([...projects, newProject]);
    toast.success("Project created successfully");
    return newProject;
  };

  const updateProject = (project: Project) => {
    setProjects(projects.map(p => p.id === project.id ? project : p));
    toast.success("Project updated successfully");
  };

  const deleteProject = (id: string) => {
    setProjects(projects.filter(p => p.id !== id));
    
    // Clean up related items
    setTasks(tasks.filter(t => t.project_id !== id));
    setNotes(notes.filter(n => n.project_id !== id));
    setEvents(events.filter(e => e.project_id !== id));
    
    // If current project is deleted, reset it
    if (currentProject && currentProject.id === id) {
      setCurrentProject(null);
    }
    
    toast.success("Project deleted successfully");
  };

  // Task methods
  const addTask = (projectId: string, title: string, description: string, status: Task['status'], dueDate?: string) => {
    const newTask: Task = {
      id: uuidv4(),
      project_id: projectId,
      title,
      description,
      status,
      due_date: dueDate || null,
      created_at: new Date().toISOString(),
    };
    setTasks([...tasks, newTask]);
    toast.success("Task added successfully");
    return newTask;
  };

  const updateTask = (task: Task) => {
    setTasks(tasks.map(t => t.id === task.id ? task : t));
    toast.success("Task updated successfully");
  };

  const updateTaskStatus = (taskId: string, status: Task['status']) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, status } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
    
    // Delete related comments
    setComments(comments.filter(c => c.task_id !== id));
    
    toast.success("Task deleted successfully");
  };

  const getProjectTasks = (projectId: string) => {
    return tasks.filter(task => task.project_id === projectId);
  };

  // Comment methods
  const addComment = (taskId: string, content: string) => {
    const newComment: Comment = {
      id: uuidv4(),
      task_id: taskId,
      content,
      created_at: new Date().toISOString(),
    };
    setComments([...comments, newComment]);
    toast.success("Comment added");
    return newComment;
  };

  const deleteComment = (id: string) => {
    setComments(comments.filter(c => c.id !== id));
    toast.success("Comment deleted");
  };

  const getTaskComments = (taskId: string) => {
    return comments.filter(comment => comment.task_id === taskId);
  };

  // Note methods
  const addNote = (projectId: string, title: string, content: string) => {
    const newNote: Note = {
      id: uuidv4(),
      project_id: projectId,
      title,
      content,
      created_at: new Date().toISOString(),
    };
    setNotes([...notes, newNote]);
    toast.success("Note created successfully");
    return newNote;
  };

  const updateNote = (note: Note) => {
    setNotes(notes.map(n => n.id === note.id ? note : n));
    toast.success("Note updated successfully");
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter(n => n.id !== id));
    
    // Delete related check items
    setCheckItems(checkItems.filter(c => c.note_id !== id));
    
    toast.success("Note deleted successfully");
  };

  const getProjectNotes = (projectId: string) => {
    return notes.filter(note => note.project_id === projectId);
  };

  // CheckItem methods
  const addCheckItem = (noteId: string, content: string) => {
    const newCheckItem: CheckItem = {
      id: uuidv4(),
      note_id: noteId,
      content,
      checked: false,
      created_at: new Date().toISOString(),
    };
    setCheckItems([...checkItems, newCheckItem]);
    return newCheckItem;
  };

  const toggleCheckItem = (id: string) => {
    setCheckItems(
      checkItems.map(item => 
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const deleteCheckItem = (id: string) => {
    setCheckItems(checkItems.filter(item => item.id !== id));
  };

  const getNoteCheckItems = (noteId: string) => {
    return checkItems.filter(item => item.note_id === noteId);
  };

  // Calendar event methods
  const addEvent = (projectId: string, title: string, description: string, startDate: string, endDate: string) => {
    const newEvent: CalendarEvent = {
      id: uuidv4(),
      project_id: projectId,
      title,
      description,
      start_date: startDate,
      end_date: endDate,
      created_at: new Date().toISOString(),
    };
    setEvents([...events, newEvent]);
    toast.success("Event added to calendar");
    return newEvent;
  };

  const updateEvent = (event: CalendarEvent) => {
    setEvents(events.map(e => e.id === event.id ? event : e));
    toast.success("Event updated successfully");
  };

  const deleteEvent = (id: string) => {
    setEvents(events.filter(e => e.id !== id));
    toast.success("Event deleted successfully");
  };

  const getProjectEvents = (projectId: string) => {
    return events.filter(event => event.project_id === projectId);
  };

  const value = {
    projects,
    tasks,
    comments,
    notes,
    checkItems,
    events,
    currentProject,
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
