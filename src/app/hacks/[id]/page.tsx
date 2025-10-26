"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Sidebar from "@/assets/components/sidebar";
import Topbar from "@/assets/components/topbar";
import { useSidebarContext } from "@/assets/components/SidebarContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar, 
  Clock, 
  Users, 
  Code, 
  Trophy, 
  Plus, 
  ArrowLeft,
  GitBranch,
  Star,
  Eye
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { 
  getHackathonById, 
  getHackProjectsByHackathon 
} from "@/actions/hacks";
import { CreateProjectDialog } from "./components/CreateProjectDialog";
import { ProjectCard } from "./components/ProjectCard";
import { VotingSection } from "./components/VotingSection";

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
}

export default function HackathonPage() {
  const params = useParams();
  const { data: session } = useSession();
  const { isShrunk } = useSidebarContext();
  const [hackathon, setHackathon] = useState<Hackathon | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (params.id) {
      fetchData();
    }
  }, [params.id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [hackathonResult, projectsResult] = await Promise.all([
        getHackathonById(params.id as string),
        getHackProjectsByHackathon(params.id as string)
      ]);

      if (hackathonResult.success && hackathonResult.hackathon) {
        setHackathon(hackathonResult.hackathon);
      }

      if (projectsResult.success && projectsResult.projects) {
        setProjects(projectsResult.projects as Project[]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "upcoming":
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Upcoming</Badge>;
      case "active":
        return <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>;
      case "ended":
        return <Badge variant="outline" className="bg-neutral-100 text-neutral-600">Ended</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const isActive = () => {
    if (!hackathon) return false;
    const now = new Date();
    const start = new Date(hackathon.start_date);
    const end = new Date(hackathon.end_date);
    return now >= start && now <= end;
  };

  const canSubmitProject = () => {
    return isActive() && session?.user?.username;
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-neutral-50 dark:bg-neutral-900">
        <Sidebar />
        <div className={`flex-1 flex flex-col transition-all duration-300 ${isShrunk ? "ml-16" : "ml-64"}`}>
          <Topbar />
          <main className="flex-1 overHBAR-auto p-6">
            <div className="max-w-7xl mx-auto">
              <div className="animate-pulse space-y-6">
                <div className="h-8 bg-neutral-200 rounded w-1/3"></div>
                <div className="h-64 bg-neutral-200 rounded"></div>
                <div className="h-32 bg-neutral-200 rounded"></div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!hackathon) {
    return (
      <div className="flex h-screen bg-neutral-50 dark:bg-neutral-900">
        <Sidebar />
        <div className={`flex-1 flex flex-col transition-all duration-300 ${isShrunk ? "ml-16" : "ml-64"}`}>
          <Topbar />
          <main className="flex-1 overHBAR-auto p-6">
            <div className="max-w-7xl mx-auto text-center py-12">
              <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
                Hackathon Not Found
              </h1>
              <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                The hackathon you're looking for doesn't exist or has been removed.
              </p>
              <Button asChild>
                <Link href="/hacks">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Hacks
                </Link>
              </Button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-neutral-50 dark:bg-neutral-900 mt-16">
      <Sidebar />
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isShrunk ? "ml-16" : "ml-64"}`}>
        <Topbar />
        <main className="flex-1 overHBAR-auto">
          {/* Hero Section */}
          <div className="relative">
            {hackathon.image_url && (
              <div className="h-64 bg-gradient-to-r from-blue-600 to-purple-600 relative overHBAR-hidden">
                <img
                  src={hackathon.image_url}
                  alt={hackathon.name}
                  className="w-full h-full object-cover opacity-50"
                />
                <div className="absolute inset-0 bg-black/30"></div>
              </div>
            )}
            
            <div className="relative px-6 py-8 bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700">
              <div className="max-w-7xl mx-auto">
                <div className="flex items-start justify-between mb-4">
                  <Button variant="ghost" asChild className="mb-4">
                    <Link href="/hacks">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Hacks
                    </Link>
                  </Button>
                  {canSubmitProject() && (
                    <CreateProjectDialog
                      hackathonId={hackathon.id}
                      trigger={
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                          <Plus className="w-4 h-4 mr-2" />
                          Submit Project
                        </Button>
                      }
                      onSuccess={fetchData}
                    />
                  )}
                </div>

                <div className="flex items-start gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
                        {hackathon.name}
                      </h1>
                      {getStatusBadge(hackathon.status)}
                    </div>
                    
                    {hackathon.description && (
                      <p className="text-neutral-600 dark:text-neutral-400 text-lg mb-4">
                        {hackathon.description}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-6 text-sm text-neutral-600 dark:text-neutral-400">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>Starts: {format(new Date(hackathon.start_date), "MMM dd, yyyy 'at' HH:mm")}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>Ends: {format(new Date(hackathon.end_date), "MMM dd, yyyy 'at' HH:mm")}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Code className="w-4 h-4" />
                        <span>{projects.length} Projects</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="max-w-7xl mx-auto">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="projects">Projects ({projects.length})</TabsTrigger>
                  <TabsTrigger value="voting">Voting</TabsTrigger>
                  <TabsTrigger value="results">Results</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6 mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{projects.length}</div>
                        <p className="text-xs text-muted-foreground">Submitted dApps</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Participants</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                          {projects.reduce((acc, project) => {
                            const members = project.team_members || [];
                            return acc + (Array.isArray(members) ? members.length : 0) + 1; // +1 for owner
                          }, 0)}
                        </div>
                        <p className="text-xs text-muted-foreground">Developers</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Status</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-purple-600">
                          {isActive() ? "Active" : hackathon.status || "Unknown"}
                        </div>
                        <p className="text-xs text-muted-foreground">Current phase</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Recent Projects */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Submissions</CardTitle>
                      <CardDescription>Latest projects submitted to this hackathon</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {projects.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {projects.slice(0, 6).map((project) => (
                            <ProjectCard key={project.id} project={project} compact />
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Code className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">
                            No projects yet
                          </h3>
                          <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                            Be the first to submit a project to this hackathon!
                          </p>
                          {canSubmitProject() && (
                            <CreateProjectDialog
                              hackathonId={hackathon.id}
                              trigger={
                                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                                  <Plus className="w-4 h-4 mr-2" />
                                  Submit Project
                                </Button>
                              }
                              onSuccess={fetchData}
                            />
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="projects" className="space-y-6 mt-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
                      All Projects
                    </h2>
                    {canSubmitProject() && (
                      <CreateProjectDialog
                        hackathonId={hackathon.id}
                        trigger={
                          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                            <Plus className="w-4 h-4 mr-2" />
                            Submit Project
                          </Button>
                        }
                        onSuccess={fetchData}
                      />
                    )}
                  </div>

                  {projects.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {projects.map((project) => (
                        <ProjectCard key={project.id} project={project} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Code className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
                      <h3 className="text-xl font-medium text-neutral-900 dark:text-white mb-2">
                        No projects submitted yet
                      </h3>
                      <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                        This hackathon is waiting for its first project submission.
                      </p>
                      {canSubmitProject() && (
                        <CreateProjectDialog
                          hackathonId={hackathon.id}
                          trigger={
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                              <Plus className="w-4 h-4 mr-2" />
                              Submit First Project
                            </Button>
                          }
                          onSuccess={fetchData}
                        />
                      )}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="voting" className="space-y-6 mt-6">
                  <VotingSection hackathonId={hackathon.id} projects={projects} />
                </TabsContent>

                <TabsContent value="results" className="space-y-6 mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Voting Results</CardTitle>
                      <CardDescription>
                        Final results and payment splits for this hackathon
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8">
                        <Trophy className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">
                          Results Coming Soon
                        </h3>
                        <p className="text-neutral-600 dark:text-neutral-400">
                          Voting results and payment distributions will be available here.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
