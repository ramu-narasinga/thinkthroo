"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@thinkthroo/ui/components/dialog";
import { BookOpen, PlayCircle } from "lucide-react";
import { Button } from "@thinkthroo/ui/components/button";
import { Pagination } from "@thinkthroo/ui/components/pagination";

type TemplateDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const TEMPLATE_OPTIONS = [
  {
    title: "API Layer",
    description: "Learn how to structure and implement a robust API layer in...",
    chapters: 3,
    lessons: 8,
  },
  {
    title: "Components Structure",
    description: "Master component architecture patterns including atomic design,...",
    chapters: 2,
    lessons: 4,
  },
  {
    title: "State Management",
    description: "Deep dive into state management patterns from local state to global...",
    chapters: 1,
    lessons: 2,
  },
  {
    title: "Project Standards",
    description: "Establish coding standards, linting rules, and project conventions.",
    chapters: 1,
    lessons: 2,
  },

  // repeat same content to make 12 (3 pages)
  {
    title: "API Layer",
    description: "Learn how to structure and implement a robust API layer in...",
    chapters: 3,
    lessons: 8,
  },
  {
    title: "Components Structure",
    description: "Master component architecture patterns including atomic design,...",
    chapters: 2,
    lessons: 4,
  },
  {
    title: "State Management",
    description: "Deep dive into state management patterns from local state to global...",
    chapters: 1,
    lessons: 2,
  },
  {
    title: "Project Standards",
    description: "Establish coding standards, linting rules, and project conventions.",
    chapters: 1,
    lessons: 2,
  },

  {
    title: "API Layer",
    description: "Learn how to structure and implement a robust API layer in...",
    chapters: 3,
    lessons: 8,
  },
  {
    title: "Components Structure",
    description: "Master component architecture patterns including atomic design,...",
    chapters: 2,
    lessons: 4,
  },
  {
    title: "State Management",
    description: "Deep dive into state management patterns from local state to global...",
    chapters: 1,
    lessons: 2,
  },
  {
    title: "Project Standards",
    description: "Establish coding standards, linting rules, and project conventions.",
    chapters: 1,
    lessons: 2,
  },
];

export function TemplateDialog({ open, onOpenChange }: TemplateDialogProps) {
  const [page, setPage] = useState(1);

  const itemsPerPage = 4;
  const totalPages = Math.ceil(TEMPLATE_OPTIONS.length / itemsPerPage);

  const startIndex = (page - 1) * itemsPerPage;
  const currentTemplates = TEMPLATE_OPTIONS.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  useEffect(() => {
    if (!open) setPage(1);
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!w-full !max-w-[1200px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Select a Template
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-6">
          {currentTemplates.map((template, index) => {
            const globalIndex = startIndex + index;
            return (
              <div
                key={`${globalIndex}-${template.title}`}
                className="flex flex-col p-6 border rounded-2xl bg-white shadow-sm hover:border-black transition-colors"
              >
                <h4 className="text-lg font-bold mb-2">{template.title}</h4>
                <p className="text-sm text-gray-500 mb-6 flex-grow">
                  {template.description}
                </p>
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-4 h-4" />
                    {template.chapters} chapters
                  </span>
                  <span>• {template.lessons} lessons</span>
                </div>
                <div className="flex justify-center">
                  <Button className="!w-[150px] bg-black hover:bg-zinc-800 text-white rounded-xl px-10 py-2">
                    <PlayCircle className="mr-2 h-4 w-4" />
                    Import
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-center pb-4">
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
