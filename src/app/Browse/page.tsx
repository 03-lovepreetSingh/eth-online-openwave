
import {getAllProjects} from '@/actions/addProjects';
import {ProjectTable as ProjectType} from '@/db/types'
import { auth } from "../../../auth";
import Browse from './browse-client'


interface session {
  accessToken?: string;
  expires?: string;
  user?: {
    username?: string;
    email?: string;
    name?: string;
    image?: string;
  };
}
export default async function getRepoData() {
  const session = await auth();
  const currentUser = session?.user?.username as string;
  const repo= await getAllProjects();
  const repoData = repo.project as ProjectType[] ?? [];
  const allLangs = new Set<string>();
          repoData.forEach((projects:ProjectType) => {
            if (projects.languages && typeof projects.languages === "object") {
              Object.keys(projects.languages).forEach((lang) =>
                allLangs.add(lang)
              );
            }
          });

          const availableLanguages = (Array.from(allLangs));

  return (
    <>
    <Browse repo={repoData as unknown as ProjectType[]} session={session as session} availableLanguages={availableLanguages}/>
    </>
  )
}