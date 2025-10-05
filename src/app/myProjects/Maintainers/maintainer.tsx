"use client"
import MaintainerList from "./maintainerList"
import {useSession} from "next-auth/react";

 const SIGNED_UP_USERS: string[] = [
  "vercel", // Example: Vercel is signed up
  "shuding", // Example: A Next.js core contributor
  "leerob", // Example: Another Next.js core contributor
  "timneutkens", // Example: Another Next.js core contributor
  "mockuser1", // Example: A mock user who is signed up
  // Add more GitHub usernames here that you consider "signed up"
]


// Define mock GitHub repository details and collaborators
const MOCK_REPO_OWNER = "gurssagar"
const MOCK_REPO_NAME = "GITFUND"

const MOCK_REPO_DETAILS = {
  owner: {
    login: "mock-owner",
    avatar_url: "/placeholder.svg?height=100&width=100",
    html_url: "https://github.com/mock-owner",
  },
}

const MOCK_COLLABORATORS = [
  {
    login: "mock-owner", // Owner might also be in collaborators list
    avatar_url: "/placeholder.svg?height=100&width=100",
    html_url: "https://github.com/mock-owner",
  },
  {
    login: "mockuser1", // Signed up
    avatar_url: "/placeholder.svg?height=100&width=100",
    html_url: "https://github.com/mockuser1",
  },
  {
    login: "mockuser2", // Not signed up
    avatar_url: "/placeholder.svg?height=100&width=100",
    html_url: "https://github.com/mockuser2",
  },
  {
    login: "mockuser3", // Signed up
    avatar_url: "/placeholder.svg?height=100&width=100",
    html_url: "https://github.com/mockuser3",
  },
  {
    login: "mockuser4", // Not signed up
    avatar_url: "/placeholder.svg?height=100&width=100",
    html_url: "https://github.com/mockuser4",
  },
]

export default function Maintainer({repo_name}: {repo_name: string}) {
  // Use mock data instead of fetching from GitHub API
  const repoDetails = MOCK_REPO_DETAILS
  const collaborators = MOCK_COLLABORATORS
  const {data:session}=useSession();
  // Extract the owner details
  const owner = {
    login: repoDetails.owner.login,
    avatar_url: repoDetails.owner.avatar_url,
    html_url: repoDetails.owner.html_url,
    isSignedUp: true, // The owner is always considered signed up for this context
  }

  // Filter out the owner from the collaborators list if they are also listed there
  const filteredCollaborators = collaborators.filter((collab) => collab.login !== owner.login)

  // Map collaborators to include their signed-up status
  const maintainers = filteredCollaborators.map((collab) => ({
    login: collab.login,
    avatar_url: collab.avatar_url,
    html_url: collab.html_url,
    isSignedUp: SIGNED_UP_USERS.includes(collab.login),
  }))

  // Sort maintainers: signed up first, then by login for consistency
  maintainers.sort((a, b) => {
    if (a.isSignedUp && !b.isSignedUp) return -1 // Signed up users come first
    if (!a.isSignedUp && b.isSignedUp) return 1
    return a.login.localeCompare(b.login) // Then sort alphabetically by login
  })

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">{
        
        }
        {
            session &&  <MaintainerList repoOwner={session?.user?.username as string} repoName={repo_name} maintainers={maintainers} />
        }
       
      </main>
    </div>
  )
}
