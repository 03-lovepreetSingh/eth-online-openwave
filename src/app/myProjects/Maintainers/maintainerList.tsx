"use client"
import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar"
import { Badge } from "../../../components/ui/badge"
import { Button } from "../../../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card"
import Link from "next/link"
import { Mail } from "lucide-react"
import { useSession } from "next-auth/react"
import { Octokit } from "octokit"

interface GithubCollaborator {
  login: string;
  id: number;
  email?: string | null;
  name?: string | null;
  node_id: string;
  avatar_url: string;
  gravatar_id: string | null;
  url: string;
  html_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  starred_url: string;
  subscriptions_url: string;
  organizations_url: string;
  repos_url: string;
  events_url: string;
  received_events_url: string;
  type: string;
  site_admin: boolean;
  permissions?: {
    admin?: boolean;
    maintain?: boolean;
    push?: boolean;
    triage?: boolean;
    pull?: boolean;
  };
  user_view_type?: string;
}

interface Maintainer {
  login: string
  avatar_url: string
  html_url: string
  isSignedUp: boolean
  [key: string]: any // for spreading extra fields
}

interface User {
  id: string | number;
  [key: string]: any;
}

interface MaintainerListProps {
  repoOwner: string
  repoName: string
  maintainers: Maintainer[]
}

