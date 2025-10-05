import { getProject } from "@/actions/projects";
import ProjectPageClient from "./project-page";
import { getProjectSplitPayments, getProjectVotes } from "@/actions/hacks";
import { Project, ProjectVotes, SplitPayment } from "@/db/types";

export default async function ProjectPage({params}: {params: {id: string}}) {
  const {id} =  await params;
  const project = await getProject(id) ;
  const votes = await getProjectVotes(id) ;
  const payments = await getProjectSplitPayments(id);
  
  if (!project || !votes || !payments || !votes.votes || !payments.payments) {
    return <div>Project not found</div>;
  }

  return <ProjectPageClient project={project[0] as Project} votes={votes.votes as ProjectVotes[]} payments={payments.payments as SplitPayment[]} />
}