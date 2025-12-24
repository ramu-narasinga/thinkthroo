import Link from "next/link";
import React from "react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbNavProps {
  items: BreadcrumbItem[];
}

export const BreadcrumbNav: React.FC<BreadcrumbNavProps> = ({ items }) => {
  return (
    <nav className="flex items-center gap-2 px-6 py-4 text-sm text-muted-foreground" aria-label="Breadcrumb">
      {items.map((item, idx) => (
        <React.Fragment key={idx}>
          {item.href ? (
            <Link href={item.href} className="hover:text-foreground transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-foreground font-medium">{item.label}</span>
          )}
          {idx < items.length - 1 && <span className="text-muted-foreground/50">/</span>}
        </React.Fragment>
      ))}
    </nav>
  );
};
