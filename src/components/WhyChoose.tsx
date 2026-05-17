import { motion } from "framer-motion";
import { ShieldCheck, MapPinned, Scale, Headphones, TrendingUp, Sparkles } from "lucide-react";
import { SectionHeader } from "./Properties";

const features = [
  { icon: ShieldCheck, title: "Verified Properties", text: "Every listing is independently verified for provenance and title." },
  { icon: MapPinned, title: "Prime Locations", text: "Curated addresses across the world's most coveted neighborhoods." },
  { icon: Scale, title: "Legal Assistance", text: "In-house counsel for cross-border transactions and structuring." },
  { icon: Headphones, title: "24/7 Concierge", text: "A single point of contact, always available, anywhere on earth." },
  { icon: TrendingUp, title: "Investment Guidance", text: "Bespoke market intelligence from analysts and former bankers." },
  { icon: Sparkles, title: "White-glove Service", text: "From private viewing to handover — choreographed in silence." },
];

export function WhyChoose() {
  return (
    <section className="relative py-32">
      <div className="container mx-auto px-6">
        <SectionHeader
          eyebrow="Why Aurelia"
          title="An Experience, Not a Transaction"
        />
        <div className="mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
              className="group glass p-8 rounded-2xl hover:border-primary/40 transition-all hover:-translate-y-1 duration-500"
            >
              <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-primary/10 border border-primary/20 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                <f.icon className="w-6 h-6" />
              </div>
              <h3 className="mt-6 font-display text-2xl">{f.title}</h3>
              <p className="mt-3 text-foreground/60 leading-relaxed">{f.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
