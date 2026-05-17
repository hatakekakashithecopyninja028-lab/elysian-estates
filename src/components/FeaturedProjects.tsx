import { motion } from "framer-motion";
import p2 from "@/assets/property-2.jpg";
import p3 from "@/assets/property-3.jpg";
import p4 from "@/assets/property-4.jpg";
import p5 from "@/assets/property-5.jpg";
import p6 from "@/assets/property-6.jpg";
import { SectionHeader } from "./Properties";

const projects = [
  { img: p3, kind: "Smart Homes", title: "The Onyx Collection", line: "Voice-led residences with circadian lighting and biometric entry." },
  { img: p4, kind: "Luxury Villas", title: "Costa Aurelia", line: "Cliffside villas overlooking the Tyrrhenian." },
  { img: p2, kind: "Penthouses", title: "Skyline Crown", line: "Triplex penthouses crowning the world's tallest towers." },
  { img: p5, kind: "Commercial", title: "Aurum Tower", line: "Boutique commercial floors with private elevators." },
  { img: p6, kind: "Smart Homes", title: "Mirage House", line: "Desert-modern smart home with integrated AI." },
];

export function FeaturedProjects() {
  return (
    <section id="projects" className="relative py-32 overflow-hidden">
      <div className="container mx-auto px-6">
        <SectionHeader
          eyebrow="Featured Projects"
          title="Defining Modern Luxury"
          subtitle="From sky-bound penthouses to private island compounds — projects we've helped shape from the ground up."
        />
      </div>

      <div className="mt-20 overflow-x-auto scrollbar-hide">
        <div className="flex gap-6 px-6 lg:px-[max(1.5rem,calc((100vw-1280px)/2))] pb-6">
          {projects.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: i * 0.08 }}
              className="group relative shrink-0 w-[85vw] md:w-[520px] aspect-[4/5] rounded-2xl overflow-hidden"
            >
              <img src={p.img} alt={p.title} loading="lazy" width={1024} height={1280} className="w-full h-full object-cover transition-transform duration-[1.6s] group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-8">
                <div className="text-xs uppercase tracking-[0.3em] text-primary mb-3">{p.kind}</div>
                <h3 className="font-display text-3xl md:text-4xl">{p.title}</h3>
                <p className="mt-3 text-foreground/70 max-w-sm">{p.line}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
