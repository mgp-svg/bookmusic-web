/** Covers come from arbitrary provider hosts (Open Library, Google Books), so this stays a
 *  plain <img> rather than next/image with a host allowlist to maintain. */
export function BookCover({
  title,
  author,
  src,
  size = "md",
  className = "",
  sizes,
  priority = false,
}: {
  title: string;
  author?: string;
  src?: string | null;
  /** Drives the fallback's type scale — a 48px search thumbnail can't wear the same type as a 200px cover. */
  size?: "sm" | "md" | "lg";
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  if (src) {
    return (
      <img
        src={src}
        alt={`Cover of ${title}`}
        sizes={sizes}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
        className={`block h-full w-full bg-elevated object-cover ${className}`}
      />
    );
  }

  // No cover from the provider — set the title as type instead, record-sleeve style.
  const scale = {
    sm: { pad: "p-1.5", text: "text-[9px] leading-[1.15]", author: "hidden", clamp: "line-clamp-4" },
    md: { pad: "p-2.5", text: "text-[15px] leading-[0.95]", author: "block", clamp: "line-clamp-4" },
    lg: { pad: "p-4", text: "text-[26px] leading-[0.92]", author: "block", clamp: "line-clamp-6" },
  }[size];

  return (
    <div
      className={`flex h-full w-full flex-col justify-end gap-2 overflow-hidden bg-elevated ${scale.pad} ${className}`}
      aria-label={`No cover for ${title}`}
    >
      <div className="flex items-center gap-1" aria-hidden>
        <span className="h-1 w-5 bg-blue" />
        <span className="h-1 w-1 bg-orange" />
      </div>
      <span className={`display break-words ${scale.text} ${scale.clamp}`}>{title}</span>
      {author ? <span className={`eyebrow truncate text-muted ${scale.author}`}>{author}</span> : null}
    </div>
  );
}
