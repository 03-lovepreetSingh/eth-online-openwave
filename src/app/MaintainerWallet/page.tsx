"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Wallet,
  TrendingUp,
  Users,
  Target,
  ExternalLink,
  Copy,
  Plus,
  Send,
  MessageCircle,
  Activity,
  DollarSign,
  GitBranch,
} from "lucide-react";
import { Suspense } from "react";

import Topbar from "@/assets/components/topbar";

import Sidebar from "@/assets/components/sidebar";

import { useSidebarContext } from "@/assets/components/SidebarContext";

// Mock data interfaces
interface RecentTransaction {
  id: string;
  contributor: string;
  type: "Funding" | "Payout" | "Withdrawal";
  amount: string;
  date: string;
  txHash: string;
}

interface ActiveBounty {
  id: string;
  title: string;
  githubUrl: string;
  amount: string;
  assignedTo?: string;
  status: "open" | "in-progress";
}

interface TopContributor {
  address: string;
  githubHandle?: string;
  totalContributed: string;
}

export default function MaintainerWalletDashboard() {
  const { isShrunk } = useSidebarContext();
  const [isConnected] = useState(true);
  const [address] = useState("0x742d35Cc6634C0532925a3b8D4C9db96590c6C87");
  const [walletBalance] = useState("3.2847");

  // Mock data - replace with real API calls
  const [totalFundsRaised] = useState("12.5");
  const [totalBounties] = useState({ amount: "8.3", count: 15 });
  const [activeContributors] = useState(8);
  const [recentTransactions] = useState<RecentTransaction[]>([
    {
      id: "1",
      contributor: "alice.eth",
      type: "Funding",
      amount: "2.5",
      date: "2024-01-15",
      txHash: "0x123...abc",
    },
    {
      id: "2",
      contributor: "bob_dev",
      type: "Payout",
      amount: "1.2",
      date: "2024-01-14",
      txHash: "0x456...def",
    },
    {
      id: "3",
      contributor: "charlie.eth",
      type: "Funding",
      amount: "0.8",
      date: "2024-01-13",
      txHash: "0x789...ghi",
    },
  ]);

  const [activeBounties] = useState<ActiveBounty[]>([
    {
      id: "1",
      title: "Fix authentication bug in login HBAR",
      githubUrl: "https://github.com/project/repo/issues/123",
      amount: "2.0",
      assignedTo: "dev_alice",
      status: "in-progress",
    },
    {
      id: "2",
      title: "Add dark mode support",
      githubUrl: "https://github.com/project/repo/issues/124",
      amount: "1.5",
      status: "open",
    },
  ]);

  const [topContributors] = useState<TopContributor[]>([
    {
      address: "0x123...abc",
      githubHandle: "alice_dev",
      totalContributed: "5.2",
    },
    {
      address: "0x456...def",
      githubHandle: "bob_coder",
      totalContributed: "3.8",
    },
    {
      address: "0x789...ghi",
      githubHandle: "charlie_eth",
      totalContributed: "2.1",
    },
  ]);

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
    }
  };

  const openExplorer = () => {
    if (address) {
      window.open(`https://etherscan.io/address/${address}`, "_blank");
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="flex min-h-screen">
        <Sidebar />
        <div
          className={`
            flex-1 transition-all duration-300 ease-in-out
            ${
              isShrunk
                ? "ml-16 w-[calc(100%-4rem)]"
                : "ml-64 w-[calc(100%-16rem)]"
            }
          `}
        >
          <Topbar />
          <main className="mt-16 overHBAR-x-hidden overHBAR-y-auto">
            <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
              {/* Header with Wallet Info */}
              <div className="mb-4 sm:mb-6 lg:mb-8">
                <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
                  <div className="space-y-1">
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-neutral-900 dark:text-white">
                      Maintainer Dashboard
                    </h1>
                    <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400">
                      Your command center for managing bounties and contributors
                    </p>
                  </div>

                  {/* Wallet Connection Section */}
                  <Card className="w-full lg:w-auto">
                    <CardContent className="p-3 sm:p-4">
                      {isConnected ? (
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                          <div className="flex items-center gap-2">
                            <Wallet className="h-4 w-4 text-green-500 flex-shrink-0" />
                            <span className="text-sm font-medium truncate">
                              {formatAddress(address!)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between sm:justify-start gap-2">
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={copyAddress}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={openExplorer}
                              >
                                <ExternalLink className="h-3 w-3" />
                              </Button>
                            </div>
                            <Badge variant="secondary" className="text-xs">
                              Ethereum
                            </Badge>
                          </div>
                        </div>
                      ) : (
                        <Button size="sm" className="w-full sm:w-auto">
                          Connect Wallet
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Key Metrics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 lg:mb-8">
                {/* Wallet Balance */}
                <Card className="relative overHBAR-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-500 to-indigo-600"></div>
                  <CardContent className="relative p-3 sm:p-4 lg:p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-xs sm:text-sm font-medium text-blue-100">
                          Wallet Balance
                        </p>
                        <p className="text-lg sm:text-xl lg:text-2xl font-bold">
                          {walletBalance} ETH
                        </p>
                      </div>
                      <div className="h-8 w-8 sm:h-10 sm:w-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <Wallet className="h-4 w-4 sm:h-5 sm:w-5" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Total Funds Raised */}
                <Card>
                  <CardContent className="p-3 sm:p-4 lg:p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-xs sm:text-sm font-medium text-neutral-600 dark:text-neutral-400">
                          Total Funds Raised
                        </p>
                        <p className="text-lg sm:text-xl lg:text-2xl font-bold text-neutral-900 dark:text-white">
                          {totalFundsRaised} ETH
                        </p>
                      </div>
                      <div className="h-8 w-8 sm:h-10 sm:w-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center flex-shrink-0">
                        <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 dark:text-green-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Bounties Paid */}
                <Card>
                  <CardContent className="p-3 sm:p-4 lg:p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-xs sm:text-sm font-medium text-neutral-600 dark:text-neutral-400">
                          Bounties Paid
                        </p>
                        <p className="text-lg sm:text-xl lg:text-2xl font-bold text-neutral-900 dark:text-white">
                          {totalBounties.amount} ETH
                        </p>
                        <p className="text-xs text-neutral-500">
                          {totalBounties.count} bounties
                        </p>
                      </div>
                      <div className="h-8 w-8 sm:h-10 sm:w-10 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center flex-shrink-0">
                        <Target className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600 dark:text-orange-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Active Contributors */}
                <Card>
                  <CardContent className="p-3 sm:p-4 lg:p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-xs sm:text-sm font-medium text-neutral-600 dark:text-neutral-400">
                          Active Contributors
                        </p>
                        <p className="text-lg sm:text-xl lg:text-2xl font-bold text-neutral-900 dark:text-white">
                          {activeContributors}
                        </p>
                      </div>
                      <div className="h-8 w-8 sm:h-10 sm:w-10 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center flex-shrink-0">
                        <Users className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 dark:text-purple-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
                {/* Recent Activity */}
                <div className="xl:col-span-2">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                        <Activity className="h-4 w-4 sm:h-5 sm:w-5" />
                        Recent Activity
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
                        {recentTransactions.map((tx) => (
                          <div
                            key={tx.id}
                            className="p-3 sm:p-4 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                    tx.type === "Funding"
                                      ? "bg-green-100 dark:bg-green-900"
                                      : tx.type === "Payout"
                                      ? "bg-blue-100 dark:bg-blue-900"
                                      : "bg-orange-100 dark:bg-orange-900"
                                  }`}
                                >
                                  {tx.type === "Funding" ? (
                                    <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                                  ) : tx.type === "Payout" ? (
                                    <Send className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                  ) : (
                                    <DollarSign className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                                  )}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="font-medium text-neutral-900 dark:text-white truncate">
                                    {tx.contributor}
                                  </p>
                                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                    {tx.type} • {formatDate(tx.date)}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center justify-between sm:justify-end sm:text-right gap-2">
                                <p className="font-medium text-neutral-900 dark:text-white">
                                  {tx.amount} ETH
                                </p>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    window.open(
                                      `https://etherscan.io/tx/${tx.txHash}`,
                                      "_blank"
                                    )
                                  }
                                >
                                  <ExternalLink className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Bounty Snapshot */}
                <div>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                        <GitBranch className="h-4 w-4 sm:h-5 sm:w-5" />
                        Active Bounties
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-neutral-600 dark:text-neutral-400">
                          Open: 1
                        </span>
                        <span className="text-neutral-600 dark:text-neutral-400">
                          In Progress: 1
                        </span>
                      </div>

                      <div className="space-y-3">
                        {activeBounties.map((bounty) => (
                          <div
                            key={bounty.id}
                            className="p-3 border rounded-lg"
                          >
                            <div className="space-y-2">
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-sm font-medium text-neutral-900 dark:text-white leading-tight">
                                  {bounty.title}
                                </p>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="flex-shrink-0"
                                  onClick={() =>
                                    window.open(bounty.githubUrl, "_blank")
                                  }
                                >
                                  <ExternalLink className="h-3 w-3" />
                                </Button>
                              </div>
                              <div className="flex flex-wrap items-center gap-2">
                                <Badge
                                  variant={
                                    bounty.status === "open"
                                      ? "secondary"
                                      : "default"
                                  }
                                  className="text-xs"
                                >
                                  {bounty.status === "open"
                                    ? "Open"
                                    : "In Progress"}
                                </Badge>
                                <span className="text-xs text-neutral-600 dark:text-neutral-400">
                                  {bounty.amount} ETH
                                </span>
                              </div>
                              {bounty.assignedTo && (
                                <p className="text-xs text-neutral-500">
                                  Assigned to: {bounty.assignedTo}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Top Contributors Chart */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base sm:text-lg">
                      Top Contributors
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 sm:space-y-4">
                      {topContributors.map((contributor, index) => (
                        <div
                          key={contributor.address}
                          className="flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="h-8 w-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                              {index + 1}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-neutral-900 dark:text-white truncate">
                                {contributor.githubHandle ||
                                  formatAddress(contributor.address)}
                              </p>
                              <p className="text-xs text-neutral-600 dark:text-neutral-400 truncate">
                                {formatAddress(contributor.address)}
                              </p>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="font-medium text-neutral-900 dark:text-white text-sm sm:text-base">
                              {contributor.totalContributed} ETH
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Funding Trend Placeholder */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base sm:text-lg">
                      Funding Over Time
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-40 sm:h-48 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg flex items-center justify-center">
                      <p className="text-neutral-600 dark:text-neutral-400 text-sm text-center px-4">
                        Chart visualization would go here
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base sm:text-lg">
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3">
                    <Button className="flex items-center justify-center gap-2 w-full sm:w-auto">
                      <Plus className="h-4 w-4" />
                      Create Bounty
                    </Button>
                    <Button
                      variant="outline"
                      className="flex items-center justify-center gap-2 bg-transparent w-full sm:w-auto"
                    >
                      <Send className="h-4 w-4" />
                      Withdraw Funds
                    </Button>
                    <Button
                      variant="outline"
                      className="flex items-center justify-center gap-2 bg-transparent w-full sm:w-auto"
                    >
                      <MessageCircle className="h-4 w-4" />
                      Message Contributors
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </Suspense>
  );
}
