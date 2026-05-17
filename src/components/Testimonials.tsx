import { motion } from "framer-motion";
import { Quote } from "lucide-react";
import { SectionHeader } from "./Properties";

const testimonials = [
  { name: "Isabelle Marchand", role: "Founder, Marchand Capital", text: "Aurelia handled our acquisition in Monaco with absolute discretion. They understand that, at this level, silence is the service." },
  { name: "Rajan Mehta", role: "CEO, Helios Group", text: "A four-month search ended in a week. They knew exactly what we wanted before we did. Genuinely the finest in the industry." },
  { name: "Sophie Chen", role: "Art Collector", text: "From the private viewing to the handover, every detail was choreographed. I never spoke to more than one person — and never needed to." },
  { name: "Alexandre Dubois", role: "Family Office Principal", text: "Cross-border structuring, legal, design consultancy — all under one roof, all flawless. Aurelia is in a category of its own." },
];

export function Testimonials() {
  // duplicate for seamless marquee
  const loop = [...testimonials, ...testimonials];
  return (
    <section className="relative py-32 overflow-hidden">
      <div className="container mx-auto px-6">
        <SectionHeader eyebrow="In Their Words" title="Trusted by the Quiet Few" />
      </div>

      <div className="mt-20 relative">
        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

        <motion.div
          className="flex gap-6"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
        >
          {loop.map((t, i) => (
            <div
              key={i}
              className="shrink-0 w-[420px] glass rounded-2xl p-8"
            >
              <Quote className="w-8 h-8 text-primary/60" />
              <p className="mt-4 text-foreground/80 leading-relaxed italic font-display text-lg">
                "{t.text}"
              </p>
              <div className="mt-6 flex items-center gap-4 pt-6 border-t border-border">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/40 flex items-center justify-center text-primary-foreground font-display text-lg">
                  {t.name[0]}
                </div>
                <div>
                  <div className="font-medium">{t.name}</div>
                  <div className="text-xs text-foreground/50 uppercase tracking-wider">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
