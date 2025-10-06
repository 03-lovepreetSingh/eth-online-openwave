
"use client";

import { useState,useEffect} from "react";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { Input } from "../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import {
  Calendar,
  Clock,
  Filter,
  MoreHorizontal,
  Search,
  User,
  GitBranch,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSidebarContext } from "../../assets/components/SidebarContext";
import Topbar from "@/assets/components/topbar";

interface Project {
  id: number | string;
  projectName: string;
  shortdes: string;
  project_repository: string;
  project_description: string;
  project_icon_url?: string;
  project_leads?: { name: string; avatar_url?: string }[];
  contributors_count?: number;
  available_issues_count?: number | string;
  languages?: string[] | Record<string, number>;
  status: string;
  requestDate: string;
  name: string;
  description: string;
  image_url: string;
  projectOwner: string;
  skills: string[];
  issue: string;
}

interface AssignedIssue {
  id: number | string;
  projectName: string;
  Contributor_id: string;
  issue: string;
  image_url: string;
  name: string;
  description: string;
  rewardAmount: string;
  status: string;
  issue_date: string;
  issue_name: string;
  issue_description: string;
  priority: string;
  Difficulty: string;
  project_repository: string;
  publisher: string;
}

interface UserIssue {
  id: string;
  issue_name: string;
  publisher: string;
  issue_description: string;
  issue_date: string;
  Difficulty: string;
  priority: string;
  project_repository: string;
  project_issues: string;
  rewardAmount: string;
}

interface Issue{
  contributorRequests: AssignedIssue;
  issues: UserIssue;
}

interface AssignedProjectsClientProps {
  projects: Project[];
  userIssues: Issue[];
  assignedIssues: AssignedIssue[];
}

