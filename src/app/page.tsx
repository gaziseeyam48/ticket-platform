import type { Metadata } from "next";
import { LandingHeader } from "@/components/landing/landing-header";
import { HeroSection } from "@/components/landing/hero-section";
import { ProductLensTabs } from "@/components/landing/product-lens-tabs";
import { WorkflowProgression } from "@/components/landing/workflow-progression";
import { FeatureStories } from "@/components/landing/feature-stories";
import { VisualInterlude } from "@/components/landing/visual-interlude";
import { AudienceSection } from "@/components/landing/audience-section";
import { ConversionSection } from "@/components/landing/conversion-section";
import { LandingFooter } from "@/components/landing/landing-footer";
import { ScrollRevealProvider } from "@/components/landing/scroll-reveal-provider";
import { DemoModalProvider } from "@/components/landing/demo-modal-context";

export const metadata: Metadata = {
  title: "TicketKoi — Event Management & Ticketing for Organizers",
  description:
    "Create events without the busywork. Manage custom registration forms, review direct payments, issue digital tickets, and run atomic door verification with your team.",
  openGraph: {
    title: "TicketKoi — Event Operations Platform",
    description:
      "Your event. Less chaos. Keep registrations organized, verify payments, and manage event day with confidence.",
    type: "website",
    siteName: "TicketKoi",
  },
};

export default function HomePage() {
  return (
    <DemoModalProvider>
      <ScrollRevealProvider>
        <div className="min-h-screen bg-white text-[#17211F] flex flex-col selection:bg-[#006B5B] selection:text-white antialiased">
        {/* Accessible skip link */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#006B5B] focus:text-white focus:rounded-md focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#006B5B] focus:ring-offset-2 text-xs font-medium"
        >
          Skip to main content
        </a>

        {/* 1. Header Navigation */}
        <LandingHeader />

        {/* 2. Main Narrative Flow */}
        <main id="main-content" className="flex-1">
          {/* Section 1: Hero */}
          <div className="reveal-hidden">
            <HeroSection />
          </div>

          {/* Section 2: Product in Action */}
          <div className="reveal-hidden reveal-stagger-1">
            <ProductLensTabs />
          </div>

          {/* Section 3: Explain the Workflow */}
          <div className="reveal-hidden reveal-stagger-1">
            <WorkflowProgression />
          </div>

          {/* Section 4: Feature Storytelling */}
          <div className="reveal-hidden reveal-stagger-1">
            <FeatureStories />
          </div>

          {/* Section 5: Memorable Visual Interlude */}
          <div className="reveal-hidden">
            <VisualInterlude />
          </div>

          {/* Section 6: Who It Is For */}
          <div className="reveal-hidden reveal-stagger-1">
            <AudienceSection />
          </div>

          {/* Section 7: Final Conversion Call-to-Action */}
          <div className="reveal-hidden">
            <ConversionSection />
          </div>
        </main>

        {/* 3. Restrained Footer */}
        <LandingFooter />
      </div>
    </ScrollRevealProvider>
  </DemoModalProvider>
  );
}
