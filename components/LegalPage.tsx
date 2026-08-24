import { AccentMark, Eyebrow, Rule } from "./primitives";

/** Shared shell for the long-form pages (privacy, support): masthead, rule, prose column. */
export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-2xl px-5">
      <header className="pt-8 pb-7">
        <h1 className="display text-[clamp(2.75rem,11vw,4.5rem)] whitespace-pre-line">{title}</h1>
        <AccentMark className="mt-6" />
        {updated ? (
          <Eyebrow muted className="mt-6 block">
            Last updated {updated}
          </Eyebrow>
        ) : null}
      </header>
      <Rule />
      <div className="prose-bm pt-8 pb-4">{children}</div>
    </div>
  );
}

/** An eyebrow-labelled block, matching the section rhythm used everywhere else. */
export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="pt-9">
      <Rule />
      <Eyebrow as="h2" className="pt-2.5 block">
        {title}
      </Eyebrow>
      <div className="pt-4">{children}</div>
    </section>
  );
}
