import PageShell from "@/components/PageShell";
import Hero from "@/components/Hero";
import ProductGrid from "@/components/ProductGrid";
import HowItWorks from "@/components/HowItWorks";
import ReviewsSection from "@/components/ReviewsSection";

export default function HomePage() {
  return (
    <PageShell>
      <Hero />
      <ProductGrid />
      <HowItWorks />
      <ReviewsSection />
    </PageShell>
  );
}
