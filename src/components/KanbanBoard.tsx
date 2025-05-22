import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useProjects } from "@/contexts/ProjectContext";
import { Task } from "@/types";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { 
  Plus, 
  MoreVertical, 
  Clock, 
  Trash2, 
  MessageSquare, 
  Edit, 
  Calendar, 
  AlertCircle,
  CalendarIcon 
} from "lucide-react";
import { format, isValid, parseISO } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export default function KanbanBoard() {
  const { projectId } = useParams();
  const { 
    getProjectTasks, 
    addTask, 
    updateTask, 
    deleteTask, 
    getTaskComments, 
    addComment,
    deleteComment,
    getProjectBoardColumns,
    addBoardColumn,
    updateBoardColumn,
    deleteBoardColumn,
    loading 
  } = useProjects();
  
  // Add the missing state variables
  const [boardColumns, setBoardColumns] = useState<any[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  
  // Task modal state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isNewTask, setIsNewTask] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskDueDate, setTaskDueDate] = useState("");
  const [selectedColumnId, setSelectedColumnId] = useState<string | null>(null);
  
  // Column actions
  const [isAddColumnModalOpen, setIsAddColumnModalOpen] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");
  const [isEditColumnModalOpen, setIsEditColumnModalOpen] = useState(false);
  const [editColumnId, setEditColumnId] = useState<string | null>(null);
  const [editColumnName, setEditColumnName] = useState("");
  
  // Comment state
  const [newComment, setNewComment] = useState("");
  
  // Drag and drop
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const dragCounterRef = useRef<{ [key: string]: number }>({});
  
  // Load board columns and tasks
  useEffect(() => {
    if (!projectId) return;
    
    // Get board columns
    const columns = getProjectBoardColumns(projectId);
    setBoardColumns(columns);
    
    // If we have no columns but we're not in loading state, create default columns
    if (columns.length === 0 && !loading) {
      createDefaultColumns();
    }
    
    // Get tasks
    const projectTasks = getProjectTasks(projectId);
    setTasks(projectTasks);
  }, [projectId, getProjectTasks, getProjectBoardColumns, loading]);
  
  const createDefaultColumns = async () => {
    if (!projectId) return;
    
    try {
      const defaultColumns = ["To Do", "In Progress", "Review", "Done"];
      const createdColumns = [];
      
      for (let i = 0; i < defaultColumns.length; i++) {
        const column = await addBoardColumn(projectId, defaultColumns[i]);
        createdColumns.push(column);
      }
      
      setBoardColumns(createdColumns);
    } catch (error) {
      console.error("Error creating default columns:", error);
    }
  };
  
  const handleAddColumn = async () => {
    if (!projectId || !newColumnName.trim()) return;
    
    try {
      const column = await addBoardColumn(projectId, newColumnName.trim());
      setBoardColumns([...boardColumns, column]);
      setIsAddColumnModalOpen(false);
      setNewColumnName("");
    } catch (error) {
      console.error("Error adding column:", error);
    }
  };
  
  const handleEditColumn = async () => {
    if (!editColumnId || !editColumnName.trim()) return;
    
    try {
      await updateBoardColumn(editColumnId, editColumnName.trim());
      setBoardColumns(boardColumns.map(col => 
        col.id === editColumnId ? { ...col, name: editColumnName.trim() } : col
      ));
      setIsEditColumnModalOpen(false);
      setEditColumnId(null);
      setEditColumnName("");
    } catch (error) {
      console.error("Error editing column:", error);
    }
  };
  
  const openEditColumnModal = (columnId: string, columnName: string) => {
    setEditColumnId(columnId);
    setEditColumnName(columnName);
    setIsEditColumnModalOpen(true);
  };
  
  const handleDeleteColumn = async (columnId: string) => {
    try {
      await deleteBoardColumn(columnId);
      setBoardColumns(boardColumns.filter(col => col.id !== columnId));
      
      // Update tasks that were in this column
      const updatedTasks = tasks.map(task => {
        if (task.column_id === columnId) {
          return {
            ...task,
            column_id: null
          };
        }
        return task;
      });
      setTasks(updatedTasks);
    } catch (error) {
      console.error("Error deleting column:", error);
    }
  };
  
  // Task handlers
  const openNewTaskModal = (columnId: string) => {
    setIsNewTask(true);
    setSelectedTask(null);
    setTaskTitle("");
    setTaskDescription("");
    setTaskDueDate("");
    setSelectedColumnId(columnId);
    setIsTaskModalOpen(true);
  };
  
  const openEditTaskModal = (task: Task) => {
    setIsNewTask(false);
    setSelectedTask(task);
    setTaskTitle(task.title);
    setTaskDescription(task.description || "");
    setTaskDueDate(task.due_date ? format(new Date(task.due_date), "yyyy-MM-dd") : "");
    setSelectedColumnId(task.column_id || null);
    setIsTaskModalOpen(true);
  };
  
  const handleSaveTask = async () => {
    if (!projectId || !taskTitle.trim()) return;
    
    try {
      if (isNewTask) {
        // Map column ID to status
        let status: 'todo' | 'in_progress' | 'review' | 'done' = 'todo';
        if (selectedColumnId) {
          const column = boardColumns.find(col => col.id === selectedColumnId);
          if (column) {
            if (column.name.toLowerCase().includes('progress')) {
              status = 'in_progress';
            } else if (column.name.toLowerCase().includes('review')) {
              status = 'review';
            } else if (column.name.toLowerCase().includes('done')) {
              status = 'done';
            }
          }
        }
        
        const newTask = await addTask(
          projectId,
          taskTitle.trim(),
          taskDescription.trim(),
          status,
          taskDueDate || undefined
        );
        
        // Update column_id
        if (selectedColumnId && newTask) {
          const updatedTask = {
            ...newTask,
            column_id: selectedColumnId
          } as Task;
          
          await updateTask(updatedTask);
          setTasks([...tasks, updatedTask]);
        } else {
          setTasks([...tasks, newTask]);
        }
      } else if (selectedTask) {
        // Update existing task
        const updatedTask = {
          ...selectedTask,
          title: taskTitle.trim(),
          description: taskDescription.trim(),
          due_date: taskDueDate || null,
          column_id: selectedColumnId
        } as Task;
        
        await updateTask(updatedTask);
        setTasks(tasks.map(t => t.id === selectedTask.id ? updatedTask : t));
      }
      
      setIsTaskModalOpen(false);
    } catch (error) {
      console.error("Error saving task:", error);
    }
  };
  
  const handleDeleteTask = async () => {
    if (!selectedTask) return;
    
    try {
      await deleteTask(selectedTask.id);
      setTasks(tasks.filter(t => t.id !== selectedTask.id));
      setIsTaskModalOpen(false);
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };
  
  const handleAddComment = async () => {
    if (!selectedTask || !newComment.trim()) return;
    
    try {
      await addComment(selectedTask.id, newComment.trim());
      setNewComment("");
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };
  
  // Drag and drop handlers
  const handleDragStart = (taskId: string) => {
    setDraggedTaskId(taskId);
  };
  
  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    
    if (!dragCounterRef.current[columnId]) {
      dragCounterRef.current[columnId] = 0;
    }
    
    dragCounterRef.current[columnId]++;
    
    // Add highlighting style to the column
    const column = document.getElementById(`column-${columnId}`);
    if (column) {
      column.classList.add("border-neon-purple", "bg-neon-purple/5");
    }
  };
  
  const handleDragLeave = (columnId: string) => {
    if (!dragCounterRef.current[columnId]) {
      return;
    }
    
    dragCounterRef.current[columnId]--;
    
    if (dragCounterRef.current[columnId] === 0) {
      // Remove highlighting style from the column
      const column = document.getElementById(`column-${columnId}`);
      if (column) {
        column.classList.remove("border-neon-purple", "bg-neon-purple/5");
      }
    }
  };
  
  const handleDrop = async (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    
    // Remove highlighting style from the column
    const column = document.getElementById(`column-${columnId}`);
    if (column) {
      column.classList.remove("border-neon-purple", "bg-neon-purple/5");
    }
    
    // Reset drag counter
    dragCounterRef.current[columnId] = 0;
    
    if (!draggedTaskId) return;
    
    const taskToMove = tasks.find(t => t.id === draggedTaskId);
    if (!taskToMove || taskToMove.column_id === columnId) {
      setDraggedTaskId(null);
      return;
    }
    
    // Get new status based on column
    let newStatus: 'todo' | 'in_progress' | 'review' | 'done' = taskToMove.status;
    const targetColumn = boardColumns.find(col => col.id === columnId);
    if (targetColumn) {
      if (targetColumn.name.toLowerCase().includes('progress')) {
        newStatus = 'in_progress';
      } else if (targetColumn.name.toLowerCase().includes('review')) {
        newStatus = 'review';
      } else if (targetColumn.name.toLowerCase().includes('done')) {
        newStatus = 'done';
      } else if (targetColumn.name.toLowerCase().includes('to do')) {
        newStatus = 'todo';
      }
    }
    
    try {
      const updatedTask = {
        ...taskToMove,
        column_id: columnId,
        status: newStatus
      } as Task;
      
      await updateTask(updatedTask);
      
      // Update local task state
      setTasks(tasks.map(t => t.id === draggedTaskId ? updatedTask : t));
    } catch (error) {
      console.error("Error moving task:", error);
    } finally {
      setDraggedTaskId(null);
    }
  };

  if (loading) {
    return (
      <div className="animate-fade-in">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-9 w-40" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex flex-col">
              <Skeleton className="h-8 w-40 mb-2" />
              <div className="space-y-2">
                {[1, 2, 3].map((j) => (
                  <Skeleton key={j} className="h-32" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  // Group tasks by column
  const tasksByColumn = new Map<string | null, Task[]>();
  
  // Initialize with empty arrays for all columns
  boardColumns.forEach(column => {
    tasksByColumn.set(column.id, []);
  });
  
  // Add unassigned category for tasks without a column
  tasksByColumn.set(null, []);
  
  // Populate with tasks
  tasks.forEach(task => {
    const columnTasks = tasksByColumn.get(task.column_id) || [];
    columnTasks.push(task);
    tasksByColumn.set(task.column_id, columnTasks);
  });

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-white font-display">
          Kanban Board
        </h1>
        <Button 
          onClick={() => setIsAddColumnModalOpen(true)}
          className="bg-neon-purple hover:bg-neon-purple/80 text-white"
        >
          <Plus className="mr-2 h-4 w-4" /> Add Column
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-auto-fit gap-4">
        {/* Board columns */}
        {boardColumns.map(column => {
          const columnTasks = tasksByColumn.get(column.id) || [];
          
          return (
            <div 
              key={column.id}
              id={`column-${column.id}`}
              className="flex flex-col bg-gray-900/60 border border-gray-800 rounded-md transition-all min-w-[270px]"
              onDragOver={(e) => handleDragOver(e, column.id)}
              onDragLeave={() => handleDragLeave(column.id)}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              <div className="flex items-center justify-between p-2 border-b border-gray-800">
                <h3 className="font-medium text-white px-2">{column.name}</h3>
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-5 h-5 rounded-full bg-gray-800 text-xs text-gray-400">
                    {columnTasks.length}
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4 text-gray-400" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className="w-40 bg-gray-900 border border-gray-800 text-white"
                      align="end"
                    >
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-gray-800" />
                      <DropdownMenuItem 
                        className="focus:bg-gray-800"
                        onClick={() => openNewTaskModal(column.id)}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Task
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="focus:bg-gray-800"
                        onClick={() => openEditColumnModal(column.id, column.name)}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Column
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-gray-800" />
                      <DropdownMenuItem 
                        className="focus:bg-red-900 text-red-500"
                        onClick={() => handleDeleteColumn(column.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Column
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              
              <div className="p-2 flex-1 overflow-y-auto max-h-[calc(100vh-220px)]">
                {/* Tasks in this column */}
                <div className="space-y-2">
                  {columnTasks.map(task => (
                    <Card 
                      key={task.id} 
                      className="bg-gray-800 border-gray-700 hover:border-neon-purple cursor-pointer"
                      onClick={() => openEditTaskModal(task)}
                      draggable
                      onDragStart={() => handleDragStart(task.id)}
                    >
                      <CardHeader className="p-3 pb-0">
                        <CardTitle className="text-sm font-medium text-white">{task.title}</CardTitle>
                      </CardHeader>
                      
                      {task.description && (
                        <CardContent className="p-3 pt-2">
                          <p className="text-xs text-gray-400 line-clamp-2">{task.description}</p>
                        </CardContent>
                      )}
                      
                      <CardFooter className="p-3 pt-0 flex justify-between">
                        {task.due_date && (
                          <div className="text-xs flex items-center text-gray-500">
                            <Clock className="h-3 w-3 mr-1 shrink-0" />
                            {format(new Date(task.due_date), "MMM d")}
                          </div>
                        )}
                        
                        {getTaskComments(task.id).length > 0 && (
                          <div className="text-xs flex items-center text-gray-500">
                            <MessageSquare className="h-3 w-3 mr-1" />
                            {getTaskComments(task.id).length}
                          </div>
                        )}
                      </CardFooter>
                    </Card>
                  ))}
                </div>
                
                {/* Add task button */}
                <Button 
                  variant="ghost" 
                  className="w-full mt-2 border border-dashed border-gray-700 hover:border-neon-purple/50 hover:bg-transparent text-gray-500 hover:text-gray-300"
                  onClick={() => openNewTaskModal(column.id)}
                >
                  <Plus className="h-4 w-4 mr-1" /> Add Task
                </Button>
              </div>
            </div>
          );
        })}
        
        {/* Unassigned tasks */}
        {tasksByColumn.get(null)?.length! > 0 && (
          <div 
            id="column-unassigned"
            className="flex flex-col bg-gray-900/60 border border-gray-800 rounded-md transition-all min-w-[270px]"
            onDragOver={(e) => handleDragOver(e, '')}
            onDragLeave={() => handleDragLeave('')}
            onDrop={(e) => handleDrop(e, '')}
          >
            <div className="flex items-center justify-between p-2 border-b border-gray-800">
              <h3 className="font-medium text-white px-2">Unassigned</h3>
              <div className="flex items-center">
                <div className="flex items-center justify-center w-5 h-5 rounded-full bg-gray-800 text-xs text-gray-400">
                  {tasksByColumn.get(null)?.length}
                </div>
              </div>
            </div>
            
            <div className="p-2 flex-1 overflow-y-auto max-h-[calc(100vh-220px)]">
              <div className="space-y-2">
                {tasksByColumn.get(null)?.map(task => (
                  <Card 
                    key={task.id} 
                    className="bg-gray-800 border-gray-700 hover:border-neon-purple cursor-pointer"
                    onClick={() => openEditTaskModal(task)}
                    draggable
                    onDragStart={() => handleDragStart(task.id)}
                  >
                    <CardHeader className="p-3 pb-0">
                      <CardTitle className="text-sm font-medium text-white">{task.title}</CardTitle>
                    </CardHeader>
                    
                    {task.description && (
                      <CardContent className="p-3 pt-2">
                        <p className="text-xs text-gray-400 line-clamp-2">{task.description}</p>
                      </CardContent>
                    )}
                    
                    <CardFooter className="p-3 pt-0 flex justify-between">
                      {task.due_date && (
                        <div className="text-xs flex items-center text-gray-500">
                          <Clock className="h-3 w-3 mr-1 shrink-0" />
                          {format(new Date(task.due_date), "MMM d")}
                        </div>
                      )}
                      
                      {getTaskComments(task.id).length > 0 && (
                        <div className="text-xs flex items-center text-gray-500">
                          <MessageSquare className="h-3 w-3 mr-1" />
                          {getTaskComments(task.id).length}
                        </div>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Add Column Modal */}
      <Dialog open={isAddColumnModalOpen} onOpenChange={setIsAddColumnModalOpen}>
        <DialogContent className="bg-gray-900 text-white border border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-neon-purple font-display">Add New Column</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="column-name" className="text-white">Column Name</Label>
              <Input
                id="column-name"
                value={newColumnName}
                onChange={(e) => setNewColumnName(e.target.value)}
                placeholder="e.g., Backlog, Testing"
                className="bg-gray-800 border-gray-700 focus:border-neon-purple text-white"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsAddColumnModalOpen(false)}
              className="border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddColumn}
              disabled={!newColumnName.trim()}
              className="bg-neon-purple hover:bg-neon-purple/80 text-white"
            >
              Add Column
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Column Modal */}
      <Dialog open={isEditColumnModalOpen} onOpenChange={setIsEditColumnModalOpen}>
        <DialogContent className="bg-gray-900 text-white border border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-neon-purple font-display">Edit Column</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-column-name" className="text-white">Column Name</Label>
              <Input
                id="edit-column-name"
                value={editColumnName}
                onChange={(e) => setEditColumnName(e.target.value)}
                className="bg-gray-800 border-gray-700 focus:border-neon-purple text-white"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsEditColumnModalOpen(false)}
              className="border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleEditColumn}
              disabled={!editColumnName.trim()}
              className="bg-neon-purple hover:bg-neon-purple/80 text-white"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Task Modal */}
      <Dialog open={isTaskModalOpen} onOpenChange={setIsTaskModalOpen}>
        <DialogContent className="bg-gray-900 text-white border border-gray-800 max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-neon-purple font-display">
              {isNewTask ? "Add New Task" : "Edit Task"}
            </DialogTitle>
            {selectedTask && !isNewTask && (
              <DialogDescription className="text-gray-400">
                Created {format(new Date(selectedTask.created_at), "MMMM d, yyyy")}
              </DialogDescription>
            )}
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="task-title" className="text-white">Title</Label>
              <Input
                id="task-title"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                className="bg-gray-800 border-gray-700 focus:border-neon-purple text-white"
                placeholder="Task title"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="task-description" className="text-white">Description</Label>
              <Textarea
                id="task-description"
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                className="bg-gray-800 border-gray-700 focus:border-neon-purple text-white min-h-[100px]"
                placeholder="Add more details about this task"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="task-due-date" className="text-white">Due Date</Label>
              <div className="flex">
                <Button
                  variant="outline"
                  size="icon"
                  className="mr-2 bg-gray-800 border-gray-700 hover:bg-gray-700"
                >
                  <CalendarIcon className="h-4 w-4 text-gray-400" />
                </Button>
                <Input
                  id="task-due-date"
                  type="date"
                  value={taskDueDate}
                  onChange={(e) => setTaskDueDate(e.target.value)}
                  className="bg-gray-800 border-gray-700 focus:border-neon-purple text-white"
                />
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="task-column" className="text-white">Column</Label>
              <select
                id="task-column"
                value={selectedColumnId || ""}
                onChange={(e) => setSelectedColumnId(e.target.value || null)}
                className="bg-gray-800 border border-gray-700 focus:border-neon-purple text-white rounded-md px-3 py-2"
              >
                <option value="">None</option>
                {boardColumns.map(column => (
                  <option key={column.id} value={column.id}>
                    {column.name}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Comments section - only for editing tasks */}
            {!isNewTask && selectedTask && (
              <div className="mt-4">
                <Label className="text-white mb-2 block">Comments</Label>
                
                <div className="space-y-3 max-h-[200px] overflow-y-auto mb-4">
                  {getTaskComments(selectedTask.id).length > 0 ? (
                    getTaskComments(selectedTask.id).map(comment => (
                      <div key={comment.id} className="bg-gray-800 rounded-md p-3">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="text-sm text-white">{comment.content}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {format(new Date(comment.created_at), "MMM d, yyyy h:mm a")}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => deleteComment(comment.id)}
                          >
                            <Trash2 className="h-3 w-3 text-gray-400" />
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-500 text-sm text-center py-2">
                      No comments yet
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="bg-gray-800 border-gray-700 focus:border-neon-purple text-white"
                  />
                  <Button
                    onClick={handleAddComment}
                    disabled={!newComment.trim()}
                    className="bg-neon-purple hover:bg-neon-purple/80"
                  >
                    Add
                  </Button>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter className="gap-2">
            {!isNewTask && (
              <Button 
                variant="destructive" 
                onClick={handleDeleteTask}
                className="bg-red-600 hover:bg-red-700"
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </Button>
            )}
            <div className="flex-1"></div>
            <Button 
              variant="outline" 
              onClick={() => setIsTaskModalOpen(false)}
              className="border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveTask}
              disabled={!taskTitle.trim()}
              className="bg-neon-purple hover:bg-neon-purple/80 text-white"
            >
              {isNewTask ? "Add Task" : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
