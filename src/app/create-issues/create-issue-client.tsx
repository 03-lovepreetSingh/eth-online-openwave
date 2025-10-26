"use client";
import { Octokit } from "octokit";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { parseEther } from "viem";
import Sidebar from "@/assets/components/sidebar";
import Topbar from "@/assets/components/topbar";
import { useWalletClient, usePublicClient } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { deployContract } from "@wagmi/core";
import type { Session } from "next-auth";
import { useSidebarContext } from "@/assets/components/SidebarContext";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Suspense } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Wallet, AlertCircle, CheckCircle } from "lucide-react";
import { User } from "@/db/types";
import {IssueWalletABI} from '../../../abi'
import {IssueWalletByteCode} from '../../../bytecode'
import { useEffect, useState } from "react";
import { ProjectTable } from "@/db/types";
interface CustomUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  username?: string | null;
  id?: string;
}

interface CustomSession {
  accessToken?: string;
  user?: CustomUser;
}

interface GitHubUser {
  login: string;
  id: number;
}

interface Repo {
  id: number;
  name: string;
  full_name: string;
  owner: GitHubUser;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
}

interface Issue {
  id: number;
  title: string;
  html_url: string;
  number: number;
  body: string;
  created_at: string;
}

interface SessionData {
  accessToken?: string;
  user?: {
    username?: string;
    email?: string;
  };
}

interface CreateIssueClientProps {
  session: { session: Session };
  managedProjects: ProjectTable[];
  userProfile: User 
}

