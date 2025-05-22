
import { useParams } from "react-router-dom";
import { useProjects } from "@/contexts/ProjectContext";
import { useState, useRef } from "react";
import { Calendar as CalendarIcon, Plus, AlertCircle } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog, 
  DialogContent, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { format, isSameDay } from "date-fns";
import { CalendarEvent, Task } from "@/types";

export default function CalendarView() {
  const { projectId } = useParams();
  const { 
    getProjectTasks, 
    getProjectEvents, 
    addEvent, 
    updateEvent, 
    deleteEvent
  } = useProjects();

  const tasks = projectId ? getProjectTasks(projectId) : [];
  const events = projectId ? getProjectEvents(projectId) : [];
  
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  
  const [eventTitle, setEventTitle] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [eventDate, setEventDate] = useState<Date | undefined>(new Date());
  
  const calendarContainerRef = useRef<HTMLDivElement>(null);
  
  const handleAddEvent = () => {
    if (projectId && eventTitle.trim() && eventDate) {
      if (editingEvent) {
        // Update existing event
        updateEvent({
          ...editingEvent,
          title: eventTitle.trim(),
          description: eventDescription.trim(),
          start_date: eventDate.toISOString(),
          end_date: new Date(eventDate.getTime() + 3600000).toISOString() // 1 hour later
        });
      } else {
        // Add new event
        addEvent(
          projectId,
          eventTitle.trim(),
          eventDescription.trim(),
          eventDate.toISOString(),
          new Date(eventDate.getTime() + 3600000).toISOString() // 1 hour later
        );
      }
      resetForm();
      setIsEventModalOpen(false);
    }
  };
  
  const handleDeleteEvent = () => {
    if (editingEvent) {
      deleteEvent(editingEvent.id);
      resetForm();
      setIsEventModalOpen(false);
    }
  };
  
  const resetForm = () => {
    setEventTitle("");
    setEventDescription("");
    setEventDate(new Date());
    setEditingEvent(null);
  };
  
  const openNewEventModal = (date?: Date) => {
    resetForm();
    if (date) setEventDate(date);
    setIsEventModalOpen(true);
  };
  
  const openEditEventModal = (event: CalendarEvent) => {
    setEditingEvent(event);
    setEventTitle(event.title);
    setEventDescription(event.description);
    setEventDate(new Date(event.start_date));
    setIsEventModalOpen(true);
  };
  
  const getDayContent = (day: Date) => {
    const dayEvents = [...events, ...tasks.filter(task => task.due_date)]
      .filter(item => {
        const itemDate = 'due_date' in item 
          ? new Date(item.due_date!)
          : new Date(item.start_date);
        return isSameDay(itemDate, day);
      });
    
    if (dayEvents.length > 0) {
      return (
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-1 h-1 bg-neon-purple rounded-full" />
        </div>
      );
    }
    
    return null;
  };
  
  const getStatusColor = (status: Task["status"]) => {
    switch (status) {
      case "todo":
        return "border-l-neon-blue";
      case "in_progress":
        return "border-l-neon-purple";
      case "review":
        return "border-l-neon-pink";
      case "done":
        return "border-l-green-500";
      default:
        return "border-l-gray-500";
    }
  };

  return (
    <div className="grid md:grid-cols-3 gap-6 animate-fade-in">
      <div className="md:col-span-2">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-white font-display">
            Calendar
          </h1>
          <Button 
            onClick={() => openNewEventModal()}
            className="bg-neon-purple hover:bg-neon-purple/80 text-white"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Event
          </Button>
        </div>
        
        <Card ref={calendarContainerRef} className="bg-gray-900/60 border-gray-800 p-4">
          <Calendar 
            mode="single"
            selected={date}
            onSelect={setDate}
            className="bg-transparent text-white"
            classNames={{
              day_today: "bg-neon-purple/20 text-white",
              day_selected: "bg-neon-purple !text-white hover:bg-neon-purple/80",
            }}
            components={{
              DayContent: (props) => (
                <div className="relative w-full h-full flex items-center justify-center">
                  <div>{props.day.day}</div>
                  <div className="absolute bottom-1">
                    {getDayContent(props.day.date)}
                  </div>
                </div>
              ),
            }}
            fromDate={new Date(new Date().getFullYear(), 0, 1)} // From Jan 1 of current year
            toDate={new Date(new Date().getFullYear() + 1, 11, 31)} // To Dec 31 of next year
            disabled={{ before: new Date(new Date().getFullYear() - 5, 0, 1) }}
            onDayClick={(day) => {
              setDate(day);
              openNewEventModal(day);
            }}
          />
        </Card>
      </div>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white">
            {date ? format(date, "MMMM d, yyyy") : "Events"}
          </h2>
        </div>
        
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-neon-purple mb-2">Events</h3>
          
          {events
            .filter(event => date && isSameDay(new Date(event.start_date), date))
            .map(event => (
              <Card 
                key={event.id} 
                className="bg-gray-800 border-gray-700 border-l-4 border-l-neon-purple hover:border-neon-purple cursor-pointer p-3"
                onClick={() => openEditEventModal(event)}
              >
                <div className="flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-2 text-neon-purple" />
                  <span className="text-sm font-medium text-white">{event.title}</span>
                </div>
                <div className="text-xs text-gray-400 mt-1 line-clamp-2">
                  {event.description}
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  {format(new Date(event.start_date), "h:mm a")}
                </div>
              </Card>
            ))}
          
          <h3 className="text-sm font-medium text-neon-blue mt-6 mb-2">Tasks Due</h3>
          
          {tasks
            .filter(task => task.due_date && date && isSameDay(new Date(task.due_date), date))
            .map(task => (
              <Card 
                key={task.id} 
                className={`bg-gray-800 border-gray-700 border-l-4 ${getStatusColor(task.status)} p-3`}
              >
                <div className="flex items-center">
                  <span className="text-sm font-medium text-white">{task.title}</span>
                </div>
                <div className="text-xs text-gray-400 mt-1 line-clamp-1">
                  {task.description}
                </div>
              </Card>
            ))}
          
          {events.filter(event => date && isSameDay(new Date(event.start_date), date)).length === 0 && 
           tasks.filter(task => task.due_date && date && isSameDay(new Date(task.due_date), date)).length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <AlertCircle className="h-8 w-8 mb-4 opacity-50" />
              <p className="text-sm">No events or tasks on this date</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Add/Edit Event Modal */}
      <Dialog open={isEventModalOpen} onOpenChange={setIsEventModalOpen}>
        <DialogContent className="bg-gray-900 text-white border border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-neon-purple font-display">
              {editingEvent ? "Edit Event" : "Add New Event"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="event-title" className="text-white">
                Event Title
              </Label>
              <Input
                id="event-title"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                className="bg-gray-800 border-gray-700 focus:border-neon-purple text-white"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="event-description" className="text-white">
                Description
              </Label>
              <Textarea
                id="event-description"
                value={eventDescription}
                onChange={(e) => setEventDescription(e.target.value)}
                className="bg-gray-800 border-gray-700 focus:border-neon-purple text-white"
              />
            </div>
            <div className="grid gap-2">
              <Label className="text-white">Date</Label>
              <Calendar 
                mode="single"
                selected={eventDate}
                onSelect={setEventDate}
                className="bg-gray-800 border border-gray-700 rounded-md p-2 text-white"
                classNames={{
                  day_today: "bg-neon-purple/20 text-white",
                  day_selected: "bg-neon-purple !text-white hover:bg-neon-purple/80",
                }}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            {editingEvent && (
              <Button 
                variant="destructive" 
                onClick={handleDeleteEvent}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete Event
              </Button>
            )}
            <Button 
              variant="outline" 
              onClick={() => {
                setIsEventModalOpen(false);
                resetForm();
              }}
              className="border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddEvent}
              className="bg-neon-purple hover:bg-neon-purple/80 text-white"
              disabled={!eventTitle.trim() || !eventDate}
            >
              {editingEvent ? "Update" : "Add"} Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
