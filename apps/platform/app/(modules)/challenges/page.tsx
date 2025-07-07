import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "@/components/interfaces/page/header";
import { Challenge } from "@/components/interfaces/modules/challenge";
import { getChallenges } from "@/lib/challenges";

type Tag = {
  title: string;
}

type Course = {
  title: string;
  description: string;
  slug: string;
  chapters: number;
  lessons: number;
  concept: {
    label: string;
    slug: string;
  };
  tags: Tag[];
};

export default async function ChallengesPage() {
  const challenges = await getChallenges();

  return (
    <div className="container relative">
      <PageHeader>
        <PageHeaderHeading>Coding Challenges for Senior Engineers</PageHeaderHeading>
        <PageHeaderDescription>
          Bring your best techniques and patterns to solve the challenges.
        </PageHeaderDescription>
        {/* <PageActions>
          
        </PageActions> */}
      </PageHeader>

      <div className="grid flex-1 gap-12">
        <div
          id="open-source-projects"
          className="grid flex-1 scroll-mt-20 items-start gap-10 md:grid-rows-2 lg:grid-rows-3"
        >
          {challenges.map((challenge) => (
            <Challenge key={challenge.slug.current} {...challenge} />
          ))}
        </div>
      </div>
    </div>
  );
}