export default function CreateIssueClient({ session, managedProjects,userProfile }: CreateIssueClientProps) {
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const [contractAddress, setContractAddress] = useState("");
  const [isDeploying, setIsDeploying] = useState(false);
  const [error, setError] = useState("");
  const [userData, setUserData] = useState<User >(userProfile);
  const [issueUrl, setIssueUrl] = useState<string | undefined>();
  const [token, setToken] = useState<string>(session?.session?.accessToken || "");
  const [user, setUser] = useState<string | undefined>(session?.session?.user?.username);
  const [selectedRepo, setSelectedRepo] = useState<string | undefined>();
  const [data, setData] = useState<ProjectTable[]>(managedProjects);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [selectedissue, setSelectedIssue] = useState<string | null>();
  const { isShrunk } = useSidebarContext();
  const { address, isConnected } = useAccount();
  const [issueTitle, setIssueTitle] = useState<string>("");
  const [issueDescription, setIssueDescription] = useState<string>("");
  const [issueCreatedAt, setIssueCreatedAt] = useState<string>("");
  const [rewardAmount, setRewardAmount] = useState<string>("");
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [issueData, setIssueData] = useState<any>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [difficulty, setDifficulty] = useState<string>("");
  const [wallet, setWallet] = useState<boolean>(true);
  const [priority, setPriority] = useState<string>("");
  console.log("userData test", userProfile);
  const octokit = new Octokit({ auth: token });
  const username: string = session?.session?.user?.username as string;

  const createContract = async () => {
    if (!walletClient) {
      setError("Wallet client not found. Please connect your wallet.");
      return;
    }
    if (!publicClient) {
      setError("Public client not available.");
      return;
    }

    setIsDeploying(true);
    setError("");

    try {
      const constructorArgs = [BigInt(100)]; // Initial contract balance
      const hash = await walletClient.deployContract({
        abi: IssueWalletABI,
        bytecode:IssueWalletByteCode as `0x${string}`,
      });

      const receipt = await publicClient.waitForTransactionReceipt({
        hash,
        timeout: 60000, // 60 second timeout
      });
      console.log(receipt,"teggsffss")
      if (!receipt.contractAddress) {
        throw new Error("Contract deployment failed - no address in receipt");
      }

      if (receipt.contractAddress) {
        try {
          const response = await fetch("/api/publicProfile", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              id: session?.session?.user?.username, // Replace with the actual user ID
              maintainerWallet: receipt.contractAddress,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            setWallet(true);
            setContractAddress(receipt.contractAddress);
          } else {
            const errorData = await response.json();
            console.error("Error:", errorData);
          }
        } catch (error) {
          console.error("Request failed:", error);
        }
      }
    } catch (error) {
      console.error("Contract deployment error:", error);
      setError(
        `Failed to deploy contract: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsDeploying(false);
    }
  };
  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const {
    data: writeData,
    writeContract,
    isPending: isWritePending,
    error: writeError,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: confirmationError,
  } = useWaitForTransactionReceipt({
    hash: writeData,
  });
  // Set token and user from session
  



  useEffect(() => {
    if (alertMessage) {
      const timer = setTimeout(() => {
        setAlertMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [alertMessage]);

  // Set token and user from session

  // Fetch repositories


  useEffect(() => {
    if (!userData) return;
    if (userData?.maintainerWallet === null) {
      setWallet(false);
    }
  }, [userData]);

  // Fetch issues for selected repo
  useEffect(() => {
    if (!token || !user || !selectedRepo) return;

    const fetchIssues = async () => {
      try {
        const response = await octokit.request(
          `GET /repos/${user}/${selectedRepo}/issues`,
          {
            owner: user,
            repo: selectedRepo,
            state: "open",
            headers: {
              "X-GitHub-Api-Version": "2022-11-28",
            },
          }
        );

        setIssues(response.data as Issue[]);
      } catch (error) {
        console.error("Error fetching issues:", error);
        setIssues([]);
      }
    };

    fetchIssues();
  }, [token, user, selectedRepo]);

  useEffect(() => {
    if (!selectedissue || !user || !selectedRepo) return;

    const fetchIssueData = async () => {
      try {
        const response = await octokit.request(
          `GET /repos/${user}/${selectedRepo}/issues/${selectedissue}`,
          {
            owner: user,
            repo: selectedRepo,
            issue_number: Number.parseInt(selectedissue),
          }
        );

        const issue = response.data;
        setIssueTitle(issue.title);
        setIssueUrl(issue.html_url);
        setIssueDescription(issue.body || "");
        setIssueCreatedAt(issue.created_at);
      } catch (error) {
        console.error("Error fetching issue data:", error);
      }
    };

    fetchIssueData();
  }, [selectedissue, user, selectedRepo]);

  useEffect(() => {
    if (isConfirmed) {
      setAlertMessage("Deposit successful! Submitting issue...");
      const createIssue = async () => {
        const currentSession = session as CustomSession;
        try {
          await fetch("/api/add-issues", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              issue_name: issueTitle,
              issue_description: issueDescription,
              issue_date: issueCreatedAt,
              issue_url: issueUrl,
              difficulty: difficulty,
              project_issues: selectedissue,
              rewardAmount: rewardAmount,
              priority: priority,
              project_repository: selectedRepo,
              email: session?.session?.user?.email,
            }),
          });
          setAlertMessage("Issue submitted successfully!");
        } catch (error) {
          console.error("Error submitting issue:", error);
          setAlertMessage("Failed to submit issue.");
        }
      };
      createIssue();
    }
    if (confirmationError) {
      setAlertMessage(
        `Deposit failed: ${(confirmationError as Error).message}`
      );
    }
    if (writeError) {
      setAlertMessage(
        `Transaction submission failed: ${(writeError as Error).message}`
      );
    }
  }, [isConfirmed]);

  const addProject = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (
      !rewardAmount ||
      isNaN(Number(rewardAmount)) ||
      Number(rewardAmount) <= 0
    ) {
      setAlertMessage("Please enter a valid positive reward amount");
      return;
    }
    if (!isConnected || !userData?.maintainerWallet) {
      console.log(isConnected,userData?.maintainerWallet,"wallet connected or not");
    console.log("userData", userData);
      return setAlertMessage("Connect your wallet first!");
    }
    console.log(isConnected,"wallet connected or not");
    console.log("userData", userData?.maintainerWallet);
    if (
      !userData?.maintainerWallet ||
      !IssueWalletABI ||
      (IssueWalletABI as readonly any[]).length === 0
    ) {
      return setAlertMessage("Contract address or ABI is not configured.");
    }

    if (!difficulty || !priority || !selectedRepo || !selectedissue) {
      return setAlertMessage("Please fill in all required fields");
    }

    try {
      const currentSession = session as CustomSession;
      const username: string = session?.session?.user?.username as string;

      if (!username) {
        return setAlertMessage("User session not found.");
      }

      if (!userData) return;

      writeContract({
        address: userData.maintainerWallet as `0x${string}`,
        abi:IssueWalletABI,
        functionName: "deposit",
        value: parseEther(rewardAmount as string),
      });

      if (isWritePending) {
        setAlertMessage("Processing deposit...");
      }
    } catch (error) {
      console.error("Error in project creation or deposit:", error);
      if (error instanceof Error) {
        setAlertMessage(`Error: ${error.message}`);
      } else {
        setAlertMessage(
          "An unexpected error occurred during project creation."
        );
      }
    }
  };

  return (
    <>
      <Suspense>
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
        {/* Alert Messages - Responsive positioning */}
        <div className="fixed bottom-4 right-4 z-[100] max-w-sm w-full">
          {alertMessage && (
            <Alert
              className={`mb-2 ${
                isConfirmed
                  ? "bg-green-100 border-green-400 text-green-700"
                  : confirmationError || writeError
                  ? "bg-red-100 border-red-400 text-red-700"
                  : ""
              }`}
            >
              <div className="flex items-center gap-2">
                {isConfirmed ? (
                  <CheckCircle className="h-4 w-4" />
                ) : confirmationError || writeError ? (
                  <AlertCircle className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <AlertTitle className="text-sm">
                  {isConfirmed
                    ? "Success"
                    : confirmationError || writeError
                    ? "Error"
                    : "Notice"}
                </AlertTitle>
              </div>
              <AlertDescription className="text-sm mt-1">
                {alertMessage}
              </AlertDescription>
            </Alert>
          )}
          {(isWritePending || isConfirming) && (
            <Alert className="bg-blue-100 border-blue-400 text-blue-700">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <AlertTitle className="text-sm">
                  Processing Transaction
                </AlertTitle>
              </div>
              <AlertDescription className="text-sm mt-1">
                {isWritePending &&
                  !isConfirming &&
                  "Please confirm in your wallet..."}
                {isConfirming && "Waiting for transaction confirmation..."}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <div className="flex min-h-screen">
          
            {wallet ? (
              <>
                <div className="mt-16 md:mt-20 p-4 sm:p-6 lg:p-8">
                  <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="mb-6 lg:mb-8">
                      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">
                        Create Issue Bounty
                      </h1>
                      <p className="text-sm sm:text-base text-muted-foreground">
                        Set up a reward for contributors to solve your GitHub
                        issues
                      </p>
                    </div>

                    {/* Wallet Connection Status */}
                    {!isConnected && (
                      <Card className="mb-6 border-amber-200 bg-amber-50 dark:bg-amber-950/20">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <Wallet className="h-5 w-5 text-amber-600" />
                            <div>
                              <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                                Wallet Not Connected
                              </p>
                              <p className="text-xs text-amber-700 dark:text-amber-300">
                                Please connect your wallet to create issue
                                bounties
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Main Form */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg sm:text-xl">
                          Issue Information
                        </CardTitle>
                        <CardDescription>
                          Fill in the details for your issue bounty
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <form onSubmit={addProject} className="space-y-6">
                          {/* Repository and Issue Selection */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                            <div className="space-y-2">
                              <Label
                                htmlFor="projectRepo"
                                className="text-sm font-medium"
                              >
                                Project Repository *
                              </Label>
                              <select
                                id="projectRepo"
                                name="projectRepo"
                                className="dark:bg-neutral-800 w-full p-2 border-2 dark:border-custom-dark-neutral rounded-md"
                                onChange={(e) =>
                                  setSelectedRepo(e.target.value)
                                } // This sets selectedRepo (singular)
                                value={selectedRepo || ""} // Ensure value is not undefined
                                required
                              >
                                <option value="">Select a repository</option>
                                {data?.map((repo) => (
                                  <option value={repo?.name} key={repo?.id}>
                                    {repo.project_repository}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div className="space-y-2">
                              <Label
                                htmlFor="projectIssue"
                                className="text-sm font-medium"
                              >
                                Select Issue *
                              </Label>
                              <Select
                                value={selectedissue || ""}
                                onValueChange={(value) =>
                                  setSelectedIssue(value)
                                }
                                disabled={!selectedRepo}
                                required
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select an issue" />
                                </SelectTrigger>
                                <SelectContent>
                                  {issues?.map((issue: any) => (
                                    <SelectItem
                                      value={issue.number.toString()}
                                      key={issue.id}
                                    >
                                      {issue.title}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          {/* Difficulty, Priority, and Reward */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                            <div className="space-y-2">
                              <Label
                                htmlFor="difficulty"
                                className="text-sm font-medium"
                              >
                                Difficulty *
                              </Label>
                              <Select
                                value={difficulty}
                                onValueChange={setDifficulty}
                                required
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select difficulty" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="low">Low</SelectItem>
                                  <SelectItem value="medium">Medium</SelectItem>
                                  <SelectItem value="hard">Hard</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label
                                htmlFor="priority"
                                className="text-sm font-medium"
                              >
                                Priority *
                              </Label>
                              <Select
                                value={priority}
                                onValueChange={setPriority}
                                required
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select priority" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Low">Low</SelectItem>
                                  <SelectItem value="Medium">Medium</SelectItem>
                                  <SelectItem value="High">High</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                              <Label
                                htmlFor="rewardAmount"
                                className="text-sm font-medium"
                              >
                                Reward Amount (HBAR) *
                              </Label>
                              <Input
                                id="rewardAmount"
                                name="rewardAmount"
                                type="text"
                                className="w-full"
                                value={rewardAmount}
                                onChange={(e) =>
                                  setRewardAmount(e.target.value)
                                }
                                placeholder="e.g., 10.5"
                                required
                              />
                            </div>
                          </div>

                          {/* Submit Button */}
                          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
                            <div className="flex-1">
                              <p className="text-xs sm:text-sm text-muted-foreground">
                                By creating this bounty, you agree to deposit
                                the reward amount to the smart contract. The
                                funds will be released when the issue is
                                successfully resolved.
                              </p>
                            </div>
                            <Button
                              type="submit"
                              className="w-full sm:w-auto px-6 py-2"
                              disabled={
                                isWritePending || isConfirming || !isConnected
                              }
                            >
                              {isWritePending || isConfirming ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Processing...
                                </>
                              ) : (
                                "Create Bounty"
                              )}
                            </Button>
                          </div>
                        </form>
                      </CardContent>
                    </Card>

                    {/* Help Section */}
                    <Card className="mt-6">
                      <CardHeader>
                        <CardTitle className="text-base sm:text-lg">
                          How it works
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex gap-3">
                          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-xs font-medium text-blue-600 dark:text-blue-400">
                            1
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Select a repository and issue from your GitHub
                            projects
                          </p>
                        </div>
                        <div className="flex gap-3">
                          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-xs font-medium text-blue-600 dark:text-blue-400">
                            2
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Set the difficulty, priority, and reward amount for
                            the issue
                          </p>
                        </div>
                        <div className="flex gap-3">
                          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-xs font-medium text-blue-600 dark:text-blue-400">
                            3
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Deposit the reward amount to the smart contract
                          </p>
                        </div>
                        <div className="flex gap-3">
                          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-xs font-medium text-blue-600 dark:text-blue-400">
                            4
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Contributors can work on the issue and submit pull
                            requests
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </>
            ) : (
              <div className="mx-auto text-center w-max-sm pt-40">
                <div className="text-center font-bold text-7xl pb-4">
                  Create Maintainer Wallet
                </div>
                <div className="text-sm text-neutral-600 dark:text-neutral-400 text-center max-w-2xl mx-auto space-y-4">
                  <p className="text-base font-medium">
                    Execute the contract below to Create an Escrow account for
                    the Maintainer where they can store and transact through.
                  </p>

                  <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-4">
                    <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                      What is a Maintainer Wallet?
                    </h3>
                    <p className="text-blue-700 dark:text-blue-300 text-sm">
                      A smart contract-based escrow wallet that securely holds
                      bounty funds and automatically releases payments when
                      issues are resolved.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                      <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2 flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Security Features
                      </h4>
                      <ul className="text-green-700 dark:text-green-300 text-xs space-y-1">
                        <li>• Immutable smart contract logic</li>
                        <li>• Automated fund release</li>
                        <li>• Transparent transaction history</li>
                        <li>• No third-party custody</li>
                      </ul>
                    </div>

                    <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                      <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-2 flex items-center">
                        <Wallet className="h-4 w-4 mr-2" />
                        Wallet Functions
                      </h4>
                      <ul className="text-purple-700 dark:text-purple-300 text-xs space-y-1">
                        <li>• Deposit bounty rewards</li>
                        <li>• Withdraw available funds</li>
                        <li>• Track contract balance</li>
                        <li>• Manage multiple bounties</li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mt-4">
                    <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-2 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      Important Notes
                    </h4>
                    <ul className="text-amber-700 dark:text-amber-300 text-xs space-y-1 text-left">
                      <li>• One-time setup required per maintainer</li>
                      <li>• Gas fees apply for contract deployment</li>
                      <li>
                        • Wallet address will be permanently linked to your
                        account
                      </li>
                      <li>
                        • Contract includes initial balance of 100 wei for
                        testing
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="pt-8">
                  <Button
                    onClick={() => createContract()}
                    disabled={isDeploying}
                    className="px-8 py-3 text-lg font-semibold"
                  >
                    {isDeploying ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Deploying Contract...
                      </>
                    ) : (
                      <>
                        <Wallet className="h-5 w-5 mr-2" />
                        Create Wallet
                      </>
                    )}
                  </Button>

                  {error && (
                    <div className="mt-4 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <p className="text-red-700 dark:text-red-300 text-sm">
                        {error}
                      </p>
                    </div>
                  )}

                  {contractAddress && (
                    <div className="mt-4 p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <p className="text-green-700 dark:text-green-300 text-sm">
                        ✅ Wallet created successfully! Address:{" "}
                        <code className="bg-green-100 dark:bg-green-900 px-1 rounded">
                          {contractAddress}
                        </code>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          </div>
      </Suspense>
    </>
  );
}

