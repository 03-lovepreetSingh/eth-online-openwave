"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Code, Loader2, Plus, X } from "lucide-react";
import { createHackProject } from "@/actions/hacks";
import { toast } from "sonner";

interface CreateProjectDialogProps {
  hackathonId: string;
  trigger: React.ReactNode;
  onSuccess?: () => void;
}

export function CreateProjectDialog({ hackathonId, trigger, onSuccess }: CreateProjectDialogProps) {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    project_name: "",
    description: "",
    repository: "",
    image_url: "",
    contract_address: "",
    tech_stack: [] as string[],
    team_members: [] as string[],
  });
  const [newTech, setNewTech] = useState("");
  const [newMember, setNewMember] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session?.user?.username) {
      toast.error("You must be logged in to submit a project");
      return;
    }

    if (!formData.project_name.trim()) {
      toast.error("Project name is required");
      return;
    }

    setLoading(true);
    try {
      const result = await createHackProject({
        hackathon_id: hackathonId,
        project_name: formData.project_name,
        description: formData.description,
        repository: formData.repository,
        image_url: formData.image_url || undefined,
        owner_id: session.user.username,
        team_members: formData.team_members,
        tech_stack: formData.tech_stack,
        contract_address: formData.contract_address || undefined,
      });

      if (result.success) {
        toast.success("Project submitted successfully!");
        setOpen(false);
        setFormData({
          project_name: "",
          description: "",
          repository: "",
          image_url: "",
          contract_address: "",
          tech_stack: [],
          team_members: [],
        });
        onSuccess?.();
      } else {
        toast.error(result.error || "Failed to submit project");
      }
    } catch (error) {
      console.error("Error creating project:", error);
      toast.error("Failed to submit project");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addTech = () => {
    if (newTech.trim() && !formData.tech_stack.includes(newTech.trim())) {
      setFormData(prev => ({
        ...prev,
        tech_stack: [...prev.tech_stack, newTech.trim()]
      }));
      setNewTech("");
    }
  };

  const removeTech = (tech: string) => {
    setFormData(prev => ({
      ...prev,
      tech_stack: prev.tech_stack.filter(t => t !== tech)
    }));
  };

  const addMember = () => {
    if (newMember.trim() && !formData.team_members.includes(newMember.trim())) {
      setFormData(prev => ({
        ...prev,
        team_members: [...prev.team_members, newMember.trim()]
      }));
      setNewMember("");
    }
  };

  const removeMember = (member: string) => {
    setFormData(prev => ({
      ...prev,
      team_members: prev.team_members.filter(m => m !== member)
    }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overHBAR-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Code className="w-5 h-5" />
            Submit New Project
          </DialogTitle>
          <DialogDescription>
            Submit your decentralized application (dApp) to this hackathon for community voting.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="project_name">Project Name *</Label>
            <Input
              id="project_name"
              placeholder="e.g., DeFi Trading Protocol"
              value={formData.project_name}
              onChange={(e) => handleChange("project_name", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe your dApp, its features, and how it works..."
              rows={3}
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="repository">Repository URL</Label>
            <Input
              id="repository"
              type="url"
              placeholder="https://github.com/username/project"
              value={formData.repository}
              onChange={(e) => handleChange("repository", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contract_address">Smart Contract Address</Label>
            <Input
              id="contract_address"
              placeholder="0x..."
              value={formData.contract_address}
              onChange={(e) => handleChange("contract_address", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image_url">Project Image URL (Optional)</Label>
            <Input
              id="image_url"
              type="url"
              placeholder="https://example.com/project-screenshot.jpg"
              value={formData.image_url}
              onChange={(e) => handleChange("image_url", e.target.value)}
            />
          </div>

          {/* Tech Stack */}
          <div className="space-y-2">
            <Label>Tech Stack</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Add technology (e.g., React, Solidity)"
                value={newTech}
                onChange={(e) => setNewTech(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTech())}
              />
              <Button type="button" onClick={addTech} size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {formData.tech_stack.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tech_stack.map((tech, index) => (
                  <Badge key={index} variant="secondary" className="pr-1">
                    {tech}
                    <button
                      type="button"
                      onClick={() => removeTech(tech)}
                      className="ml-1 text-red-500 hover:text-red-700"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Team Members */}
          <div className="space-y-2">
            <Label>Team Members (GitHub usernames)</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Add team member username"
                value={newMember}
                onChange={(e) => setNewMember(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addMember())}
              />
              <Button type="button" onClick={addMember} size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {formData.team_members.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.team_members.map((member, index) => (
                  <Badge key={index} variant="outline" className="pr-1">
                    @{member}
                    <button
                      type="button"
                      onClick={() => removeMember(member)}
                      className="ml-1 text-red-500 hover:text-red-700"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Submit Project
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
