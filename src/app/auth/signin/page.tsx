"use client";

import { createClient } from "@/lib/supabase/client";
import { useSearchParams } from "next/navigation";
import { Suspense, useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import FireflyParticles from "@/components/shared/FireflyParticles";

function SignInContent() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? "/bury";
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  const handleSignIn = async () => {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?redirectTo=${redirectTo}`,
        scopes: "read:user user:email",
      },
    });
    // stays loading until redirect
  };

  return (
    <div className="relative min-h-screen bg-[#030305] flex items-center justify-center overflow-hidden">
      {/* Ambient particles */}
      <div className="absolute inset-0 pointer-events-none">
        <FireflyParticles count={18} />
      </div>

      {/* Background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_60%,rgba(88,28,135,0.18),transparent)]" />
      <div className="fog-layer-1 absolute inset-0 pointer-events-none" />

      <motion.div
        className="relative z-10 text-center max-w-md w-full px-6"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 24 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Coffin */}
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="text-7xl mb-6 select-none"
          style={{ filter: "drop-shadow(0 0 24px rgba(139,92,246,0.5))" }}
        >
          ⚰️
        </motion.div>

        <h1 className="font-gothic text-4xl text-[#f5f0e8] mb-3"
          style={{ textShadow: "0 0 40px rgba(139,92,246,0.3)" }}>
          Connect GitHub
        </h1>

        <p className="text-zinc-500 text-base mb-8 leading-relaxed">
          We need to see your repositories<br />to know which ones to bury.
        </p>

        {/* Button */}
        <motion.button
          onClick={handleSignIn}
          disabled={loading}
          whileHover={{ scale: loading ? 1 : 1.03 }}
          whileTap={{ scale: loading ? 1 : 0.97 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
          className="w-full relative overflow-hidden py-3.5 px-6 rounded-xl font-semibold text-white transition-all"
          style={{
            background: loading
              ? "rgba(109,40,217,0.5)"
              : "linear-gradient(135deg,#7c3aed,#6d28d9)",
            boxShadow: loading
              ? "none"
              : "0 0 32px rgba(139,92,246,0.4), 0 4px 16px rgba(0,0,0,0.4)",
          }}
        >
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.span
                key="loading"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="flex items-center justify-center gap-3"
              >
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 border-2 border-t-white border-purple-400/40 rounded-full block"
                />
                Redirecting to GitHub...
              </motion.span>
            ) : (
              <motion.span
                key="idle"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="flex items-center justify-center gap-3"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                Connect with GitHub
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Loading state below button */}
        <AnimatePresence>
          {loading && (
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.3 }}
              className="text-zinc-600 text-xs mt-4 font-mono"
            >
              Opening GitHub authorization...
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense>
      <SignInContent />
    </Suspense>
  );
}
