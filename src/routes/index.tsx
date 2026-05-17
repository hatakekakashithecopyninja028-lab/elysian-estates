import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Properties } from "@/components/Properties";
import { About } from "@/components/About";
import { FeaturedProjects } from "@/components/FeaturedProjects";
import { WhyChoose } from "@/components/WhyChoose";
import { Testimonials } from "@/components/Testimonials";
import { Gallery } from "@/components/Gallery";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";
import { FloatingCTA } from "@/components/FloatingCTA";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Serene Mansion — Discover Luxury Living" },
      {
        name: "description",
        content:
          "A private brokerage curating the world's most distinguished residences — villas, penthouses, and estates for the discerning few.",
      },
      { property: "og:title", content: "Serene Mansion — Discover Luxury Living" },
      {
        property: "og:description",
        content: "A private collection of luxury estates, penthouses, and private islands.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <div className="relative bg-background text-foreground overflow-x-hidden">
      <Navbar />
      <main>
        <Hero />
        <Properties />
        <About />
        <FeaturedProjects />
        <WhyChoose />
        <Testimonials />
        <Gallery />
        <Contact />
      </main>
      <Footer />
      <FloatingCTA />
    </div>
  );
}
