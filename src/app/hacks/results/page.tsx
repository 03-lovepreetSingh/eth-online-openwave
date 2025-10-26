"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Sidebar from "@/assets/components/sidebar";
import Topbar from "@/assets/components/topbar";
import { useSidebarContext } from "@/assets/components/SidebarContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  ArrowLeft,
  Trophy, 
  Medal,
  Award,
  TrendingUp,
  DollarSign,
  Users,
  RefreshCw,
  BarChart,
  Calendar,
  Check,
  X,
  Crown,
  Star,
  ExternalLink
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { getAllHackathons } from "@/actions/hacks";
import { toast } from "sonner";

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

interface HackathonResult {
  result: {
    id: string;
    hackathon_id: string;
    project_id: string;
    final_rank: number | null;
    total_votes: number;
    yes_votes: number;
    no_votes: number;
    approval_percentage: string | null;
    voting_status: string;
    total_funding: string;
    contributors_funding: string;
    maintainers_funding: string;
    award_category: string | null;
    judge_feedback: string | null;
    demo_url: string | null;
    presentation_url: string | null;
    final_score: string | null;
    metrics: any;
    created_at: Date;
    updated_at: Date;
  };
  hackathon: Hackathon | null;
  project: {
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
  } | null;
}

export default function ResultsPage() {
  const { data: session } = useSession();
  const { isShrunk } = useSidebarContext();
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [results, setResults] = useState<HackathonResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [selectedHackathon, setSelectedHackathon] = useState("all");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch hackathons
      const hackathonsResult = await getAllHackathons();
      if (hackathonsResult.success && hackathonsResult.hackathons) {
        setHackathons(hackathonsResult.hackathons);
      }

      // Fetch results
      const resultsResponse = await fetch('/api/hacks/results');
      if (resultsResponse.ok) {
        const resultsData = await resultsResponse.json();
        setResults(resultsData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch results data");
    } finally {
      setLoading(false);
    }
  };

  const handleCalculateResults = async (hackathon_id: string) => {
    try {
      setCalculating(true);
      const response = await fetch('/api/hacks/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hackathon_id, action: 'calculate' })
      });

      if (response.ok) {
        toast.success("Results calculated successfully!");
        await fetchData(); // Refresh data
      } else {
        toast.error("Failed to calculate results");
      }
    } catch (error) {
      console.error("Error calculating results:", error);
      toast.error("Error calculating results");
    } finally {
      setCalculating(false);
    }
  };

  const filteredResults = selectedHackathon === "all" 
    ? results 
    : results.filter(result => result.result.hackathon_id === selectedHackathon);

  const topProjects = filteredResults
    .filter(result => result.result.voting_status === "approved")
    .sort((a, b) => {
      if (a.result.final_rank && b.result.final_rank) {
        return a.result.final_rank - b.result.final_rank;
      }
      const aPercentage = parseFloat(a.result.approval_percentage || "0");
      const bPercentage = parseFloat(b.result.approval_percentage || "0");
      return bPercentage - aPercentage;
    })
    .slice(0, 10);

  const totalFunding = filteredResults.reduce((sum, result) => 
    sum + parseFloat(result.result.total_funding || "0"), 0
  );
  
  const approvedProjects = filteredResults.filter(result => 
    result.result.voting_status === "approved"
  );
  
  const avgApprovalRate = filteredResults.length > 0 
    ? filteredResults.reduce((sum, result) => 
        sum + parseFloat(result.result.approval_percentage || "0"), 0
      ) / filteredResults.length
    : 0;

  const formatDate = (date: Date | string | null) => {
    if (!date) return "Unknown";
    try {
      return format(new Date(date), "MMM dd, yyyy");
    } catch {
      return "Invalid date";
    }
  };

  const formatAmount = (amount: string | number) => {
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    if (num >= 1000000) {
      return `$${(num / 1000000).toFixed(2)}M`;
    } else if (num >= 1000) {
      return `$${(num / 1000).toFixed(2)}K`;
    } else {
      return `$${num.toFixed(2)}`;
    }
  };

  const getRankIcon = (rank: number | null) => {
    if (!rank) return Star;
    switch (rank) {
      case 1: return Crown;
      case 2: return Trophy;
      case 3: return Medal;
      default: return Award;
    }
  };

  const getRankColor = (rank: number | null) => {
    if (!rank) return "text-gray-400";
    switch (rank) {
      case 1: return "text-yellow-500";
      case 2: return "text-gray-400";
      case 3: return "text-orange-500";
      default: return "text-blue-500";
    }
  };

  return (
    <div className="flex h-screen bg-neutral-50 dark:bg-neutral-900 mt-16">
      <Sidebar />
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isShrunk ? "ml-16" : "ml-64"}`}>
        <Topbar />
        <main className="flex-1 overHBAR-auto p-6">
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
                  Hackathon Results & Analytics
                </h1>
                <p className="text-neutral-600 dark:text-neutral-400 mt-1">
                  View voting outcomes, funding distributions, and performance metrics
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <Select value={selectedHackathon} onValueChange={setSelectedHackathon}>
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Select hackathon" />
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
                
                {selectedHackathon !== "all" && (
                  <Button 
                    onClick={() => handleCalculateResults(selectedHackathon)}
                    disabled={calculating}
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className={`w-4 h-4 ${calculating ? 'animate-spin' : ''}`} />
                    {calculating ? 'Calculating...' : 'Recalculate Results'}
                  </Button>
                )}
              </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                        Total Projects
                      </p>
                      <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                        {filteredResults.length}
                      </p>
                    </div>
                    <BarChart className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                        Approved Projects
                      </p>
                      <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                        {approvedProjects.length}
                      </p>
                    </div>
                    <Trophy className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                        Total Funding
                      </p>
                      <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                        {formatAmount(totalFunding)}
                      </p>
                    </div>
                    <DollarSign className="w-8 h-8 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                        Avg Approval Rate
                      </p>
                      <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                        {avgApprovalRate.toFixed(1)}%
                      </p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="leaderboard" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="leaderboard">🏆 Leaderboard</TabsTrigger>
                <TabsTrigger value="voting">📊 Voting Results</TabsTrigger>
                <TabsTrigger value="funding">💰 Funding Splits</TabsTrigger>
                <TabsTrigger value="analytics">📈 Analytics</TabsTrigger>
              </TabsList>

              <TabsContent value="leaderboard" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="w-5 h-5" />
                      Top Approved Projects
                    </CardTitle>
                    <CardDescription>
                      Projects ranked by final ranking and approval percentage
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {topProjects.length > 0 ? (
                        topProjects.map((result, index) => {
                          const RankIcon = getRankIcon(result.result.final_rank);
                          const rankColor = getRankColor(result.result.final_rank);
                          
                          return (
                            <div key={result.result.id} className="flex items-center gap-4 p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                                  <RankIcon className={`w-5 h-5 ${rankColor}`} />
                                </div>
                                <div className="text-lg font-bold text-neutral-500 dark:text-neutral-400">
                                  #{result.result.final_rank || index + 1}
                                </div>
                              </div>
                              
                              <div className="flex-1">
                                <h3 className="font-semibold text-neutral-900 dark:text-white">
                                  {result.project?.project_name || "Unknown Project"}
                                </h3>
                                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                  by @{result.project?.owner_id} • {result.hackathon?.name}
                                </p>
                                {result.result.award_category && (
                                  <Badge variant="outline" className="mt-1">
                                    {result.result.award_category}
                                  </Badge>
                                )}
                              </div>
                              
                              <div className="text-right">
                                <div className="text-lg font-bold text-green-600">
                                  {parseFloat(result.result.approval_percentage || "0").toFixed(1)}%
                                </div>
                                <div className="text-sm text-neutral-500">
                                  {result.result.total_votes} votes
                                </div>
                                {result.result.final_score && (
                                  <div className="text-sm text-blue-600">
                                    Score: {result.result.final_score}
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex gap-2">
                                <Button asChild variant="outline" size="sm">
                                  <Link href={`/hacks/project/${result.result.project_id}`}>
                                    View Project
                                  </Link>
                                </Button>
                                {result.result.demo_url && (
                                  <Button asChild variant="outline" size="sm">
                                    <Link href={result.result.demo_url} target="_blank">
                                      <ExternalLink className="w-4 h-4" />
                                    </Link>
                                  </Button>
                                )}
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-center py-8 text-neutral-500 dark:text-neutral-400">
                          No approved projects yet
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="voting" className="space-y-6">
                <div className="grid gap-4">
                  {filteredResults.map((result) => (
                    <Card key={result.result.id}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg">
                              {result.project?.project_name || "Unknown Project"}
                            </CardTitle>
                            <CardDescription>
                              by @{result.project?.owner_id} • {result.hackathon?.name}
                            </CardDescription>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={
                              result.result.voting_status === "approved" ? "default" :
                              result.result.voting_status === "rejected" ? "destructive" : "secondary"
                            }>
                              {result.result.voting_status === "approved" && <Check className="w-3 h-3 mr-1" />}
                              {result.result.voting_status === "rejected" && <X className="w-3 h-3 mr-1" />}
                              {result.result.voting_status.charAt(0).toUpperCase() + result.result.voting_status.slice(1)}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <div className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                              Approval Rate
                            </div>
                            <div className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
                              {parseFloat(result.result.approval_percentage || "0").toFixed(1)}%
                            </div>
                            <Progress 
                              value={parseFloat(result.result.approval_percentage || "0")} 
                              className="h-2" 
                            />
                          </div>
                          
                          <div>
                            <div className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                              Vote Breakdown
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1">
                                <Check className="w-4 h-4 text-green-600" />
                                <span className="font-medium">{result.result.yes_votes}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <X className="w-4 h-4 text-red-600" />
                                <span className="font-medium">{result.result.no_votes}</span>
                              </div>
                            </div>
                            <div className="text-sm text-neutral-500 mt-1">
                              Total: {result.result.total_votes}
                            </div>
                          </div>
                          
                          <div>
                            <div className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                              Funding Amount
                            </div>
                            <div className="text-lg font-bold text-neutral-900 dark:text-white">
                              {formatAmount(result.result.total_funding)}
                            </div>
                            {result.result.judge_feedback && (
                              <div className="mt-2">
                                <div className="text-sm text-neutral-600 dark:text-neutral-400">
                                  Judge Feedback:
                                </div>
                                <p className="text-sm text-neutral-700 dark:text-neutral-300 mt-1">
                                  {result.result.judge_feedback}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="funding" className="space-y-6">
                <div className="grid gap-4">
                  {filteredResults
                    .filter(result => parseFloat(result.result.total_funding || "0") > 0)
                    .map((result) => (
                    <Card key={result.result.id}>
                      <CardHeader>
                        <CardTitle className="text-lg">
                          {result.project?.project_name || "Unknown Project"}
                        </CardTitle>
                        <CardDescription>
                          Total Funding: {formatAmount(result.result.total_funding)}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <div className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                              Contributors Share
                            </div>
                            <div className="text-xl font-bold text-blue-600 mb-2">
                              {formatAmount(result.result.contributors_funding)}
                            </div>
                            <Progress 
                              value={(parseFloat(result.result.contributors_funding) / parseFloat(result.result.total_funding)) * 100} 
                              className="h-2" 
                            />
                          </div>
                          
                          <div>
                            <div className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                              Maintainers Share
                            </div>
                            <div className="text-xl font-bold text-green-600 mb-2">
                              {formatAmount(result.result.maintainers_funding)}
                            </div>
                            <Progress 
                              value={(parseFloat(result.result.maintainers_funding) / parseFloat(result.result.total_funding)) * 100} 
                              className="h-2" 
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="analytics" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Project Status Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-neutral-600 dark:text-neutral-400">Approved</span>
                          <span className="font-medium">
                            {filteredResults.filter(r => r.result.voting_status === "approved").length}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-neutral-600 dark:text-neutral-400">Rejected</span>
                          <span className="font-medium">
                            {filteredResults.filter(r => r.result.voting_status === "rejected").length}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-neutral-600 dark:text-neutral-400">Pending</span>
                          <span className="font-medium">
                            {filteredResults.filter(r => r.result.voting_status === "pending").length}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Funding Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-neutral-600 dark:text-neutral-400">Total Distributed</span>
                          <span className="font-medium">{formatAmount(totalFunding)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-neutral-600 dark:text-neutral-400">Avg per Project</span>
                          <span className="font-medium">
                            {filteredResults.length > 0 ? formatAmount(totalFunding / filteredResults.length) : "$0"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-neutral-600 dark:text-neutral-400">Funded Projects</span>
                          <span className="font-medium">
                            {filteredResults.filter(r => parseFloat(r.result.total_funding || "0") > 0).length}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Award Categories</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {Array.from(new Set(filteredResults.map(r => r.result.award_category).filter(Boolean))).map(category => (
                          <div key={category} className="flex items-center justify-between">
                            <Badge variant="outline">{category}</Badge>
                            <span className="text-sm text-neutral-600">
                              {filteredResults.filter(r => r.result.award_category === category).length}
                            </span>
                          </div>
                        ))}
                        {filteredResults.filter(r => r.result.award_category).length === 0 && (
                          <div className="text-sm text-neutral-500">No awards assigned yet</div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Participation Metrics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-neutral-600 dark:text-neutral-400">Total Votes Cast</span>
                          <span className="font-medium">
                            {filteredResults.reduce((sum, r) => sum + r.result.total_votes, 0)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-neutral-600 dark:text-neutral-400">Avg Votes per Project</span>
                          <span className="font-medium">
                            {filteredResults.length > 0 
                              ? (filteredResults.reduce((sum, r) => sum + r.result.total_votes, 0) / filteredResults.length).toFixed(1)
                              : "0"
                            }
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-neutral-600 dark:text-neutral-400">Projects with Demos</span>
                          <span className="font-medium">
                            {filteredResults.filter(r => r.result.demo_url).length}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}
