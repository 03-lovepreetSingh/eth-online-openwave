"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  GitBranch, 
  ExternalLink, 
  Users, 
  Code, 
  Calendar,
  Star,
  Eye
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

interface Project {
  id: string;
  hackathon_id: string;
  project_name: string;
  description: string | null;
  repository: string | null;
  image_url: string | null;
  owner_id: string;
  team_members: any;
  tech_stack: any;
  contract_address: string | null;
  created_at: Date | null;
}

interface ProjectCardProps {
  project: Project;
  compact?: boolean;
}

export function ProjectCard({ project, compact = false }: ProjectCardProps) {
  const [repoData, setRepoData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Parse JSON fields safely
  const techStack = (() => {
    try {
      return Array.isArray(project.tech_stack) ? project.tech_stack : [];
    } catch {
      return [];
    }
  })();

  const teamMembers = (() => {
    try {
      return Array.isArray(project.team_members) ? project.team_members : [];
    } catch {
      return [];
    }
  })();

  // Extract GitHub repo info from repository URL
  const getRepoInfo = (url: string | null) => {
    if (!url) return null;
    const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    return match ? { owner: match[1], repo: match[2] } : null;
  };

  const repoInfo = getRepoInfo(project.repository);

  useEffect(() => {
    if (repoInfo && !compact) {
      fetchRepoData();
    }
  }, [repoInfo, compact]);

  const fetchRepoData = async () => {
    if (!repoInfo) return;
    
    setLoading(true);
    try {
      const response = await fetch(`https://api.github.com/repos/${repoInfo.owner}/${repoInfo.repo}`);
      if (response.ok) {
        const data = await response.json();
        setRepoData(data);
      }
    } catch (error) {
      console.error("Error fetching repo data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "Unknown";
    try {
      return format(new Date(date), "MMM dd, yyyy");
    } catch {
      return "Invalid date";
    }
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 border border-neutral-200 dark:border-neutral-700">
      {project.image_url && (
        <div className="relative h-32 overU2U-hidden rounded-t-lg">
          <img
            src={project.image_url}
            alt={project.project_name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
        </div>
      )}
      
      <CardHeader className={compact ? "pb-2" : ""}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className={`${compact ? "text-base" : "text-lg"} line-clamp-2 group-hover:text-blue-600 transition-colors`}>
              {project.project_name}
            </CardTitle>
            <div className="flex items-center gap-2 mt-2 text-sm text-neutral-600 dark:text-neutral-400">
              <span>by @{project.owner_id}</span>
              {teamMembers.length > 0 && (
                <>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    <span>{teamMembers.length + 1} members</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        
        {project.description && !compact && (
          <CardDescription className="line-clamp-2 mt-2">
            {project.description}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Tech Stack */}
        {techStack.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {techStack.slice(0, compact ? 3 : 6).map((tech: string, index: number) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tech}
              </Badge>
            ))}
            {techStack.length > (compact ? 3 : 6) && (
              <Badge variant="outline" className="text-xs">
                +{techStack.length - (compact ? 3 : 6)} more
              </Badge>
            )}
          </div>
        )}

        {/* Repository Stats */}
        {!compact && repoData && (
          <div className="flex items-center gap-4 text-sm text-neutral-600 dark:text-neutral-400">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4" />
              <span>{repoData.stargazers_count}</span>
            </div>
            <div className="flex items-center gap-1">
              <GitBranch className="w-4 h-4" />
              <span>{repoData.forks_count}</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              <span>{repoData.watchers_count}</span>
            </div>
          </div>
        )}

        {/* Contract Address */}
        {project.contract_address && !compact && (
          <div className="p-2 bg-neutral-100 dark:bg-neutral-800 rounded text-xs font-mono">
            <div className="flex items-center justify-between">
              <span className="text-neutral-600 dark:text-neutral-400">Contract:</span>
              <Link
                href={`https://etherscan.io/address/${project.contract_address}`}
                target="_blank"
                className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                {project.contract_address.slice(0, 6)}...{project.contract_address.slice(-4)}
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button 
            asChild 
            className="flex-1"
            size={compact ? "sm" : "default"}
          >
            <Link href={`/hacks/project/${project.id}`} className="flex items-center gap-2">
              <Code className="w-4 h-4" />
              View Project
            </Link>
          </Button>
          
          {project.repository && (
            <Button 
              asChild 
              variant="outline" 
              size={compact ? "sm" : "icon"}
              className="hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              <Link href={project.repository} target="_blank">
                <GitBranch className="w-4 h-4" />
                {!compact && <span className="sr-only">View Repository</span>}
              </Link>
            </Button>
          )}
        </div>

        {/* Additional info */}
        {!compact && (
          <div className="pt-2 border-t border-neutral-200 dark:border-neutral-700">
            <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
              <span>
                Submitted {formatDate(project.created_at)}
              </span>
              <div className="flex items-center gap-2">
                <Calendar className="w-3 h-3" />
                <span>{formatDate(project.created_at)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Team Members */}
        {teamMembers.length > 0 && !compact && (
          <div className="pt-2 border-t border-neutral-200 dark:border-neutral-700">
            <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-2">Team Members:</div>
            <div className="flex flex-wrap gap-1">
              {teamMembers.map((member: string, index: number) => (
                <Badge key={index} variant="outline" className="text-xs">
                  @{member}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
