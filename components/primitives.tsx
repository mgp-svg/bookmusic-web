import Link from "next/link";

/** The structural pieces from Design/Theme.swift: hard rules, tracked caps, section headers. */

export function Rule({ className = "" }: { className?: string }) {
  return <div className={`rule ${className}`} />;
}

export function Eyebrow({
  children,
  muted = false,
  className = "",
  as: Tag = "span",
}: {
  children: React.ReactNode;
  muted?: boolean;
  className?: string;
  as?: "span" | "div" | "h2" | "p";
}) {
  return <Tag className={`eyebrow ${muted ? "text-muted" : ""} ${className}`}>{children}</Tag>;
}

/** Rule, uppercase label left, utility text right. */
export function SectionHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: { label: string; href: string };
}) {
  return (
    <div className="flex flex-col gap-2.5">
      <Rule />
      <div className="flex items-baseline justify-between gap-4">
        <Eyebrow as="h2">{title}</Eyebrow>
        {action ? (
          <Link href={action.href} className="eyebrow text-muted hover:text-ink transition-colors">
            {action.label} →
          </Link>
        ) : subtitle ? (
          <Eyebrow muted>{subtitle}</Eyebrow>
        ) : null}
      </div>
    </div>
  );
}

/** The two-square accent mark: a wide blue bar and an orange square. */
export function AccentMark({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`} aria-hidden>
      <div className="h-3 w-11 bg-blue" />
      <div className="h-3 w-3 bg-orange" />
    </div>
  );
}

export function StatusNote({
  title,
  message,
  children,
}: {
  title: string;
  message?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="border border-rule-soft px-5 py-8 text-center">
      <p className="text-lg font-black uppercase tracking-tight">{title}</p>
      {message ? <p className="mt-2 text-sm text-muted mx-auto max-w-sm">{message}</p> : null}
      {children ? <div className="mt-5 flex justify-center">{children}</div> : null}
    </div>
  );
}
