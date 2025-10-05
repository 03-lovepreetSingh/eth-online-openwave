
import CreateIssueClient from "./create-issue-client";
import { auth } from "../../../auth";
import { Suspense } from "react";
import { fetchGithubIssueDetails, fetchGithubIssuesByUser } from "@/actions/github";
import {getManagedProjects} from "@/actions/manage-projects";
import type { ProjectTable , User } from "@/db/types";
import { getUserProfile } from "@/actions/public-profile";
export default async function Project() {
  const session = await auth();
  const currentUser = session?.user?.username;

  if (!currentUser) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-[400px] border p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
          <p className="mb-4">Please sign in to create issues.</p>
          <a href="/Login" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Sign In
          </a>
        </div>
      </div>
    );
  }
  try{
    const managedProjects = await getManagedProjects(currentUser);
    const userProfile = await getUserProfile(currentUser);
    const userProfileData = userProfile.data as User;
    const managedProjectsData = managedProjects.data as ProjectTable[]
    const repos = await fetchGithubIssuesByUser(session?.accessToken as string, currentUser, "openwave");
    const userData = await fetchGithubIssueDetails(session?.accessToken as string, currentUser, "openwave", "1");
    console.log("Fetched Repos:", repos);
    console.log("Fetched User Data:", userData);
    return (
    <>
      <Suspense>
        <div className="flex min-h-screen">
            <CreateIssueClient
              session={{ session }}
              managedProjects={ managedProjectsData }
              userProfile={userProfileData}
            />
        </div>
      </Suspense>
    </>
  );

  }
  catch(error){
    console.error("Error fetching data:", error);
  }
  
}
