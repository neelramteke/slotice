
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useProjects } from "@/contexts/ProjectContext";
import { Outlet, Navigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

export function AppLayout() {
  const { currentProject, loading } = useProjects();

  if (loading) {
    return (
      <div className="flex min-h-screen w-full bg-background">
        <Skeleton className="h-screen w-64" />
        <div className="flex-1 flex flex-col min-h-screen">
          <Skeleton className="h-14 w-full" />
          <div className="p-6 flex-1">
            <Skeleton className="h-[calc(100vh-100px)] w-full" />
          </div>
        </div>
      </div>
    );
  }

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
