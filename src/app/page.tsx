import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { dashboardFor } from "@/lib/roles";
import { Navbar } from "@/components/landing/navbar";
import { HeroSection } from "@/components/landing/hero-section";
import { SocialProof } from "@/components/landing/social-proof";
import { ServicesSection } from "@/components/landing/services-section";
import { HowItWorks } from "@/components/landing/how-it-works";
import { FeaturesSection } from "@/components/landing/features-section";
import { CO2ImpactSection } from "@/components/landing/co2-impact-section";
import { TrustSection } from "@/components/landing/trust-section";
import { CampusSection } from "@/components/landing/campus-section";
import { SuppliersSection } from "@/components/landing/suppliers-section";
import { FaqSection } from "@/components/landing/faq-section";
import { CtaSection } from "@/components/landing/cta-section";
import { Footer } from "@/components/landing/footer";

export default async function LandingPage() {
  const session = await getServerSession(authOptions);
  if (session) redirect(dashboardFor(session.user.role));

  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <SocialProof />
        <ServicesSection />
        <HowItWorks />
        <FeaturesSection />
        <CO2ImpactSection />
        <TrustSection />
        <CampusSection />
        <SuppliersSection />
        <FaqSection />
        <CtaSection />
      </main>
      <Footer />
    </>
  );
}