export default function MaintainerList({ repoOwner, repoName, maintainers }: MaintainerListProps) {
  const { data: session } = useSession();
  const [maintainer, setMaintainers] = useState<GithubCollaborator[]>([]);
  const [admins, setAdmins] = useState<GithubCollaborator[]>([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [projectMaintainers, setProjectMaintainers] = useState<(string | number)[]>([]);

  const nonSignedUpMaintainers = maintainers.filter((m) => !m.isSignedUp)
  const octokit = new Octokit({
    auth: (session as any)?.accessToken,
  });

  useEffect(() => {
    const fetchMaintainers = async () => {
      if (!session) return;
      const response = await octokit.request('GET /repos/{owner}/{repo}/collaborators', {
        owner: repoOwner,
        repo: repoName,
      });
      const admin = response.data.filter(
        (collab: GithubCollaborator) => collab.permissions?.admin
      );
      const filtered = response.data.filter(
        (collab: GithubCollaborator) => !collab.permissions?.admin && (collab.permissions?.maintain || collab.permissions?.triage || collab.permissions?.push)
      );
      setAdmins(admin);
      setMaintainers(filtered);
    }
    fetchMaintainers();
  }, [session, repoOwner, repoName, octokit]);

  useEffect(() => {
    const fetchUsersAPI = async () => {
      if (!session) return;
      const response = await fetch('/api/checkMaintainers?mainatiner=["' + maintainer.map((m) => m.login).join('","') + '"]');
      const data = await response.json();
      setUsers(data.users);
    }
    fetchUsersAPI();
  }, [session, maintainer]);

  useEffect(() => {
    const fetchMaintainerProjects = async () => {
      if (!session) return;
      const response = await fetch('/api/maintainerProjects?projectName=' + repoName);
      const data = await response.json();
      setProjectMaintainers(data.maintainerUserIds);
    }
    fetchMaintainerProjects()
  }, [session, repoName]);

  const enhancedMaintainers: Maintainer[] = maintainer.map((m) => {
    // Try to match user by login (string) or id (number)
    const userData = users.find(user => user.id === m.login || user.id === m.id);
    return {
      ...m,
      userData: userData || null,
      isSignedUp: !!userData // Update isSignedUp based on whether user exists
    };
  });

  const filteredProjectMaintainers = enhancedMaintainers.filter(maintainer =>
    projectMaintainers && projectMaintainers.includes(maintainer.login)
  );

  const nonVerifiedfilteredProjectMaintainers = enhancedMaintainers.filter(maintainer =>
    projectMaintainers && !projectMaintainers.includes(maintainer.login)
  );

  const addContributor = async (maintainLogin: string) => {
    await fetch('/api/maintainerProjects', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectName: repoName,
        maintainerUserIds: [maintainLogin],
        action: 'append'
      })
    });
  }

  // Mailto link for all non-signed-up maintainers (existing functionality)
  const mailtoSubjectAll = encodeURIComponent(`Regarding GitHub Repository Maintainership for ${repoOwner}/${repoName}`)
  const mailtoBodyAll = encodeURIComponent(
    `Dear GitHub Maintainers,\n\n` +
    `This email is regarding your role as a maintainer for the repository ${repoOwner}/${repoName}.\n\n` +
    `We noticed that some maintainers are not yet signed up as users in our system. ` +
    `Please consider signing up to get full access to our internal tools and communications.\n\n` +
    `Best regards,\nYour Team`,
  )
  const mailtoLinkAll = `mailto:?subject=${mailtoSubjectAll}&body=${mailtoBodyAll}`

  return (
    <div className="w-full mx-auto py-8 px-4 md:px-6">
      {/* Changed max-w-3xl to max-w-5xl for a wider card */}
      <div className="w-full  mx-auto">
        <div>
          <div className="text-2xl font-bold">GitHub Repository Maintainers</div>
          <div>
            Details for maintainers of the{" "}
            <Link
              href={`https://github.com/${repoOwner}/${repoName}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              {repoOwner}/{repoName}
            </Link>{" "}
            repository.
          </div>
        </div>
        <div className="space-y-6">
          {/* Repository Owner */}
          <div className="space-y-2">
            <h2 className="text-xl font-semibold pt-4">Repository Owner</h2>
            <div className="flex pb-4 items-center gap-4 p-3 border rounded-md bg-accent/20">
              {
                admins.map((admin) => {
                  return (
                    <div key={admin.login} className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={admin.avatar_url} alt={`${admin.login}'s avatar`} />
                        <AvatarFallback>{admin.login.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="grid gap-1">
                        <Link
                          href={admin.html_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium hover:underline"
                        >
                          {admin.login} (Owner)
                        </Link>
                        <Badge variant="default">Signed Up</Badge> {/* Owner is always considered signed up for this context */}
                      </div>
                    </div>
                  )
                })
              }
            </div>
          </div>
          <div className="">
            <div className='lg:flex block pb-4 lg:justify-between'>
              <h2 className="text-xl font-semibold">Verified Maintainers</h2>
            </div>
            <div className="grid gap-4">
              {maintainers.length === 0 ? (
                <p className="text-muted-foreground">No other maintainers found for this repository.</p>
              ) : (
                filteredProjectMaintainers.map((maintainer) => {
                  // Individual mailto link for non-signed-up maintainers
                  const mailtoSubjectIndividual = encodeURIComponent(
                    `Regarding your maintainership for ${repoOwner}/${repoName}`,
                  )
                  const mailtoBodyIndividual = encodeURIComponent(
                    `Dear ${maintainer.login},\n\n` +
                    `This email is regarding your role as a maintainer for the repository ${repoOwner}/${repoName}.\n\n` +
                    `We noticed you are not yet signed up as a user in our system. ` +
                    `Please consider signing up to get full access to our internal tools and communications.\n\n` +
                    `Best regards,\nYour Team`,
                  )
                  const mailtoLinkIndividual = `mailto:?subject=${mailtoSubjectIndividual}&body=${mailtoBodyIndividual}`

                  return (
                    <div
                      key={maintainer.login}
                      className={`flex items-center gap-4 p-3 border rounded-md ${!maintainer.isSignedUp ? "bg-muted text-muted-foreground opacity-70" : "bg-card"
                        }`}
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={maintainer.avatar_url}
                          alt={`${maintainer.login}'s avatar`}
                        />
                        <AvatarFallback>{maintainer.login.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="grid gap-1 flex-1">
                        <Link
                          href={maintainer.html_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`font-medium ${!maintainer.isSignedUp ? "line-through" : "hover:underline"}`}
                        >
                          {maintainer.login}
                        </Link>
                        <p className="text-sm text-muted-foreground">
                          {maintainer.isSignedUp ? "Signed Up" : "Not Signed Up"}
                        </p>
                      </div>
                      <Badge variant={maintainer.isSignedUp ? "default" : "destructive"}>
                        {maintainer.isSignedUp ? "Active" : "Disabled"}
                      </Badge>
                      {!maintainer.isSignedUp && (
                        <Button asChild size="icon" variant="ghost" className="ml-2">
                          <Link href={mailtoLinkIndividual} aria-label={`Mail ${maintainer.login}`}>
                            <Mail className="h-5 w-5" />
                          </Link>
                        </Button>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </div>
          {/* Other Maintainers */}
          <div className="">
            <div className='lg:flex block pb-4 lg:justify-between'>
              <h2 className="text-xl font-semibold">Other Maintainers</h2>
              {nonSignedUpMaintainers.length > 0 && (
                <div className="flex lg:justify-end my-auto">
                  <Button asChild>
                    <Link href={mailtoLinkAll}>
                      <Mail className="mr-2 h-4 w-4" />
                      Mail All Non-Signed Up
                    </Link>
                  </Button>
                </div>
              )}
            </div>
            <div className="grid gap-4">
              {maintainers.length === 0 ? (
                <p className="text-muted-foreground">No other maintainers found for this repository.</p>
              ) : (
                nonVerifiedfilteredProjectMaintainers.map((maintainer) => {
                  // Individual mailto link for non-signed-up maintainers
                  const mailtoSubjectIndividual = encodeURIComponent(
                    `Regarding your maintainership for ${repoOwner}/${repoName}`,
                  )
                  const mailtoBodyIndividual = encodeURIComponent(
                    `Dear ${maintainer.login},\n\n` +
                    `This email is regarding your role as a maintainer for the repository ${repoOwner}/${repoName}.\n\n` +
                    `We noticed you are not yet signed up as a user in our system. ` +
                    `Please consider signing up to get full access to our internal tools and communications.\n\n` +
                    `Best regards,\nYour Team`,
                  )
                  const mailtoLinkIndividual = `mailto:?subject=${mailtoSubjectIndividual}&body=${mailtoBodyIndividual}`

                  return (
                    <div
                      key={maintainer.login}
                      className={`flex items-center gap-4 p-3 border rounded-md ${!maintainer.isSignedUp ? "bg-muted text-muted-foreground opacity-70" : "bg-card"
                        }`}
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={maintainer.avatar_url}
                          alt={`${maintainer.login}'s avatar`}
                        />
                        <AvatarFallback>{maintainer.login.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="grid gap-1 flex-1">
                        <Link
                          href={maintainer.html_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`font-medium ${!maintainer.isSignedUp ? "line-through" : "hover:underline"}`}
                        >
                          {maintainer.login}
                        </Link>
                        <p className="text-sm text-muted-foreground">
                          {maintainer.isSignedUp ? "Signed Up" : "Not Signed Up"}
                        </p>
                      </div>
                      {
                        maintainer.isSignedUp && (
                          <div>
                            <button onClick={() => addContributor(maintainer.login)} className="bg-neutral-800 text-[13px] text-neutral-200 px-2 py-1 rounded">
                              Add as Maintainer
                            </button>
                          </div>
                        )
                      }
                      {!maintainer.isSignedUp && (
                        <Button asChild size="icon" variant="ghost" className="ml-2">
                          <Link href={mailtoLinkIndividual} aria-label={`Mail ${maintainer.login}`}>
                            <Mail className="h-5 w-5" />
                          </Link>
                        </Button>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
