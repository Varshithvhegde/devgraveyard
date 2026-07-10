import Hero from "@/components/landing/Hero";
import GraveyardStats from "@/components/landing/GraveyardStats";
import FeaturedTombstones from "@/components/landing/FeaturedTombstones";
import HowItWorks from "@/components/landing/HowItWorks";
import { Suspense } from "react";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Suspense fallback={null}>
        <GraveyardStats />
      </Suspense>
      <Suspense fallback={null}>
        <FeaturedTombstones />
      </Suspense>
      <HowItWorks />
    </>
  );
}
