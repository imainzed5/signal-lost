import Link from "next/link";

export default function NotFound() {
  return (
    <main className="shell-grid px-6 py-10 sm:px-8">
      <section className="shell-panel mx-auto flex min-h-[70vh] w-full max-w-3xl flex-col items-start justify-center gap-6 p-8 sm:p-10">
        <p className="text-xs uppercase tracking-[0.4em] text-accent-soft">
          Address Resolution Failed
        </p>
        <h1 className="text-3xl font-semibold tracking-[0.2em] text-foreground sm:text-5xl">
          SIGNAL LOST
        </h1>
        <p className="max-w-2xl text-sm leading-7 text-muted sm:text-base">
          The route you requested does not exist inside this host system. Return to
          the shell and reacquire the signal.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-full border border-accent/50 bg-accent/10 px-5 py-3 text-xs uppercase tracking-[0.28em] text-accent transition hover:border-accent hover:bg-accent/18"
        >
          Return to Shell
        </Link>
      </section>
    </main>
  );
}
