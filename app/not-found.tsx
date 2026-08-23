import Link from "next/link";
import { AccentMark, Eyebrow } from "@/components/primitives";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-5 pt-12">
      <Eyebrow muted>404</Eyebrow>
      <h1 className="display mt-4 text-[clamp(2.2rem,8vw,4rem)]">Off the shelf</h1>
      <AccentMark className="mt-5" />
      <p className="mt-5 max-w-md text-sm text-muted">That page isn&apos;t here.</p>
      <div className="mt-7 max-w-xs">
        <Link href="/" className="btn-primary">
          Back to the front
        </Link>
      </div>
    </div>
  );
}
