
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { Project, Task, Comment, Note, CheckItem, CalendarEvent, BoardColumn } from '@/types';
import { mockProjects, mockTasks, mockComments, mockNotes, mockCheckItems, mockEvents, mockBoardColumns } from '@/lib/mock-data';
import { v4 as uuidv4 } from 'uuid';

interface ProjectContextType {
  projects: Project[];
  tasks: Task[];
  comments: Comment[];
  notes: Note[];
  checkItems: CheckItem[];
  events: CalendarEvent[];
  columns: BoardColumn[];
  loading: boolean;
  currentProject: Project | null;
  setCurrentProject: (project: Project) => void;
  addProject: (name: string, description: string) => Promise<Project>;
  deleteProject: (id: string) => void;
  addTask: (taskData: Partial<Task>) => Task;
  updateTask: (taskId: string, taskData: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  addColumn: (columnData: Partial<BoardColumn>) => void;
  updateColumn: (columnId: string, columnData: Partial<BoardColumn>) => void;
  deleteColumn: (columnId: string) => void;
  // Note methods
  getProjectNotes: (projectId: string) => Note[];
  addNote: (projectId: string, title: string, content: string) => Promise<Note>;
  updateNote: (note: Note) => Promise<void>;
  deleteNote: (noteId: string) => Promise<void>;
  // Check item methods
  getNoteCheckItems: (noteId: string) => CheckItem[];
  addCheckItem: (noteId: string, content: string) => Promise<void>;
  toggleCheckItem: (checkItemId: string) => void;
  deleteCheckItem: (checkItemId: string) => void;
  // Calendar event methods
  getProjectEvents: (projectId: string) => CalendarEvent[];
  addEvent: (projectId: string, title: string, description: string, startDate: string, endDate: string) => Promise<CalendarEvent>;
  deleteEvent: (eventId: string) => Promise<void>;
  // Task methods for specific views
  getProjectTasks: (projectId: string) => Task[];
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

interface ProjectProviderProps {
  children: ReactNode;
}

export const ProjectProvider: React.FC<ProjectProviderProps> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [checkItems, setCheckItems] = useState<CheckItem[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [columns, setColumns] = useState<BoardColumn[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Initialize with mock data
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      
      // Simulate API fetch delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setProjects(mockProjects);
      setTasks(mockTasks);
      setComments(mockComments);
      setNotes(mockNotes);
      setCheckItems(mockCheckItems);
      setEvents(mockEvents);
      setColumns(mockBoardColumns);
      
      // Set first project as current if available
      if (mockProjects.length > 0) {
        setCurrentProject(mockProjects[0]);
      }
      
      setLoading(false);
    };
    
    initializeData();
  }, []);

  const addProject = async (name: string, description: string): Promise<Project> => {
    const newProject: Project = {
      id: uuidv4(),
      name,
      description,
      created_at: new Date().toISOString(),
    };
    
    setProjects(prev => [...prev, newProject]);
    return newProject;
  };

  const deleteProject = (id: string) => {
    // If the project to be deleted is the current project, set current project to null
    if (currentProject && currentProject.id === id) {
      setCurrentProject(null);
    }
    
    // Delete project and related data
    setProjects(prev => prev.filter(project => project.id !== id));
    setTasks(prev => prev.filter(task => task.project_id !== id));
    setNotes(prev => prev.filter(note => note.project_id !== id));
    setEvents(prev => prev.filter(event => event.project_id !== id));
    setColumns(prev => prev.filter(column => column.project_id !== id));
  };

  const addTask = (taskData: Partial<Task>): Task => {
    const newTask: Task = {
      id: uuidv4(),
      title: taskData.title || '',
      description: taskData.description || '',
      status: taskData.status || 'todo',
      project_id: taskData.project_id || '',
      column_id: taskData.column_id || null,
      position: taskData.position || 0,
      due_date: taskData.due_date || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    setTasks(prev => [...prev, newTask]);
    return newTask;
  };

  const updateTask = (taskId: string, taskData: Partial<Task>) => {
    setTasks(prev => 
      prev.map(task => 
        task.id === taskId 
          ? { ...task, ...taskData, updated_at: new Date().toISOString() } 
          : task
      )
    );
  };

  const deleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
    setComments(prev => prev.filter(comment => comment.task_id !== taskId));
  };

  const addColumn = (columnData: Partial<BoardColumn>) => {
    const newColumn: BoardColumn = {
      id: uuidv4(),
      name: columnData.name || '',
      project_id: columnData.project_id || '',
      position: columnData.position || 0,
      created_at: new Date().toISOString(),
    };
    
    setColumns(prev => [...prev, newColumn]);
  };

