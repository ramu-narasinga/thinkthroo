"use client";

import { useState, useMemo } from "react";
import { type SanitySkill } from "@/lib/skill";
import { ModuleCard } from "./module-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@thinkthroo/ui/components/select";

interface SkillsGridProps {
  skills: SanitySkill[];
}

export function SkillsGrid({ skills }: SkillsGridProps) {
  const [activeTag, setActiveTag] = useState<string>("all");

  const allTags = useMemo(() => {
    const seen = new Set<string>();
    const tags: string[] = [];
    for (const skill of skills) {
      for (const tag of skill.tags ?? []) {
        if (!seen.has(tag.title)) {
          seen.add(tag.title);
          tags.push(tag.title);
        }
      }
    }
    return tags;
  }, [skills]);

  const filtered = useMemo(
    () =>
      activeTag === "all"
        ? skills
        : skills.filter((s) => s.tags?.some((t) => t.title === activeTag)),
    [skills, activeTag]
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Dropdown filter */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Filter by tags:</span>
        <Select value={activeTag} onValueChange={setActiveTag}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select a tag" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {allTags.map((tag) => (
              <SelectItem key={tag} value={tag}>
                {tag}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((skill) => (
          <ModuleCard key={skill.slug} skill={skill} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-sm text-muted-foreground">No skills match this tag.</p>
      )}
    </div>
  );
}
