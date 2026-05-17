import { motion } from "framer-motion";
import { Search, MapPin, Home, DollarSign, ArrowRight } from "lucide-react";
import heroImg from "@/assets/hero-mansion.jpg";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background */}
      <motion.div
        initial={{ scale: 1.15 }}
        animate={{ scale: 1 }}
        transition={{ duration: 2.4, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-0"
      >
        <img
          src={heroImg}
          alt="Luxury mansion at twilight"
          className="w-full h-full object-cover"
          width={1920}
          height={1280}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/40 to-background" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent" />
      </motion.div>

      <div className="relative z-10 container mx-auto px-6 pt-32 pb-32">
        <motion.div
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.15, delayChildren: 0.3 } },
          }}
          className="max-w-3xl"
        >
          <motion.div
            variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-xs uppercase tracking-[0.3em] text-primary/90">
              Curated Luxury Estates
            </span>
          </motion.div>

          <motion.h1
            variants={{ hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0 } }}
            className="font-display text-5xl md:text-7xl lg:text-8xl leading-[1.05] font-light"
          >
            Discover
            <br />
            <span className="italic text-gradient-gold">Luxury Living</span>
          </motion.h1>

          <motion.p
            variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
            className="mt-8 text-lg md:text-xl text-foreground/70 max-w-xl leading-relaxed"
          >
            A private collection of the world's most distinguished residences —
            handpicked estates, penthouses, and private islands for the
            discerning few.
          </motion.p>

          <motion.div
            variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
            className="mt-10 flex flex-wrap gap-4"
          >
            <a
              href="#properties"
              className="group inline-flex items-center gap-3 px-8 py-4 rounded-full bg-primary text-primary-foreground font-medium tracking-wide hover-glow transition-all"
            >
              Explore Properties
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="#contact"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-full glass text-foreground hover:border-primary/50 transition-all"
            >
              Book Consultation
            </a>
          </motion.div>
        </motion.div>

        {/* Floating search bar */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.8 }}
          className="mt-20 max-w-5xl glass-strong rounded-2xl p-2 grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_auto] gap-2"
        >
          <SearchField icon={<MapPin className="w-4 h-4" />} label="Location" placeholder="Beverly Hills, Dubai…" />
          <SearchField icon={<Home className="w-4 h-4" />} label="Property" placeholder="Villa, Penthouse…" />
          <SearchField icon={<DollarSign className="w-4 h-4" />} label="Budget" placeholder="$5M – $50M" />
          <button className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-primary text-primary-foreground font-medium hover-glow transition-all">
            <Search className="w-4 h-4" />
            Search
          </button>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-xs uppercase tracking-[0.3em] text-foreground/40"
      >
        Scroll to explore
      </motion.div>
    </section>
  );
}

function SearchField({
  icon,
  label,
  placeholder,
}: {
  icon: React.ReactNode;
  label: string;
  placeholder: string;
}) {
  return (
    <div className="px-5 py-3 rounded-xl hover:bg-white/5 transition-colors">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-primary/80">
        {icon}
        {label}
      </div>
      <input
        placeholder={placeholder}
        className="mt-1 w-full bg-transparent text-foreground placeholder:text-foreground/40 outline-none text-sm"
      />
    </div>
  );
}
