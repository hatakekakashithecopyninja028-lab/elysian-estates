import { useState } from "react";
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

export interface PropertyFilters {
  location: string;
  type: string;
  minPrice: string;
  maxPrice: string;
  sort: string;
}

const DEFAULT_FILTERS: PropertyFilters = {
  location: "",
  type: "",
  minPrice: "",
  maxPrice: "",
  sort: "-createdAt",
};

function Home() {
  const [filters, setFilters] = useState<PropertyFilters>(DEFAULT_FILTERS);

  const handleHeroSearch = (heroFilters: Partial<PropertyFilters>) => {
    setFilters((prev) => ({ ...prev, ...heroFilters }));
    setTimeout(() => {
      document.getElementById("properties")?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };

  const handleFilterChange = (updated: Partial<PropertyFilters>) => {
    setFilters((prev) => ({ ...prev, ...updated }));
  };

  const handleReset = () => setFilters(DEFAULT_FILTERS);

  return (
    <div className="relative bg-background text-foreground overflow-x-hidden">
      <Navbar />
      <main>
        <Hero onSearch={handleHeroSearch} />
        <Properties
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={handleReset}
        />
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
