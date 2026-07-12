import ScrollReveal from "@/components/shared/ScrollReveal";

const steps = [
  {
    icon: "🔗",
    step: "01",
    title: "Connect GitHub",
    description: "Sign in with GitHub. We fetch your repositories — the living, the dead, and everything in between.",
  },
  {
    icon: "⚰️",
    step: "02",
    title: "Choose & Bury",
    description: "Pick the project. Write the cause of death. Carve your epitaph. We analyze its commit history so the tombstone tells the full truth.",
  },
  {
    icon: "🕯️",
    step: "03",
    title: "Share & Mourn",
    description: "Your tombstone joins the graveyard wall. Others light candles, leave RIP messages, or vote to resurrect it from the dead.",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-24 max-w-5xl mx-auto px-6">
      <ScrollReveal className="text-center mb-16">
        <div className="text-[10px] text-zinc-600 uppercase tracking-[0.3em] mb-3">The Ritual</div>
        <h2 className="font-gothic text-4xl text-bone mb-3">Three Steps to Eternal Rest</h2>
        <p className="text-zinc-600 text-sm max-w-sm mx-auto">
          A proper burial takes five minutes. The grief lasts much longer.
        </p>
      </ScrollReveal>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative">
        {/* Connecting line */}
        <div className="hidden md:block absolute top-12 left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] h-px"
          style={{ background: "linear-gradient(90deg, transparent, rgba(139,92,246,0.3) 20%, rgba(139,92,246,0.3) 80%, transparent)" }}
        />

        {steps.map((step, i) => (
          <ScrollReveal key={i} delay={i * 120} direction="up">
            <div className="relative text-center group">
              {/* Step number */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-mono text-zinc-700 tracking-widest">
                {step.step}
              </div>

              {/* Icon container */}
              <div
                className="w-20 h-20 rounded-2xl mx-auto mb-5 flex items-center justify-center text-4xl relative transition-transform duration-300 group-hover:-translate-y-1"
                style={{
                  background: "linear-gradient(135deg, rgba(139,92,246,0.08), rgba(88,28,135,0.12))",
                  border: "1px solid rgba(139,92,246,0.15)",
                  boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
                }}
              >
                {step.icon}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: "radial-gradient(circle at 50% 50%, rgba(139,92,246,0.1), transparent)" }}
                />
              </div>

              <h3 className="font-gothic text-xl text-bone mb-3">{step.title}</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">{step.description}</p>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
