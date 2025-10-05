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
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Calendar, Clock, Code, Users, Trophy, Plus, Filter, Search } from "lucide-react";
import Link from "next/link";
import { getAllHackathons, getHacksDashboardStats } from "@/actions/hacks";
import { CreateHackathonDialog } from "./components/CreateHackathonDialog";
import { HackathonCard } from "./components/HackathonCard";
import { StatsCards } from "./components/StatsCards";

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

interface DashboardStats {
  totalHackathons: number;
  totalProjects: number;
  totalVotes: number;
  totalPayments: number;
}

export default function HacksPageClient() {
  const { data: session } = useSession();
  const { isShrunk } = useSidebarContext();
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [hackathonsResult, statsResult] = await Promise.all([
        getAllHackathons(),
        getHacksDashboardStats()
      ]);

      if (hackathonsResult.success) {
        setHackathons(hackathonsResult.hackathons || []);
      }

      if (statsResult.success) {
        setStats(statsResult.stats || null);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredHackathons = hackathons.filter(hackathon => {
    const matchesSearch = hackathon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (hackathon.description && hackathon.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === "all" || hackathon.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
                <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
                  Hacks Dashboard
                </h1>
                <p className="text-neutral-600 dark:text-neutral-400 mt-1">
                  Manage hackathons, track projects, and coordinate decentralized voting
                </p>
              </div>
              <CreateHackathonDialog 
                trigger={
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Hackathon
                  </Button>
                }
                onSuccess={fetchData}
              />
            </div>

            {/* Stats Cards */}
            {stats && <StatsCards stats={stats} />}

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 bg-white dark:bg-neutral-800 p-4 rounded-lg border border-neutral-200 dark:border-neutral-700">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
                  <Input
                    placeholder="Search hackathons..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="ended">Ended</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Hackathons Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                // Loading skeletons
                Array.from({ length: 6 }).map((_, i) => (
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
              ) : filteredHackathons.length > 0 ? (
                filteredHackathons.map((hackathon) => (
                  <HackathonCard key={hackathon.id} hackathon={hackathon} />
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <Code className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">
                    No hackathons found
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                    {searchTerm || statusFilter !== "all" 
                      ? "Try adjusting your search or filters"
                      : "Get started by creating your first hackathon"
                    }
                  </p>
                  {!searchTerm && statusFilter === "all" && (
                    <Button 
                      onClick={() => setShowCreateDialog(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Hackathon
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-dashed border-2 border-neutral-300 dark:border-neutral-600 hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
                <CardContent className="p-6 text-center">
                  <Trophy className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                  <h3 className="font-medium text-neutral-900 dark:text-white mb-2">
                    View All Projects
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                    Browse all submitted hackathon projects
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/hacks/projects">View Projects</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-dashed border-2 border-neutral-300 dark:border-neutral-600 hover:border-green-500 dark:hover:border-green-400 transition-colors">
                <CardContent className="p-6 text-center">
                  <Users className="w-8 h-8 text-green-600 mx-auto mb-3" />
                  <h3 className="font-medium text-neutral-900 dark:text-white mb-2">
                    Voting Results
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                    View voting results and analytics
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/hacks/results">View Results</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-dashed border-2 border-neutral-300 dark:border-neutral-600 hover:border-purple-500 dark:hover:border-purple-400 transition-colors">
                <CardContent className="p-6 text-center">
                  <Clock className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                  <h3 className="font-medium text-neutral-900 dark:text-white mb-2">
                    Payment Splits
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                    Manage contributor vs maintainer rewards
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/hacks/payments">View Payments</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
