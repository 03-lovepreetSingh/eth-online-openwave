"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Sidebar from "@/assets/components/sidebar";
import Topbar from "@/assets/components/topbar";
import { useSidebarContext } from "@/assets/components/SidebarContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  ArrowLeft,
  Search, 
  Filter, 
  Code, 
  GitBranch,
  Star,
  Users,
  Calendar,
  ExternalLink
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { getAllHackathons } from "@/actions/hacks";

interface Hackathon {
  id: string;
  name: string;
  description: string | null;
  start_date: Date;
  end_date: Date;
  image_url: string | null;
  status: string | null;
  created_at: Date | null;
  created_by: string | null;
}

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
  hackathon?: Hackathon;
}

export default function AllProjectsPage() {
  const { data: session } = useSession();
  const { isShrunk } = useSidebarContext();
  const [projects, setProjects] = useState<Project[]>([]);
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [hackathonFilter, setHackathonFilter] = useState("all");
  const [techFilter, setTechFilter] = useState("all");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const hackathonsResult = await getAllHackathons();
      
      if (hackathonsResult.success && hackathonsResult.hackathons) {
        setHackathons(hackathonsResult.hackathons);
        
        // Fetch projects for all hackathons
        const allProjects: Project[] = [];
        for (const hackathon of hackathonsResult.hackathons) {
          try {
            const response = await fetch(`/api/hacks/${hackathon.id}/projects`);
            if (response.ok) {
              const projectsData = await response.json();
              const projectsWithHackathon = projectsData.map((project: any) => ({
                ...project,
                hackathon
              }));
              allProjects.push(...projectsWithHackathon);
            }
          } catch (error) {
            console.error(`Error fetching projects for hackathon ${hackathon.id}:`, error);
          }
        }
        setProjects(allProjects);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Get unique tech stack items for filtering
  const getAllTechStack = () => {
    const techSet = new Set<string>();
    projects.forEach(project => {
      try {
        const techStack = Array.isArray(project.tech_stack) ? project.tech_stack : [];
        techStack.forEach(tech => techSet.add(tech));
      } catch (error) {
        // Ignore parsing errors
      }
    });
    return Array.from(techSet).sort();
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.project_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (project.description && project.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         project.owner_id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesHackathon = hackathonFilter === "all" || project.hackathon_id === hackathonFilter;
    
    let matchesTech = techFilter === "all";
    if (!matchesTech && techFilter !== "all") {
      try {
        const techStack = Array.isArray(project.tech_stack) ? project.tech_stack : [];
        matchesTech = techStack.includes(techFilter);
      } catch (error) {
        matchesTech = false;
      }
    }
    
    return matchesSearch && matchesHackathon && matchesTech;
  });

  const formatDate = (date: Date | null) => {
    if (!date) return "Unknown";
    try {
      return format(new Date(date), "MMM dd, yyyy");
    } catch {
      return "Invalid date";
    }
  };

  return (
    <div className="flex h-screen bg-neutral-50 dark:bg-neutral-900 mt-16">
      <Sidebar />
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isShrunk ? "ml-16" : "ml-64"}`}>
        <Topbar />
        <main className="flex-1 overU2U-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Button variant="ghost" asChild>
                    <Link href="/hacks">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Hacks
                    </Link>
                  </Button>
                </div>
                <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
                  All Projects
                </h1>
                <p className="text-neutral-600 dark:text-neutral-400 mt-1">
                  Browse all submitted hackathon projects across all events
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                        Total Projects
                      </p>
                      <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                        {projects.length}
                      </p>
                    </div>
                    <Code className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                        Active Hackathons
                      </p>
                      <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                        {hackathons.filter(h => h.status === "active").length}
                      </p>
                    </div>
                    <Calendar className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                        Unique Technologies
                      </p>
                      <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                        {getAllTechStack().length}
                      </p>
                    </div>
                    <GitBranch className="w-8 h-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                        Total Developers
                      </p>
                      <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                        {new Set(projects.map(p => p.owner_id)).size}
                      </p>
                    </div>
                    <Users className="w-8 h-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 bg-white dark:bg-neutral-800 p-4 rounded-lg border border-neutral-200 dark:border-neutral-700">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
                  <Input
                    placeholder="Search projects, descriptions, or developers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={hackathonFilter} onValueChange={setHackathonFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by hackathon" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Hackathons</SelectItem>
                  {hackathons.map(hackathon => (
                    <SelectItem key={hackathon.id} value={hackathon.id}>
                      {hackathon.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={techFilter} onValueChange={setTechFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by technology" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Technologies</SelectItem>
                  {getAllTechStack().map(tech => (
                    <SelectItem key={tech} value={tech}>
                      {tech}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Results Summary */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Showing {filteredProjects.length} of {projects.length} projects
              </p>
              {(searchTerm || hackathonFilter !== "all" || techFilter !== "all") && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchTerm("");
                    setHackathonFilter("all");
                    setTechFilter("all");
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>

            {/* Projects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                // Loading skeletons
                Array.from({ length: 9 }).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-4 bg-neutral-200 rounded w-3/4"></div>
                      <div className="h-3 bg-neutral-200 rounded w-1/2"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="h-3 bg-neutral-200 rounded"></div>
                        <div className="h-3 bg-neutral-200 rounded w-5/6"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : filteredProjects.length > 0 ? (
                filteredProjects.map((project) => {
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

                  return (
                    <Card key={project.id} className="group hover:shadow-lg transition-all duration-200">
                      {project.image_url && (
                        <div className="relative h-32 overU2U-hidden rounded-t-lg">
                          <img
                            src={project.image_url}
                            alt={project.project_name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                        </div>
                      )}
                      
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg line-clamp-2 group-hover:text-blue-600 transition-colors">
                          {project.project_name}
                        </CardTitle>
                        <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                          <span>by @{project.owner_id}</span>
                          {teamMembers.length > 0 && (
                            <>
                              <span>•</span>
                              <div className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                <span>{teamMembers.length + 1}</span>
                              </div>
                            </>
                          )}
                        </div>
                        
                        {project.hackathon && (
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {project.hackathon.name}
                            </Badge>
                          </div>
                        )}
                      </CardHeader>

                      <CardContent className="space-y-4">
                        {project.description && (
                          <CardDescription className="line-clamp-2">
                            {project.description}
                          </CardDescription>
                        )}

                        {/* Tech Stack */}
                        {techStack.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {techStack.slice(0, 4).map((tech: string, index: number) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {tech}
                              </Badge>
                            ))}
                            {techStack.length > 4 && (
                              <Badge variant="outline" className="text-xs">
                                +{techStack.length - 4} more
                              </Badge>
                            )}
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <Button asChild className="flex-1" size="sm">
                            <Link href={`/hacks/project/${project.id}`} className="flex items-center gap-2">
                              <Code className="w-4 h-4" />
                              View Project
                            </Link>
                          </Button>
                          
                          {project.repository && (
                            <Button 
                              asChild 
                              variant="outline" 
                              size="sm"
                              className="hover:bg-neutral-100 dark:hover:bg-neutral-800"
                            >
                              <Link href={project.repository} target="_blank">
                                <GitBranch className="w-4 h-4" />
                              </Link>
                            </Button>
                          )}
                        </div>

                        {/* Additional info */}
                        <div className="pt-2 border-t border-neutral-200 dark:border-neutral-700">
                          <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
                            <span>
                              {formatDate(project.created_at)}
                            </span>
                            <Link 
                              href={`/hacks/${project.hackathon_id}`}
                              className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                            >
                              View Hackathon <ExternalLink className="w-3 h-3" />
                            </Link>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              ) : (
                <div className="col-span-full text-center py-12">
                  <Code className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-neutral-900 dark:text-white mb-2">
                    No projects found
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                    {searchTerm || hackathonFilter !== "all" || techFilter !== "all"
                      ? "Try adjusting your search criteria or filters"
                      : "No projects have been submitted yet"
                    }
                  </p>
                  {(searchTerm || hackathonFilter !== "all" || techFilter !== "all") && (
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setSearchTerm("");
                        setHackathonFilter("all");
                        setTechFilter("all");
                      }}
                    >
                      Clear All Filters
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
