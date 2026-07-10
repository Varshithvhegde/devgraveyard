import BuryForm from "@/components/burial/BuryForm";

export const metadata = {
  title: "Bury a Project — DevGraveyard",
};

export default function BuryPage() {
  return (
    <div className="min-h-screen bg-[#050505] px-4 py-16">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <div className="text-6xl mb-4 select-none">⚰️</div>
          <h1 className="font-gothic text-4xl text-bone mb-3">
            Bury a Project
          </h1>
          <p className="text-zinc-500 text-base">
            It deserves a proper farewell.
          </p>
        </div>
        <BuryForm />
      </div>
    </div>
  );
}
