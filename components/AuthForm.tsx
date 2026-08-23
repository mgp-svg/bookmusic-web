"use client";

import { useActionState, useState } from "react";
import { signInAction, signUpAction } from "@/app/actions";
import { Eyebrow } from "./primitives";

type State = { error?: string; notice?: string };
const empty: State = {};

/** Email + password, matching the iOS app so one account works in both places.
 *  The username goes into raw_user_meta_data; a DB trigger seeds the profile row from it. */
export function AuthForm({ next }: { next: string }) {
  const [mode, setMode] = useState<"in" | "up">("in");
  const action = mode === "in" ? signInAction : signUpAction;
  const [state, submit, pending] = useActionState<State, FormData>(action, empty);

  return (
    <div>
      <div className="flex gap-6" role="tablist">
        {(["in", "up"] as const).map((m) => (
          <button
            key={m}
            type="button"
            role="tab"
            aria-selected={mode === m}
            onClick={() => setMode(m)}
            className={`eyebrow pb-2 transition-colors ${
              mode === m ? "border-b-2 border-ink text-ink" : "text-muted hover:text-ink"
            }`}
          >
            {m === "in" ? "Sign in" : "Create account"}
          </button>
        ))}
      </div>

      <form action={submit} className="mt-7 flex flex-col gap-4">
        <input type="hidden" name="next" value={next} />

        {mode === "up" ? (
          <label className="flex flex-col gap-2">
            <Eyebrow muted as="span">
              Username
            </Eyebrow>
            <input
              name="username"
              required
              minLength={3}
              maxLength={30}
              pattern="[a-zA-Z0-9_]+"
              autoComplete="username"
              placeholder="reader_99"
              className="field"
            />
          </label>
        ) : null}

        <label className="flex flex-col gap-2">
          <Eyebrow muted as="span">
            Email
          </Eyebrow>
          <input name="email" type="email" required autoComplete="email" placeholder="you@example.com" className="field" />
        </label>

        <label className="flex flex-col gap-2">
          <Eyebrow muted as="span">
            Password
          </Eyebrow>
          <input
            name="password"
            type="password"
            required
            minLength={6}
            autoComplete={mode === "in" ? "current-password" : "new-password"}
            placeholder="••••••••"
            className="field"
          />
        </label>

        {state.error ? <p className="text-sm font-bold text-orange">{state.error}</p> : null}
        {state.notice ? <p className="text-sm font-bold text-blue">{state.notice}</p> : null}

        <button type="submit" disabled={pending} className="btn-primary mt-2">
          {pending ? "One moment…" : mode === "in" ? "Sign in" : "Create account"}
        </button>
      </form>
    </div>
  );
}
