"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Calendar, Loader2 } from "lucide-react";
import { createHackathon } from "@/actions/hacks";
import { toast } from "sonner";

interface CreateHackathonDialogProps {
  trigger: React.ReactNode;
  onSuccess?: () => void;
}

export function CreateHackathonDialog({ trigger, onSuccess }: CreateHackathonDialogProps) {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    start_date: "",
    end_date: "",
    image_url: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session?.user?.username) {
      toast.error("You must be logged in to create a hackathon");
      return;
    }

    setLoading(true);
    try {
      const result = await createHackathon({
        name: formData.name,
        description: formData.description,
        start_date: new Date(formData.start_date),
        end_date: new Date(formData.end_date),
        image_url: formData.image_url || undefined,
        created_by: session.user.username,
      });

      if (result.success) {
        toast.success("Hackathon created successfully!");
        setOpen(false);
        setFormData({
          name: "",
          description: "",
          start_date: "",
          end_date: "",
          image_url: "",
        });
        onSuccess?.();
      } else {
        toast.error(result.error || "Failed to create hackathon");
      }
    } catch (error) {
      console.error("Error creating hackathon:", error);
      toast.error("Failed to create hackathon");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Create New Hackathon
          </DialogTitle>
          <DialogDescription>
            Set up a new hackathon event for developers to participate in and showcase their dApps.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Hackathon Name *</Label>
            <Input
              id="name"
              placeholder="e.g., DeFi Innovation Hack 2024"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the hackathon theme, goals, and what participants should build..."
              rows={3}
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date *</Label>
              <Input
                id="start_date"
                type="datetime-local"
                value={formData.start_date}
                onChange={(e) => handleChange("start_date", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date">End Date *</Label>
              <Input
                id="end_date"
                type="datetime-local"
                value={formData.end_date}
                onChange={(e) => handleChange("end_date", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="image_url">Image URL (Optional)</Label>
            <Input
              id="image_url"
              type="url"
              placeholder="https://example.com/hackathon-banner.jpg"
              value={formData.image_url}
              onChange={(e) => handleChange("image_url", e.target.value)}
            />
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
              Create Hackathon
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
