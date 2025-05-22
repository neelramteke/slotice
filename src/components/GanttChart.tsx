
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useProjects } from "@/contexts/ProjectContext";
import { Task } from "@/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { format, addDays, differenceInDays, parseISO, isValid, subDays } from "date-fns";
import { AlertCircle, Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function GanttChart() {
  const { projectId } = useParams();
  const { getProjectTasks, addTask, updateTask, loading } = useProjects();
  const [tasks, setTasks] = useState<Task[]>([]);
  
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(addDays(new Date(), 30));
  const [daysToShow, setDaysToShow] = useState<Date[]>([]);
  
  // Task modal
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isNewTask, setIsNewTask] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskDueDate, setTaskDueDate] = useState("");
  const [taskStatus, setTaskStatus] = useState<Task['status']>("todo");
  
  // Load tasks
  useEffect(() => {
    if (projectId) {
      const projectTasks = getProjectTasks(projectId).filter(task => task.due_date);
      setTasks(projectTasks);
      
      // Calculate date range based on tasks
      if (projectTasks.length > 0) {
        const dates = projectTasks
          .filter(task => task.due_date)
          .map(task => new Date(task.due_date!));
        
        const createdDates = projectTasks.map(task => new Date(task.created_at));
        
        if (dates.length > 0) {
          const allDates = [...dates, ...createdDates];
          const earliestDate = new Date(Math.min(...allDates.map(date => date.getTime())));
          const latestDate = new Date(Math.max(...dates.map(date => date.getTime())));
          
          // Set start date to 7 days before earliest date
          setStartDate(subDays(earliestDate, 7));
          // Set end date to 7 days after latest date
          setEndDate(addDays(latestDate, 7));
        }
      }
    }
  }, [projectId, getProjectTasks]);
  
  // Update days to show whenever date range changes
  useEffect(() => {
    // Generate array of dates to display
    const dayCount = differenceInDays(endDate, startDate) + 1;
    const days = Array.from({ length: dayCount }, (_, i) => 
      addDays(new Date(startDate), i)
    );
    setDaysToShow(days);
  }, [startDate, endDate]);
  
  const handleAddTask = async () => {
    if (!projectId || !taskTitle.trim() || !taskDueDate) return;
    
    try {
      // Prepare task data object
      const taskData: Partial<Task> = {
        project_id: projectId,
        title: taskTitle.trim(),
        description: taskDescription.trim(),
        status: taskStatus,
        due_date: taskDueDate
      };
      
      // Add the task
      const newTask = addTask(taskData);
      
      setTasks([...tasks, newTask]);
      setIsTaskModalOpen(false);
      resetTaskForm();
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };
  
  const handleEditTask = async () => {
    if (!selectedTask || !taskTitle.trim() || !taskDueDate) return;
    
    try {
      // Update the task
      updateTask(selectedTask.id, {
        title: taskTitle.trim(),
        description: taskDescription.trim(),
        status: taskStatus,
        due_date: taskDueDate
      });
      
      // Update local state
      setTasks(tasks.map(t => 
        t.id === selectedTask.id 
          ? { ...t, title: taskTitle.trim(), description: taskDescription.trim(), status: taskStatus, due_date: taskDueDate } 
          : t
      ));
      
      setIsTaskModalOpen(false);
      resetTaskForm();
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };
  
  const resetTaskForm = () => {
    setTaskTitle("");
    setTaskDescription("");
    setTaskDueDate("");
    setTaskStatus("todo");
    setSelectedTask(null);
  };
  
  const openNewTaskModal = () => {
    setIsNewTask(true);
    resetTaskForm();
    setIsTaskModalOpen(true);
  };
  
  const openEditTaskModal = (task: Task) => {
    setIsNewTask(false);
    setSelectedTask(task);
    setTaskTitle(task.title);
    setTaskDescription(task.description || "");
    setTaskDueDate(task.due_date || "");
    setTaskStatus(task.status);
    setIsTaskModalOpen(true);
  };
  
  const getTaskPosition = (task: Task) => {
    if (!task.due_date) return null;
    
    const dueDate = new Date(task.due_date);
    const daysDiff = differenceInDays(dueDate, startDate);
    
    // Only show tasks within the date range
    if (daysDiff < 0 || daysDiff > daysToShow.length) return null;
    
    // Calculate position based on days difference
    return {
      left: `${(daysDiff / daysToShow.length) * 100}%`,
    };
  };
  
  const getStatusColor = (status: Task["status"]) => {
    switch (status) {
      case "todo":
        return "bg-neon-blue";
      case "in_progress":
        return "bg-neon-purple";
      case "review":
        return "bg-neon-pink";
      case "done":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };
  
  const handleScrollLeft = () => {
    setStartDate(subDays(startDate, 14));
    setEndDate(subDays(endDate, 14));
  };
  
  const handleScrollRight = () => {
    setStartDate(addDays(startDate, 14));
    setEndDate(addDays(endDate, 14));
  };

  if (loading) {
    return (
      <div className="animate-fade-in">
        <div className="mb-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-5 w-60 mt-1" />
        </div>
        
        <div className="flex justify-between items-center mb-4">
          <Skeleton className="h-9 w-24" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-9" />
            <Skeleton className="h-9 w-9" />
          </div>
        </div>
        
        <Skeleton className="h-[500px] w-full" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-white font-display">
            Gantt Chart
          </h1>
          <p className="text-gray-400">Visualize your project timeline</p>
        </div>
        
        <Button
          onClick={openNewTaskModal}
          className="bg-neon-purple hover:bg-neon-purple/80 text-white"
        >
          <Plus className="mr-2 h-4 w-4" /> Add Task
        </Button>
      </div>
      
      <div className="flex justify-between items-center mb-4">
        <div className="text-neon-purple font-medium">
          {format(startDate, "MMM d, yyyy")} - {format(endDate, "MMM d, yyyy")}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleScrollLeft}
            className="border-gray-700 hover:bg-gray-800 text-gray-400"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-left"><path d="m15 18-6-6 6-6"/></svg>
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleScrollRight}
            className="border-gray-700 hover:bg-gray-800 text-gray-400"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-right"><path d="m9 18 6-6-6-6"/></svg>
          </Button>
        </div>
      </div>
      
      <Card className="bg-gray-900/60 border-gray-800 p-4 overflow-x-auto">
        {tasks.filter(task => task.due_date).length > 0 ? (
          <div className="min-w-[800px]">
            {/* Timeline header */}
            <div className="flex border-b border-gray-800 pb-2">
              <div className="w-1/4 pr-4">
                <div className="text-sm font-medium text-gray-400">Tasks</div>
              </div>
              <div className="w-3/4 flex">
                {daysToShow.map((day, index) => (
                  <div 
                    key={index} 
                    className={`flex-1 min-w-[30px] text-center text-xs ${
                      day.getDate() === 1 ? 'border-l border-gray-700' : ''
                    } ${day.getDay() === 0 || day.getDay() === 6 ? 'bg-gray-800/30' : ''}`}
                  >
                    {day.getDate() === 1 && (
                      <div className="text-gray-400 font-medium">
                        {format(day, "MMM")}
                      </div>
                    )}
                    <div className={`${
                      day.getDate() === new Date().getDate() && 
                      day.getMonth() === new Date().getMonth() && 
                      day.getFullYear() === new Date().getFullYear() 
                        ? 'text-neon-purple font-bold' 
                        : 'text-gray-500'
                    }`}>
                      {format(day, "d")}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Tasks */}
            <div className="mt-4 space-y-3">
              {tasks
                .filter(task => task.due_date)
                .sort((a, b) => {
                  const dateA = a.due_date ? new Date(a.due_date).getTime() : 0;
                  const dateB = b.due_date ? new Date(b.due_date).getTime() : 0;
                  return dateA - dateB;
                })
                .map(task => (
                  <div key={task.id} className="flex">
                    <div className="w-1/4 pr-4">
                      <div className="text-sm text-white truncate">{task.title}</div>
                    </div>
                    <div className="w-3/4 relative h-8">
                      {/* Day columns backdrop */}
                      <div className="absolute inset-0 flex">
                        {daysToShow.map((day, index) => (
                          <div 
                            key={index} 
                            className={`flex-1 min-w-[30px] ${
                              day.getDay() === 0 || day.getDay() === 6 ? 'bg-gray-800/30' : ''
                            } ${index === 0 ? '' : 'border-l border-gray-800/30'}`}
                          />
                        ))}
                      </div>
                      
                      {/* Task bar */}
                      {task.due_date && getTaskPosition(task) && (
                        <div 
                          className={`absolute top-0 h-7 ${getStatusColor(task.status)} rounded-md flex items-center justify-center px-2 transform transition-all duration-300 hover:scale-y-125 cursor-pointer`}
                          style={getTaskPosition(task)}
                          title={`${task.title} - Due: ${format(new Date(task.due_date), "MMM d, yyyy")}`}
                          onClick={() => openEditTaskModal(task)}
                        >
                          <span className="text-xs text-white font-medium truncate">
                            {task.title}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
            
            {/* Today marker */}
            {daysToShow.some(day => 
              day.getDate() === new Date().getDate() && 
              day.getMonth() === new Date().getMonth() && 
              day.getFullYear() === new Date().getFullYear()
            ) && (
              <div className="relative mt-4">
                <div className="w-3/4 ml-1/4">
                  <div 
                    className="absolute h-full border-l-2 border-dashed border-neon-purple"
                    style={{ 
                      left: `${(differenceInDays(new Date(), startDate) / daysToShow.length) * 100}%` 
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <AlertCircle className="h-12 w-12 mb-4 opacity-50" />
            <p className="text-lg">No tasks with due dates</p>
            <p className="text-sm mt-2">Add tasks with due dates to visualize them in the Gantt chart</p>
            <Button
              onClick={openNewTaskModal}
              className="mt-4 bg-neon-purple hover:bg-neon-purple/80 text-white"
            >
              <Plus className="mr-2 h-4 w-4" /> Add Task
            </Button>
          </div>
        )}
      </Card>
      
      {/* Task Modal */}
      <Dialog open={isTaskModalOpen} onOpenChange={setIsTaskModalOpen}>
        <DialogContent className="bg-gray-900 text-white border border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-neon-purple font-display">
              {isNewTask ? "Add New Task" : "Edit Task"}
            </DialogTitle>
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
              <Input
                id="task-due-date"
                type="date"
                value={taskDueDate}
                onChange={(e) => setTaskDueDate(e.target.value)}
                className="bg-gray-800 border-gray-700 focus:border-neon-purple text-white"
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="task-status" className="text-white">Status</Label>
              <select
                id="task-status"
                value={taskStatus}
                onChange={(e) => setTaskStatus(e.target.value as Task['status'])}
                className="bg-gray-800 border border-gray-700 focus:border-neon-purple text-white rounded-md px-3 py-2"
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="review">Review</option>
                <option value="done">Done</option>
              </select>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsTaskModalOpen(false)}
              className="border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button 
              onClick={isNewTask ? handleAddTask : handleEditTask}
              disabled={!taskTitle.trim() || !taskDueDate}
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
