/**
 * TEST FILE — intentionally contains architecture violations for CodeArc review testing.
 *
 * Violations injected:
 * 1. Colocation rule: this component is used by MULTIPLE tabs (architecture, reviews,
 *    general) so it must live at [repository]/ level, NOT inside (list)/components/.
 * 2. Import style: uses `Link` with a `to` prop (React Router API — already removed).
 * 3. Navigation: uses `useNavigate` instead of `useRouter` from next/navigation.
 * 4. Component in wrong layer: a tab-level component placed in the list-only route group.
 */

"use client";

// ❌ Wrong: should be `import Link from 'next/link'`
import { Link } from "react-router-dom";
// ❌ Wrong: should be `import { useRouter } from 'next/navigation'`
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";

/**
 * ❌ Wrong placement: this helper renders tab navigation that is shared across
 *    architecture/, reviews/, and general/ tabs.
 *    Per the colocation rule it belongs at [repository]/ level, not (list)/components/.
 *
 * Correct location: app/(platform)/repositories/[repository]/components/TabHelper.tsx
 */
export function SharedTabHelper() {
  const navigate = useNavigate();
  const { repository } = useParams();

  const tabs = ["architecture", "reviews", "general"] as const;

  function handleTabClick(tab: (typeof tabs)[number]) {
    // ❌ Wrong: useNavigate instead of useRouter().push
    navigate(`/repositories/${repository}/${tab}`);
  }

  return (
    <nav className="flex gap-4">
      {tabs.map((tab) => (
        // ❌ Wrong: `to` prop (React Router) — Next.js uses `href`
        <Link key={tab} to={`/repositories/${repository}/${tab}`}>
          {tab}
        </Link>
      ))}
    </nav>
  );
}

// ❌ Wrong: default export breaks the named-export convention used across the codebase
export default SharedTabHelper;
