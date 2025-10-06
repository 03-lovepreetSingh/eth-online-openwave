"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { Octokit } from "@octokit/rest";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, AlertCircle, User, MapPin, CalendarDays, LinkIcon, Star, GitPullRequest, Briefcase } from "lucide-react";
import Sidebar from "@/assets/components/sidebar";
import Topbar from "@/assets/components/topbar";
import { useSidebarContext } from "@/assets/components/SidebarContext";
import ProjectsTab from "./components/ProjectsTab";
import { userProfileAbi, userProfileContract } from "./abi";
import { getUserCerts } from "@/actions/user-certs";

type TabName = "Overview" | "Pull Requests" | "Achievements" | "Activity" | "Projects";
type TabNameExtended = "Overview" | "Pull Requests" | "Achievements" | "Projects";

interface GitHubContribution {
  date: string;
  count: number;
  level: number;
  contributions: any[];
}

interface GitHubStats {
  totalContributions: number;
  pullRequests: number;
  issues: number;
  repositories: number;
}

interface User {
  _id: string;
  fullName: string;
  username: string;
  email: string;
  image_url?: string;
  Bio?: string;
  Location?: string;
  userName?: string;
  Linkedin?: string;
  Telegram?: string;
  Twitter?: string;
  rating?: number;
  skills?: {
    languages?: Array<{
      name: string;
      proficiency: string;
      yearsOfExperience: number;
    }>;
  };
  [key: string]: any;
}

interface NFTBadge {
  name: string;
  description: string;
  json: string;
}

interface Achievement {
  image: string;
  name: string;
  description: string;
  attributes: Array<{
    trait_type: string;
    value: string | number;
  }>;
}

const achievements: Achievement[] = [
  {
    image: "first-fixer",
    name: "First Fixer",
    description: "You've squashed your first bug! This badge marks the beginning of your contribution journey.",
    attributes: [
      { trait_type: "Role", value: "Contributor" },
      { trait_type: "Milestone", value: 1 }
    ]
  },
  {
    image: "bug-buster",
    name: "Bug Buster",
    description: "You're becoming unstoppable — five fixes and counting. This badge celebrates your persistence.",
    attributes: [
      { trait_type: "Role", value: "Contributor" },
      { trait_type: "Milestone", value: 5 }
    ]
  },
  {
    image: "code-champion",
    name: "Code Champion",
    description: "Ten issues down! You've earned your place among the top contributors.",
    attributes: [
      { trait_type: "Role", value: "Contributor" },
      { trait_type: "Milestone", value: 10 }
    ]
  }
];

function getNFTBadge(role: string, milestone: number): NFTBadge | null {
  switch (role) {
    case "Contributor":
      switch (milestone) {
        case 1:
          return {
            name: "First Fixer",
            description: "You've squashed your first bug! This badge marks the beginning of your contribution journey.",
            json: "",
          };
        case 5:
          return {
            name: "Bug Buster",
            description: "You're becoming unstoppable — five fixes and counting. This badge celebrates your persistence.",
            json: "",
          };
        case 10:
          return {
            name: "Code Champion",
            description: "Ten issues down! You've earned your place among the top contributors.",
            json: "",
          };
        default:
          return null;
      }
    default:
      return null;
  }
}



