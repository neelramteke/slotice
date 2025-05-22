
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useProjects } from "@/contexts/ProjectContext";
import { Task } from "@/types";
import { Card } from "@/components/ui/card";
import { format, addDays, differenceInDays } from "date-fns";
import { AlertCircle } from "lucide-react";

export default function GanttChart() {
  const { projectId } = useParams();
  const { getProjectTasks } = useProjects();
  const tasks = projectId ? getProjectTasks(projectId) : [];
  
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(addDays(new Date(), 30));
  const [daysToShow, setDaysToShow] = useState<Date[]>([]);
  
  useEffect(() => {
    if (tasks.length > 0) {
      // Find earliest and latest dates from tasks
      const dates = tasks
        .filter(task => task.due_date)
        .map(task => new Date(task.due_date!));
      
      if (dates.length > 0) {
        const earliestDate = new Date(Math.min(...dates.map(date => date.getTime())));
        const latestDate = new Date(Math.max(...dates.map(date => date.getTime())));
        
        // Set start date 7 days before earliest date
        setStartDate(addDays(earliestDate, -7));
        // Set end date 7 days after latest date
        setEndDate(addDays(latestDate, 7));
      }
    }
  }, [tasks]);
  
  useEffect(() => {
    // Generate array of dates to display
    const dayCount = differenceInDays(endDate, startDate) + 1;
    const days = Array.from({ length: dayCount }, (_, i) => 
      addDays(new Date(startDate), i)
    );
    setDaysToShow(days);
  }, [startDate, endDate]);
  
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

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-white font-display">
          Gantt Chart
        </h1>
        <p className="text-gray-400">Visualize your project timeline</p>
      </div>
      
      <Card className="bg-gray-900/60 border-gray-800 p-4 overflow-x-auto">
        {tasks.length > 0 ? (
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
              {tasks.map(task => (
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
            <p className="text-lg">No tasks yet</p>
            <p className="text-sm mt-2">Add tasks with due dates to visualize them in the Gantt chart</p>
          </div>
        )}
      </Card>
      
      <div className="mt-6 text-sm text-gray-400">
        <p>Note: This is a basic Gantt visualization showing task due dates. For a more advanced Gantt chart with dependencies and task durations, a third-party library like Bryntum Gantt would be required.</p>
      </div>
    </div>
  );
}
