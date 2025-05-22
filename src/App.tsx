
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProjectProvider } from "./contexts/ProjectContext";
import { AppLayout } from "./components/AppLayout";
import Dashboard from "./pages/Dashboard";
import KanbanBoard from "./pages/KanbanBoard";
import GanttChart from "./pages/GanttChart";
import CalendarView from "./pages/CalendarView";
import NotePad from "./pages/NotePad";
import Timeline from "./pages/Timeline";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ProjectProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/project/:projectId" element={<AppLayout />}>
              <Route index element={<Navigate to="board" replace />} />
              <Route path="board" element={<KanbanBoard />} />
              <Route path="gantt" element={<GanttChart />} />
              <Route path="calendar" element={<CalendarView />} />
              <Route path="notes" element={<NotePad />} />
              <Route path="timeline" element={<Timeline />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ProjectProvider>
  </QueryClientProvider>
);

export default App;
