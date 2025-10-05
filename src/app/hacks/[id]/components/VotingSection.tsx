"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  Code, 
  Vote, 
  TrendingUp,
  CheckCircle,
  Circle,
  Trophy,
  DollarSign
} from "lucide-react";
import { 
  castVote, 
  getProjectVotes, 
  getUserVoteForProject 
} from "@/actions/hacks";
import { toast } from "sonner";
import { ProjectCard } from "./ProjectCard";

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

interface VotingSectionProps {
  hackathonId: string;
  projects: Project[];
}

interface ProjectVotes {
  [projectId: string]: {
    contributorVotes: number;
    maintainerVotes: number;
    totalVotes: number;
    userVote: "contributor" | "maintainer" | null;
  };
}

export function VotingSection({ hackathonId, projects }: VotingSectionProps) {
  const { data: session } = useSession();
  const [votes, setVotes] = useState<ProjectVotes>({});
  const [loading, setLoading] = useState(true);
  const [votingFor, setVotingFor] = useState<string | null>(null);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);

  useEffect(() => {
    fetchAllVotes();
  }, [projects]);

  const fetchAllVotes = async () => {
    setLoading(true);
    try {
      const votePromises = projects.map(async (project) => {
        const [votesResult, userVoteResult] = await Promise.all([
          getProjectVotes(project.id),
          session?.user?.username 
            ? getUserVoteForProject(project.id, session.user.username)
            : Promise.resolve({ success: true, vote: null })
        ]);

        return {
          projectId: project.id,
          votes: votesResult.success ? {
            contributorVotes: votesResult.contributorVotes || 0,
            maintainerVotes: votesResult.maintainerVotes || 0,
            totalVotes: votesResult.totalVotes || 0,
            userVote: userVoteResult.success && userVoteResult.vote 
              ? userVoteResult.vote.vote_type as "contributor" | "maintainer"
              : null
          } : {
            contributorVotes: 0,
            maintainerVotes: 0,
            totalVotes: 0,
            userVote: null
          }
        };
      });

      const results = await Promise.all(votePromises);
      const votesData: ProjectVotes = {};
      results.forEach(({ projectId, votes }) => {
        votesData[projectId] = votes;
      });
      setVotes(votesData);
    } catch (error) {
      console.error("Error fetching votes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (projectId: string, voteType: "contributor" | "maintainer") => {
    if (!session?.user?.username) {
      toast.error("You must be logged in to vote");
      return;
    }

    setVotingFor(projectId);
    try {
      const result = await castVote({
        project_id: projectId,
        voter_id: session.user.username,
        vote_type: voteType
      });

      if (result.success) {
        toast.success(`Voted for ${voteType}s!`);
        // Refresh votes for this project
        const [votesResult, userVoteResult] = await Promise.all([
          getProjectVotes(projectId),
          getUserVoteForProject(projectId, session.user.username)
        ]);

        if (votesResult.success) {
          setVotes(prev => ({
            ...prev,
            [projectId]: {
              contributorVotes: votesResult.contributorVotes || 0,
              maintainerVotes: votesResult.maintainerVotes || 0,
              totalVotes: votesResult.totalVotes || 0,
              userVote: userVoteResult.success && userVoteResult.vote 
                ? userVoteResult.vote.vote_type as "contributor" | "maintainer"
                : null
            }
          }));
        }
      } else {
        toast.error(result.error || "Failed to cast vote");
      }
    } catch (error) {
      console.error("Error casting vote:", error);
      toast.error("Failed to cast vote");
    } finally {
      setVotingFor(null);
    }
  };

  const getVotePercentage = (projectId: string, type: "contributor" | "maintainer") => {
    const projectVotes = votes[projectId];
    if (!projectVotes || projectVotes.totalVotes === 0) return 0;
    
    const voteCount = type === "contributor" 
      ? projectVotes.contributorVotes 
      : projectVotes.maintainerVotes;
    
    return (voteCount / projectVotes.totalVotes) * 100;
  };

  const getTotalVotes = () => {
    return Object.values(votes).reduce((total, vote) => total + vote.totalVotes, 0);
  };

  const getTopProjects = () => {
    return projects
      .map(project => ({
        ...project,
        votes: votes[project.id] || { contributorVotes: 0, maintainerVotes: 0, totalVotes: 0, userVote: null }
      }))
      .sort((a, b) => b.votes.totalVotes - a.votes.totalVotes)
      .slice(0, 3);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
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
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Voting Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Votes Cast</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{getTotalVotes()}</div>
            <p className="text-xs text-muted-foreground">Community decisions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Projects Voted On</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {Object.values(votes).filter(v => v.totalVotes > 0).length}
            </div>
            <p className="text-xs text-muted-foreground">Out of {projects.length} total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Your Votes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {Object.values(votes).filter(v => v.userVote).length}
            </div>
            <p className="text-xs text-muted-foreground">Projects voted on</p>
          </CardContent>
        </Card>
      </div>

      {/* Top Projects */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Top Voted Projects
          </CardTitle>
          <CardDescription>
            Projects ranked by community votes
          </CardDescription>
        </CardHeader>
        <CardContent>
          {getTopProjects().length > 0 ? (
            <div className="space-y-4">
              {getTopProjects().map((project, index) => (
                <div key={project.id} className="flex items-center gap-4 p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-neutral-900 dark:text-white">
                      {project.project_name}
                    </h4>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                        <Users className="w-4 h-4" />
                        <span>{project.votes.totalVotes} votes</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          Contributors: {project.votes.contributorVotes}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          Maintainers: {project.votes.maintainerVotes}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <a href={`/hacks/project/${project.id}`}>View</a>
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Vote className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">
                No votes yet
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                Be the first to vote on a project!
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Voting Interface */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
            Cast Your Votes
          </h2>
          <div className="text-sm text-neutral-600 dark:text-neutral-400">
            Vote for either <Badge variant="outline">Contributors</Badge> or <Badge variant="outline">Maintainers</Badge> for each project
          </div>
        </div>

        {projects.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {projects.map((project) => {
              const projectVotes = votes[project.id] || { contributorVotes: 0, maintainerVotes: 0, totalVotes: 0, userVote: null };
              
              return (
                <Card key={project.id} className="border border-neutral-200 dark:border-neutral-700">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{project.project_name}</CardTitle>
                        <CardDescription className="line-clamp-2">
                          {project.description || "No description provided"}
                        </CardDescription>
                      </div>
                      {projectVotes.userVote && (
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Voted
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Voting Progress */}
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-blue-600">Contributors</span>
                          <span>{projectVotes.contributorVotes} votes ({getVotePercentage(project.id, "contributor").toFixed(1)}%)</span>
                        </div>
                        <Progress 
                          value={getVotePercentage(project.id, "contributor")} 
                          className="h-2"
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-green-600">Maintainers</span>
                          <span>{projectVotes.maintainerVotes} votes ({getVotePercentage(project.id, "maintainer").toFixed(1)}%)</span>
                        </div>
                        <Progress 
                          value={getVotePercentage(project.id, "maintainer")} 
                          className="h-2"
                        />
                      </div>
                    </div>

                    {/* Voting Buttons */}
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleVote(project.id, "contributor")}
                        disabled={!session?.user?.username || votingFor === project.id}
                        variant={projectVotes.userVote === "contributor" ? "default" : "outline"}
                        className="flex-1"
                        size="sm"
                      >
                        {projectVotes.userVote === "contributor" ? (
                          <CheckCircle className="w-4 h-4 mr-2" />
                        ) : (
                          <Circle className="w-4 h-4 mr-2" />
                        )}
                        Contributors
                      </Button>
                      
                      <Button
                        onClick={() => handleVote(project.id, "maintainer")}
                        disabled={!session?.user?.username || votingFor === project.id}
                        variant={projectVotes.userVote === "maintainer" ? "default" : "outline"}
                        className="flex-1"
                        size="sm"
                      >
                        {projectVotes.userVote === "maintainer" ? (
                          <CheckCircle className="w-4 h-4 mr-2" />
                        ) : (
                          <Circle className="w-4 h-4 mr-2" />
                        )}
                        Maintainers
                      </Button>
                    </div>

                    <div className="text-center">
                      <Button variant="ghost" size="sm" asChild>
                        <a href={`/hacks/project/${project.id}`} className="text-blue-600 hover:text-blue-800">
                          View Project Details →
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <Code className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-neutral-900 dark:text-white mb-2">
              No projects to vote on
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400">
              Projects will appear here once they are submitted to this hackathon.
            </p>
          </div>
        )}
      </div>

      {/* Voting Info */}
      <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <CardContent className="">
          <div className="flex items-start gap-3">
            <Vote className="w-6 h-6 text-blue-600 mt-1" />
            <div>
              <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                How Voting Works
              </h3>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>• Vote for either <strong>Contributors</strong> or <strong>Maintainers</strong> for each project</li>
                <li>• Contributors are developers who built the project for this hackathon</li>
                <li>• Maintainers are ongoing project maintainers who will continue development</li>
                <li>• Voting determines how rewards are split between these two groups</li>
                <li>• You can change your vote at any time during the voting period</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
