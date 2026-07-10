export default function Footer() {
  return (
    <footer className="border-t border-zinc-800/60 bg-black/40 py-8 mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center space-y-2">
        <p className="text-zinc-600 text-sm font-gothic italic">
          &ldquo;Every great project starts with passion. Some end there too.&rdquo;
        </p>
        <p className="text-zinc-700 text-xs font-mono">
          Built with{" "}
          <a
            href="https://github.com/Varshithvhegde/devgraveyard"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-zinc-500 transition-colors underline underline-offset-2"
          >
            love and abandonment
          </a>{" "}
          · DevGraveyard
        </p>
      </div>
    </footer>
  );
}
