import Link from "next/link";
import { Montserrat } from "next/font/google";
import {
  BookOpenText,
  Lightning,
  TrendUp,
  UsersThree,
} from "@phosphor-icons/react/dist/ssr";

const montserrat = Montserrat({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
});

const highlights = [
  {
    title: "Editorial Workflow",
    description:
      "Plan, draft, and publish with clear states so every article moves forward without guesswork.",
    icon: BookOpenText,
    tone: "bg-emerald-50 text-emerald-700",
  },
  {
    title: "Live Momentum",
    description:
      "Track what readers respond to and keep your next post aligned with real audience interest.",
    icon: TrendUp,
    tone: "bg-emerald-100/70 text-emerald-700",
  },
  {
    title: "Focused Community",
    description:
      "Comments, likes, and shares are designed for meaningful feedback instead of noisy activity.",
    icon: UsersThree,
    tone: "bg-emerald-50 text-emerald-700",
  },
  {
    title: "Fast Publishing Stack",
    description:
      "Built on Next.js 14 with a clean, responsive interface that stays smooth across devices.",
    icon: Lightning,
    tone: "bg-emerald-100/70 text-emerald-700",
  },
];

export default function HomePage() {
  return (
    <div
      className={`${montserrat.className} min-h-[100dvh] bg-slate-50 text-slate-900`}
    >
      <section className="relative overflow-hidden border-b border-slate-200/70">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-emerald-100/70 to-transparent" />
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-16 md:grid-cols-12 md:gap-8 md:px-6 md:py-20 lg:px-10">
          <div className="md:col-span-7 md:pr-6">
            <p className="mb-5 inline-flex items-center rounded-full border border-emerald-200 bg-white px-4 py-1.5 text-sm font-medium text-emerald-700">
              Publishing space for IE213 community
            </p>
            <h1 className="text-4xl font-semibold leading-none tracking-tighter text-slate-950 md:text-6xl">
              Welcome to IE213 Blog
            </h1>
            <p className="mt-6 max-w-[62ch] text-base leading-relaxed text-slate-600 md:text-lg">
              Build thoughtful posts, surface useful ideas, and keep
              conversations around every article crisp and practical.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                href="/posts"
                className="rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-emerald-700 active:scale-[0.98]"
              >
                Explore Posts
              </Link>
              <Link
                href="/register"
                className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-800 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-slate-400 hover:bg-slate-100 active:scale-[0.98]"
              >
                Create Account
              </Link>
            </div>
          </div>

          <aside className="md:col-span-5">
            <div className="rounded-[2rem] border border-slate-200/80 bg-white p-8 shadow-[0_20px_40px_-15px_rgba(15,23,42,0.08)]">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <p className="text-sm font-semibold text-slate-800">
                  Editorial Pulse
                </p>
                <span className="inline-flex items-center gap-2 text-xs text-emerald-700">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  Sync healthy
                </span>
              </div>

              <div className="space-y-4 py-5">
                <div className="space-y-2 rounded-2xl border border-slate-200 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Loading queue
                  </p>
                  <div className="h-2.5 w-3/4 animate-pulse rounded bg-slate-200" />
                  <div className="h-2.5 w-5/6 animate-pulse rounded bg-slate-200" />
                </div>
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                    Empty drafts
                  </p>
                  <p className="mt-2 text-sm text-slate-700">
                    You have no draft in progress. Start your first article from
                    the writing studio.
                  </p>
                </div>
                <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                    Error state sample
                  </p>
                  <p className="mt-2 text-sm text-slate-700">
                    Media upload failed on one asset. Retry from the post editor
                    to continue publishing.
                  </p>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-4 text-xs text-slate-500">
                Designed for desktop depth and mobile clarity with a
                single-column fallback.
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-20 lg:px-10">
        <div className="mb-10 max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">
            Why teams write here
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-600">
            A bright workspace built for long-form writing, clean review cycles,
            and measurable reader response.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-12 md:gap-6">
          <div className="md:col-span-7 space-y-5">
            {highlights.slice(0, 2).map((item) => {
              const Icon = item.icon;
              return (
                <article
                  key={item.title}
                  className="rounded-[2rem] border border-slate-200/80 bg-white p-8 shadow-[0_20px_40px_-15px_rgba(15,23,42,0.08)]"
                >
                  <div
                    className={`mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl ${item.tone}`}
                  >
                    <Icon size={22} weight="duotone" />
                  </div>
                  <h3 className="text-2xl font-semibold tracking-tight text-slate-900">
                    {item.title}
                  </h3>
                  <p className="mt-3 max-w-[60ch] text-base leading-relaxed text-slate-600">
                    {item.description}
                  </p>
                </article>
              );
            })}
          </div>

          <div className="md:col-span-5 space-y-5 md:pt-16">
            {highlights.slice(2).map((item) => {
              const Icon = item.icon;
              return (
                <article
                  key={item.title}
                  className="rounded-[2rem] border border-slate-200/80 bg-white p-8 shadow-[0_20px_40px_-15px_rgba(15,23,42,0.08)]"
                >
                  <div
                    className={`mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl ${item.tone}`}
                  >
                    <Icon size={22} weight="duotone" />
                  </div>
                  <h3 className="text-xl font-semibold tracking-tight text-slate-900">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-base leading-relaxed text-slate-600">
                    {item.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200/80 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-16 md:grid-cols-12 md:items-end md:px-6 md:py-20 lg:px-10">
          <div className="md:col-span-8">
            <h2 className="text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">
              Ready to publish your first piece?
            </h2>
            <p className="mt-4 max-w-[60ch] text-base leading-relaxed text-slate-600">
              Join the IE213 writing room, open a draft, and share practical
              ideas with peers who value technical depth.
            </p>
          </div>
          <div className="md:col-span-4 md:justify-self-end">
            <Link
              href="/register"
              className="inline-flex items-center rounded-xl bg-emerald-600 px-7 py-3 text-sm font-semibold text-white transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-emerald-700 active:-translate-y-[1px]"
            >
              Create Your Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