export default function AssignedProjectsClient({
  projects,
  userIssues,
  assignedIssues,
}: AssignedProjectsClientProps) {
  console.log(projects,"projects");
  console.log(assignedIssues,"assignedIssues");
  console.log(userIssues,"userIssues");
  const { isShrunk } = useSidebarContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
      const checkMobile = () => {
        setIsMobile(window.innerWidth < 768);
      };
  
      checkMobile();
      window.addEventListener("resize", checkMobile);
  
      return () => window.removeEventListener("resize", checkMobile);
    }, []);

  const filteredProjects = projects.filter((project) => {
    const searchLower = searchTerm.toLowerCase();
    const statusMatch =
      statusFilter === "all" || (project.status || "").toLowerCase() === statusFilter;
    const searchMatch =
      (project.projectName || "").toLowerCase().includes(searchLower) ||
      (project.shortdes || "").toLowerCase().includes(searchLower);
    return statusMatch && searchMatch;
  });

  const filteredIssues = userIssues.filter((issue) => {
    const searchLower = searchTerm.toLowerCase();
    const statusMatch =
      statusFilter === "all" || (issue.contributorRequests.status || "").toLowerCase() === statusFilter;
    const searchMatch =
      (issue.contributorRequests.issue_name || "").toLowerCase().includes(searchLower) ||
      (issue.contributorRequests.issue_description || "").toLowerCase().includes(searchLower);
    return statusMatch && searchMatch;
  });



  // Helper function to determine status color
  function getStatusColor(status?: string) {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800 hover:bg-violet-100";
      case "in-progress":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100";
      case "pending":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
      default:
        return "bg-neutral-100 text-neutral-800 hover:bg-neutral-100";
    }
  }

  // Helper function to determine priority color
  function getPriorityColor(priority?: string) {
    switch (priority?.toLowerCase()) {
      case "high":
      case "hard":
        return "bg-red-100 text-red-800 hover:bg-red-100";
      case "medium":
        return "bg-orange-100 text-orange-800 hover:bg-orange-100";
      case "low":
        return "bg-green-100 text-green-800 hover:bg-violet-100";
      default:
        return "bg-neutral-100 text-neutral-800 hover:bg-neutral-100";
    }
  }

  // Helper function to determine difficulty color
  function getDifficultyColor(difficulty?: string) {
    switch (difficulty?.toLowerCase()) {
      case "hard":
        return "bg-red-100 text-red-800 hover:bg-red-100";
      case "medium":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
      case "low":
      case "easy":
        return "bg-green-100 text-green-800 hover:bg-violet-100";
      default:
        return "bg-neutral-100 text-neutral-800 hover:bg-neutral-100";
    }
  }

  // Helper function to format dates
  function formatDate(dateString: string) {
    if (!dateString) return "Date not available";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return "Invalid Date";
    }
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  }

  // Helper function to calculate days ago
  function getDaysAgo(dateString: string) {
    if (!dateString) return null;
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return null;
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Today";
    return diffDays === 1 ? "1 day ago" : `${diffDays} days ago`;
  }

  return (
    <div
      className={`
        flex-1 transition-all duration-300 ease-in-out
         ${
                isMobile
                  ? "ml-0 w-full"
                  : isShrunk
                  ? "ml-16 w-[calc(100%-4rem)]"
                  : "ml-64 w-[calc(100%-16rem)]"
              }
      `}
    >
      <Topbar />
      <div className="z-10 mt-16 bg-background">
        {/* Header */}
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-4 py-4 lg:py-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="space-y-1">
                <h1 className="text-xl md:text-2xl lg:text-3xl font-bold">
                  Assigned Projects & Issues
                </h1>
                <p className="text-sm md:text-base text-muted-foreground">
                  Manage your projects and available bounty issues
                </p>
              </div>

              {/* Search and Filter Section */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 lg:gap-4">
                <div className="relative flex-1 sm:flex-none">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search projects or issues..."
                    className="pl-10 w-full sm:w-64"
                    value={searchTerm}
                    onChange={(e:React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select
                  value={statusFilter}
                  onValueChange={setStatusFilter}
                >
                  <SelectTrigger className="w-full sm:w-32">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-6 lg:py-8">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
            <Card>
              <CardContent className="p-4 lg:p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs lg:text-sm font-medium text-muted-foreground">
                      Total Projects
                    </p>
                    <p className="text-xl lg:text-2xl font-bold">
                      {filteredProjects.length}
                    </p>
                  </div>
                  <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 lg:p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs lg:text-sm font-medium text-muted-foreground">
                      Available Issues
                    </p>
                    <p className="text-xl lg:text-2xl font-bold">
                      {filteredIssues.length}
                    </p>
                  </div>
                  <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <AlertCircle className="h-4 w-4 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 lg:p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs lg:text-sm font-medium text-muted-foreground">
                      Total Rewards
                    </p>
                    <p className="text-lg lg:text-2xl font-bold">
                      {userIssues
                        .reduce(
                          (sum, issue) =>
                            sum + Number.parseFloat(issue.issues.rewardAmount),
                          0
                        )
                        .toFixed(7)}{" "}
                      <span className="text-sm lg:text-base">U2U</span>
                    </p>
                  </div>
                  <div className="h-8 w-8 bg-white rounded-full flex items-center justify-center ">
                    <img
                      src="https://s2.coinmarketcap.com/static/img/coins/64x64/27369.png"
                      width={16}
                      height={16}
                      alt="U2U Icon"
                      className="h-4 w-4"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 lg:p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs lg:text-sm font-medium text-muted-foreground">
                      In Progress
                    </p>
                    <p className="text-xl lg:text-2xl font-bold">
                      {
                        projects.filter((p) => p.status === "in-progress")
                          .length
                      }
                    </p>
                  </div>
                  <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <Clock className="h-4 w-4 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs for Projects and Issues */}
          <Tabs defaultValue="projects" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:grid-cols-none lg:flex">
              <TabsTrigger value="projects" className="text-xs sm:text-sm">
                My Projects ({filteredProjects.length})
              </TabsTrigger>
              <TabsTrigger value="issues" className="text-xs sm:text-sm">
                Available Issues ({filteredIssues.length})
              </TabsTrigger>
            </TabsList>

            {/* Projects Tab */}
            <TabsContent value="projects">
              {filteredProjects.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      No projects found
                    </h3>
                    <p className="text-muted-foreground">
                      {searchTerm
                        ? "Try adjusting your search criteria."
                        : "You haven't been assigned to any projects yet."}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
                  {filteredProjects.map((project) => {
                    const daysAgo = getDaysAgo(project.requestDate);
                    return (
                      <Card
                        key={project.id}
                        className="hover:shadow-md transition-shadow"
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="space-y-1 flex-1 min-w-0">
                              <CardTitle className="text-base lg:text-lg leading-tight line-clamp-2">
                                {project.projectName}
                              </CardTitle>
                              <CardDescription className="text-xs lg:text-sm line-clamp-2">
                                {project.shortdes}
                              </CardDescription>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 flex-shrink-0"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  Update Status
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  Contact Owner
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600">
                                  Leave Project
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3 lg:space-y-4">
                          {/* Project Owner */}
                          <div className="flex items-center gap-2">
                            <Avatar className="h-5 w-5 lg:h-6 lg:w-6">
                              <AvatarImage
                                src={
                                  project.image_url
                                }
                              />
                              <AvatarFallback className="text-xs">
                                {project.projectOwner
                                  ?.slice(0, 2)
                                  ?.toUpperCase() || "???"}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs lg:text-sm text-muted-foreground truncate">
                              Owner: {project.projectOwner}
                            </span>
                          </div>

                          {/* Skills */}
                          <div className="flex flex-wrap gap-1">
                            {Object.keys(project.languages || {})
                              .slice(0, 3)
                              .map((skill, index) => (
                                <Badge
                                  key={index}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  {skill}
                                </Badge>
                              ))}
                            {Object.keys(project.languages || {}).length >
                              3 && (
                              <Badge
                                variant="secondary"
                                className="text-xs"
                              >
                                +
                                {Object.keys(project.languages || {})
                                  .length - 3}
                              </Badge>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-2 pt-2">
                            <Link
                              href={`/myProjects/Issues?repo=${project.project_repository}`}
                              className="flex-1"
                            >
                              <Button
                                size="sm"
                                className="w-full text-xs lg:text-sm"
                              >
                                View Project
                              </Button>
                            </Link>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            {/* Issues Tab */}
            <TabsContent value="issues">
              {filteredIssues.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      No issues found
                    </h3>
                    <p className="text-muted-foreground">
                      {searchTerm
                        ? "Try adjusting your search criteria."
                        : "No available issues at the moment."}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
                  {filteredIssues.map((issue) => {
                    const daysAgo = getDaysAgo(issue.issues.issue_date);
                    return (
                      <Card
                        key={issue.issues.id}
                        className="hover:shadow-md transition-shadow"
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="space-y-1 flex-1 min-w-0">
                              <CardTitle className="text-base lg:text-lg leading-tight line-clamp-2 ">
                                {issue.issues.issue_name}
                              </CardTitle>
                              <CardDescription className="text-xs lg:text-sm line-clamp-2">
                                {issue.issues.issue_description}
                              </CardDescription>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 flex-shrink-0"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  View Issue
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  Apply to Work
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  Contact Publisher
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  Report Issue
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3 lg:space-y-4">
                          {/* Priority and Difficulty */}
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge
                              className={getPriorityColor(issue.issues.priority)}
                              variant="secondary"
                            >
                              {issue.issues.priority?.charAt(0)?.toUpperCase() +
                                issue.issues.priority?.slice(1) || "Unknown"}{" "}
                              Priority
                            </Badge>
                            <Badge
                              className={getDifficultyColor(
                                issue.issues.Difficulty
                              )}
                              variant="secondary"
                            >
                              {issue.issues.Difficulty?.charAt(0)?.toUpperCase() +
                                issue.issues.Difficulty?.slice(1) || "Unknown"}
                            </Badge>
                          </div>

                          {/* Reward Amount */}
                          <div className="flex items-center gap-2 p-3 bg-neutral-50 dark:bg-neutral-950 rounded-lg">
                            <img
                              src="https://s2.coinmarketcap.com/static/img/coins/64x64/27369.png"
                              width={24}
                              height={24}
                              alt="U2U Icon"
                              className="h-5 w-5 lg:h-6 lg:w-6"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="text-xs lg:text-sm font-medium text-neutral-800 dark:text-neutral-200">
                                Reward
                              </p>
                              <p className="text-sm lg:text-lg font-bold text-neutral-900 dark:text-neutral-100 truncate">
                                {issue.issues.rewardAmount} U2U
                              </p>
                            </div>
                          </div>

                          {/* Repository Info */}
                          <div className="flex items-center gap-2 text-xs lg:text-sm">
                            <GitBranch className="h-3 w-3 lg:h-4 lg:w-4 text-muted-foreground flex-shrink-0" />
                            <span className="text-muted-foreground">
                              Repository:
                            </span>
                            <span className="font-mono truncate">
                              {issue.issues.project_repository}
                            </span>
                          </div>

                          {/* Issue Date */}
                          <div className="flex items-center gap-2 text-xs lg:text-sm">
                            <Calendar className="h-3 w-3 lg:h-4 lg:w-4 text-muted-foreground flex-shrink-0" />
                            <span className="text-muted-foreground">
                              Posted:
                            </span>
                            <span className="truncate">
                              {formatDate(issue.issues.issue_date)}{" "}
                              {daysAgo ? `(${daysAgo})` : ""}
                            </span>
                          </div>

                          {/* Publisher */}
                          <div className="flex items-center gap-2">
                            <Avatar className="h-5 w-5 lg:h-6 lg:w-6">
                              <AvatarFallback className="text-xs">
                                {issue.issues.publisher
                                  ?.slice(0, 2)
                                  ?.toUpperCase() || "???"}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs lg:text-sm text-muted-foreground truncate">
                              Published by {issue.issues.publisher}
                            </span>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex flex-col sm:flex-row gap-2 pt-2">
                            <Button
                              size="sm"
                              className="flex-1 text-xs lg:text-sm"
                            >
                              Apply to Work
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1 text-xs lg:text-sm bg-transparent"
                              onClick={() =>{router.push(`/myProjects/Issues?repo=${issue.issues.project_repository}&issue=${issue.issues.project_issues}`)}}
                            >
                              View Details
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );





    
}
