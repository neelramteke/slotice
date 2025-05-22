
import { useState } from "react";
import { useParams } from "react-router-dom";
import { useProjects } from "@/contexts/ProjectContext";
import { Note, CheckItem } from "@/types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { 
  Plus, 
  Trash2, 
  Check, 
  Square, 
  AlertCircle 
} from "lucide-react";
import { format } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";

export default function NotePad() {
  const { projectId } = useParams();
  const { 
    getProjectNotes, 
    addNote, 
    updateNote, 
    deleteNote, 
    addCheckItem, 
    toggleCheckItem, 
    deleteCheckItem, 
    getNoteCheckItems,
    loading
  } = useProjects();
  
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [newCheckItem, setNewCheckItem] = useState("");
  
  const notes = projectId ? getProjectNotes(projectId) : [];
  
  const handleAddNote = async () => {
    if (projectId && noteTitle.trim()) {
      try {
        if (editingNote) {
          // Update existing note
          const updatedNote = {
            ...editingNote,
            title: noteTitle.trim(),
            content: noteContent.trim(),
          };
          await updateNote(updatedNote);
        } else {
          // Add new note
          await addNote(projectId, noteTitle.trim(), noteContent.trim());
        }
        resetForm();
        setIsNoteModalOpen(false);
      } catch (error) {
        console.error("Error with note:", error);
      }
    }
  };
  
  const handleDeleteNote = async () => {
    if (editingNote) {
      try {
        await deleteNote(editingNote.id);
        resetForm();
        setIsNoteModalOpen(false);
      } catch (error) {
        console.error("Error deleting note:", error);
      }
    }
  };
  
  const resetForm = () => {
    setNoteTitle("");
    setNoteContent("");
    setNewCheckItem("");
    setEditingNote(null);
  };
  
  const openNewNoteModal = () => {
    resetForm();
    setIsNoteModalOpen(true);
  };
  
  const openEditNoteModal = (note: Note) => {
    setEditingNote(note);
    setNoteTitle(note.title);
    setNoteContent(note.content || "");
    setIsNoteModalOpen(true);
  };
  
  const handleAddCheckItem = async () => {
    if (editingNote && newCheckItem.trim()) {
      try {
        await addCheckItem(editingNote.id, newCheckItem.trim());
        setNewCheckItem("");
      } catch (error) {
        console.error("Error adding check item:", error);
      }
    }
  };
  
  const handleCheckItemKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAddCheckItem();
    }
  };

  if (loading) {
    return (
      <div className="animate-fade-in">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-9 w-32" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-white font-display">
          Notes
        </h1>
        <Button 
          onClick={openNewNoteModal}
          className="bg-neon-purple hover:bg-neon-purple/80 text-white"
        >
          <Plus className="mr-2 h-4 w-4" /> Add Note
        </Button>
      </div>
      
      {notes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <AlertCircle className="h-16 w-16 mb-4 opacity-50" />
          <p className="text-xl mb-2">No notes yet</p>
          <p className="text-sm mb-8">Create your first note to get started</p>
          <Button 
            onClick={openNewNoteModal}
            className="bg-neon-purple hover:bg-neon-purple/80 text-white"
          >
            <Plus className="mr-2 h-4 w-4" /> Create Note
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map(note => {
            const checkItems = getNoteCheckItems(note.id);
            const checkedCount = checkItems.filter(item => item.checked).length;
            
            return (
              <Card 
                key={note.id} 
                className="bg-gray-900/70 border-gray-800 hover:border-neon-purple transition-all hover:shadow-neon-purple overflow-hidden cursor-pointer group"
                onClick={() => openEditNoteModal(note)}
              >
                <div className="h-1.5 w-full bg-gradient-to-r from-neon-blue to-neon-purple" />
                <CardHeader>
                  <CardTitle className="text-white">{note.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {note.content && (
                    <p className="text-sm text-gray-300 whitespace-pre-wrap line-clamp-4">{note.content}</p>
                  )}
                  
                  {checkItems.length > 0 && (
                    <div className="space-y-2">
                      {checkItems.slice(0, 3).map(item => (
                        <div 
                          key={item.id} 
                          className="flex items-start text-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleCheckItem(item.id);
                          }}
                        >
                          {item.checked ? (
                            <Check className="h-4 w-4 mr-2 text-neon-purple shrink-0" />
                          ) : (
                            <Square className="h-4 w-4 mr-2 text-gray-500 shrink-0" />
                          )}
                          <span className={`${item.checked ? 'line-through text-gray-500' : 'text-gray-300'}`}>
                            {item.content}
                          </span>
                        </div>
                      ))}
                      
                      {checkItems.length > 3 && (
                        <div className="text-xs text-gray-500 pl-6">
                          +{checkItems.length - 3} more items
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
                <CardFooter className="text-xs text-gray-500 justify-between">
                  <span>
                    {format(new Date(note.created_at), "MMM d, yyyy")}
                  </span>
                  {checkItems.length > 0 && (
                    <span>
                      {checkedCount}/{checkItems.length} completed
                    </span>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
      
      {/* Add/Edit Note Modal */}
      <Dialog open={isNoteModalOpen} onOpenChange={setIsNoteModalOpen}>
        <DialogContent className="bg-gray-900 text-white border border-gray-800 max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-neon-purple font-display">
              {editingNote ? "Edit Note" : "Create New Note"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="note-title" className="text-white">
                Title
              </Label>
              <Input
                id="note-title"
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                className="bg-gray-800 border-gray-700 focus:border-neon-purple text-white"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="note-content" className="text-white">
                Note Content
              </Label>
              <Textarea
                id="note-content"
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                className="bg-gray-800 border-gray-700 focus:border-neon-purple text-white min-h-[100px]"
              />
            </div>
            
            {editingNote && (
              <div className="grid gap-2 mt-4">
                <div className="flex justify-between items-center">
                  <Label className="text-white">
                    Checklist
                  </Label>
                </div>
                
                <div className="flex items-center gap-2 mb-2">
                  <Input
                    placeholder="Add new item"
                    value={newCheckItem}
                    onChange={(e) => setNewCheckItem(e.target.value)}
                    className="bg-gray-800 border-gray-700 focus:border-neon-purple text-white"
                    onKeyPress={handleCheckItemKeyPress}
                  />
                  <Button
                    onClick={handleAddCheckItem}
                    disabled={!newCheckItem.trim()}
                    className="shrink-0 bg-neon-purple hover:bg-neon-purple/80"
                  >
                    Add
                  </Button>
                </div>
                
                <div className="space-y-2 max-h-[200px] overflow-auto">
                  {getNoteCheckItems(editingNote.id).length === 0 ? (
                    <div className="text-sm text-gray-500 text-center py-4">
                      No checklist items yet
                    </div>
                  ) : (
                    getNoteCheckItems(editingNote.id).map(item => (
                      <div key={item.id} className="flex items-start gap-2 group">
                        <Checkbox
                          checked={item.checked}
                          onCheckedChange={() => toggleCheckItem(item.id)}
                          className="mt-1 data-[state=checked]:bg-neon-purple data-[state=checked]:border-neon-purple"
                        />
                        <div className="flex-1">
                          <p className={`text-sm ${item.checked ? 'line-through text-gray-500' : 'text-white'}`}>
                            {item.content}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteCheckItem(item.id);
                          }}
                        >
                          <Trash2 className="h-3 w-3 text-gray-400" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter className="gap-2">
            {editingNote && (
              <Button 
                variant="destructive" 
                onClick={handleDeleteNote}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete Note
              </Button>
            )}
            <Button 
              variant="outline" 
              onClick={() => {
                setIsNoteModalOpen(false);
                resetForm();
              }}
              className="border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddNote}
              className="bg-neon-purple hover:bg-neon-purple/80 text-white"
              disabled={!noteTitle.trim()}
            >
              {editingNote ? "Update" : "Create"} Note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
