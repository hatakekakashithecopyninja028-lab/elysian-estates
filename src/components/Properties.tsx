import { motion } from "framer-motion";
import { Bed, Bath, Maximize, MapPin } from "lucide-react";
import p1 from "@/assets/property-1.jpg";
import p2 from "@/assets/property-2.jpg";
import p3 from "@/assets/property-3.jpg";
import p4 from "@/assets/property-4.jpg";
import p5 from "@/assets/property-5.jpg";
import p6 from "@/assets/property-6.jpg";

const properties = [
  { img: p1, name: "Villa Serenissima", location: "Lake Como, Italy", price: "₹24,500,000", beds: 7, baths: 9, area: "12,400" },
  { img: p2, name: "The Crown Penthouse", location: "Manhattan, NY", price: "₹38,000,000", beds: 5, baths: 6, area: "8,200" },
  { img: p3, name: "Obsidian Estate", location: "Beverly Hills, CA", price: "₹42,750,000", beds: 8, baths: 11, area: "15,800" },
  { img: p4, name: "Cliffside Mirage", location: "Amalfi Coast, IT", price: "₹31,200,000", beds: 6, baths: 8, area: "10,500" },
  { img: p5, name: "Skyline Tower 88", location: "Dubai, UAE", price: "₹28,900,000", beds: 4, baths: 5, area: "7,600" },
  { img: p6, name: "Maison Lumière", location: "Saint-Tropez, FR", price: "₹19,800,000", beds: 6, baths: 7, area: "9,200" },
];

export function Properties() {
  return (
    <section id="properties" className="relative py-32">
      <div className="container mx-auto px-6">
        <SectionHeader
          eyebrow="Featured Residences"
          title="A Portfolio of Rarity"
          subtitle="Each property is privately curated — vetted for provenance, design, and quiet exclusivity."
        />

        <div className="mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {properties.map((p, i) => (
            <motion.article
              key={p.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, delay: (i % 3) * 0.1, ease: "easeOut" }}
              className="group relative overflow-hidden rounded-2xl bg-card border border-border hover:border-primary/40 transition-all duration-500 hover-glow"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={p.img}
                  alt={p.name}
                  loading="lazy"
                  width={1024}
                  height={768}
                  className="w-full h-full object-cover transition-transform duration-[1.4s] group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
                <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full glass text-xs uppercase tracking-wider text-primary">
                  For Sale
                </div>
                <div className="absolute bottom-4 right-4 text-right">
                  <div className="text-xs uppercase tracking-wider text-primary/80">Asking</div>
                  <div className="font-display text-2xl text-foreground">{p.price}</div>
                </div>
              </div>

              <div className="p-6">
                <h3 className="font-display text-2xl">{p.name}</h3>
                <div className="mt-2 flex items-center gap-1.5 text-sm text-foreground/60">
                  <MapPin className="w-3.5 h-3.5 text-primary" />
                  {p.location}
                </div>
                <div className="mt-5 pt-5 border-t border-border flex items-center justify-between text-sm text-foreground/70">
                  <Stat icon={<Bed className="w-4 h-4" />} value={`₹{p.beds} bd`} />
                  <Stat icon={<Bath className="w-4 h-4" />} value={`₹{p.baths} ba`} />
                  <Stat icon={<Maximize className="w-4 h-4" />} value={`₹{p.area} ft²`} />
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Stat({ icon, value }: { icon: React.ReactNode; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-primary">{icon}</span>
      {value}
    </div>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="max-w-2xl"
    >
      <div className="text-xs uppercase tracking-[0.4em] text-primary mb-5">{eyebrow}</div>
      <h2 className="font-display text-4xl md:text-6xl font-light leading-tight">
        {title.split(" ").map((w, i) =>
          i === title.split(" ").length - 1 ? (
            <span key={i} className="italic text-gradient-gold"> {w}</span>
          ) : (
            <span key={i}>{i > 0 ? " " : ""}{w}</span>
          )
        )}
      </h2>
      {subtitle && (
        <p className="mt-6 text-foreground/60 text-lg leading-relaxed">{subtitle}</p>
      )}
    </motion.div>
  );
}
