
import { Project, Task, Comment, Note, CheckItem, CalendarEvent, BoardColumn } from '../types';

// Mock data for initial development (will be replaced by Supabase)

export const mockProjects: Project[] = [
  {
    id: '1',
    name: 'Website Redesign',
    description: 'Complete overhaul of company website with new branding',
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Mobile App Development',
    description: 'Create a companion mobile app for our service',
    created_at: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Marketing Campaign',
    description: 'Q3 digital marketing campaign for product launch',
    created_at: new Date().toISOString(),
  },
];

export const mockTasks: Task[] = [
  {
    id: '101',
    project_id: '1',
    title: 'Create design mockups',
    description: 'Create initial mockups for homepage and key sections',
    status: 'done',
    due_date: new Date(Date.now() + 86400000).toISOString(),
    created_at: new Date().toISOString(),
    column_id: 'col-1', // Added column_id
    position: 0, // Added position
    updated_at: new Date().toISOString(), // Added updated_at
  },
  {
    id: '102',
    project_id: '1',
    title: 'Frontend development',
    description: 'Implement the new design in React',
    status: 'in_progress',
    due_date: new Date(Date.now() + 86400000 * 7).toISOString(),
    created_at: new Date().toISOString(),
    column_id: 'col-2', // Added column_id
    position: 1, // Added position
    updated_at: new Date().toISOString(), // Added updated_at
  },
  {
    id: '103',
    project_id: '1',
    title: 'Backend API updates',
    description: 'Update API endpoints for new features',
    status: 'todo',
    due_date: new Date(Date.now() + 86400000 * 14).toISOString(),
    created_at: new Date().toISOString(),
    column_id: 'col-3', // Added column_id
    position: 2, // Added position
    updated_at: new Date().toISOString(), // Added updated_at
  },
  {
    id: '104',
    project_id: '1',
    title: 'Testing and QA',
    description: 'Comprehensive testing of new website',
    status: 'todo',
    due_date: new Date(Date.now() + 86400000 * 21).toISOString(),
    created_at: new Date().toISOString(),
    column_id: 'col-3', // Added column_id
    position: 3, // Added position
    updated_at: new Date().toISOString(), // Added updated_at
  },
  {
    id: '201',
    project_id: '2',
    title: 'App wireframing',
    description: 'Create wireframes for key app screens',
    status: 'done',
    due_date: new Date(Date.now() - 86400000 * 3).toISOString(),
    created_at: new Date().toISOString(),
    column_id: 'col-1', // Added column_id
    position: 0, // Added position
    updated_at: new Date().toISOString(), // Added updated_at
  },
  {
    id: '202',
    project_id: '2',
    title: 'UI Design',
    description: 'Design UI components and screens',
    status: 'in_progress',
    due_date: new Date(Date.now() + 86400000 * 5).toISOString(),
    created_at: new Date().toISOString(),
    column_id: 'col-2', // Added column_id
    position: 1, // Added position
    updated_at: new Date().toISOString(), // Added updated_at
  },
];

export const mockComments: Comment[] = [
  {
    id: '1001',
    task_id: '101',
    content: 'Mockups look great! Ready for development.',
    created_at: new Date().toISOString(),
  },
  {
    id: '1002',
    task_id: '102',
    content: 'Working on responsive layouts now.',
    created_at: new Date().toISOString(),
  },
];

export const mockNotes: Note[] = [
  {
    id: '301',
    project_id: '1',
    title: 'Design System',
    content: 'Notes about our design system components',
    created_at: new Date().toISOString(),
  },
  {
    id: '302',
    project_id: '2',
    title: 'App Requirements',
    content: 'Key requirements for the mobile app',
    created_at: new Date().toISOString(),
  },
];

export const mockCheckItems: CheckItem[] = [
  {
    id: '401',
    note_id: '301',
    content: 'Define color palette',
    checked: true,
    created_at: new Date().toISOString(),
  },
  {
    id: '402',
    note_id: '301',
    content: 'Create component library',
    checked: false,
    created_at: new Date().toISOString(),
  },
  {
    id: '403',
    note_id: '302',
    content: 'User profile screens',
    checked: true,
    created_at: new Date().toISOString(),
  },
  {
    id: '404',
    note_id: '302',
    content: 'Payment integration',
    checked: false,
    created_at: new Date().toISOString(),
  },
];

export const mockEvents: CalendarEvent[] = [
  {
    id: '501',
    project_id: '1',
    title: 'Design Review',
    description: 'Review website mockups with team',
    start_date: new Date(Date.now() + 86400000 * 2).toISOString(),
    end_date: new Date(Date.now() + 86400000 * 2 + 3600000 * 2).toISOString(),
    created_at: new Date().toISOString(),
  },
  {
    id: '502',
    project_id: '1',
    title: 'Client Presentation',
    description: 'Present website design to client',
    start_date: new Date(Date.now() + 86400000 * 5).toISOString(),
    end_date: new Date(Date.now() + 86400000 * 5 + 3600000 * 1).toISOString(),
    created_at: new Date().toISOString(),
  },
];

// Add mock board columns
export const mockBoardColumns: BoardColumn[] = [
  {
    id: 'col-1',
    project_id: '1',
    name: 'Done',
    position: 2,
    created_at: new Date().toISOString(),
  },
  {
    id: 'col-2',
    project_id: '1',
    name: 'In Progress',
    position: 1,
    created_at: new Date().toISOString(),
  },
  {
    id: 'col-3',
    project_id: '1',
    name: 'To Do',
    position: 0,
    created_at: new Date().toISOString(),
  },
];
