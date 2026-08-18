import VibeCheckApp from "@/components/VibeCheckApp";

export default function Home() {
  return (
    <div className="flex min-h-full flex-col">
      <VibeCheckApp />
      <footer className="mx-auto w-full max-w-5xl px-6 py-6 sm:px-10">
        <p className="font-mono text-[11px] text-paper-dimmer">
          Sentiment scored client-side with AFINN-based lexical analysis. Not a substitute for
          reading the actual posts.
        </p>
      </footer>
    </div>
  );
}
