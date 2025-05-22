
import { useProjects } from "@/contexts/ProjectContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { projects, addProject, setCurrentProject } = useProjects();
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const navigate = useNavigate();

  const handleAddProject = () => {
    if (newProjectName.trim()) {
      const newProject = addProject(newProjectName.trim(), newProjectDescription.trim());
      if (newProject) {
        setCurrentProject(newProject);
        setIsNewProjectModalOpen(false);
        setNewProjectName("");
        setNewProjectDescription("");
        navigate(`/project/${newProject.id}/board`);
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

  return (
    <div className="container mx-auto animate-fade-in">
      <div className="grid gap-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white font-display">Your Projects</h1>
          <Button 
            onClick={() => setIsNewProjectModalOpen(true)}
            className="bg-neon-purple hover:bg-neon-purple/80 text-white"
          >
            <Plus className="mr-2 h-4 w-4" /> New Project
          </Button>
        </div>
        
        {projects.length === 0 ? (
          <div className="text-center py-12">
            <div className="mb-4 text-gray-400">No projects yet</div>
            <Button 
              onClick={() => setIsNewProjectModalOpen(true)}
              className="bg-neon-purple hover:bg-neon-purple/80 text-white"
            >
              <Plus className="mr-2 h-4 w-4" /> Create Your First Project
            </Button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Card 
                key={project.id}
                className="bg-gray-900/70 border-gray-800 hover:border-neon-purple/50 transition-all hover:shadow-neon-purple cursor-pointer overflow-hidden group"
                onClick={() => handleSelectProject(project.id)}
              >
                <div className="h-1.5 w-full bg-gradient-to-r from-neon-purple to-neon-blue" />
                <CardHeader>
                  <CardTitle className="text-white">{project.name}</CardTitle>
                  <CardDescription className="text-gray-400 line-clamp-2">
                    {project.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-400">
                    Created: {new Date(project.created_at).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      <Dialog open={isNewProjectModalOpen} onOpenChange={setIsNewProjectModalOpen}>
        <DialogContent className="bg-gray-900 text-white border border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-neon-purple font-display">Create New Project</DialogTitle>
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
                className="bg-gray-800 border-gray-700 focus:border-neon-purple text-white"
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
                className="bg-gray-800 border-gray-700 focus:border-neon-purple text-white min-h-[100px]"
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
              className="bg-neon-purple hover:bg-neon-purple/80 text-white"
            >
              Create Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
