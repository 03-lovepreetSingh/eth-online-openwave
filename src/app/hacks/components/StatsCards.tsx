"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Code, Users, DollarSign, TrendingUp } from "lucide-react";

interface DashboardStats {
  totalHackathons: number;
  totalProjects: number;
  totalVotes: number;
  totalPayments: number;
}

interface StatsCardsProps {
  stats: DashboardStats;
}

export function StatsCards({ stats }: StatsCardsProps) {
  const statsData = [
    {
      title: "Total Hackathons",
      value: stats.totalHackathons,
      icon: Trophy,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
      description: "Active and completed events",
    },
    {
      title: "Submitted Projects",
      value: stats.totalProjects,
      icon: Code,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/20",
      description: "Decentralized applications",
    },
    {
      title: "Community Votes",
      value: stats.totalVotes,
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900/20",
      description: "Quorum-based decisions",
    },
    {
      title: "Split Payments",
      value: stats.totalPayments,
      icon: DollarSign,
      color: "text-orange-600",
      bgColor: "bg-orange-100 dark:bg-orange-900/20",
      description: "Contributors vs maintainers",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsData.map((stat, index) => (
        <Card key={index} className="border border-neutral-200 dark:border-neutral-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                  {stat.title}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                    {stat.value.toLocaleString()}
                  </p>
                  <TrendingUp className="w-4 h-4 text-green-500" />
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                  {stat.description}
                </p>
              </div>
              <div className={`p-3 rounded-full ${stat.bgColor}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
