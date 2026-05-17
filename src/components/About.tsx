import { motion, useInView, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useRef } from "react";
import aboutImg from "@/assets/about-building.jpg";
import { SectionHeader } from "./Properties";

function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v).toLocaleString() + suffix);

  useEffect(() => {
    if (inView) {
      const controls = animate(count, to, { duration: 2, ease: "easeOut" });
      return controls.stop;
    }
  }, [inView, to, count]);

  return <motion.span ref={ref}>{rounded}</motion.span>;
}

export function About() {
  const stats = [
    { value: 1240, suffix: "+", label: "Properties Sold" },
    { value: 860, suffix: "+", label: "Happy Clients" },
    { value: 38, suffix: "", label: "Cities Covered" },
    { value: 24, suffix: "B+", label: "In Transactions" },
  ];
  return (
    <section id="about" className="relative py-32">
      <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="relative"
        >
          <div className="relative rounded-2xl overflow-hidden">
            <img src={aboutImg} alt="Aurelia heritage building" loading="lazy" width={1024} height={1280} className="w-full h-[640px] object-cover" />
            <div className="absolute inset-0 bg-gradient-to-tr from-background/60 to-transparent" />
          </div>
          <div className="absolute -bottom-8 -right-8 glass-strong rounded-2xl p-6 max-w-[220px] hidden md:block">
            <div className="text-xs uppercase tracking-widest text-primary mb-2">Est. 1987</div>
            <div className="font-display text-2xl">Four decades of trust</div>
          </div>
        </motion.div>

        <div>
          <SectionHeader
            eyebrow="About Aurelia"
            title="A House Built on Discretion"
            subtitle="For nearly forty years, Serene Mansion has quietly placed the world's finest residences into the hands of those who value privacy as much as prestige."
          />

          <div className="mt-12 grid grid-cols-2 gap-px bg-border rounded-2xl overflow-hidden">
            {stats.map((s) => (
              <div key={s.label} className="bg-card p-8">
                <div className="font-display text-4xl md:text-5xl text-gradient-gold">
                  <Counter to={s.value} suffix={s.suffix} />
                </div>
                <div className="mt-2 text-sm text-foreground/60 uppercase tracking-wider">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
