import { auth } from "../../../auth";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import Sidebar from "../../assets/components/sidebar";

import { Suspense } from "react";
import Link from "next/link";
import { getProjects } from "../../actions/addProjects";
import { getAllIssues } from "../../actions/show-issues";
import { getContributionsByUser } from "../../actions/contributions";
import AssignedProjectsClient from "./assigned-projects-client";
import { SidebarProvider } from "@/assets/components/SidebarContext";
// Using local interfaces from AssignedProjectsClient component



export default async function Component() {
  const session = await auth();
  const currentUser = session?.user?.username;

  if (!currentUser) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-[400px]">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>
              Please sign in to view your assigned projects and issues.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Link href="/Login">
              <Button>Sign In</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  try {

    const projectsResult = await getProjects(currentUser);
    const projects = projectsResult.project ?? [];

    const userIssuesResult = await getAllIssues(currentUser);
    const userIssues = userIssuesResult.data ?? [];
    
    const assignedIssuesResult = await getContributionsByUser(currentUser!);
    const assignedIssues = assignedIssuesResult.data ?? [];

    return (
      <Suspense>
        <SidebarProvider>
          <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex-1">
             
              <AssignedProjectsClient
                projects={projects}
                userIssues={userIssues}
                assignedIssues={assignedIssues}
              />
            </div>
          </div>
        </SidebarProvider>
      </Suspense>
    );
  } catch (error) {
    console.error("Error fetching data:", error);
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-[400px]">
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>
              There was an error fetching data. Please try again later.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }
}