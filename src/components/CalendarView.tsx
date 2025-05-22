
import React, { useState, useMemo } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, ChevronRight, Plus, CalendarIcon, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { useProjects } from '@/contexts/ProjectContext';
import { useParams } from 'react-router-dom';
import { CalendarEvent } from '@/types';

// Define DayContentProps interface
interface DayContentProps {
  date: Date;
  dayOfMonth: number;
}

// Custom day component for the calendar
const CalendarDay = ({ date, dayOfMonth }: DayContentProps) => {
  return (
    <div className="w-full h-full">
      <div className="font-medium">{dayOfMonth}</div>
    </div>
  );
};

const CalendarView = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { events, addEvent, deleteEvent, getProjectEvents } = useProjects();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isAddEventDialogOpen, setIsAddEventDialogOpen] = useState(false);
  const [isViewEventDialogOpen, setIsViewEventDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    startTime: '09:00',
    endTime: '10:00'
  });

  // Get all events for the current project
  const projectEvents = useMemo(() => {
    if (!projectId) return [];
    return getProjectEvents(projectId);
  }, [projectId, events, getProjectEvents]);

  // Filter events for the selected date
  const eventsForSelectedDate = useMemo(() => {
    if (!selectedDate) return [];
    
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    return projectEvents.filter(event => {
      const eventStartDate = event.start_date.split('T')[0];
      return eventStartDate === dateStr;
    });
  }, [selectedDate, projectEvents]);

  const handleAddEvent = () => {
    if (!projectId || !selectedDate || !newEvent.title) return;
    
    const startDateTime = `${format(selectedDate, 'yyyy-MM-dd')}T${newEvent.startTime}:00`;
    const endDateTime = `${format(selectedDate, 'yyyy-MM-dd')}T${newEvent.endTime}:00`;
    
    addEvent(
      projectId,
      newEvent.title,
      newEvent.description,
      startDateTime,
      endDateTime
    );
    
    setIsAddEventDialogOpen(false);
    setNewEvent({
      title: '',
      description: '',
      startTime: '09:00',
      endTime: '10:00'
    });
  };

  const handleViewEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsViewEventDialogOpen(true);
  };

  const handleDeleteEvent = (eventId: string) => {
    deleteEvent(eventId);
    setIsViewEventDialogOpen(false);
  };

  const handlePrevMonth = () => {
    if (selectedDate) {
      const prevMonth = new Date(selectedDate);
      prevMonth.setMonth(prevMonth.getMonth() - 1);
      setSelectedDate(prevMonth);
    }
  };

  const handleNextMonth = () => {
    if (selectedDate) {
      const nextMonth = new Date(selectedDate);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      setSelectedDate(nextMonth);
    }
  };

  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white font-display">Calendar</h1>
        <Button 
          onClick={() => setIsAddEventDialogOpen(true)}
          variant="outline" 
          className="border-neon-purple text-neon-purple hover:bg-neon-purple/20"
        >
          <Plus className="mr-2 h-4 w-4" /> Add Event
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <Card className="lg:col-span-8 bg-gray-900 border-gray-800 shadow">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handlePrevMonth}
                  className="text-gray-400 hover:text-white"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <h2 className="text-lg font-medium text-white mx-2">
                  {selectedDate ? format(selectedDate, 'MMMM yyyy') : ''}
                </h2>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleNextMonth}
                  className="text-gray-400 hover:text-white"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
              <div className="text-sm text-gray-400">
                {projectEvents.length} event{projectEvents.length !== 1 ? 's' : ''}
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border-gray-800"
              classNames={{
                day_today: "bg-neon-purple/20 text-neon-purple font-bold",
                day_selected: "bg-neon-purple text-white hover:bg-neon-purple hover:text-white focus:bg-neon-purple focus:text-white",
                day_outside: "text-gray-500 opacity-50",
              }}
              components={{
                DayContent: ({ date }) => {
                  // Find events for this day
                  const dayStr = format(date, 'yyyy-MM-dd');
                  const hasEvents = projectEvents.some(event => event.start_date.split('T')[0] === dayStr);
                  
                  return (
                    <div className="w-full h-full relative">
                      <div>{date.getDate()}</div>
                      {hasEvents && (
                        <div className="absolute bottom-1 right-0 left-0 flex justify-center">
                          <div className="h-1 w-1 bg-neon-blue rounded-full"></div>
                        </div>
                      )}
                    </div>
                  );
                }
              }}
            />
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-4 bg-gray-900 border-gray-800 shadow">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <CalendarIcon className="h-4 w-4 mr-2" />
              {selectedDate ? format(selectedDate, 'EEEE, MMMM d, yyyy') : ''}
            </CardTitle>
            <CardDescription className="text-gray-400">
              {eventsForSelectedDate.length 
                ? `${eventsForSelectedDate.length} event${eventsForSelectedDate.length !== 1 ? 's' : ''}`
                : 'No events scheduled'}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-2">
            {eventsForSelectedDate.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                <div className="mb-2">No events for this day</div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setIsAddEventDialogOpen(true)}
                  className="border-gray-700 text-gray-300"
                >
                  <Plus className="h-4 w-4 mr-2" /> Add Event
                </Button>
              </div>
            ) : (
              eventsForSelectedDate.map((event) => (
                <div 
                  key={event.id}
                  onClick={() => handleViewEvent(event)}
                  className="p-3 bg-gray-800 hover:bg-gray-700 rounded-md cursor-pointer transition-colors"
                >
                  <div className="font-medium text-white">{event.title}</div>
                  <div className="text-sm text-gray-400 flex items-center mt-1">
                    <Clock className="h-3 w-3 mr-1" />
                    {format(new Date(event.start_date), 'h:mm a')} - {format(new Date(event.end_date), 'h:mm a')}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Add Event Dialog */}
      <Dialog open={isAddEventDialogOpen} onOpenChange={setIsAddEventDialogOpen}>
        <DialogContent className="bg-gray-900 text-white border border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-neon-purple font-display">Add New Event</DialogTitle>
            <DialogDescription className="text-gray-400">
              {selectedDate ? format(selectedDate, 'EEEE, MMMM d, yyyy') : ''}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="event-title" className="text-white">Event Title</Label>
              <Input
                id="event-title"
                placeholder="Meeting with team"
                value={newEvent.title}
                onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                className="bg-gray-800 border-gray-700 focus:border-neon-purple text-white"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="event-description" className="text-white">Description</Label>
              <Textarea
                id="event-description"
                placeholder="Discuss project timeline and next steps..."
                value={newEvent.description}
                onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                className="bg-gray-800 border-gray-700 focus:border-neon-purple text-white min-h-[80px]"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="start-time" className="text-white">Start Time</Label>
                <Input
                  id="start-time"
                  type="time"
                  value={newEvent.startTime}
                  onChange={(e) => setNewEvent({...newEvent, startTime: e.target.value})}
                  className="bg-gray-800 border-gray-700 focus:border-neon-purple text-white"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="end-time" className="text-white">End Time</Label>
                <Input
                  id="end-time"
                  type="time"
                  value={newEvent.endTime}
                  onChange={(e) => setNewEvent({...newEvent, endTime: e.target.value})}
                  className="bg-gray-800 border-gray-700 focus:border-neon-purple text-white"
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsAddEventDialogOpen(false)}
              className="border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddEvent}
              disabled={!newEvent.title}
              className="bg-neon-purple hover:bg-neon-purple/80 text-white"
            >
              Add Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* View Event Dialog */}
      <Dialog open={isViewEventDialogOpen} onOpenChange={setIsViewEventDialogOpen}>
        <DialogContent className="bg-gray-900 text-white border border-gray-800">
          {selectedEvent && (
            <>
              <DialogHeader>
                <DialogTitle className="text-neon-purple font-display">{selectedEvent.title}</DialogTitle>
                <DialogDescription className="text-gray-400">
                  {format(new Date(selectedEvent.start_date), 'EEEE, MMMM d, yyyy')}
                </DialogDescription>
              </DialogHeader>
              
              <div className="py-4">
                <div className="flex items-center text-sm text-gray-400 mb-4">
                  <Clock className="h-4 w-4 mr-2" />
                  {format(new Date(selectedEvent.start_date), 'h:mm a')} - {format(new Date(selectedEvent.end_date), 'h:mm a')}
                </div>
                
                <div className="text-white">
                  {selectedEvent.description || 'No description provided.'}
                </div>
              </div>
              
              <DialogFooter>
                <Button 
                  variant="destructive" 
                  onClick={() => handleDeleteEvent(selectedEvent.id)}
                  className="bg-red-900 hover:bg-red-800 text-white"
                >
                  Delete Event
                </Button>
                <Button 
                  onClick={() => setIsViewEventDialogOpen(false)}
                  className="bg-neon-purple hover:bg-neon-purple/80 text-white"
                >
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CalendarView;
