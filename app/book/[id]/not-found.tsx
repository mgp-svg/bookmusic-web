import Link from "next/link";
import { AccentMark, Eyebrow } from "@/components/primitives";

export default function BookNotFound() {
  return (
    <div className="mx-auto max-w-5xl px-5 pt-12">
      <Eyebrow>404</Eyebrow>
      <h1 className="display mt-4 text-[clamp(2.2rem,8vw,4rem)]">No such book</h1>
      <AccentMark className="mt-5" />
      <p className="mt-5 max-w-md text-sm text-muted">
        That soundtrack doesn&apos;t exist — or no one has opened that book yet. Search for the title, or
        use the ISBN on the back of your copy.
      </p>
      <div className="mt-7 flex max-w-md flex-col gap-3 sm:flex-row">
        <Link href="/search" className="btn-primary">
          Search books
        </Link>
        <Link href="/" className="btn-secondary">
          Back to the front
        </Link>
      </div>
    </div>
  );
}
