"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card"
import { Textarea } from "../../components/ui/textarea"
import {Input} from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Checkbox } from "../../components/ui/checkbox"
import { Loader2, CheckCircle2, XCircle, Wallet } from "lucide-react"
import { cn } from "../../lib/utils"
import { useAccount } from "wagmi"
import { useReadContract } from "wagmi"
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther, formatEther, isAddress } from "viem";
import { useSession } from "next-auth/react"
const COOLDOWN_PERIOD_MS = 48 * 60 * 60 * 1000 // 48 hours in milliseconds
const WALLET_ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/
import {faucetabi} from '../../../abi'
import Sidebar from "../../assets/components/sidebar";
import Topbar from "../../assets/components/topbar";
import { useSidebarContext } from "../../assets/components/SidebarContext";

const FAUCET_CONTRACT_ADDRESS = "0x3FCF23De6e128bC045c3370E675Ec9FD368c4928";

interface UserStatus {
  isRegistered: boolean
  canClaim: boolean
  lastClaimTime: number | null
  username: string
  status: "checking" | "not_registered" | "registered" | "can_claim" | "cooldown" | "claiming" | "claimed" | "error"
  message?: string
}

interface Session{
data:{
 user: {
    username: string
  }
}

}

export default function FaucetPage() {
  const {data: session} = useSession() as Session;
  const { isShrunk } = useSidebarContext();
  const { address, isConnected } = useAccount();
  
  const {
    data: hash,
    isPending,
    writeContract,
    error: writeError,
  } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });
  
  // Contract read hooks - moved to top level to fix hook rules
  const { data: contractBalance } = useReadContract({
    abi: faucetabi,
    address: FAUCET_CONTRACT_ADDRESS,
    functionName: 'getContractBalance',
  });
  
  const { data: userRegisteredUsername, refetch: refetchUsername } = useReadContract({
    abi: faucetabi,
    address: FAUCET_CONTRACT_ADDRESS,
    functionName: 'getUsername',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && isConnected,
    },
  });
  
  const { data: isUsernameRegistered, refetch: refetchUsernameRegistered } = useReadContract({
    abi: faucetabi,
    address: FAUCET_CONTRACT_ADDRESS,
    functionName: 'isUsernameRegistered',
    args: session?.user?.username ? [session.user.username] : undefined,
    query: {
      enabled: !!session?.user?.username,
    },
  });
  
  const { data: canUserClaim, refetch: refetchCanClaim } = useReadContract({
    abi: faucetabi,
    address: FAUCET_CONTRACT_ADDRESS,
    functionName: 'canClaim',
    args: session?.user?.username ? [session.user.username] : undefined,
    query: {
      enabled: !!session?.user?.username && !!isUsernameRegistered,
    },
  });
  
  const [userStatus, setUserStatus] = useState<UserStatus>({
    isRegistered: false,
    canClaim: false,
    lastClaimTime: null,
    username: '',
    status: 'checking'
  });
  
  const [globalStatusMessage, setGlobalStatusMessage] = useState<{
    type: "success" | "error" | "info"
    message: string
  } | null>(null);
  
  // Check user registration status
  useEffect(() => {
    if (!isConnected || !address || !session?.user?.username) {
      setUserStatus({
        isRegistered: false,
        canClaim: false,
        lastClaimTime: null,
        username: '',
        status: 'checking',
        message: 'Please connect wallet and sign in'
      });
      return;
    }
    
    const checkUserStatus = async () => {
      try {
        setUserStatus(prev => ({ ...prev, status: 'checking' }));
        
        // Check if username is registered
        const isRegistered = !!isUsernameRegistered;
        const registeredUsername = userRegisteredUsername as string || '';
        
        if (!isRegistered) {
          setUserStatus({
            isRegistered: false,
            canClaim: false,
            lastClaimTime: null,
            username: session?.user?.username,
            status: 'not_registered',
            message: 'You need to register first'
          });
          return;
        }
        
        // Check if user can claim
        const canClaim = !!canUserClaim;
        
        setUserStatus({
          isRegistered: true,
          canClaim,
          lastClaimTime: null, // We could add this to the contract if needed
          username: registeredUsername,
          status: canClaim ? 'can_claim' : 'cooldown',
          message: canClaim ? 'Ready to claim!' : 'Still in cooldown period'
        });
        
      } catch (error) {
        console.error('Error checking user status:', error);
        setUserStatus(prev => ({
          ...prev,
          status: 'error',
          message: 'Error checking registration status'
        }));
      }
    };
    
    checkUserStatus();
  }, [isConnected, address, session?.user?.username, isUsernameRegistered, userRegisteredUsername, canUserClaim]);
  
  // Handle contract balance
  useEffect(() => {
    if (contractBalance) {
      console.log('Contract balance:', formatEther(contractBalance as bigint));
    }
  }, [contractBalance]);
  
  // Handle transaction confirmation
  useEffect(() => {
    if (isConfirmed) {
      setGlobalStatusMessage({
        type: 'success',
        message: 'Transaction confirmed successfully!'
      });
      // Refetch user data after successful transaction
      setTimeout(() => {
        refetchUsername();
        refetchUsernameRegistered();
        refetchCanClaim();
      }, 2000);
    }
  }, [isConfirmed, refetchUsername, refetchUsernameRegistered, refetchCanClaim]);
  
  const register = async () => {
    if (!isConnected || !address) {
      setGlobalStatusMessage({ type: "error", message: "Please connect your wallet first." });
      return;
    }
    
    if (!session?.user?.username) {
      setGlobalStatusMessage({ type: "error", message: "Please sign in first." });
      return;
    }
    
    try {
      setUserStatus(prev => ({ ...prev, status: 'checking' }));
      setGlobalStatusMessage({ type: "info", message: "Registering username..." });
      
      await writeContract({
        address: FAUCET_CONTRACT_ADDRESS,
        abi: faucetabi,
        functionName: "register",
        args: [session.user.username],
      });
      
    } catch (error) {
      console.error("Registration failed:", error);
      const message = error instanceof Error ? error.message : "Unknown error";
      setGlobalStatusMessage({ type: "error", message: `Registration failed: ${message}` });
      setUserStatus(prev => ({ ...prev, status: 'error' }));
    }
  };
  
  const claimEther = async () => {
    if (!isConnected || !address) {
      setGlobalStatusMessage({ type: "error", message: "Please connect your wallet first." });
      return;
    }
    
    if (!userStatus.isRegistered) {
      setGlobalStatusMessage({ type: "error", message: "Please register first." });
      return;
    }
    
    if (!userStatus.canClaim) {
      setGlobalStatusMessage({ type: "error", message: "You cannot claim yet. Please wait for cooldown period." });
      return;
    }
    
    try {
      setUserStatus(prev => ({ ...prev, status: 'claiming' }));
      setGlobalStatusMessage({ type: "info", message: "Claiming Ether..." });
      
      await writeContract({
        address: FAUCET_CONTRACT_ADDRESS,
        abi: faucetabi,
        functionName: "claimEther",
      });
      
    } catch (error) {
      console.error("Claim failed:", error);
      const message = error instanceof Error ? error.message : "Unknown error";
      setGlobalStatusMessage({ type: "error", message: `Claim failed: ${message}` });
      setUserStatus(prev => ({ ...prev, status: 'error' }));
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'can_claim':
      case 'claimed':
        return 'text-green-600 dark:text-green-400';
      case 'cooldown':
        return 'text-blue-600 dark:text-blue-400';
      case 'error':
      case 'not_registered':
        return 'text-red-600 dark:text-red-400';
      case 'claiming':
      case 'checking':
        return 'text-yellow-600 dark:text-yellow-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'claiming':
      case 'checking':
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'can_claim':
      case 'claimed':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'error':
      case 'not_registered':
        return <XCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };
  
  return (
    <>
      <div className="flex min-h-screen">
        <Sidebar />
        <div
          className={`w-full transition-all duration-300 ${
            isShrunk ? "md:ml-[4rem]" : "md:ml-[16rem]"
          }`}
        >
          <Topbar />
          <div className="flex min-h-screen bg-gray-100 dark:bg-gray-950">
            {/* Side Screen */}
            <div className="hidden md:flex md:w-1/2 lg:w-2/5 items-center justify-center p-8 bg-gradient-to-br from-purple-600 to-indigo-800 text-white relative overHBAR-hidden">
              <div className="absolute inset-0 z-0 opacity-20">
                <img
                  src="/placeholder.svg?height=1080&width=1920"
                  alt="Background pattern"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="relative z-10 text-center max-w-md space-y-6">
                <Wallet className="h-24 w-24 mx-auto text-white/80" />
                <h1 className="text-4xl font-bold tracking-tight">Ether Faucet</h1>
                <p className="text-lg text-white/90">
                  Get your free Ether here! We distribute 0.5 ETH to registered users every 48 hours.
                  Register your username and claim your share.
                </p>
                <p className="text-sm text-white/70">
                  Contract Balance: {contractBalance ? formatEther(contractBalance as bigint) : '0'} ETH
                </p>
              </div>
            </div>
            
            {/* Faucet Form */}
            <div className="flex-1 flex items-center justify-center p-4 md:p-8">
              <div className="w-full px-10">
                <div>
                  <div className="flex justify-between pb-3">
                    <div className="text-2xl font-bold">
                      Claim Ether Testnet Tokens
                    </div>
                    <div className="text-sm text-neutral-500">
                      (0.5 ETH every 48 hours)
                    </div>
                  </div>
                </div>
                
                <div className="grid gap-4">
                  {/* User Status Card */}
                  <div className="border rounded-lg p-4 bg-white dark:bg-gray-900">
                    <Label className="text-lg font-semibold mb-3 block">Account Status</Label>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span>Wallet:</span>
                        <span className="text-sm font-mono">
                          {isConnected ? `${address?.slice(0, 6)}...${address?.slice(-4)}` : 'Not connected'}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span>Username:</span>
                        <span className="text-sm">
                          {session?.user?.username || 'Not signed in'}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span>Registration:</span>
                        <span className={cn("text-sm flex items-center gap-2", getStatusColor(userStatus.status))}>
                          {getStatusIcon(userStatus.status)}
                          {userStatus.isRegistered ? 'Registered' : 'Not registered'}
                        </span>
                      </div>
                      
                      {userStatus.isRegistered && (
                        <div className="flex items-center justify-between">
                          <span>Claim Status:</span>
                          <span className={cn("text-sm flex items-center gap-2", getStatusColor(userStatus.status))}>
                            {getStatusIcon(userStatus.status)}
                            {userStatus.canClaim ? 'Ready to claim' : 'Cooldown active'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="grid gap-2">
                    {!userStatus.isRegistered && userStatus.status !== 'checking' && (
                      <Button 
                        onClick={register} 
                        disabled={!isConnected || !session?.user?.username || isPending || isConfirming}
                        className="w-full"
                      >
                        {isPending || isConfirming ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {isPending ? 'Confirming...' : 'Processing...'}
                          </>
                        ) : (
                          'Register Username'
                        )}
                      </Button>
                    )}
                    
                    {userStatus.isRegistered && (
                      <Button 
                        onClick={claimEther}
                        disabled={!userStatus.canClaim || isPending || isConfirming || userStatus.status === 'claiming'}
                        className="w-full"
                      >
                        {isPending || isConfirming || userStatus.status === 'claiming' ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {isPending ? 'Confirming...' : isConfirming ? 'Processing...' : 'Claiming...'}
                          </>
                        ) : (
                          'Claim 0.5 ETH'
                        )}
                      </Button>
                    )}
                  </div>
                  
                  {/* Status Messages */}
                  {globalStatusMessage && (
                    <div
                      className={cn(
                        "flex items-center gap-2 p-3 rounded-md text-sm",
                        globalStatusMessage.type === "success" &&
                          "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
                        globalStatusMessage.type === "error" && "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
                        globalStatusMessage.type === "info" &&
                          "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
                      )}
                    >
                      {globalStatusMessage.type === "success" && <CheckCircle2 className="h-4 w-4" />}
                      {globalStatusMessage.type === "error" && <XCircle className="h-4 w-4" />}
                      {globalStatusMessage.type === "info" && <Loader2 className="h-4 w-4 animate-spin" />}
                      <span>{globalStatusMessage.message}</span>
                    </div>
                  )}
                  
                  {userStatus.message && (
                    <div className={cn("text-sm p-2 rounded", getStatusColor(userStatus.status))}>
                      {userStatus.message}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