  const updateColumn = (columnId: string, columnData: Partial<BoardColumn>) => {
    setColumns(prev => 
      prev.map(column => 
        column.id === columnId 
          ? { ...column, ...columnData } 
          : column
      )
    );
  };

  const deleteColumn = (columnId: string) => {
    // Delete column
    setColumns(prev => prev.filter(column => column.id !== columnId));
    
    // Move tasks to first column or remove column_id
    const projectColumns = columns.filter(col => 
      col.id !== columnId && col.project_id === columns.find(c => c.id === columnId)?.project_id
    );
    
    if (projectColumns.length > 0) {
      // Find the column with the lowest position to move tasks to
      const targetColumn = projectColumns.reduce((prev, curr) => 
        prev.position < curr.position ? prev : curr
      );
      
      // Move tasks to target column
      setTasks(prev => 
        prev.map(task => 
          task.column_id === columnId 
            ? { ...task, column_id: targetColumn.id }
            : task
        )
      );
    } else {
      // If no columns left, set column_id to null
      setTasks(prev => 
        prev.map(task => 
          task.column_id === columnId 
            ? { ...task, column_id: null }
            : task
        )
      );
    }
  };

  // Note methods
  const getProjectNotes = (projectId: string): Note[] => {
    return notes.filter(note => note.project_id === projectId);
  };

  const addNote = async (projectId: string, title: string, content: string): Promise<Note> => {
    const newNote: Note = {
      id: uuidv4(),
      project_id: projectId,
      title,
      content,
      created_at: new Date().toISOString(),
    };
    
    setNotes(prev => [...prev, newNote]);
    return newNote;
  };

  const updateNote = async (updatedNote: Note): Promise<void> => {
    setNotes(prev => prev.map(note => 
      note.id === updatedNote.id 
        ? { ...updatedNote, updated_at: new Date().toISOString() } 
        : note
    ));
  };

  const deleteNote = async (noteId: string): Promise<void> => {
    setNotes(prev => prev.filter(note => note.id !== noteId));
    setCheckItems(prev => prev.filter(item => item.note_id !== noteId));
  };

  // Check item methods
  const getNoteCheckItems = (noteId: string): CheckItem[] => {
    return checkItems.filter(item => item.note_id === noteId);
  };

  const addCheckItem = async (noteId: string, content: string): Promise<void> => {
    const newCheckItem: CheckItem = {
      id: uuidv4(),
      note_id: noteId,
      content,
      checked: false,
      created_at: new Date().toISOString(),
    };
    
    setCheckItems(prev => [...prev, newCheckItem]);
  };

  const toggleCheckItem = (checkItemId: string): void => {
    setCheckItems(prev => prev.map(item => 
      item.id === checkItemId 
        ? { ...item, checked: !item.checked } 
        : item
    ));
  };

  const deleteCheckItem = (checkItemId: string): void => {
    setCheckItems(prev => prev.filter(item => item.id !== checkItemId));
  };

  // Event methods
  const getProjectEvents = (projectId: string): CalendarEvent[] => {
    return events.filter(event => event.project_id === projectId);
  };

  const addEvent = async (
    projectId: string,
    title: string,
    description: string,
    startDate: string,
    endDate: string
  ): Promise<CalendarEvent> => {
    const newEvent: CalendarEvent = {
      id: uuidv4(),
      project_id: projectId,
      title,
      description,
      start_date: startDate,
      end_date: endDate,
      created_at: new Date().toISOString(),
    };
    
    setEvents(prev => [...prev, newEvent]);
    return newEvent;
  };

  const deleteEvent = async (eventId: string): Promise<void> => {
    setEvents(prev => prev.filter(event => event.id !== eventId));
  };

  // Task methods for specific views
  const getProjectTasks = (projectId: string): Task[] => {
    return tasks.filter(task => task.project_id === projectId);
  };

  const value = {
    projects,
    tasks,
    comments,
    notes,
    checkItems,
    events,
    columns,
    loading,
    currentProject,
    setCurrentProject,
    addProject,
    deleteProject,
    addTask,
    updateTask,
    deleteTask,
    addColumn,
    updateColumn,
    deleteColumn,
    getProjectNotes,
    addNote,
    updateNote,
    deleteNote,
    getNoteCheckItems,
    addCheckItem,
    toggleCheckItem,
    deleteCheckItem,
    getProjectEvents,
    addEvent,
    deleteEvent,
    getProjectTasks,
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjects = (): ProjectContextType => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
};
