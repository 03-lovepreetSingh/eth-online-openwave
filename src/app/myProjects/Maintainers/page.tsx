"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import {
  ArrowLeft,
  MessageSquare,
  Calendar,
  User,
  GitPullRequest,
  WarehouseIcon as Repository,
  Plus,
  ExternalLink,
  Star,
  GitFork,
  Eye,
} from "lucide-react";
import Maintainer from "./maintainer";  
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import { useSidebarContext } from "../../../assets/components/SidebarContext";
import Sidebar from "../../../assets/components/sidebar";
import Topbar from "../../../assets/components/topbar";
import { RepositoryDescription } from "../../../components/repository-discription";

interface RepositoryData {
  project_repository: string;
  projectOwner: string;
  projectName: string;
  aiDescription: string;
  stars: number;
  forks: number;
  contributors: string[];
  languages?: Record<string, number>;
  longdis?: string;
}

interface IssueData {
  id: string;
  issue_name: string;
  priority: string;
  project_issues: string;
  rewardAmount: string;
  issue_description: string;
  publisher: string;
  issue_date: string;
  comments: number;
  Difficulty?: string;
}



interface RepoUser {
  name?: string | null;
  email?: string | null;
  username?: string | null;
}

export default function RepositoryIssuesPage() {
  const { isShrunk } = useSidebarContext();
  const { data: session } = useSession();
  const [repoData, setRepoData] = useState<RepositoryData | null>(null);
  const [issues, setIssues] = useState<IssueData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const searchParams = useSearchParams();
  const repository = searchParams?.get("repo");

  // Generate intelligent description for repository
  const generateIntelligentDescription = useMemo(() => {
    if (!repoData) return "";

    if (repoData.aiDescription && repoData.aiDescription.trim()) {
      return repoData.aiDescription;
    }

    // Fallback: Generate description based on available data
    const languages = repoData.languages ? Object.keys(repoData.languages) : [];
    const primaryLanguage = languages.length > 0 ? languages[0] : "code";

    let description = `A ${primaryLanguage} project`;

    if (repoData.longdis && repoData.longdis.trim()) {
      description = repoData.longdis;
    } else {
      // Generate based on repository stats and context
      if (repoData.stars > 100) {
        description += " with a strong community following";
      }
      if (repoData.contributors && repoData.contributors.length > 5) {
        description += " actively maintained by multiple contributors";
      }
      if (languages.length > 1) {
        description += ` built with ${languages.slice(0, 3).join(", ")}`;
      }
      description += ". Open for contributions and collaboration.";
    }

    return description;
  }, [repoData]);

  useEffect(() => {
    fetchData();
  }, [session]);

  const fetchData = async () => {
    if (!session?.user) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const repositories = await fetch(
        `/api/manageProjects?projectOwner=${
          (session?.user as RepoUser)?.username
        }`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const repositoryData = await repositories.json();

      for (let i = 0; i < repositoryData.project.length; i++) {
        if (repositoryData.project[i].project_repository == repository) {
          setRepoData(repositoryData.project[i]);
          break;
        }
      }
    } catch (error) {
      console.error("Error fetching repository data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchIssues = async () => {
      if (!repository) return;

      try {
        const response = await fetch(
          `/api/add-issues?project_repository=${repository}`,
          {
            method: "GET",
          }
        );
        const responseData = await response.json();
        setIssues(responseData.projects || []);
      } catch (error) {
        console.error("Error fetching issues:", error);
        setIssues([]);
      }
    };

    fetchIssues();
  }, [repository]);

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-neutral-100 text-neutral-800 dark:bg-neutral-900 dark:text-neutral-200";
    }
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty?.toLowerCase()) {
      case "easy":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "hard":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-neutral-100 text-neutral-800 dark:bg-neutral-900 dark:text-neutral-200";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const totalRewardAmount = useMemo(() => {
    return issues.reduce(
      (sum, issue) => sum + Number.parseFloat(issue.rewardAmount || "0"),
      0
    );
  }, [issues]);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
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
          <div className="pt-20">
            <Maintainer repo_name={repository as string} />
          </div>

            
      </div>
    </div>
  );
}
