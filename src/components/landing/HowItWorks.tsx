const steps = [
  {
    icon: "🔗",
    title: "Connect GitHub",
    description:
      "Sign in with your GitHub account. We fetch your repos so you can choose which ones to bury.",
  },
  {
    icon: "⚰️",
    title: "Choose & Bury",
    description:
      "Pick the project, write the cause of death, and carve your epitaph. We analyze its commit history.",
  },
  {
    icon: "🕯️",
    title: "Share & Mourn",
    description:
      "Your tombstone goes on the wall. Others can light candles, leave RIP messages, or vote to resurrect it.",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-16 max-w-5xl mx-auto px-6">
      <div className="text-center mb-12">
        <h2 className="font-gothic text-3xl text-bone mb-2">
          How It Works
        </h2>
        <p className="text-zinc-500 text-sm">
          Three steps to eternal rest
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {steps.map((step, i) => (
          <div key={i} className="relative text-center">
            <div className="text-5xl mb-4 select-none">{step.icon}</div>
            <div className="text-zinc-700 font-mono text-xs mb-2 uppercase tracking-widest">
              Step {i + 1}
            </div>
            <h3 className="font-gothic text-xl text-zinc-200 mb-3">
              {step.title}
            </h3>
            <p className="text-zinc-500 text-sm leading-relaxed">
              {step.description}
            </p>
            {i < steps.length - 1 && (
              <div className="hidden md:block absolute top-8 right-0 translate-x-1/2 text-zinc-700 text-xl">
                →
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
