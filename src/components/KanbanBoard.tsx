
import { useEffect, useState } from "react";
import { useProjects } from "@/contexts/ProjectContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Task, BoardColumn } from "@/types";
import { CalendarIcon, Plus, Trash, MoreHorizontal, Pencil } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const KanbanBoard = () => {
  const { currentProject, tasks, columns, loading, addTask, updateTask, addColumn, updateColumn, deleteColumn, deleteTask } = useProjects();
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);
  const [isEditingColumn, setIsEditingColumn] = useState(false);
  const [currentColumnId, setCurrentColumnId] = useState<string | null>(null);
  const [editingColumnId, setEditingColumnId] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskDueDate, setNewTaskDueDate] = useState("");
  const [newColumnName, setNewColumnName] = useState("");
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  
  // Sort columns by position
  const sortedColumns = [...(columns || [])].sort((a, b) => a.position - b.position);
  
  // Map of column id to tasks in that column
  const getTasksByColumn = () => {
    const taskMap: Record<string, Task[]> = {};
    
    if (columns) {
      columns.forEach(column => {
        taskMap[column.id] = tasks
          .filter(task => task.column_id === column.id)
          .sort((a, b) => a.position - b.position);
      });
    }
    
    return taskMap;
  };
  
  const tasksByColumn = getTasksByColumn();
  
  // Handle adding a new task
  const handleAddTask = () => {
    if (newTaskTitle.trim() && currentColumnId && currentProject) {
      const columnPosition = tasksByColumn[currentColumnId]?.length || 0;
      
      addTask({
        title: newTaskTitle.trim(),
        description: newTaskDescription.trim(),
        due_date: newTaskDueDate ? new Date(newTaskDueDate).toISOString() : null,
        project_id: currentProject.id,
        column_id: currentColumnId,
        position: columnPosition,
        status: 'todo'
      });
      
      // Reset form
      setNewTaskTitle("");
      setNewTaskDescription("");
      setNewTaskDueDate("");
      setIsTaskModalOpen(false);
    }
  };
  
  // Handle adding/editing a column
  const handleColumnAction = () => {
    if (newColumnName.trim() && currentProject) {
      if (isEditingColumn && editingColumnId) {
        // Update existing column
        updateColumn(editingColumnId, { name: newColumnName.trim() });
      } else {
        // Add new column
        const columnPosition = sortedColumns.length;
        addColumn({
          name: newColumnName.trim(),
          position: columnPosition,
          project_id: currentProject.id
        });
      }
      
      // Reset form
      setNewColumnName("");
      setIsColumnModalOpen(false);
      setIsEditingColumn(false);
      setEditingColumnId(null);
    }
  };
  
  // Handle editing a column
  const handleEditColumn = (column: BoardColumn) => {
    setNewColumnName(column.name);
    setEditingColumnId(column.id);
    setIsEditingColumn(true);
    setIsColumnModalOpen(true);
  };
  
  // Handle deleting a column
  const handleDeleteColumn = (columnId: string) => {
    deleteColumn(columnId);
  };
  
  // Handle drag start
  const handleDragStart = (task: Task) => {
    setDraggedTask(task);
  };
  
  // Handle drag over
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  
  // Handle drop on column
  const handleDropOnColumn = (columnId: string) => {
    if (draggedTask && draggedTask.column_id !== columnId) {
      const position = tasksByColumn[columnId]?.length || 0;
      updateTask(draggedTask.id, { 
        column_id: columnId,
        position
      });
      setDraggedTask(null);
    }
  };
  
  // Calculate date status for styling
  const getDateStatus = (dueDate: string | null) => {
    if (!dueDate) return "none";
    
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return "overdue";
    if (diffDays <= 3) return "soon";
    return "normal";
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="flex justify-between mb-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-8 w-32" />
        </div>
        <div className="flex space-x-4 overflow-x-auto pb-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="w-72 flex-shrink-0">
              <Skeleton className="h-10 w-full mb-4" />
              {[1, 2, 3].map(j => (
                <Skeleton key={j} className="h-28 w-full mb-2" />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!currentProject) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white mb-2">No Project Selected</h2>
          <p className="text-gray-400">Select a project from the sidebar to view its Kanban board.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Kanban Board</h1>
        <Button 
          onClick={() => {
            setIsColumnModalOpen(true);
            setIsEditingColumn(false);
            setNewColumnName("");
          }}
          className="bg-[#e09f3e] hover:bg-[#e09f3e]/80"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Column
        </Button>
      </div>
      
      {sortedColumns.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">No columns yet</div>
          <Button 
            onClick={() => {
              setIsColumnModalOpen(true);
              setIsEditingColumn(false);
              setNewColumnName("");
            }}
            className="bg-[#e09f3e] hover:bg-[#e09f3e]/80"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Your First Column
          </Button>
        </div>
      ) : (
        <div className="flex space-x-4 overflow-x-auto pb-4">
          {sortedColumns.map((column) => (
            <div 
              key={column.id} 
              className="bg-gray-900/70 rounded-lg w-72 flex-shrink-0 flex flex-col"
              onDragOver={handleDragOver}
              onDrop={() => handleDropOnColumn(column.id)}
            >
              <div className="flex items-center justify-between p-3 bg-gray-800 rounded-t-lg border-b border-gray-700">
                <h3 className="font-medium text-white">{column.name}</h3>
                <div className="flex items-center">
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-6 w-6 text-gray-400 hover:text-white"
                    onClick={() => {
                      setCurrentColumnId(column.id);
                      setIsTaskModalOpen(true);
                      setNewTaskTitle("");
                      setNewTaskDescription("");
                      setNewTaskDueDate("");
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-6 w-6 text-gray-400 hover:text-white"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 bg-gray-900 text-white border-gray-700">
                      <DropdownMenuItem 
                        className="flex items-center cursor-pointer hover:bg-gray-800"
                        onClick={() => handleEditColumn(column)}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit Column
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="flex items-center cursor-pointer text-red-500 hover:bg-gray-800 focus:text-red-500"
                        onClick={() => handleDeleteColumn(column.id)}
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        Delete Column
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              
              <div className="p-2 flex-1 overflow-y-auto max-h-[calc(100vh-220px)]">
                {tasksByColumn[column.id]?.map((task) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={() => handleDragStart(task)}
                    className="mb-2 cursor-grab active:cursor-grabbing"
                  >
                    <Card className="bg-gray-800 hover:bg-gray-750 border-gray-700 p-3">
                      <div className="flex justify-between">
                        <h4 className="font-medium text-white mb-1">{task.title}</h4>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-5 w-5 -mt-1 -mr-1 text-gray-400 hover:text-white"
                            >
                              <MoreHorizontal className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 bg-gray-900 text-white border-gray-700">
                            <DropdownMenuItem 
                              className="flex items-center cursor-pointer text-red-500 hover:bg-gray-800 focus:text-red-500"
                              onClick={() => deleteTask(task.id)}
                            >
                              <Trash className="mr-2 h-4 w-4" />
                              Delete Task
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      
                      {task.description && (
                        <p className="text-sm text-gray-400 mb-2 line-clamp-2">
                          {task.description}
                        </p>
                      )}
                      
                      {task.due_date && (
                        <div 
                          className={cn(
                            "flex items-center text-xs mt-2 px-2 py-1 rounded-md",
                            getDateStatus(task.due_date) === "overdue" 
                              ? "bg-red-900/30 text-red-200" 
                              : getDateStatus(task.due_date) === "soon" 
                              ? "bg-yellow-900/30 text-yellow-200" 
                              : "bg-gray-700/50 text-gray-300"
                          )}
                        >
                          <CalendarIcon className="h-3 w-3 mr-1" />
                          {format(new Date(task.due_date), "MMM d, yyyy")}
                        </div>
                      )}
                    </Card>
                  </div>
                ))}
                
                <Button 
                  variant="ghost" 
                  className="w-full text-sm text-gray-400 hover:text-white hover:bg-gray-800 mt-1"
                  onClick={() => {
                    setCurrentColumnId(column.id);
                    setIsTaskModalOpen(true);
                    setNewTaskTitle("");
                    setNewTaskDescription("");
                    setNewTaskDueDate("");
                  }}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Task
                </Button>
              </div>
            </div>
          ))}
          
          <div className="flex-shrink-0 w-72">
            <Button 
              variant="outline" 
              className="border-dashed border-gray-700 text-gray-400 hover:text-white hover:bg-gray-800/50 w-full h-12"
              onClick={() => {
                setIsColumnModalOpen(true);
                setIsEditingColumn(false);
                setNewColumnName("");
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Column
            </Button>
          </div>
        </div>
      )}
      
      {/* Add Task Modal */}
      <Dialog open={isTaskModalOpen} onOpenChange={setIsTaskModalOpen}>
        <DialogContent className="bg-gray-900 text-white border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-[#e09f3e]">Add New Task</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="task-title">Task Title</Label>
              <Input
                id="task-title"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="bg-gray-800 border-gray-700 focus:border-[#e09f3e] text-white"
                placeholder="Enter task title"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="task-description">Description</Label>
              <Textarea
                id="task-description"
                value={newTaskDescription}
                onChange={(e) => setNewTaskDescription(e.target.value)}
                className="bg-gray-800 border-gray-700 focus:border-[#e09f3e] text-white min-h-[80px]"
                placeholder="Enter task description"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="task-due-date">Due Date (Optional)</Label>
              <Input
                id="task-due-date"
                type="date"
                value={newTaskDueDate}
                onChange={(e) => setNewTaskDueDate(e.target.value)}
                className="bg-gray-800 border-gray-700 focus:border-[#e09f3e] text-white"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTaskModalOpen(false)} className="border-gray-700 text-gray-300">
              Cancel
            </Button>
            <Button onClick={handleAddTask} className="bg-[#e09f3e] hover:bg-[#e09f3e]/80" disabled={!newTaskTitle.trim()}>
              Add Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Add/Edit Column Modal */}
      <Dialog open={isColumnModalOpen} onOpenChange={setIsColumnModalOpen}>
        <DialogContent className="bg-gray-900 text-white border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-[#e09f3e]">{isEditingColumn ? 'Edit Column' : 'Add New Column'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="column-name">Column Name</Label>
              <Input
                id="column-name"
                value={newColumnName}
                onChange={(e) => setNewColumnName(e.target.value)}
                className="bg-gray-800 border-gray-700 focus:border-[#e09f3e] text-white"
                placeholder="Enter column name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsColumnModalOpen(false)} className="border-gray-700 text-gray-300">
              Cancel
            </Button>
            <Button onClick={handleColumnAction} className="bg-[#e09f3e] hover:bg-[#e09f3e]/80" disabled={!newColumnName.trim()}>
              {isEditingColumn ? 'Update Column' : 'Add Column'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default KanbanBoard;
