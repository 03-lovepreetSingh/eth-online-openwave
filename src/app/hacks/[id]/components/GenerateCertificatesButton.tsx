"use client";

import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { userProfileAbi, userProfileContract } from "@/app/userProfile/abi";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, AlertCircle } from "lucide-react";

export default function GenerateCertificatesButton({ hackathonId }: { hackathonId: string }) {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [mintingStatus, setMintingStatus] = useState<string | null>(null);
  const [mintHash, setMintHash] = useState<string | null>(null);
  const [mintingProjects, setMintingProjects] = useState<Set<string>>(new Set());
  const [mintedProjects, setMintedProjects] = useState<Set<string>>(new Set());
  const [currentMintingProject, setCurrentMintingProject] = useState<string | null>(null);
  
  const { address, isConnected } = useAccount();
  const { writeContract: writeContractMint, isPending: isMinting, error: mintError } = useWriteContract();
  const { isLoading: isConfirmingMint, isSuccess: isMintConfirmed, error: confirmationError } = useWaitForTransactionReceipt({ hash: mintHash as `0x${string}` });

  const mintCertificateNFT = async (projectId: string, ipfsHash: string, projectName: string, ownerId: string) => {
    if (!address || !isConnected) {
      setMintingStatus("Please connect your wallet to mint NFT");
      return;
    }

    // Track that this project is being minted
    setMintingProjects(prev => new Set(prev).add(projectId));
    setCurrentMintingProject(projectId); // Set the current project being minted

    try {
      // Create metadata for the certificate NFT
      const metadata = {
        name: `Certificate: ${projectName}`,
        description: `Completion certificate for project ${projectName} in hackathon ${hackathonId}`,
        image: `ipfs://${ipfsHash}`,
        external_url: `https://gateway.pinata.cloud/ipfs/${ipfsHash}`,
        attributes: [
          { trait_type: "Type", value: "Certificate" },
          { trait_type: "Project", value: projectName },
          { trait_type: "Hackathon", value: hackathonId },
          { trait_type: "Issued", value: new Date().toISOString() },
          { trait_type: "Recipient", value: ownerId }
        ]
      };

      // For now, we'll use the IPFS hash directly as the token URI
      // In a real implementation, you'd upload this metadata to IPFS first
      const tokenURI = `ipfs://${ipfsHash}`; // This should be the metadata URI

      const result = await writeContractMint({
        address: userProfileContract as `0x${string}`,
        abi: userProfileAbi,
        functionName: "mint",
        args: [address, tokenURI], // Minting to the connected wallet for now
      });

      // @ts-expect-error - result is not typed
      if (result?.hash) {
        // @ts-expect-error - result is not typed
        setMintHash(result.hash);
        setMintingStatus(`NFT minting transaction submitted for ${projectName}. Please confirm in your wallet...`);
      }
    } catch (error) {
      console.error("Error minting NFT:", error);
      setMintingStatus(`Failed to mint NFT for ${projectName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      // Remove from minting projects
      setMintingProjects(prev => {
        const newSet = new Set(prev);
        newSet.delete(projectId);
        return newSet;
      });
      setCurrentMintingProject(null); // Clear the current project being minted
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    setResults([]);
    setMintingStatus(null);
    try {
      const res = await fetch(`/api/hacks/${hackathonId}/generate-certificates`, { method: "POST" });
      const json = await res.json();
      if (json.success) {
        setResults(json.results || []);
        // Remove auto-minting - users will now manually mint NFTs
      } else {
        alert(json.error || "Failed");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to generate certificates");
    } finally {
      setLoading(false);
    }
  };

  const mintAllNFTs = async () => {
    if (!address || !isConnected) {
      setMintingStatus("Please connect your wallet to mint NFTs");
      return;
    }

    const availableProjects = results.filter(r => r.ipfsHash && !mintedProjects.has(r.projectId) && !mintingProjects.has(r.projectId));
    
    if (availableProjects.length === 0) {
      setMintingStatus("No projects available for minting");
      return;
    }

    setMintingStatus(`Starting to mint NFTs for ${availableProjects.length} projects...`);
    
    for (const result of availableProjects) {
      await mintCertificateNFT(result.projectId, result.ipfsHash, result.projectName, result.ownerId);
      // Add a small delay between mints to avoid overwhelming the blockchain
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    setMintingStatus("All NFT minting transactions submitted. Please confirm each one in your wallet.");
  };

  // Update minting status based on transaction state
  useEffect(() => {
    if (isMinting) {
      setMintingStatus("Please confirm the NFT minting transaction in your wallet...");
    } else if (isConfirmingMint) {
      setMintingStatus("Waiting for transaction confirmation...");
    } else if (isMintConfirmed) {
      setMintingStatus("NFT minted successfully!");
      // Add to minted projects if we have a current project being tracked
      if (currentMintingProject) {
        setMintedProjects(prev => new Set(prev).add(currentMintingProject));
      }
      setTimeout(() => setMintingStatus(null), 5000);
    } else if (mintError) {
      setMintingStatus(`Transaction failed: ${mintError.message}`);
    } else if (confirmationError) {
      setMintingStatus(`Transaction confirmation failed: ${confirmationError.message}`);
    }
  }, [isMinting, isConfirmingMint, isMintConfirmed, mintError, confirmationError, mintHash, currentMintingProject]);

  return (
    <div className="pt-2 flex items-center gap-2 flex-wrap">
      <Button disabled={loading} onClick={handleGenerate}>
        {loading ? "Generating..." : "Generate Certificates"}
      </Button>

      {/* Mint All Button */}
      {!loading && results.length > 0 && isConnected && (
        <Button 
          onClick={mintAllNFTs}
          disabled={results.filter(r => r.ipfsHash && !mintedProjects.has(r.projectId) && !mintingProjects.has(r.projectId)).length === 0}
          variant="outline"
          className="text-xs"
        >
          Mint All Available NFTs
        </Button>
      )}

      {/* Wallet Connection Warning */}
      {!isConnected && (
        <div className="w-full mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            <strong>Wallet Required:</strong> Please connect your wallet to mint NFTs for the generated certificates.
          </p>
        </div>
      )}

      {/* Info Note */}
      <div className="w-full mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          <strong>Note:</strong> This will generate certificates for all projects. After generation, you can manually mint NFTs for each certificate 
          by clicking the "Mint NFT" button. Each certificate will be stored on IPFS and represented as a unique NFT.
        </p>
      </div>

      {/* Minting Status Alert */}
      {mintingStatus && (
        <Alert
          className={`mb-2 ${
            isMintConfirmed
              ? "bg-green-100 border-green-400 text-green-700"
              : confirmationError || mintError
              ? "bg-red-100 border-red-400 text-red-700"
              : ""
          }`}
        >
          <div className="flex items-center gap-2">
            {isMintConfirmed ? (
              <CheckCircle className="h-4 w-4" />
            ) : confirmationError || mintError ? (
              <AlertCircle className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertTitle className="text-sm">
              {isMintConfirmed
                ? "Success"
                : confirmationError || mintError
                ? "Error"
                : "Notice"}
            </AlertTitle>
          </div>
          <AlertDescription className="text-sm mt-1">
            {mintingStatus}
          </AlertDescription>
        </Alert>
      )}

      {!loading && results.length > 0 && (
        <ul className="mt-4 space-y-2">
          {results.map(r => (
            <li key={r.projectId} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex-1">
                <div className="font-medium text-gray-900 dark:text-gray-100">
                  {r.projectName}
                </div>
                {r.ipfsHash ? (
                  <a 
                    href={r.url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {r.ipfsHash}
                  </a>
                ) : (
                  <span className="text-sm text-red-600 dark:text-red-400">Error: {r.error}</span>
                )}
              </div>
              <div className="ml-4 flex items-center gap-2">
                {r.ipfsHash ? (
                  <Button
                    size="sm"
                    onClick={() => mintCertificateNFT(r.projectId, r.ipfsHash, r.projectName, r.ownerId)}
                    disabled={mintingProjects.has(r.projectId) || !isConnected}
                    className="text-xs"
                  >
                    {mintingProjects.has(r.projectId) ? "Minting..." : "Mint NFT"}
                  </Button>
                ) : null}
                <div className="ml-2">
                  {mintingProjects.has(r.projectId) ? (
                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 dark:bg-blue-900 dark:text-blue-200 rounded-full">
                      Minting...
                    </span>
                  ) : mintedProjects.has(r.projectId) ? (
                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-green-800 bg-green-100 dark:bg-green-900 dark:text-green-200 rounded-full">
                      Minted ✓
                    </span>
                  ) : r.ipfsHash ? (
                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-800 bg-gray-100 dark:bg-gray-700 dark:text-gray-200 rounded-full">
                      Ready to Mint
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-red-800 bg-red-100 dark:bg-red-900 dark:text-red-200 rounded-full">
                      Failed
                    </span>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      {loading && <p>Generating...</p>}
    </div>
  );
}