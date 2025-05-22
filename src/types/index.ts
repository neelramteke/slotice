
export interface Project {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at?: string;
}

export interface Task {
  id: string;
  project_id: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'review' | 'done';
  due_date: string | null;
  created_at: string;
  column_id: string | null;
  position: number;
  updated_at: string;
}

export interface Comment {
  id: string;
  task_id: string;
  content: string;
  created_at: string;
}

export interface Note {
  id: string;
  project_id: string;
  title: string;
  content: string;
  created_at: string;
}

export interface CheckItem {
  id: string;
  note_id: string;
  content: string;
  checked: boolean;
  created_at: string;
}

export interface CalendarEvent {
  id: string;
  project_id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  created_at: string;
}

export interface GanttTask {
  id: string;
  project_id: string;
  title: string;
  start_date: string;
  end_date: string;
  progress: number;
  dependencies: string[];
  created_at: string;
}

export interface BoardColumn {
  id: string;
  project_id: string;
  name: string;
  position: number;
  created_at: string;
}
