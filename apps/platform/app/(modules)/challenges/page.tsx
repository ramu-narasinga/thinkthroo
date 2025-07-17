import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "@/components/interfaces/page/header";
import { Challenge } from "@/components/interfaces/modules/challenge";
import { getChallenges } from "@/lib/challenges";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

type Tag = {
  title: string;
};

export default async function ChallengesPage() {
  const challenges = await getChallenges();

  return (
    <div className="container relative">
      <PageHeader>
        <PageHeaderHeading>
          Coding Challenges for Senior Engineers
        </PageHeaderHeading>
        <PageHeaderDescription>
          Bring your best techniques and patterns to solve the challenges.
        </PageHeaderDescription>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-5  mt-8 ml-20">
        {/* Main Content */}
        <main className="lg:col-span-4">
          <div
            id="open-source-projects"
            className="grid gap-10 md:grid-cols-2 lg:grid-cols-2"
          >
            {challenges.map((challenge) => (
              <Challenge key={challenge.slug.current} {...challenge} />
            ))}
          </div>
        </main>

        {/* Sidebar Filters */}
        <div className="lg:col-span-1 -ml-8 mr-15 mb-12">
          <div className="relative group overflow-hidden">
            <div className="absolute right-0 top-0 h-full w-[2px] bg-transparent transition-all duration-300" />


            <div className="space-y-6">
              <Accordion type="multiple" className="w-full space-y-4">
                {/* Difficulty Filter */}
                <AccordionItem value="difficulty">
                <div className="pb-4 border-b border-gray-300">
    <AccordionTrigger className="text-md font-regular">
      Difficulty
    </AccordionTrigger>
    <AccordionContent>
                    <div className="flex flex-row gap-2 text-gray-500">
                      <div className="flex items-center gap-2">
                        <Checkbox id="easy" className="border-neutral-300" />
                        <Label htmlFor="easy" className="font-normal text-gray-500">
                          Easy
                        </Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox id="medium" className="border-neutral-300" />
                        <Label htmlFor="medium" className="font-normal text-gray-500">
                          Medium
                        </Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox id="hard" className="border-neutral-300" />
                        <Label htmlFor="hard" className="font-normal text-gray-500">
                          Hard
                        </Label>
                      </div>
                    </div>
                  </AccordionContent>
                  </div>
                </AccordionItem>

                {/* Progress Filter */}
                <AccordionItem value="progress">
                  <AccordionTrigger className="text-md font-regular">
                    Progress
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="flex flex-row gap-2 text-gray-500">
                      <div className="flex items-center gap-2">
                        <Checkbox id="completed" className="border-neutral-300" />
                        <Label htmlFor="completed" className="font-normal text-gray-500">
                          Completed
                        </Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox id="not-completed" className="border-neutral-300" />
                        <Label htmlFor="not-completed" className="font-normal text-gray-500">
                          Not completed
                        </Label>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

            </div>
          </div>
        </div>
        
      </div>
    </div>
    
  );
}
