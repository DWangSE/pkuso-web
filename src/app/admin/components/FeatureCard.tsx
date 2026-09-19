"use client";

import React from "react";
import Link from "next/link";

interface FeatureCardProps {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeCount?: number;
  badgeMax?: number;
}

export function FeatureCard({
  title,
  href,
  icon: Icon,
  badgeCount,
  badgeMax = 99,
}: FeatureCardProps) {
  const showBadge = badgeCount && badgeCount > 0;
  const displayBadge = showBadge
    ? badgeCount > badgeMax
      ? `${badgeMax}+`
      : String(badgeCount)
    : null;

  return (
    <Link
      href={href}
      prefetch={false}
      className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-3 transition-colors hover:bg-muted hover:border-border/50"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <span className="flex-1 min-w-0 text-label font-medium text-text truncate">{title}</span>
      {displayBadge && (
        <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-danger px-2 text-[11px] font-medium text-danger-foreground ml-2">
          {displayBadge}
        </span>
      )}
    </Link>
  );
}
