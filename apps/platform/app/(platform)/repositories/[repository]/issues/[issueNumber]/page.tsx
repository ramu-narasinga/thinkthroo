import { IssueDetailView } from "./components/IssueDetailView";

interface PageProps {
  params: Promise<{ repository: string; issueNumber: string }>;
}

export default async function IssueDetailPage({ params }: PageProps) {
  const { repository, issueNumber } = await params;
  const repositoryFullName = decodeURIComponent(repository);
  const issueNum = parseInt(issueNumber, 10);

  return <IssueDetailView repositoryFullName={repositoryFullName} issueNumber={issueNum} />;
}
