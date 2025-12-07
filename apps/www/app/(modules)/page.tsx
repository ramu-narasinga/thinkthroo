import Image from "next/image";
import Link from "next/link";
import ConvertKitForm from "@/components/interfaces/site/forms/newsletter";
import { Problem } from "@/components/interfaces/site/problem";
import { HowItWorks } from "@/components/interfaces/site/how-it-works";
import { Hero } from "@/components/interfaces/site/hero";
import { UsedByTeams } from "@/components/interfaces/site/used-by-teams";
import { SocialProof } from "@/components/interfaces/site/social-proof";
import { ArchitectureTemplates } from "@/components/interfaces/site/architecture-templates";
import { ProductionGradeProjects } from "@/components/interfaces/site/production-grade-projects";

export default function RootPage() {
  return (
    <div className="flex flex-1 flex-col">
      
      <Hero />

      <Problem />

      <HowItWorks />

      <ArchitectureTemplates />

      <ProductionGradeProjects />

      {/* <UsedByTeams />

      <SocialProof /> */}

      <ConvertKitForm />
    </div>
  );
}
