"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useAccount, useWriteContract } from "wagmi";
import Sidebar from "@/assets/components/sidebar";
import Topbar from "@/assets/components/topbar";
import { useSidebarContext } from "@/assets/components/SidebarContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft,
  ExternalLink,
  GitBranch,
  Star,
  Eye,
  Users,
  Code,
  DollarSign,
  CheckCircle,
  Circle,
  Loader2,
  Trophy,
  Vote
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { parseEther } from "viem";
import { toast } from "sonner";
import { 
  castVote,
  createSplitPayment,
  getProjectSplitPayments
} from "@/actions/hacks";
import { HACK_SPLIT_SOL_CONTRACT_ADDRESS } from "@/assets/hack-split";
import hackSplitABI from "@/assets/abi-hack-split.json";
import { Project, ProjectVotes, SplitPayment } from "@/db/types";

export default function ProjectPageClient({
    project,
    votes,
    payments
}: {project: Project | null, votes: ProjectVotes[], payments: SplitPayment[]}) {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const { address } = useAccount();
  const { writeContract } = useWriteContract();
  const { isShrunk } = useSidebarContext();
  
  const [repoData, setRepoData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [votingLoading, setVotingLoading] = useState(false);
  const [splitAmount, setSplitAmount] = useState("");
  const [splittingLoading, setSplittingLoading] = useState(false);

  const handleVote = async (voteType: "contributor" | "maintainer") => {
    if (!session?.user?.username || !project) {
      toast.error("You must be logged in to vote");
      return;
    }

    setVotingLoading(true);
    try {
      const result = await castVote({
        project_id: project.id,
        voter_id: session.user.username,
        vote_type: voteType
      });

      if (result.success) {
        toast.success(`Voted for ${voteType}s!`);
        // await getProjectVotes(project.id);
      } else {
        toast.error(result.error || "Failed to cast vote");
      }
    } catch (error) {
      console.error("Error casting vote:", error);
      toast.error("Failed to cast vote");
    } finally {
      setVotingLoading(false);
    }
  };

  const calculateSplit = () => {
    if (!votes || votes.length === 0) {
      return { contributorShare: 50, maintainerShare: 50 };
    }

    const contributorPercentage = (votes.filter((vote) => vote.vote_type === "contributor").length / votes.length) * 100;
    const maintainerPercentage = (votes.filter((vote) => vote.vote_type === "maintainer").length / votes.length) * 100;

    return {
      contributorShare: contributorPercentage,
      maintainerShare: maintainerPercentage
    };
  };

  const handleSplit = async () => {
    if (!splitAmount || !project || !address) {
      toast.error("Please enter an amount and connect your wallet");
      return;
    }

    if (!votes || votes.length === 0) {
      toast.error("No votes cast yet - cannot determine split");
      return;
    }

    setSplittingLoading(true);
    try {
      const amount = parseEther(splitAmount);
      const split = calculateSplit();
      
      // Calculate actual ETH amounts
      const contributorAmount = (amount * BigInt(Math.floor(split.contributorShare))) / BigInt(100);
      const maintainerAmount = (amount * BigInt(Math.floor(split.maintainerShare))) / BigInt(100);

      // Call smart contract
      writeContract({
        address: HACK_SPLIT_SOL_CONTRACT_ADDRESS,
        abi: hackSplitABI,
        functionName: "executeSplit",
        args: [
          project.id, // projectId as bytes32
          [], // contributors (empty for now)
          [], // maintainers (empty for now)
          [], // contributorShares (empty for now)
          [], // maintainerShares (empty for now)
        ],
        value: amount,
      });

      // Record the split in database
      const paymentResult = await createSplitPayment({
        project_id: project.id,
        total_amount: splitAmount,
        contributor_share: (contributorAmount / BigInt(10**18)).toString(),
        maintainer_share: (maintainerAmount / BigInt(10**18)).toString(),
      });

      if (paymentResult.success) {
        toast.success("Split payment initiated!");
        setSplitAmount("");
        // await getProjectVotes(project.id);
        // await getProjectSplitPayments(project.id);
      }

    } catch (error) {
      console.error("Error executing split:", error);
      toast.error("Failed to execute split");
    } finally {
      setSplittingLoading(false);
    }
  };

  // Parse JSON fields safely
  const techStack = (() => {
    try {
      return Array.isArray(project?.tech_stack) ? project.tech_stack : [];
    } catch {
      return [];
    }
  })();

  const teamMembers = (() => {
    try {
      return Array.isArray(project?.team_members) ? project.team_members : [];
    } catch {
      return [];
    }
  })();

  const getVotePercentage = (type: "contributor" | "maintainer") => {
    if (!votes || votes.length === 0) return 0;
    const voteCount = type === "contributor" ? votes.filter((vote) => vote.vote_type === "contributor").length : votes.filter((vote) => vote.vote_type === "maintainer").length;
    return (voteCount / votes.length) * 100;
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-neutral-50 dark:bg-neutral-900 mt-16">
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

  if (!project) {
    return (
      <div className="flex h-screen bg-neutral-50 dark:bg-neutral-900 mt-16">
        <Sidebar />
        <div className={`flex-1 flex flex-col transition-all duration-300 ${isShrunk ? "ml-16" : "ml-64"}`}>
          <Topbar />
          <main className="flex-1 overHBAR-auto p-6">
            <div className="max-w-7xl mx-auto text-center py-12">
              <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
                Project Not Found
              </h1>
              <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                The project you're looking for doesn't exist or has been removed.
              </p>
              <Button onClick={() => router.back()}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
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
            {project.image_url && (
              <div className="h-64 bg-gradient-to-r from-blue-600 to-purple-600 relative overHBAR-hidden">
                <img
                  src={project.image_url}
                  alt={project.project_name}
                  className="w-full h-full object-cover opacity-50"
                />
                <div className="absolute inset-0 bg-black/30"></div>
              </div>
            )}
            
            <div className="relative px-6 py-8 bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700">
              <div className="max-w-7xl mx-auto">
                <Button variant="ghost" onClick={() => router.back()} className="mb-4">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>

                <div className="flex items-start gap-6">
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-3">
                      {project.project_name}
                    </h1>
                    
                    <div className="flex items-center gap-4 text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                      <span>by @{project.owner_id}</span>
                      {teamMembers.length > 0 && (
                        <>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>{teamMembers.length + 1} members</span>
                          </div>
                        </>
                      )}
                      <span>•</span>
                      <span>Created {project.created_at ? format(new Date(project.created_at), "MMM dd, yyyy") : "Unknown"}</span>
                    </div>

                    {project.description && (
                      <p className="text-neutral-600 dark:text-neutral-400 text-lg mb-4">
                        {project.description}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-2">
                      {project.repository && (
                        <Button variant="outline" size="sm" asChild>
                          <Link href={project.repository} target="_blank">
                            <GitBranch className="w-4 h-4 mr-2" />
                            View Repository
                          </Link>
                        </Button>
                      )}
                      
                      {project.contract_address && (
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`https://etherscan.io/address/${project.contract_address}`} target="_blank">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            View Contract
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="max-w-7xl mx-auto">
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="voting">Voting</TabsTrigger>
                  <TabsTrigger value="splits">Payment Splits</TabsTrigger>
                  <TabsTrigger value="details">Details</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6 mt-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Info */}
                    <div className="lg:col-span-2 space-y-6">
                      {/* Tech Stack */}
                      {techStack.length > 0 && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Tech Stack</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="flex flex-wrap gap-2">
                              {techStack.map((tech: string, index: number) => (
                                <Badge key={index} variant="secondary">
                                  {tech}
                                </Badge>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Repository Stats */}
                      {repoData && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Repository Stats</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-3 gap-4">
                              <div className="text-center">
                                <div className="text-2xl font-bold text-yellow-600">{repoData.stargazers_count}</div>
                                <div className="text-sm text-neutral-600 dark:text-neutral-400 flex items-center justify-center gap-1">
                                  <Star className="w-4 h-4" />
                                  Stars
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="text-2xl font-bold text-blue-600">{repoData.forks_count}</div>
                                <div className="text-sm text-neutral-600 dark:text-neutral-400 flex items-center justify-center gap-1">
                                  <GitBranch className="w-4 h-4" />
                                  Forks
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="text-2xl font-bold text-green-600">{repoData.watchers_count}</div>
                                <div className="text-sm text-neutral-600 dark:text-neutral-400 flex items-center justify-center gap-1">
                                  <Eye className="w-4 h-4" />
                                  Watchers
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                      {/* Voting Summary */}
                      {votes && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                              <Vote className="w-5 h-5" />
                              Voting Summary
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              <div className="text-center">
                                <div className="text-3xl font-bold text-purple-600">{votes.length}</div>
                                <div className="text-sm text-neutral-600 dark:text-neutral-400">Total Votes</div>
                              </div>
                              
                              <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span>Contributors</span>
                                  <span>{votes.filter((vote) => vote.vote_type === "contributor").length} ({getVotePercentage("contributor").toFixed(1)}%)</span>
                                </div>
                                <Progress value={getVotePercentage("contributor")} className="h-2" />
                                
                                <div className="flex justify-between text-sm">
                                  <span>Maintainers</span>
                                  <span>{votes.filter((vote) => vote.vote_type === "maintainer").length} ({getVotePercentage("maintainer").toFixed(1)}%)</span>
                                </div>
                                <Progress value={getVotePercentage("maintainer")} className="h-2" />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Team Members */}
                      {teamMembers.length > 0 && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Team Members</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Badge variant="default">Owner</Badge>
                                <span className="text-sm">@{project.owner_id}</span>
                              </div>
                              {teamMembers.map((member: string, index: number) => (
                                <div key={index} className="flex items-center gap-2">
                                  <Badge variant="outline">Member</Badge>
                                  <span className="text-sm">@{member}</span>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="voting" className="space-y-6 mt-6">
                  {votes ? (
                    <div className="space-y-6">
                      {/* Current Voting Status */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Current Voting Status</CardTitle>
                          <CardDescription>
                            Community votes determine reward distribution
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-blue-600">{votes.filter((vote) => vote.vote_type === "contributor").length}</div>
                              <div className="text-sm text-neutral-600 dark:text-neutral-400">Contributor Votes</div>
                              <div className="text-xs text-neutral-500 dark:text-neutral-400">
                                {getVotePercentage("contributor").toFixed(1)}% of total
                              </div>
                            </div>
                            
                            <div className="text-center">
                              <div className="text-2xl font-bold text-green-600">{votes.filter((vote) => vote.vote_type === "maintainer").length}</div>
                              <div className="text-sm text-neutral-600 dark:text-neutral-400">Maintainer Votes</div>
                              <div className="text-xs text-neutral-500 dark:text-neutral-400">
                                {getVotePercentage("maintainer").toFixed(1)}% of total
                              </div>
                            </div>

                            <div className="text-center">
                              <div className="text-2xl font-bold text-purple-600">{votes.length}</div>
                              <div className="text-sm text-neutral-600 dark:text-neutral-400">Total Votes</div>
                              {votes.find((vote) => vote.voter_id === session?.user?.username) && (
                                <Badge variant="default" className="mt-1 bg-green-100 text-green-800">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  You voted: {votes.find((vote) => vote.voter_id === session?.user?.username)?.vote_type}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Vote Buttons */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Cast Your Vote</CardTitle>
                          <CardDescription>
                            Vote for either contributors or maintainers for this project
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex gap-4">
                            <Button
                              onClick={() => handleVote("contributor")}
                              disabled={!session?.user?.username || votingLoading}
                              variant={votes.find((vote) => vote.voter_id === session?.user?.username)?.vote_type === "contributor" ? "default" : "outline"}
                              className="flex-1"
                            >
                              {votingLoading ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              ) : votes.find((vote) => vote.voter_id === session?.user?.username)?.vote_type === "contributor" ? (
                                <CheckCircle className="w-4 h-4 mr-2" />
                              ) : (
                                <Circle className="w-4 h-4 mr-2" />
                              )}
                              Vote for Contributors
                            </Button>
                            
                            <Button
                              onClick={() => handleVote("maintainer")}
                              disabled={!session?.user?.username || votingLoading}
                              variant={votes.find((vote) => vote.voter_id === session?.user?.username)?.vote_type === "maintainer" ? "default" : "outline"}
                              className="flex-1"
                            >
                              {votingLoading ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              ) : votes.find((vote) => vote.voter_id === session?.user?.username)?.vote_type === "maintainer" ? (
                                <CheckCircle className="w-4 h-4 mr-2" />
                              ) : (
                                <Circle className="w-4 h-4 mr-2" />
                              )}
                              Vote for Maintainers
                            </Button>
                          </div>
                          
                          {!session?.user?.username && (
                            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-3 text-center">
                              You must be logged in to vote
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center py-8">
                          <Vote className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">
                            No votes yet
                          </h3>
                          <p className="text-neutral-600 dark:text-neutral-400">
                            Be the first to vote on this project!
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="splits" className="space-y-6 mt-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Split Calculator */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <DollarSign className="w-5 h-5" />
                          Payment Split Calculator
                        </CardTitle>
                        <CardDescription>
                          Split payments between contributors and maintainers based on votes
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="amount">Total Amount (ETH)</Label>
                          <Input
                            id="amount"
                            type="number"
                            step="0.001"
                            placeholder="0.1"
                            value={splitAmount}
                            onChange={(e) => setSplitAmount(e.target.value)}
                          />
                        </div>

                        {votes && votes.length > 0 && splitAmount && (
                          <div className="space-y-3 p-4 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
                            <h4 className="font-medium">Split Preview:</h4>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span>Contributors ({getVotePercentage("contributor").toFixed(1)}%):</span>
                                <span className="font-mono">
                                  {((parseFloat(splitAmount) * getVotePercentage("contributor")) / 100).toFixed(4)} ETH
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Maintainers ({getVotePercentage("maintainer").toFixed(1)}%):</span>
                                <span className="font-mono">
                                  {((parseFloat(splitAmount) * getVotePercentage("maintainer")) / 100).toFixed(4)} ETH
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                        <Button
                          onClick={handleSplit}
                          disabled={!splitAmount || !address || !votes || votes.length === 0 || splittingLoading}
                          className="w-full"
                        >
                          {splittingLoading ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <DollarSign className="w-4 h-4 mr-2" />
                          )}
                          Execute Split Payment
                        </Button>

                        {(!votes || votes.length === 0) && (
                          <p className="text-sm text-amber-600 dark:text-amber-400">
                            ⚠️ No votes cast yet - split cannot be calculated
                          </p>
                        )}
                      </CardContent>
                    </Card>

                    {/* Payment History */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Payment History</CardTitle>
                        <CardDescription>
                          Previous split payments for this project
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {payments.length > 0 ? (
                          <div className="space-y-3">
                            {payments.map((payment) => (
                              <div key={payment.id} className="p-3 border border-neutral-200 dark:border-neutral-700 rounded-lg">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <div className="font-medium">{payment.total_amount} ETH</div>
                                    <div className="text-sm text-neutral-600 dark:text-neutral-400">
                                      Contributors: {payment.contributor_share} ETH
                                    </div>
                                    <div className="text-sm text-neutral-600 dark:text-neutral-400">
                                      Maintainers: {payment.maintainer_share} ETH
                                    </div>
                                  </div>
                                  <Badge 
                                    variant={payment.status === "completed" ? "default" : "secondary"}
                                  >
                                    {payment.status || "pending"}
                                  </Badge>
                                </div>
                                {payment.transaction_hash && (
                                  <div className="mt-2">
                                    <Link
                                      href={`https://etherscan.io/tx/${payment.transaction_hash}`}
                                      target="_blank"
                                      className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                    >
                                      View transaction <ExternalLink className="w-3 h-3" />
                                    </Link>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <DollarSign className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">
                              No payments yet
                            </h3>
                            <p className="text-neutral-600 dark:text-neutral-400">
                              Payment splits will appear here once executed.
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="details" className="space-y-6 mt-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Project Details */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Project Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label className="text-sm font-medium">Project Name</Label>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400">{project.project_name}</p>
                        </div>
                        
                        {project.description && (
                          <div>
                            <Label className="text-sm font-medium">Description</Label>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400">{project.description}</p>
                          </div>
                        )}

                        <div>
                          <Label className="text-sm font-medium">Owner</Label>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400">@{project.owner_id}</p>
                        </div>

                        {project.repository && (
                          <div>
                            <Label className="text-sm font-medium">Repository</Label>
                            <Link 
                              href={project.repository} 
                              target="_blank"
                              className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                            >
                              {project.repository} <ExternalLink className="w-3 h-3" />
                            </Link>
                          </div>
                        )}

                        {project.contract_address && (
                          <div>
                            <Label className="text-sm font-medium">Smart Contract</Label>
                            <Link 
                              href={`https://etherscan.io/address/${project.contract_address}`} 
                              target="_blank"
                              className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1 font-mono"
                            >
                              {project.contract_address} <ExternalLink className="w-3 h-3" />
                            </Link>
                          </div>
                        )}

                        <div>
                          <Label className="text-sm font-medium">Created</Label>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400">
                            {project.created_at ? format(new Date(project.created_at), "PPP") : "Unknown"}
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Technical Details */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Technical Details</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {techStack.length > 0 && (
                          <div>
                            <Label className="text-sm font-medium">Technology Stack</Label>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {techStack.map((tech: string, index: number) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {tech}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {teamMembers.length > 0 && (
                          <div>
                            <Label className="text-sm font-medium">Team Members</Label>
                            <div className="space-y-1 mt-1">
                              {teamMembers.map((member: string, index: number) => (
                                <p key={index} className="text-sm text-neutral-600 dark:text-neutral-400">
                                  @{member}
                                </p>
                              ))}
                            </div>
                          </div>
                        )}

                        <div>
                          <Label className="text-sm font-medium">Project ID</Label>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400 font-mono">{project.id}</p>
                        </div>

                        <div>
                          <Label className="text-sm font-medium">Hackathon ID</Label>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400 font-mono">{project.hackathon_id}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