export default function UserProfilePage() {
  const { isShrunk } = useSidebarContext();
  const [activeTab, setActiveTab] = useState<TabName>("Overview");
  const [activeExtendedTab, setActiveExtendedTab] = useState<TabNameExtended>("Overview");
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [contributionData, setContributionData] = useState<GitHubContribution[]>([]);
  const [TotalEarnings, updateEarnings] = useState<number | undefined>(undefined);
  const [rewardAmount, setRewardAmount] = useState<number>(0);
  const [rewardData, setRewardData] = useState<any[]>([]);
  const [uniqueRewardDays, setUniqueRewardDays] = useState(0);
  const [issues, updateIssues] = useState([]);
  const [githubStats, setGithubStats] = useState<GitHubStats>({
    totalContributions: 0,
    pullRequests: 0,
    issues: 0,
    repositories: 0,
  });
  const [loadingContributions, setLoadingContributions] = useState(false);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [userProjects, setUserProjects] = useState([]);
  const [forwardHash, setForwardHash] = useState<string | null>(null);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [certificates, setCertificates] = useState<any[]>([]);
  const searchParams = useSearchParams();
  const userFromQuery = searchParams?.get("user");
  const router = useRouter();
  const { data: session } = useSession();
  const { address, isConnected } = useAccount();

  const { writeContract: writeContractForward, isPending: isForwarding, error: forwardError } = useWriteContract();
  const { isLoading: isConfirmingForward, isSuccess: isForwardConfirmed, error: confirmationError } = useWaitForTransactionReceipt({ hash: forwardHash as `0x${string}` });

  const achieve = async (ach: string) => {
    if (!address) return;
    try {
      const result = await writeContractForward({
        address: userProfileContract as `0x${string}`,
        abi: userProfileAbi,
        functionName: "achieve",
        args: [address, `${ach}`],
      });
      // @ts-expect-error - result is not typed
      if (result?.hash) {
        // @ts-expect-error - result is not typed
        setForwardHash(result.hash);
      }
    } catch (error) {
      console.error("Error in achieve function:", error);
    }
  };

  const fetchUserCerts = async () => {
    const certs = await getUserCerts(userFromQuery as string);
    setCertificates(certs);
  };

  useEffect(() => {
    if (isForwarding) {
      setAlertMessage("Please confirm the NFT minting transaction in your wallet...");
    } else if (isConfirmingForward) {
      setAlertMessage("Waiting for transaction confirmation...");
    } else if (isForwardConfirmed) {
      setAlertMessage("NFT minted successfully!");
      setTimeout(() => setAlertMessage(null), 5000);
    } else if (forwardError) {
      setAlertMessage(`Transaction failed: ${forwardError.message}`);
    } else if (confirmationError) {
      setAlertMessage(`Transaction confirmation failed: ${confirmationError.message}`);
    }
  }, [isForwarding, isConfirmingForward, isForwardConfirmed, forwardError, confirmationError]);

  useEffect(() => {
    const fetchRewards = async () => {
      const res = await fetch("/api/getIssues?publisher=" + userFromQuery, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const resData = await res.json();
      updateIssues(resData);
    };
    fetchRewards();
    fetchUserCerts();
  }, [userFromQuery]);

  const contributorRewardsCount = rewardData.length;
  const maintainerIssuesCount = issues.length;

  const filteredAchievements = achievements.filter((achievement) => {
    const role = achievement.attributes.find(
      (attr) => attr.trait_type === "Role"
    )?.value;
    const milestone = achievement.attributes.find(
      (attr) => attr.trait_type === "Milestone"
    )?.value;

    if (role === "Contributor") {
      return contributorRewardsCount >= Number(milestone);
    } else if (role === "Maintainer") {
      return maintainerIssuesCount >= Number(milestone);
    }
    return false;
  });

  const fetchEarnings = useCallback(async () => {
    if (!userFromQuery) return;

    try {
      const rewards = await fetch(`/api/rewards?contributor=${userFromQuery}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (rewards.ok) {
        const data = await rewards.json();
        for (let i = 0; i < data.Rewards.length; i++) {
          setRewardAmount((prev) => prev + (data.Rewards[i].rewardAmount || 0));
        }
        setRewardData(data.Rewards || []);

        const now = new Date();
        const oneYearAgo = new Date(now);
        oneYearAgo.setFullYear(now.getFullYear() - 1);

        const validDates = data.Rewards.map((pr: { date?: string }) => {
          if (!pr.date) return null;
          try {
            const date = new Date(pr.date);
            if (isNaN(date.getTime()) || date < oneYearAgo) return null;
            return date.toISOString().split("T")[0];
          } catch {
            return null;
          }
        }).filter(Boolean) as string[];

        setUniqueRewardDays(new Set(validDates).size);

        if (data.Rewards && Array.isArray(data.Rewards)) {
          const userRewards = data.Rewards.filter(
            (reward: any) => reward.Contributor_id === userFromQuery
          ).map((reward: any) => Number(reward.value));

          const totalEarnings = userRewards.reduce(
            (sum: number, value: number) => sum + value,
            0
          );

          updateEarnings(totalEarnings);
        }
      } else {
        console.error("Failed to fetch earnings:");
      }
    } catch (error) {
      console.error("Error fetching earnings:", error);
    }
  }, [userFromQuery, updateEarnings]);

  useEffect(() => {
    fetchEarnings();
  }, [fetchEarnings]);

  const fetchGitHubData = async (username: string, accessToken?: string) => {
    if (!username) return;

    setLoadingContributions(true);
    try {
      const octokit = new Octokit({
        auth: accessToken || undefined,
      });

      const { data: events } = await octokit.request(
        "GET /users/{username}/events",
        {
          username: username,
          per_page: 100,
          headers: {
            "X-GitHub-Api-Version": "2022-11-28",
          },
        }
      );

      const { data: repos } = await octokit.request(
        "GET /users/{username}/repos",
        {
          username: username,
          per_page: 100,
          headers: {
            "X-GitHub-Api-Version": "2022-11-28",
          },
        }
      );

      const contributorStats = [];
      try {
        for (const repo of repos.slice(0, 5)) {
          const { data: stats } = await octokit.request(
            "GET /repos/{owner}/{repo}/stats/contributors",
            {
              owner: username,
              repo: repo.name,
              headers: {
                "X-GitHub-Api-Version": "2022-11-28",
              },
            }
          );
          contributorStats.push({ repo: repo.name, stats });
        }
      } catch (error) {
        console.warn("Could not fetch contributor stats:", error);
      }

      const yearAgo = new Date();
      yearAgo.setDate(yearAgo.getDate() - 365);

      const contributionMap = new Map<
        string,
        { count: number; contributions: any[] }
      >();

      for (let i = 0; i < 365; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split("T")[0];
        contributionMap.set(dateStr, { count: 0, contributions: [] });
      }

      const relevantEvents = events.filter(
        (event: any) =>
          [
            "PushEvent",
            "PullRequestEvent",
            "IssuesEvent",
            "CreateEvent",
            "CommitCommentEvent",
            "ReleaseEvent",
          ].includes(event.type) && new Date(event.created_at) >= yearAgo
      );

      relevantEvents.forEach((event: any) => {
        const date = new Date(event.created_at).toISOString().split("T")[0];
        if (contributionMap.has(date)) {
          const current = contributionMap.get(date)!;
          current.count += 1;

          let description = "";
          const repo = event.repo?.name || "";

          switch (event.type) {
            case "PushEvent":
              description = `Pushed ${
                event.payload?.commits?.length || 0
              } commit(s)`;
              break;
            case "PullRequestEvent":
              description = `${event.payload?.action || ""} pull request: ${
                event.payload?.pull_request?.title || ""
              }`;
              break;
            case "IssuesEvent":
              description = `${event.payload?.action || ""} issue: ${
                event.payload?.issue?.title || ""
              }`;
              break;
            case "CreateEvent":
              description = `Created ${event.payload?.ref_type || ""}: ${
                event.payload?.ref || ""
              }`;
              break;
            case "CommitCommentEvent":
              description = "Commented on a commit";
              break;
            case "ReleaseEvent":
              description = `Released ${
                event.payload?.release?.tag_name || ""
              }`;
              break;
            default:
              description = event.type;
          }

          current.contributions.push({
            type: event.type,
            repo,
            description,
            url:
              event.payload?.pull_request?.html_url ||
              event.payload?.issue?.html_url ||
              `https://github.com/${repo}`,
          });

          contributionMap.set(date, current);
        }
      });

      const contributions: GitHubContribution[] = Array.from(
        contributionMap.entries()
      )
        .map(([date, data]) => ({
          date,
          count: data.count,
          level:
            data.count === 0
              ? 0
              : data.count <= 2
              ? 1
              : data.count <= 5
              ? 2
              : data.count <= 10
              ? 3
              : 4,
          contributions: data.contributions,
        }))
        .sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );

      setContributionData(contributions);

      const totalContributions = contributions.reduce(
        (sum, day) => sum + day.count,
        0
      );
      const pullRequests = relevantEvents.filter(
        (e) => e.type === "PullRequestEvent"
      ).length;
      const issues = relevantEvents.filter(
        (e) => e.type === "IssuesEvent"
      ).length;

      setGithubStats({
        totalContributions,
        pullRequests,
        issues,
        repositories: repos.length,
      });
    } catch (error) {
      console.error("Error fetching GitHub data:", error);
    } finally {
      setLoadingContributions(false);
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(
          `/api/publicProfile?username=${userFromQuery}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (res.ok) {
          const data = await res.json();
          setUsers(data.user || []);

          if (userFromQuery && data.users) {
            const user = data.users.find((u: any) => u._id === userFromQuery);
            setCurrentUser((user as User) || null);
          }
        } else {
          console.error("Failed to fetch users:", res.statusText);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, [session, userFromQuery]);

  useEffect(() => {
    if (currentUser?.userName) {
      fetchGitHubData(currentUser.userName as string);
    }
  }, [currentUser]);

  const renderTabContent = () => {

    switch (activeExtendedTab) {
      case "Overview":
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mt-4 sm:mt-6">
            <div className="lg:col-span-2 bg-white dark:bg-neutral-800 p-4 sm:p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4 text-neutral-900 dark:text-white">
                GitHub Contributions (Last Year)
              </h2>
              {loadingContributions ? (
                <div className="h-64 bg-neutral-100 dark:bg-neutral-700 rounded flex items-center justify-center">
                  <p className="text-neutral-500 dark:text-neutral-400">
                    Loading contributions...
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      Worked {uniqueRewardDays} days in the last year
                    </p>
                  </div>
                  <div className="overU2U-x-auto w-full">
                    {/* Component placeholder - you'll need to implement this */}
                    <div className="h-64 bg-neutral-100 dark:bg-neutral-700 rounded flex items-center justify-center">
                      <p className="text-neutral-500 dark:text-neutral-400">
                        Contribution chart component
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-3 sm:mt-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-neutral-900 dark:text-white">
                        {rewardData.length}
                      </div>
                      <div className="text-sm text-neutral-500 dark:text-neutral-400">
                        Pull Requests
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-neutral-900 dark:text-white">
                        {new Set(rewardData.map((pr) => pr.issue)).size}
                      </div>
                      <div className="text-sm text-neutral-500 dark:text-neutral-400">
                        Issues
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-neutral-900 dark:text-white">
                        {new Set(rewardData.map((pr) => pr.projectName)).size}
                      </div>
                      <div className="text-sm text-neutral-500 dark:text-neutral-400">
                        Repositories
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-neutral-900 dark:text-white">
                        {new Set(rewardData.map((pr) => pr.rewardedAt)).size}
                      </div>
                      <div className="text-sm text-neutral-500 dark:text-neutral-400">
                        Active Days
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="lg:col-span-1 bg-white dark:bg-neutral-800 p-4 sm:p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4 text-neutral-900 dark:text-white">
                Recent Pull Requests
              </h2>
              <ul className="space-y-3">
                {rewardData.slice(0, 3).map((pr) => (
                  <li key={pr.id} className="text-sm">
                    <a
                      href={pr.url}
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {pr.title}
                    </a>
                    <div className="text-xs text-neutral-500 dark:text-neutral-400">
                      Project: {pr.projectName} | Reward: ${pr.rewardAmount}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );
      case "Pull Requests":
        return (
          <div className="mt-4 sm:mt-6 bg-white dark:bg-neutral-800 p-4 sm:p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-neutral-900 dark:text-white">
              Completed Pull Requests
            </h2>
            <div className="overU2U-x-auto">
              <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
                <thead className="bg-neutral-50 dark:bg-neutral-700">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider"
                    >
                      Project
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider"
                    >
                      Description
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider"
                    >
                      Merged Date
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider"
                    >
                      Reward
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">View</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-neutral-800 divide-y divide-neutral-200 dark:divide-neutral-700">
                  {rewardData.map((pr) => (
                    <tr key={pr.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-400">
                        {pr.projectName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {pr.projectDescription}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-400">
                        {pr.date
                          ? new Date(pr.date).toLocaleDateString("en-US", {})
                          : "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-400">
                        ${pr.rewardAmount.toFixed(4)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <a
                          href={pr.issue}
                          className="text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          <LinkIcon className="w-4 h-4 inline" />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      case "Achievements":
        return (
          <>
            {session?.user?.username ? (
              <>
                {isConnected ? (
                  <>
                    <div className="mt-6 bg-white dark:bg-neutral-800 p-6 rounded-lg shadow">
                      <h2 className="text-xl font-semibold mb-4 text-neutral-900 dark:text-white">
                        Achievements
                      </h2>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
                        Badges and milestones you've unlocked
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {filteredAchievements.map((ach) => (
                          <div
                            key={ach.image}
                            id={ach.image}
                            className="w-full max-w-sm mx-auto h-48 rounded-2xl p-12 flex flex-col items-center justify-center text-center shadow-xl border border-white/30 dark:border-neutral-300/10 bg-white/10 dark:bg-neutral-800/20 backdrop-blur-xl backdrop-saturate-150"
                          >
                            <div className={`text-xl font-bold pb-2`}>
                              {ach.name}
                            </div>
                            <div
                              className={`pb-2 text-sm dark:text-neutral-400 text-neutral-600`}
                            >
                              {ach.description}
                            </div>
                            <Button
                              onClick={() => {
                                achieve(ach.image);
                              }}
                              className="mb-3"
                            >
                              Claim Now
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="mt-6 bg-white dark:bg-neutral-800 p-6 rounded-lg shadow">
                      <h2 className="text-xl font-semibold mb-4 text-neutral-900 dark:text-white">
                        Achievements
                      </h2>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
                        Badges and milestones you've unlocked
                      </p>
                      <div className="">
                        <div className="flex text-center justify-center">
                          <div className="">
                            <Icon
                              icon="material-symbols:error"
                              width="24"
                              height="24"
                            />
                          </div>
                          <div>
                            Please connect your wallet to claim achievements.
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </>
            ) : (
              <>
                <div className="mt-6 bg-white dark:bg-neutral-800 p-6 rounded-lg shadow">
                  <h2 className="text-xl font-semibold mb-4 text-neutral-900 dark:text-white">
                    Achievements
                  </h2>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
                    Badges and milestones you've unlocked
                  </p>
                  <div className="">
                    <div className="flex text-center justify-center">
                      <div className="">
                        <Icon
                          icon="material-symbols:error"
                          className=""
                          width="24"
                          height="24"
                        />
                      </div>
                      <div>Please Login to claim achievements.</div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </>
        );
      case "Projects":
        return (
          <div className="mt-4 sm:mt-6">
            <div className="bg-white dark:bg-neutral-800 p-4 sm:p-6 rounded-lg shadow">
                <ProjectsTab userIdProp={userFromQuery || users[0]?._id} />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div>
      <Sidebar />
      <div
        className={` ${
          isShrunk
            ? "md:ml-[4rem] md:w-[calc(100%_-_4rem)]"
            : "md:ml-[16rem] md:w-[calc(100%_-_16rem)]"
        }`}
      >
        <Topbar />

        {/* Alert System */}
        <div className="fixed bottom-4 right-4 z-[100] max-w-sm w-full">
          {alertMessage && (
            <Alert
              className={`mb-2 ${
                isForwardConfirmed
                  ? "bg-green-100 border-green-400 text-green-700"
                  : confirmationError || forwardError
                  ? "bg-red-100 border-red-400 text-red-700"
                  : ""
              }`}
            >
              <div className="flex items-center gap-2">
                {isForwardConfirmed ? (
                  <CheckCircle className="h-4 w-4" />
                ) : confirmationError || forwardError ? (
                  <AlertCircle className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <AlertTitle className="text-sm">
                  {isForwardConfirmed
                    ? "Success"
                    : confirmationError || forwardError
                    ? "Error"
                    : "Notice"}
                </AlertTitle>
              </div>
              <AlertDescription className="text-sm mt-1">
                {alertMessage}
              </AlertDescription>
            </Alert>
          )}
        </div>
        {users.length > 0 ? (
          <>
            <div className="mt-16 md:mt-20 z-10 min-h-screen p-4 sm:p-6 lg:p-8">
              <div className="max-w-7xl mx-auto">
                {/* User Info Header */}
                <div className="bg-white dark:bg-neutral-800 shadow rounded-lg p-6 mb-6">
                  <div className="flex flex-col md:flex-row items-center">
                    <img
                      className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-full mr-0 md:mr-6 mb-4 md:mb-0 border-4 border-neutral-200 dark:border-neutral-700"
                      src={
                        (currentUser?.image_url as string) ||
                        users[0]?.image_url
                      }
                      alt={(currentUser?.fullName as string) || users[0]?.id}
                    />
                    <div className="text-center sm:text-left">
                      <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white">
                        {(currentUser?.fullName as string) ||
                          users[0]?.fullName}
                      </h1>
                      <p className="text-md text-neutral-600 dark:text-neutral-400">
                        {(currentUser?.username as string) || users[0]?.id}
                      </p>
                      <p className="mt-2 text-sm text-neutral-700 dark:text-neutral-300 max-w-xl">
                        {users[0]?.Bio}
                      </p>
                      <div className="mt-3 flex flex-wrap justify-center sm:justify-start items-center gap-x-4 gap-y-2 text-xs text-neutral-500 dark:text-neutral-400">
                        <span className="flex items-center">
                          <User className="w-3 h-3 mr-1" /> {users[0].email}
                        </span>
                        <span className="flex items-center">
                          <MapPin className="w-3 h-3 mr-1" />{" "}
                          {(currentUser?.Location as string) ||
                            users[0].Location}
                        </span>
                        <span className="flex items-center">
                          <CalendarDays className="w-3 h-3 mr-1" /> Joined{" "}
                          "Recently"
                        </span>
                        <a
                          href={
                            users[0]?.id
                              ? `https://github.com/${users[0].id as string}`
                              : "#"
                          }
                          className="flex items-center hover:text-blue-600 dark:hover:text-blue-400"
                        >
                          <LinkIcon className="w-3 h-3 mr-1" /> GitHub Profile
                        </a>
                        {users[0]?.Linkedin && (
                          <a
                            href={`https://linkedin.com/in/${
                              users[0].Linkedin as string
                            }`}
                            className="flex items-center hover:text-blue-600 dark:hover:text-blue-400"
                          >
                            <LinkIcon className="w-3 h-3 mr-1" /> Linkedin
                            Profile
                          </a>
                        )}
                        {users[0]?.Telegram && (
                          <a
                            href={`https://telegram.org/${
                              users[0].Telegram as string
                            }`}
                            className="flex items-center hover:text-blue-600 dark:hover:text-blue-400"
                          >
                            <LinkIcon className="w-3 h-3 mr-1" /> Telegram
                          </a>
                        )}
                        {users[0]?.Twitter && (
                          <a
                            href={`https://twitter.com/${
                              users[0].Twitter as string
                            }`}
                            className="flex items-center hover:text-blue-600 dark:hover:text-blue-400"
                          >
                            <LinkIcon className="w-3 h-3 mr-1" /> Twitter
                          </a>
                        )}
                      </div>
                      <div className="mt-3 flex items-center justify-center sm:justify-start">
                        <Star className="w-4 h-4 text-yellow-400 mr-1" />
                        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                          {users[0].rating}/5.0 rating
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                    <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-2">
                      Skills
                    </h3>
                    <div className="flex flex-wrap gap-1 sm:gap-2">
                      {users[0].skills?.languages?.map(
                        (lang: {
                          name: string;
                          proficiency: string;
                          yearsOfExperience: number;
                        }) => (
                          <span
                            key={lang.name}
                            className="px-3 py-1 text-xs font-semibold text-blue-700 bg-blue-100 dark:text-blue-200 dark:bg-blue-700 rounded-full"
                            title={`${lang.proficiency} (${lang.yearsOfExperience} years)`}
                          >
                            {lang.name}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                </div>

                {/* Stats Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
                  {[
                    {
                      icon: (
                        <img
                          src="https://s2.coinmarketcap.com/static/img/coins/64x64/27369.png"
                          width={40}
                          height={40}
                          className="w-6 h-6 "
                          alt="Earnings"
                        />
                      ),
                      label: "Total Earnings",
                      value: ` ${rewardAmount.toFixed(2)}`,
                      subtext: "From completed pull requests",
                    },
                    {
                      icon: (
                        <GitPullRequest className="w-6 h-6 text-blue-500" />
                      ),
                      label: "Pull Requests",
                      value: rewardData.length,
                      subtext: "Successfully merged",
                    },
                    {
                      icon: <Briefcase className="w-6 h-6 text-purple-500" />,
                      label: "Projects",
                      value: new Set(rewardData.map((r) => r.projectName)).size,
                      subtext: "Contributed to",
                    },
                    {
                      icon: <Star className="w-6 h-6 text-yellow-500" />,
                      label: "Average Rating",
                      value: `${users[0].rating}/5.0`,
                      subtext: "From maintainers",
                    },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="bg-white dark:bg-neutral-800 shadow rounded-lg p-4 flex items-start space-x-3"
                    >
                      <div className="flex-shrink-0 p-1 sm:p-2 bg-neutral-100 dark:bg-neutral-700 rounded-full">
                        {stat.icon}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                          {stat.label}
                        </p>
                        <p className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white">
                          {stat.value}
                        </p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                          {stat.subtext}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Tabs Navigation */}
                <div className="mb-6">
                  <div className="border-b border-neutral-200 dark:border-neutral-700">
                    <nav
                      className="-mb-px flex flex-wrap gap-x-2 sm:gap-x-4 md:space-x-8"
                      aria-label="Tabs"
                    >
                      {(
                        ["Overview", "Pull Requests", "Achievements", "Projects"] as TabNameExtended[]
                      ).map((tab) => (
                        <button
                          key={tab}
                          onClick={() => {
                            setActiveExtendedTab(tab);
                            if (tab === "Projects") {
                              (async () => {
                                try {
                                  setLoadingProjects(true);
                                  const userId = userFromQuery || users[0]?._id;
                                  const res = await fetch(`/api/user-projects?userId=${userId}`);
                                  const json = await res.json();
                                  if (json.success) setUserProjects(json.projects || []);
                                  else setUserProjects([]);
                                } catch (err) {
                                  console.error(err);
                                  setUserProjects([]);
                                } finally {
                                  setLoadingProjects(false);
                                }
                              })();
                            }
                          }}
                          className={`whitespace-nowrap py-2 sm:py-3 px-1 border-b-2 font-medium text-xs sm:text-sm
                    ${
                      activeExtendedTab === tab
                        ? "border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-300"
                        : "border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300 dark:text-neutral-400 dark:hover:text-neutral-200 dark:hover:border-neutral-600"
                    }
                  `}
                        >
                          {tab}
                        </button>
                      ))}
                    </nav>
                  </div>
                </div>

                {/* Tab Content */}
                <div>{renderTabContent()}</div>
              </div>
            </div>
          </>
        ) : (
          <div className="z-10 mt-20 min-h-screen p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
              {/* User Info Header */}
              <div className="bg-white dark:bg-neutral-800 shadow rounded-lg p-6 mb-6">
                <div className="flex flex-col sm:flex-row items-center">
                  <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full mr-0 sm:mr-6 mb-4 sm:mb-0 border-4 border-neutral-200 dark:border-neutral-700 bg-neutral-200 dark:bg-neutral-700 animate-pulse"></div>
                  <div className="text-center sm:text-left w-full">
                    <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white animate-pulse">
                      <span className="inline-block h-6 w-48 bg-neutral-300 dark:bg-neutral-600 rounded"></span>
                    </h1>
                    <p className="text-md text-neutral-600 dark:text-neutral-400 animate-pulse mt-2">
                      <span className="inline-block h-4 w-32 bg-neutral-300 dark:bg-neutral-600 rounded"></span>
                    </p>
                    <p className="mt-2 text-sm text-neutral-700 dark:text-neutral-300 max-w-xl animate-pulse">
                      <span className="inline-block h-4 w-full bg-neutral-300 dark:bg-neutral-600 rounded"></span>
                      <span className="inline-block h-4 w-3/4 bg-neutral-300 dark:bg-neutral-600 rounded mt-1"></span>
                    </p>
                    <div className="mt-3 flex flex-wrap justify-center sm:justify-start items-center gap-x-4 gap-y-2 text-xs text-neutral-500 dark:text-neutral-400">
                      {[...Array(4)].map((_, i) => (
                        <span
                          key={i}
                          className="flex items-center animate-pulse"
                        >
                          <span className="inline-block h-3 w-3 bg-neutral-300 dark:bg-neutral-600 rounded-full mr-1"></span>
                          <span className="inline-block h-3 w-16 bg-neutral-300 dark:bg-neutral-600 rounded"></span>
                        </span>
                      ))}
                    </div>
                    <div className="mt-3 flex items-center justify-center sm:justify-start animate-pulse">
                      <span className="inline-block h-4 w-4 bg-neutral-300 dark:bg-neutral-600 rounded-full mr-1"></span>
                      <span className="inline-block h-4 w-24 bg-neutral-300 dark:bg-neutral-600 rounded"></span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                  <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-2 animate-pulse">
                    <span className="inline-block h-4 w-16 bg-neutral-300 dark:bg-neutral-600 rounded"></span>
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 text-xs font-semibold text-blue-700 bg-blue-100 dark:text-blue-200 dark:bg-blue-700 rounded-full animate-pulse"
                      >
                        <span className="inline-block h-3 w-12 bg-blue-200 dark:bg-blue-600 rounded"></span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-white dark:bg-neutral-800 shadow rounded-lg p-4 flex items-start space-x-3 animate-pulse"
                  >
                    <div className="flex-shrink-0 p-2 bg-neutral-100 dark:bg-neutral-700 rounded-full">
                      <span className="inline-block h-6 w-6 bg-neutral-300 dark:bg-neutral-600 rounded-full"></span>
                    </div>
                    <div className="w-full">
                      <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                        <span className="inline-block h-3 w-24 bg-neutral-300 dark:bg-neutral-600 rounded"></span>
                      </p>
                      <p className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white mt-1">
                        <span className="inline-block h-6 w-16 bg-neutral-300 dark:bg-neutral-600 rounded"></span>
                      </p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                        <span className="inline-block h-3 w-32 bg-neutral-300 dark:bg-neutral-600 rounded"></span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Tabs Navigation */}
              <div className="mb-6 animate-pulse">
                <div className="border-b border-neutral-200 dark:border-neutral-700">
                  <nav className="-mb-px flex space-x-4 sm:space-x-8">
                    {[...Array(4)].map((_, i) => (
                      <button
                        key={i}
                        className="whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm border-transparent"
                      >
                        <span className="inline-block h-4 w-20 bg-neutral-300 dark:bg-neutral-600 rounded"></span>
                      </button>
                    ))}
                  </nav>
                </div>
              </div>

              {/* Tab Content */}
              <div className="bg-white dark:bg-neutral-800 rounded-lg shadow p-6 animate-pulse">
                <div className="h-64 w-full bg-neutral-100 dark:bg-neutral-700 rounded"></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
