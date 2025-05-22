
import { useState } from "react";
import { useParams } from "react-router-dom";
import { useProjects } from "@/contexts/ProjectContext";
import { Task } from "@/types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar as CalendarIcon, Plus, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function KanbanBoard() {
  const { projectId } = useParams();
  const { 
    getProjectTasks, 
    addTask, 
    updateTaskStatus,
    deleteTask,
    addComment,
    getTaskComments
  } = useProjects();
  
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskStatus, setNewTaskStatus] = useState<Task["status"]>("todo");
  const [newTaskDueDate, setNewTaskDueDate] = useState<Date>();
  const [calendarOpen, setCalendarOpen] = useState(false);
  
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [commentContent, setCommentContent] = useState("");
  
  const tasks = projectId ? getProjectTasks(projectId) : [];
  
  const todoTasks = tasks.filter(task => task.status === "todo");
  const inProgressTasks = tasks.filter(task => task.status === "in_progress");
  const reviewTasks = tasks.filter(task => task.status === "review");
  const doneTasks = tasks.filter(task => task.status === "done");

  const handleAddTask = () => {
    if (projectId && newTaskTitle.trim()) {
      addTask(
        projectId,
        newTaskTitle.trim(),
        newTaskDescription.trim(),
        newTaskStatus,
        newTaskDueDate?.toISOString()
      );
      setIsTaskModalOpen(false);
      resetForm();
    }
  };
  
  const resetForm = () => {
    setNewTaskTitle("");
    setNewTaskDescription("");
    setNewTaskStatus("todo");
    setNewTaskDueDate(undefined);
  };
  
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData("taskId", taskId);
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  
  const handleDrop = (e: React.DragEvent, status: Task["status"]) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");
    updateTaskStatus(taskId, status);
  };
  
  const viewTask = (task: Task) => {
    setSelectedTask(task);
  };
  
  const handleCloseTaskView = () => {
    setSelectedTask(null);
    setCommentContent("");
  };
  
  const handleAddComment = () => {
    if (selectedTask && commentContent.trim()) {
      addComment(selectedTask.id, commentContent.trim());
      setCommentContent("");
    }
  };
  
  const getStatusColor = (status: Task["status"]) => {
    switch (status) {
      case "todo":
        return "from-neon-blue to-neon-blue/70";
      case "in_progress":
        return "from-neon-purple to-neon-purple/70";
      case "review":
        return "from-neon-pink to-neon-pink/70";
      case "done":
        return "from-green-500 to-green-500/70";
      default:
        return "from-gray-500 to-gray-500/70";
    }
  };
  
  const getColumnName = (status: Task["status"]) => {
    switch (status) {
      case "todo":
        return "To Do";
      case "in_progress":
        return "In Progress";
      case "review":
        return "Review";
      case "done":
        return "Done";
      default:
        return "";
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-white font-display">
          Kanban Board
        </h1>
        <Button 
          onClick={() => setIsTaskModalOpen(true)}
          className="bg-neon-purple hover:bg-neon-purple/80 text-white"
        >
          <Plus className="mr-2 h-4 w-4" /> Add Task
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 overflow-auto pb-6">
        {/* To Do Column */}
        <div 
          className="bg-gray-900/60 rounded-lg border border-gray-800 p-4 min-h-[50vh]"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, "todo")}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-neon-blue">To Do</h3>
            <span className="bg-gray-800 text-xs rounded px-2 py-1 text-gray-300">
              {todoTasks.length}
            </span>
          </div>
          
          <div className="space-y-3">
            {todoTasks.map((task) => (
              <Card 
                key={task.id} 
                className="bg-gray-800 border-gray-700 hover:border-neon-blue cursor-pointer group"
                draggable
                onDragStart={(e) => handleDragStart(e, task.id)}
                onClick={() => viewTask(task)}
              >
                <div className="h-1 w-full bg-gradient-to-r from-neon-blue to-neon-blue/70" />
                <CardHeader className="p-3 pb-0">
                  <CardTitle className="text-sm font-medium text-white">{task.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-1">
                  <p className="text-xs text-gray-400 line-clamp-2">{task.description}</p>
                </CardContent>
                {task.due_date && (
                  <CardFooter className="p-3 pt-0 text-xs text-gray-400 flex items-center">
                    <CalendarIcon className="h-3 w-3 mr-1" />
                    {format(new Date(task.due_date), "MMM d, yyyy")}
                  </CardFooter>
                )}
              </Card>
            ))}
          </div>
        </div>
        
        {/* In Progress Column */}
        <div 
          className="bg-gray-900/60 rounded-lg border border-gray-800 p-4 min-h-[50vh]"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, "in_progress")}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-neon-purple">In Progress</h3>
            <span className="bg-gray-800 text-xs rounded px-2 py-1 text-gray-300">
              {inProgressTasks.length}
            </span>
          </div>
          
          <div className="space-y-3">
            {inProgressTasks.map((task) => (
              <Card 
                key={task.id} 
                className="bg-gray-800 border-gray-700 hover:border-neon-purple cursor-pointer"
                draggable
                onDragStart={(e) => handleDragStart(e, task.id)}
                onClick={() => viewTask(task)}
              >
                <div className="h-1 w-full bg-gradient-to-r from-neon-purple to-neon-purple/70" />
                <CardHeader className="p-3 pb-0">
                  <CardTitle className="text-sm font-medium text-white">{task.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-1">
                  <p className="text-xs text-gray-400 line-clamp-2">{task.description}</p>
                </CardContent>
                {task.due_date && (
                  <CardFooter className="p-3 pt-0 text-xs text-gray-400 flex items-center">
                    <CalendarIcon className="h-3 w-3 mr-1" />
                    {format(new Date(task.due_date), "MMM d, yyyy")}
                  </CardFooter>
                )}
              </Card>
            ))}
          </div>
        </div>
        
        {/* Review Column */}
        <div 
          className="bg-gray-900/60 rounded-lg border border-gray-800 p-4 min-h-[50vh]"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, "review")}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-neon-pink">Review</h3>
            <span className="bg-gray-800 text-xs rounded px-2 py-1 text-gray-300">
              {reviewTasks.length}
            </span>
          </div>
          
          <div className="space-y-3">
            {reviewTasks.map((task) => (
              <Card 
                key={task.id} 
                className="bg-gray-800 border-gray-700 hover:border-neon-pink cursor-pointer"
                draggable
                onDragStart={(e) => handleDragStart(e, task.id)}
                onClick={() => viewTask(task)}
              >
                <div className="h-1 w-full bg-gradient-to-r from-neon-pink to-neon-pink/70" />
                <CardHeader className="p-3 pb-0">
                  <CardTitle className="text-sm font-medium text-white">{task.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-1">
                  <p className="text-xs text-gray-400 line-clamp-2">{task.description}</p>
                </CardContent>
                {task.due_date && (
                  <CardFooter className="p-3 pt-0 text-xs text-gray-400 flex items-center">
                    <CalendarIcon className="h-3 w-3 mr-1" />
                    {format(new Date(task.due_date), "MMM d, yyyy")}
                  </CardFooter>
                )}
              </Card>
            ))}
          </div>
        </div>
        
        {/* Done Column */}
        <div 
          className="bg-gray-900/60 rounded-lg border border-gray-800 p-4 min-h-[50vh]"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, "done")}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-green-500">Done</h3>
            <span className="bg-gray-800 text-xs rounded px-2 py-1 text-gray-300">
              {doneTasks.length}
            </span>
          </div>
          
          <div className="space-y-3">
            {doneTasks.map((task) => (
              <Card 
                key={task.id} 
                className="bg-gray-800 border-gray-700 hover:border-green-500 cursor-pointer"
                draggable
                onDragStart={(e) => handleDragStart(e, task.id)}
                onClick={() => viewTask(task)}
              >
                <div className="h-1 w-full bg-gradient-to-r from-green-500 to-green-500/70" />
                <CardHeader className="p-3 pb-0">
                  <CardTitle className="text-sm font-medium text-white">{task.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-1">
                  <p className="text-xs text-gray-400 line-clamp-2">{task.description}</p>
                </CardContent>
                {task.due_date && (
                  <CardFooter className="p-3 pt-0 text-xs text-gray-400 flex items-center">
                    <CalendarIcon className="h-3 w-3 mr-1" />
                    {format(new Date(task.due_date), "MMM d, yyyy")}
                  </CardFooter>
                )}
              </Card>
            ))}
          </div>
        </div>
      </div>
      
      {/* Add Task Modal */}
      <Dialog open={isTaskModalOpen} onOpenChange={setIsTaskModalOpen}>
        <DialogContent className="bg-gray-900 text-white border border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-neon-purple font-display">Add New Task</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="task-title" className="text-white">
                Task Title
              </Label>
              <Input
                id="task-title"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="bg-gray-800 border-gray-700 focus:border-neon-purple text-white"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="task-description" className="text-white">
                Description
              </Label>
              <Textarea
                id="task-description"
                value={newTaskDescription}
                onChange={(e) => setNewTaskDescription(e.target.value)}
                className="bg-gray-800 border-gray-700 focus:border-neon-purple text-white"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="task-status" className="text-white">
                Status
              </Label>
              <div className="grid grid-cols-4 gap-2">
                {(["todo", "in_progress", "review", "done"] as Task["status"][]).map((status) => (
                  <Button
                    key={status}
                    type="button" 
                    variant={newTaskStatus === status ? "default" : "outline"}
                    onClick={() => setNewTaskStatus(status)}
                    className={cn(
                      newTaskStatus === status 
                        ? `bg-gradient-to-r ${getStatusColor(status)} text-white`
                        : "border-gray-700 text-gray-400 hover:text-white"
                    )}
                  >
                    {getColumnName(status)}
                  </Button>
                ))}
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="task-date" className="text-white">
                Due Date
              </Label>
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal bg-gray-800 border-gray-700",
                      !newTaskDueDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {newTaskDueDate ? format(newTaskDueDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="bg-gray-900 border-gray-800 p-0 w-auto">
                  <Calendar
                    mode="single"
                    selected={newTaskDueDate}
                    onSelect={(date) => {
                      setNewTaskDueDate(date);
                      setCalendarOpen(false);
                    }}
                    initialFocus
                    className="bg-gray-900"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsTaskModalOpen(false);
                resetForm();
              }}
              className="border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddTask}
              className="bg-neon-purple hover:bg-neon-purple/80 text-white"
              disabled={!newTaskTitle.trim()}
            >
              Add Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Task Details Modal */}
      {selectedTask && (
        <Dialog open={Boolean(selectedTask)} onOpenChange={handleCloseTaskView}>
          <DialogContent className="bg-gray-900 text-white border border-gray-800 max-w-2xl">
            <div className={`h-1 w-full bg-gradient-to-r ${getStatusColor(selectedTask.status)} -mt-4 rounded-t-lg`} />
            <DialogHeader>
              <div className="flex justify-between items-start">
                <DialogTitle className="text-white text-xl">{selectedTask.title}</DialogTitle>
                <span className="text-xs bg-gray-800 rounded px-3 py-1 text-gray-300">
                  {getColumnName(selectedTask.status)}
                </span>
              </div>
            </DialogHeader>
            
            <Tabs defaultValue="details">
              <TabsList className="bg-gray-800 text-gray-400">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="comments">Comments</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="pt-4">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-400 mb-1">Description</h3>
                    <p className="text-sm text-white whitespace-pre-wrap">{selectedTask.description}</p>
                  </div>
                  
                  {selectedTask.due_date && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-400 mb-1">Due Date</h3>
                      <div className="flex items-center text-sm text-white">
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        {format(new Date(selectedTask.due_date), "MMMM d, yyyy")}
                      </div>
                    </div>
                  )}
                  
                  <div className="pt-2">
                    <h3 className="text-sm font-semibold text-gray-400 mb-2">Status</h3>
                    <div className="grid grid-cols-4 gap-2">
                      {(["todo", "in_progress", "review", "done"] as Task["status"][]).map((status) => (
                        <Button
                          key={status}
                          type="button" 
                          variant={selectedTask.status === status ? "default" : "outline"}
                          onClick={() => updateTaskStatus(selectedTask.id, status)}
                          className={cn(
                            selectedTask.status === status 
                              ? `bg-gradient-to-r ${getStatusColor(status)} text-white`
                              : "border-gray-700 text-gray-400 hover:text-white"
                          )}
                        >
                          {getColumnName(status)}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="comments" className="pt-4">
                <div className="space-y-4">
                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <Textarea 
                        placeholder="Add a comment..."
                        value={commentContent}
                        onChange={(e) => setCommentContent(e.target.value)}
                        className="bg-gray-800 border-gray-700 focus:border-neon-purple text-white min-h-[100px]"
                      />
                    </div>
                    <Button
                      onClick={handleAddComment}
                      disabled={!commentContent.trim()}
                      className="bg-neon-purple hover:bg-neon-purple/80 text-white"
                    >
                      Add
                    </Button>
                  </div>
                  
                  <div className="space-y-3 mt-4">
                    {getTaskComments(selectedTask.id).map((comment) => (
                      <div key={comment.id} className="bg-gray-800 p-3 rounded-lg">
                        <div className="text-sm text-white whitespace-pre-wrap">{comment.content}</div>
                        <div className="text-xs text-gray-400 mt-2">
                          {format(new Date(comment.created_at), "MMM d, yyyy h:mm a")}
                        </div>
                      </div>
                    ))}
                    
                    {getTaskComments(selectedTask.id).length === 0 && (
                      <div className="text-center py-8 text-gray-400">
                        <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No comments yet</p>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            
            <DialogFooter className="gap-2">
              <Button 
                variant="destructive" 
                onClick={() => {
                  deleteTask(selectedTask.id);
                  handleCloseTaskView();
                }}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete Task
              </Button>
              <Button 
                onClick={handleCloseTaskView}
                className="bg-gray-800 hover:bg-gray-700 text-white border-gray-700"
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
