"use client";

import BuryForm from "@/components/burial/BuryForm";
import { motion } from "motion/react";
import FireflyParticles from "@/components/shared/FireflyParticles";

export default function BuryPage() {
  return (
    <div className="relative min-h-screen bg-[#030305] px-4 py-16 overflow-hidden">
      {/* Ambient particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ height: 200 }}>
        <FireflyParticles count={8} />
      </div>

      {/* Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(88,28,135,0.15), transparent 70%)" }} />

      <div className="relative max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-12"
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="text-6xl mb-4 select-none"
            style={{ filter: "drop-shadow(0 0 20px rgba(139,92,246,0.5))" }}
          >
            ⚰️
          </motion.div>
          <h1 className="font-gothic text-4xl text-[#f5f0e8] mb-2"
            style={{ textShadow: "0 0 40px rgba(139,92,246,0.2)" }}>
            Bury a Project
          </h1>
          <p className="text-zinc-600 text-sm">It deserves a proper farewell.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        >
          <BuryForm />
        </motion.div>
      </div>
    </div>
  );
}
