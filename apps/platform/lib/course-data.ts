// Mock course data for the learning dashboard
export interface Lesson {
  id: string;
  title: string;
  completed: boolean;
}

export interface Chapter {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface Module {
  id: string;
  title: string;
  chapters: Chapter[];
}

export interface Category {
  id: string;
  title: string;
  slug: string;
  modules: Module[];
}

export const courseData: Category[] = [
  {
    id: "1",
    title: "Codebase Architecture",
    slug: "codebase-architecture",
    modules: [
      {
        id: "m1",
        title: "Module 1: Foundations",
        chapters: [
          {
            id: "ch1",
            title: "Chapter 1: Introduction",
            lessons: [
              { id: "l1", title: "Getting Started", completed: true },
              { id: "l2", title: "Core Concepts", completed: true },
              { id: "l3", title: "Best Practices", completed: false },
            ],
          },
          {
            id: "ch2",
            title: "Chapter 2: Advanced Topics",
            lessons: [
              { id: "l4", title: "Architecture Patterns", completed: false },
              { id: "l5", title: "Design Systems", completed: false },
            ],
          },
        ],
      },
      {
        id: "m2",
        title: "Module 2: Practical Applications",
        chapters: [
          {
            id: "ch3",
            title: "Chapter 1: Real-world Examples",
            lessons: [
              { id: "l6", title: "Case Study 1", completed: false },
              { id: "l7", title: "Case Study 2", completed: false },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "2",
    title: "Production Grade Projects",
    slug: "production-grade-projects",
    modules: [
      {
        id: "m3",
        title: "Module 1: Setup",
        chapters: [
          {
            id: "ch4",
            title: "Chapter 1: Environment",
            lessons: [
              { id: "l8", title: "Project Initialization", completed: false },
              { id: "l9", title: "Configuration", completed: false },
              { id: "l10", title: "Testing Setup", completed: false },
            ],
          },
        ],
      },
      {
        id: "m4",
        title: "Module 2: Implementation",
        chapters: [
          {
            id: "ch5",
            title: "Chapter 1: Core Features",
            lessons: [
              { id: "l11", title: "Feature Development", completed: false },
              { id: "l12", title: "Integration", completed: false },
            ],
          },
        ],
      },
    ],
  },
];

export function getCategoryProgress(category: Category): number {
  const totalLessons = category.modules.reduce(
    (acc, module) =>
      acc +
      module.chapters.reduce((chAcc, chapter) => chAcc + chapter.lessons.length, 0),
    0
  );

  const completedLessons = category.modules.reduce(
    (acc, module) =>
      acc +
      module.chapters.reduce(
        (chAcc, chapter) =>
          chAcc + chapter.lessons.filter((lesson) => lesson.completed).length,
        0
      ),
    0
  );

  return totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
}
