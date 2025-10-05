"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { CheckCircle, XCircle, Clock, User, Mail, FileText, ExternalLink } from "lucide-react";
import { useSession } from "next-auth/react";

interface ContributorApplication {
  id: string;
  username: string;
  projectName: string;
  name: string;
  email: string;
  bio: string;
  whyContribute: string;
  exampleProjects: string;
  languages: string[];
  frameworks: string[];
  tools: string[];
  otherSkills: string;
  resumeUrl: string;
  samplePatchesUrl: string;
  prLinks: string;
  accessLevel: string;
  status: string;
  submittedAt: string;
  fullName: string;
}

interface ContributorApplicationsApprovalProps {
  repo_name: string;
}

export default function ContributorApplicationsApproval({ repo_name }: ContributorApplicationsApprovalProps) {
  const { data: session } = useSession();
  const [applications, setApplications] = useState<ContributorApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchApplications();
  }, [repo_name]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/contributor-applications?projectName=${repo_name}`);
      const data = await response.json();
      setApplications(data.applications || []);
    } catch (error) {
      console.error("Error fetching applications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (applicationId: string, newStatus: 'approved' | 'rejected') => {
    try {
      setProcessingId(applicationId);
      const response = await fetch('/api/contributor-applications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          applicationId,
          status: newStatus,
        }),
      });

      if (response.ok) {
        // Update local state
        setApplications(prev => 
          prev.map(app => 
            app.id === applicationId 
              ? { ...app, status: newStatus }
              : app
          )
        );
      } else {
        console.error('Failed to update application status');
      }
    } catch (error) {
      console.error('Error updating application status:', error);
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="px-10 py-5">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p>Loading contributor applications...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-10 py-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold lg:text-2xl font-semibold">
            Contributor Applications ({applications.length})
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Review and approve contributor applications for {repo_name}
          </p>
        </div>
      </div>

      {applications.length === 0 ? (
        <div className="text-center py-12">
          <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Applications Yet</h3>
          <p className="text-muted-foreground">
            No contributor applications have been submitted for this repository yet.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((application) => (
            <Card key={application.id} className="w-full">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <User className="h-8 w-8 text-muted-foreground" />
                    <div>
                      <CardTitle className="text-lg">{application.fullName || application.name}</CardTitle>
                      <CardDescription className="flex items-center space-x-2">
                        <Mail className="h-4 w-4" />
                        <span>{application.email}</span>
                        <span>•</span>
                        <span>@{application.username}</span>
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(application.status)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Bio and Why Contribute */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">Bio</h4>
                      <p className="text-sm text-muted-foreground">{application.bio || 'No bio provided'}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Why Contribute</h4>
                      <p className="text-sm text-muted-foreground">{application.whyContribute || 'No reason provided'}</p>
                    </div>
                  </div>

                  {/* Skills */}
                  <div>
                    <h4 className="font-semibold mb-2">Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {application.languages?.map((lang, index) => (
                        <Badge key={index} variant="secondary">{lang}</Badge>
                      ))}
                      {application.frameworks?.map((framework, index) => (
                        <Badge key={index} variant="outline">{framework}</Badge>
                      ))}
                      {application.tools?.map((tool, index) => (
                        <Badge key={index} variant="outline">{tool}</Badge>
                      ))}
                    </div>
                  </div>

                  {/* Links and Files */}
                  <div className="flex flex-wrap gap-4">
                    {application.resumeUrl && (
                      <a href={application.resumeUrl} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm">
                          <FileText className="h-4 w-4 mr-2" />
                          Resume
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </Button>
                      </a>
                    )}
                    {application.samplePatchesUrl && (
                      <a href={application.samplePatchesUrl} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm">
                          <FileText className="h-4 w-4 mr-2" />
                          Sample Patches
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </Button>
                      </a>
                    )}
                  </div>

                  {/* Action Buttons */}
                  {application.status === 'pending' && (
                    <div className="flex space-x-2 pt-4 border-t">
                      <Button
                        onClick={() => handleStatusUpdate(application.id, 'approved')}
                        disabled={processingId === application.id}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        onClick={() => handleStatusUpdate(application.id, 'rejected')}
                        disabled={processingId === application.id}
                        variant="destructive"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}