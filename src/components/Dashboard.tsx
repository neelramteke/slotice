
import { useProjects } from "@/contexts/ProjectContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, BarChart3, CalendarIcon, CheckSquare } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { projects, addProject, setCurrentProject, tasks, events, loading } = useProjects();
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const navigate = useNavigate();

  const handleAddProject = async () => {
    if (newProjectName.trim()) {
      try {
        const newProject = await addProject(newProjectName.trim(), newProjectDescription.trim());
        if (newProject) {
          setCurrentProject(newProject);
          setIsNewProjectModalOpen(false);
          setNewProjectName("");
          setNewProjectDescription("");
          navigate(`/project/${newProject.id}/board`);
        }
      } catch (error) {
        console.error("Error adding project:", error);
      }
    }
  };

  const handleSelectProject = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      setCurrentProject(project);
      navigate(`/project/${projectId}/board`);
    }
  };

  // Prepare data for the overview statistics
  const totalProjects = projects.length;
  const totalTasks = tasks.length;
  const totalEvents = events.length;
  
  if (loading) {
    return (
      <div className="container mx-auto animate-fade-in">
        <div className="grid gap-6">
          <div className="flex justify-between items-center">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-10 w-40" />
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto animate-fade-in">
      <div className="grid gap-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <Button 
            onClick={() => setIsNewProjectModalOpen(true)}
            className="bg-[#e09f3e] hover:bg-[#e09f3e]/80 text-white"
          >
            <Plus className="mr-2 h-4 w-4" /> New Project
          </Button>
        </div>
        
        {/* Summary Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="bg-[#fff3b0] border-gray-800 hover:shadow-[#fff3b0]/20 transition-all">
            <CardHeader className="pb-2">
              <CardTitle className="text-gray-900 flex items-center">
                <BarChart3 className="mr-2 h-5 w-5 text-[#540b0e]" />
                Projects
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{totalProjects}</div>
              <p className="text-gray-700 mt-1 text-sm">
                Active projects in your workspace
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[#e09f3e] border-gray-800 hover:shadow-[#e09f3e]/20 transition-all">
            <CardHeader className="pb-2">
              <CardTitle className="text-gray-900 flex items-center">
                <CheckSquare className="mr-2 h-5 w-5 text-[#540b0e]" />
                Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{totalTasks}</div>
              <p className="text-gray-700 mt-1 text-sm">
                Total tasks across all projects
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[#540b0e] border-gray-800 hover:shadow-[#540b0e]/20 transition-all">
            <CardHeader className="pb-2">
              <CardTitle className="text-white flex items-center">
                <CalendarIcon className="mr-2 h-5 w-5 text-[#fff3b0]" />
                Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{totalEvents}</div>
              <p className="text-white/80 mt-1 text-sm">
                Scheduled events on your calendar
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* Projects list */}
        <div className="mt-4">
          <h2 className="text-xl font-bold text-white mb-4">Your Projects</h2>
          
          {projects.length === 0 ? (
            <div className="text-center py-12">
              <div className="mb-4 text-gray-400">No projects yet</div>
              <Button 
                onClick={() => setIsNewProjectModalOpen(true)}
                className="bg-[#e09f3e] hover:bg-[#e09f3e]/80 text-white"
              >
                <Plus className="mr-2 h-4 w-4" /> Create Your First Project
              </Button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => {
                const projectTasks = tasks.filter(task => task.project_id === project.id);
                const totalProjectTasks = projectTasks.length;
                const completedTasks = projectTasks.filter(task => task.status === 'done').length;
                const taskCompletionPercentage = totalProjectTasks > 0 
                  ? Math.round((completedTasks / totalProjectTasks) * 100) 
                  : 0;
                
                return (
                  <Card 
                    key={project.id}
                    className="bg-gray-900/70 border-gray-800 hover:border-[#e09f3e]/50 transition-all hover:shadow-[#e09f3e] cursor-pointer overflow-hidden group"
                    onClick={() => handleSelectProject(project.id)}
                  >
                    <div className="h-1.5 w-full bg-gradient-to-r from-[#540b0e] to-[#e09f3e]" />
                    <CardHeader>
                      <CardTitle className="text-white">{project.name}</CardTitle>
                      <CardDescription className="text-gray-400 line-clamp-2">
                        {project.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Task Completion</span>
                          <span className="text-white font-medium">{taskCompletionPercentage}%</span>
                        </div>
                        <div className="w-full bg-gray-800 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-[#e09f3e] to-[#fff3b0] h-2 rounded-full"
                            style={{ width: `${taskCompletionPercentage}%` }}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          <div className="flex flex-col">
                            <span className="text-xs text-gray-500">Tasks</span>
                            <span className="text-white">{totalProjectTasks}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs text-gray-500">Created</span>
                            <span className="text-white">{new Date(project.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
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
    </div>
  );
}
