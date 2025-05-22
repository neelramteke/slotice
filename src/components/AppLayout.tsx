
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useProjects } from "@/contexts/ProjectContext";
import { Outlet, Navigate } from "react-router-dom";

export function AppLayout() {
  const { currentProject } = useProjects();

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col min-h-screen">
          <header className="h-14 border-b border-gray-800 flex items-center px-4">
            <SidebarTrigger className="text-gray-400 hover:text-white mr-4" />
            <h1 className="font-display text-xl text-white">
              {currentProject?.name || "Project Management"}
            </h1>
          </header>
          
          <main className="flex-1 overflow-auto p-6">
            {currentProject ? <Outlet /> : <Navigate to="/" />}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
