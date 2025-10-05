import Home from './homepage-client'
import { auth } from '../../../auth'
import {getAllProjects} from '@/actions/addProjects'
import {ProjectTable as ProjectType} from '@/db/types'
export default async function homepage(){
  const session = await auth();
  const currentUser = session?.user?.username as string;
  const repo= await getAllProjects();
  const repoData = repo.project as ProjectType[] ?? [];
  return(
    <>
    <Home session={session} repoData={repoData} />
    </>
  )
}