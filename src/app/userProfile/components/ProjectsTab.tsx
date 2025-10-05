"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { ProjectCard } from "@/app/hacks/[id]/components/ProjectCard";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

export default function ProjectsTab({ userIdProp }: { userIdProp?: string }) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  // results: { [projectId]: { loading?: boolean, success?: boolean, url?: string, error?: string } }
  const [results, setResults] = useState<Record<string, any>>({});

  const userId =
    userIdProp ||
    (session?.user?.username as string) ||
    session?.user?.email;

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/user-projects?userId=${userId}`);
      const json = await res.json();
      if (json.success) setProjects(json.projects || []);
      else setProjects([]);
    } catch (err) {
      console.error(err);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchExistingCertificates = async () => {
    if (!userId) return;
    
    try {
      const certs = await fetch(`/api/user-certs?userId=${userId}`);
      const certsData = await certs.json();
      
      // Create a map of projectId -> certificate data
      const certsMap: Record<string, any> = {};
      certsData.forEach((cert: any) => {
        certsMap[cert.project_id] = {
          success: true,
          alreadyExists: true,
          url: cert.url || `https://gateway.pinata.cloud/ipfs/${cert.ipfs_hash}`,
          ipfsHash: cert.ipfs_hash
        };
      });
      
      setResults(certsMap);
    } catch (err) {
      console.error("Error fetching existing certificates:", err);
    }
  };

  useEffect(() => {
    if (!userId) return;
    fetchProjects();
    fetchExistingCertificates();
  }, [userId]);

  const handleGenerate = async (projectId: string) => {
    setResults((s) => ({
      ...s,
      [projectId]: { loading: true, success: undefined, error: undefined, url: undefined },
    }));
    try {
      const res = await fetch(
        `/api/hacks/project/${projectId}/generate-certificate`,
        { 
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId })
        }
      );
      const json = await res.json();
      setResults((s) => ({
        ...s,
        [projectId]: { ...json, loading: false },
      }));
    } catch (err) {
      console.error(err);
      setResults((s) => ({
        ...s,
        [projectId]: {
          loading: false,
          success: false,
          error: "Network error",
        },
      }));
    }
  };

  if (loading)
    return (
      <div className="h-40 flex items-center justify-center">
        <Loader2 className="animate-spin mr-2" /> Loading projects...
      </div>
    );

  if (!projects || projects.length === 0)
    return <div className="text-neutral-500">No projects found.</div>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {projects.map((row: any) => {
        const result = results[row.project.id] || {};
        const hasCertificate = result.success || result.alreadyExists;
        const certificateUrl = result.url;
        
        return (
          <div key={row.project.id} className="space-y-2">
            <ProjectCard project={row.project} />
            <div className="flex items-center gap-2">
              <Button
                onClick={() => handleGenerate(row.project.id)}
                disabled={result.loading || hasCertificate}
                variant={hasCertificate ? "secondary" : "default"}
              >
                {result.loading ? (
                  <>
                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                    Generating...
                  </>
                ) : hasCertificate ? (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
                    Certificate Ready
                  </>
                ) : (
                  "Generate Certificate"
                )}
              </Button>
              {/* Show result only after user clicks or if certificate already exists */}
              {result.loading ? (
                <span className="text-sm text-neutral-500">Generating certificate...</span>
              ) : hasCertificate && certificateUrl ? (
                <a
                  href={certificateUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 text-sm flex items-center gap-1"
                >
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  {result.alreadyExists ? "View Certificate" : "View on IPFS"}
                </a>
              ) : result.success === false && result.error ? (
                <span className="text-red-500 text-sm flex items-center gap-1">
                  <XCircle className="h-4 w-4" />
                  {result.error || "Failed"}
                </span>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
