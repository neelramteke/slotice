import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Kanban, Calendar, ChartGantt, ClipboardList, Plus, Trash2, LayoutDashboard, Clock } from "lucide-react";
import { useProjects } from "@/contexts/ProjectContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

export function AppSidebar() {
  const sidebarContext = useSidebar();
  const collapsed = sidebarContext?.state === "collapsed";
  const navigate = useNavigate();
  const { projects, addProject, deleteProject, currentProject, setCurrentProject } = useProjects();
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");

  const handleAddProject = async () => {
    if (newProjectName.trim()) {
      try {
        const newProject = await addProject(newProjectName.trim(), newProjectDescription.trim());
        if (newProject) {
          setCurrentProject(newProject);
          setIsNewProjectModalOpen(false);
          setNewProjectName("");
          setNewProjectDescription("");
        }
      } catch (error) {
        console.error("Failed to create project:", error);
      }
    }
  };

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "flex items-center w-full p-2 rounded-md text-white bg-secondary hover:bg-secondary/80 transition-colors"
      : "flex items-center w-full p-2 rounded-md text-gray-300 hover:bg-secondary/50 transition-colors";

  const goToDashboard = () => {
    navigate("/");
  };

  return (
    <Sidebar
      className={`border-r border-gray-800 transition-all duration-300 ${collapsed ? "w-16" : "w-64"}`}
      collapsible="icon"
    >
      <div className="flex flex-col h-full">
        <div 
          className="flex items-center justify-between p-4 cursor-pointer" 
          onClick={goToDashboard}
        >
          {!collapsed && (
            <img src="/logo.png" alt="Logo" className="h-8" />
          )}
        </div>
        
        <div className="px-2 mb-4">
          <Button 
            onClick={() => setIsNewProjectModalOpen(true)} 
            variant="outline" 
            className={`${collapsed ? "w-10 h-10 p-0" : "w-full"} border-[#e09f3e] text-[#e09f3e] hover:text-white hover:bg-[#e09f3e]/20 transition-colors`}
          >
            <Plus className={`${collapsed ? '' : 'mr-2'} h-4 w-4`} />
            {!collapsed && "New Project"}
          </Button>
        </div>

        <SidebarContent className="flex-1 overflow-auto">
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs uppercase tracking-wider text-gray-500">
              {!collapsed && "Projects"}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              {projects.map((project) => (
                <SidebarMenuItem key={project.id} className="mb-1">
                  <div 
                    className={`group flex items-center justify-between w-full p-2 rounded-md cursor-pointer ${
                      currentProject?.id === project.id 
                        ? "bg-[#e09f3e]/20 text-[#e09f3e]" 
                        : "text-gray-300 hover:bg-gray-800"
                    }`}
                    onClick={() => setCurrentProject(project)}
                  >
                    <span className={`${collapsed ? "hidden" : "truncate"}`}>
                      {project.name}
                    </span>
                    {collapsed && (
                      <div className="w-10 h-10 flex items-center justify-center">
                        {project.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    
                    {!collapsed && (
                      <Button
                        variant="ghost" 
                        size="icon" 
                        className="opacity-0 group-hover:opacity-100 h-6 w-6 text-gray-400 hover:text-white hover:bg-red-500/20"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteProject(project.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </SidebarMenuItem>
              ))}
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        
        {currentProject && (
          <div className="border-t border-gray-800 p-2">
            <NavLink to={`/project/${currentProject.id}/board`} className={getNavCls}>
              <Kanban className="h-4 w-4 mr-2" />
              {!collapsed && <span>Kanban Board</span>}
            </NavLink>
            <NavLink to={`/project/${currentProject.id}/gantt`} className={getNavCls}>
              <ChartGantt className="h-4 w-4 mr-2" />
              {!collapsed && <span>Gantt Chart</span>}
            </NavLink>
            <NavLink to={`/project/${currentProject.id}/calendar`} className={getNavCls}>
              <Calendar className="h-4 w-4 mr-2" />
              {!collapsed && <span>Calendar</span>}
            </NavLink>
            <NavLink to={`/project/${currentProject.id}/notes`} className={getNavCls}>
              <ClipboardList className="h-4 w-4 mr-2" />
              {!collapsed && <span>Notes</span>}
            </NavLink>
            <NavLink to={`/project/${currentProject.id}/timeline`} className={getNavCls}>
              <Clock className="h-4 w-4 mr-2" />
              {!collapsed && <span>Timeline</span>}
            </NavLink>
          </div>
        )}
        
        {/* Dashboard button at bottom of sidebar */}
        <div className="mt-auto border-t border-gray-800 p-2">
          <Button
            onClick={goToDashboard}
            variant="ghost"
            className="flex items-center w-full p-2 rounded-md text-gray-300 hover:bg-secondary/50 transition-colors"
          >
            <LayoutDashboard className="h-4 w-4 mr-2" />
            {!collapsed && <span>Home Page</span>}
          </Button>
        </div>
      </div>
      
      <Dialog open={isNewProjectModalOpen} onOpenChange={setIsNewProjectModalOpen}>
        <DialogContent className="bg-gray-900 text-white border border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-[#e09f3e] font-display">Create New Project</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="project-name" className="text-white">
                Project Name
              </Label>
              <Input
                id="project-name"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                className="bg-gray-800 border-gray-700 focus:border-[#e09f3e] text-white"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="project-description" className="text-white">
                Description
              </Label>
              <Textarea
                id="project-description"
                value={newProjectDescription}
                onChange={(e) => setNewProjectDescription(e.target.value)}
                className="bg-gray-800 border-gray-700 focus:border-[#e09f3e] text-white min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsNewProjectModalOpen(false)}
              className="border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddProject}
              className="bg-[#e09f3e] hover:bg-[#e09f3e]/80 text-white"
              disabled={!newProjectName.trim()}
            >
              Create Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Sidebar>
  );
}