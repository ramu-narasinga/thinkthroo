export interface Lesson {
  id: string
  title: string
  duration: string
  completed: boolean
  type: "video" | "article" | "quiz"
}

export interface Chapter {
  id: string
  title: string
  lessons: Lesson[]
}

export interface Module {
  id: string
  slug: string        // ✅ ADDED
  title: string
  description: string
  chapters: Chapter[]
  icon?: string
}

export interface Category {
  id: string
  title: string
  slug: string
  modules: Module[]
}

export const courseData: Category[] = [
  {
    id: "production-grade-projects",
    title: "Production Grade Projects",
    slug: "production-grade-projects",
    modules: [
      {
        id: "api-layer",
        slug: "api-layer",
        title: "API Layer",
        description:
          "Learn how to structure and implement a robust API layer in modern applications. We cover data fetching patterns, mutations, and best practices.",
        chapters: [
          {
            id: "ch1-fundamentals",
            title: "Fundamentals",
            lessons: [
              {
                id: "l1",
                title: "Introduction to API Architecture",
                duration: "12 min",
                completed: true,
                type: "video",
              },
              {
                id: "l2",
                title: "RESTful Design Principles",
                duration: "18 min",
                completed: true,
                type: "video",
              },
              {
                id: "l3",
                title: "Setting Up Axios",
                duration: "8 min",
                completed: false,
                type: "article",
              },
            ],
          },
          {
            id: "ch2-data-fetching",
            title: "Data Fetching",
            lessons: [
              {
                id: "l4",
                title: "GET Requests & Caching",
                duration: "15 min",
                completed: false,
                type: "video",
              },
              {
                id: "l5",
                title: "Error Handling Patterns",
                duration: "10 min",
                completed: false,
                type: "article",
              },
              {
                id: "l6",
                title: "Quiz: Data Fetching",
                duration: "5 min",
                completed: false,
                type: "quiz",
              },
            ],
          },
          {
            id: "ch3-mutations",
            title: "Mutations",
            lessons: [
              {
                id: "l7",
                title: "POST, PUT, DELETE Operations",
                duration: "20 min",
                completed: false,
                type: "video",
              },
              {
                id: "l8",
                title: "Optimistic Updates",
                duration: "12 min",
                completed: false,
                type: "video",
              },
            ],
          },
        ],
      },
      {
        id: "components-structure",
        slug: "components-structure",
        title: "Components Structure",
        description:
          "Master component architecture patterns including atomic design, composition, and reusability principles.",
        chapters: [
          {
            id: "ch1-atomic-design",
            title: "Atomic Design",
            lessons: [
              {
                id: "l9",
                title: "Atoms, Molecules, Organisms",
                duration: "14 min",
                completed: false,
                type: "video",
              },
              {
                id: "l10",
                title: "Building a Component Library",
                duration: "22 min",
                completed: false,
                type: "video",
              },
            ],
          },
          {
            id: "ch2-composition",
            title: "Composition Patterns",
            lessons: [
              {
                id: "l11",
                title: "Compound Components",
                duration: "16 min",
                completed: false,
                type: "video",
              },
              {
                id: "l12",
                title: "Render Props & HOCs",
                duration: "18 min",
                completed: false,
                type: "article",
              },
            ],
          },
        ],
      },
      {
        id: "state-management",
        slug: "state-management",
        title: "State Management",
        description:
          "Deep dive into state management patterns from local state to global solutions.",
        chapters: [
          {
            id: "ch1-local-state",
            title: "Local State",
            lessons: [
              {
                id: "l13",
                title: "useState & useReducer",
                duration: "15 min",
                completed: false,
                type: "video",
              },
              {
                id: "l14",
                title: "Form State Management",
                duration: "12 min",
                completed: false,
                type: "video",
              },
            ],
          },
        ],
      },
      {
        id: "project-standards",
        slug: "project-standards",
        title: "Project Standards",
        description:
          "Establish coding standards, linting rules, and project conventions.",
        chapters: [
          {
            id: "ch1-linting",
            title: "Linting & Formatting",
            lessons: [
              {
                id: "l15",
                title: "ESLint Configuration",
                duration: "10 min",
                completed: false,
                type: "article",
              },
              {
                id: "l16",
                title: "Prettier Setup",
                duration: "8 min",
                completed: false,
                type: "article",
              },
            ],
          },
        ],
      },
    ],
  },
]

export function getModuleProgress(module: Module): number {
  const totalLessons = module.chapters.reduce(
    (acc, ch) => acc + ch.lessons.length,
    0
  )
  const completedLessons = module.chapters.reduce(
    (acc, ch) => acc + ch.lessons.filter((l) => l.completed).length,
    0
  )
  return totalLessons > 0
    ? Math.round((completedLessons / totalLessons) * 100)
    : 0
}

export function getCategoryProgress(category: Category): number {
  const totalLessons = category.modules.reduce(
    (acc, m) =>
      acc +
      m.chapters.reduce(
        (chAcc, ch) => chAcc + ch.lessons.length,
        0
      ),
    0
  )

  const completedLessons = category.modules.reduce(
    (acc, m) =>
      acc +
      m.chapters.reduce(
        (chAcc, ch) =>
          chAcc + ch.lessons.filter((l) => l.completed).length,
        0
      ),
    0
  )

  return totalLessons > 0
    ? Math.round((completedLessons / totalLessons) * 100)
    : 0
}

export function getNextLesson(module: Module): Lesson | null {
  for (const chapter of module.chapters) {
    for (const lesson of chapter.lessons) {
      if (!lesson.completed) {
        return lesson
      }
    }
  }
  return null
}
