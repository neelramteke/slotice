
import { useState, useEffect } from "react";
import { useProjects } from "@/contexts/ProjectContext";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Task, CalendarEvent } from "@/types";

// Define the TimelineEvent interface properly
interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  date: Date;
  type: 'task' | 'event';
  relatedData: Task | CalendarEvent;
}

// Helper function to get timeline events from tasks and events
const getTimelineEvents = (tasks: Task[], events: CalendarEvent[]): TimelineEvent[] => {
  // Map tasks to timeline events
  const taskEvents: TimelineEvent[] = tasks.map(task => ({
    id: `task-${task.id}`,
    title: `Task: ${task.title}`,
    description: task.description || 'No description provided',
    date: new Date(task.created_at),
    type: 'task',
    relatedData: task,
  }));

  // Map events to timeline events
  const calendarEvents: TimelineEvent[] = events.map(event => ({
    id: `event-${event.id}`,
    title: `Event: ${event.title}`,
    description: event.description || 'No description provided',
    date: new Date(event.created_at),
    type: 'event',
    relatedData: event,
  }));

  // Combine and sort all events by date (newest first)
  return [...taskEvents, ...calendarEvents].sort((a, b) => 
    b.date.getTime() - a.date.getTime()
  );
};

// Group events by day
const groupEventsByDay = (events: TimelineEvent[]) => {
  const grouped: { [date: string]: TimelineEvent[] } = {};
  
  events.forEach(event => {
    const dateString = format(event.date, 'yyyy-MM-dd');
    if (!grouped[dateString]) {
      grouped[dateString] = [];
    }
    grouped[dateString].push(event);
  });
  
  return Object.entries(grouped)
    .sort(([dateA], [dateB]) => 
      new Date(dateB).getTime() - new Date(dateA).getTime()
    )
    .map(([date, events]) => ({ 
      date: new Date(date), 
      events 
    }));
};

export default function Timeline() {
  const { tasks, events, currentProject, loading } = useProjects();
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [groupedEvents, setGroupedEvents] = useState<{ date: Date, events: TimelineEvent[] }[]>([]);
  
  // Filter tasks and events by current project
  useEffect(() => {
    if (currentProject) {
      const filteredTasks = tasks.filter(task => task.project_id === currentProject.id);
      const filteredEvents = events.filter(event => event.project_id === currentProject.id);
      
      // Get timeline events
      const timelineEvents = getTimelineEvents(filteredTasks, filteredEvents);
      setTimelineEvents(timelineEvents);
      
      // Group events by day
      const grouped = groupEventsByDay(timelineEvents);
      setGroupedEvents(grouped);
    } else {
      setTimelineEvents([]);
      setGroupedEvents([]);
    }
  }, [currentProject, tasks, events]);
  
  if (loading) {
    return (
      <div className="p-4">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="space-y-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-6 w-32" />
              {[1, 2].map(j => (
                <Skeleton key={j} className="h-24 w-full" />
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
          <p className="text-gray-400">Select a project from the sidebar to view its timeline.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-white mb-6">Project Timeline</h1>
      
      {timelineEvents.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">No activity in this project yet</div>
          <p className="text-sm text-gray-500">
            Activities will appear here as you create tasks and events
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {groupedEvents.map((dayGroup) => (
            <div key={dayGroup.date.toISOString()} className="space-y-2">
              <h2 className="text-xl font-medium text-white">
                {format(dayGroup.date, 'EEEE, MMMM d, yyyy')}
                <span className="ml-2 text-sm text-gray-400">
                  ({dayGroup.events.length} {dayGroup.events.length === 1 ? 'event' : 'events'})
                </span>
              </h2>
              
              <div className="border-l-2 border-gray-700 pl-6 space-y-4 ml-2">
                {dayGroup.events.map((event) => (
                  <Card 
                    key={event.id} 
                    className="bg-gray-800 border-gray-700 overflow-hidden"
                  >
                    <div className={`h-1 ${event.type === 'task' ? 'bg-[#e09f3e]' : 'bg-[#fff3b0]'}`} />
                    <CardContent className="p-4">
                      <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                        <div>
                          <h3 className="text-lg font-medium text-white">{event.title}</h3>
                          <p className="text-gray-400 text-sm mt-1">
                            {event.description}
                          </p>
                        </div>
                        <div className="md:ml-4 mt-2 md:mt-0">
                          <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-700 text-gray-300">
                            {format(event.date, 'HH:mm')}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
