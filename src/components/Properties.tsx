import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bed, Bath, Maximize, MapPin, SlidersHorizontal, X, ArrowUpDown } from "lucide-react";
import p1 from "@/assets/property-1.jpg";
import p2 from "@/assets/property-2.jpg";
import p3 from "@/assets/property-3.jpg";
import p4 from "@/assets/property-4.jpg";
import p5 from "@/assets/property-5.jpg";
import p6 from "@/assets/property-6.jpg";
import type { PropertyFilters } from "@/routes/index";
import { PropertyModal } from "@/components/PropertyModal";
import type { ModalProperty } from "@/components/PropertyModal";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

const STATIC_PROPERTIES = [
  { _id: "1", thumbnail: p1, title: "Villa Serenissima", location: "Lake Como, Italy", price: 24500000, priceFormatted: "₹24,500,000", bedrooms: 7, bathrooms: 9, area: 12400, status: "Available", type: "Villa", images: [p1, p2, p3], description: "Nestled along the serene shores of Lake Como, Villa Serenissima is a testament to Italian grandeur. Seven palatial bedrooms, a private 40-metre lakefront, and gardens designed by a landscape laureate. Every room frames a different masterpiece of nature." },
  { _id: "2", thumbnail: p2, title: "The Crown Penthouse", location: "Manhattan, NY", price: 38000000, priceFormatted: "₹38,000,000", bedrooms: 5, bathrooms: 6, area: 8200, status: "Available", type: "Penthouse", images: [p2, p4, p5], description: "Occupying the entire top floor of one of Manhattan's most coveted towers, The Crown commands uninterrupted views across Central Park and the Hudson. A full-floor private terrace, a 1,200-bottle wine vault, and a dedicated concierge floor define life above the city." },
  { _id: "3", thumbnail: p3, title: "Obsidian Estate", location: "Beverly Hills, CA", price: 42750000, priceFormatted: "₹42,750,000", bedrooms: 8, bathrooms: 11, area: 15800, status: "Available", type: "Estate", images: [p3, p1, p6], description: "A fortress of elegance in the most exclusive enclave of Beverly Hills. Obsidian Estate spans over 15,000 sq ft of bespoke interiors, anchored by a 90-foot infinity pool that dissolves into the canyon below. The eight-car motor court and private cinema complete this singular compound." },
  { _id: "4", thumbnail: p4, title: "Cliffside Mirage", location: "Amalfi Coast, IT", price: 31200000, priceFormatted: "₹31,200,000", bedrooms: 6, bathrooms: 8, area: 10500, status: "Available", type: "Villa", images: [p4, p2, p3], description: "Carved into the UNESCO-listed Amalfi cliffs, Cliffside Mirage is an architectural poem — six suites, each a private sanctuary with sea-facing terraces. A private pier and sea-level pool grant direct access to the Mediterranean at any hour." },
  { _id: "5", thumbnail: p5, title: "Skyline Tower 88", location: "Dubai, UAE", price: 28900000, priceFormatted: "₹28,900,000", bedrooms: 4, bathrooms: 5, area: 7600, status: "Available", type: "Penthouse", images: [p5, p1, p4], description: "On the 88th floor of Dubai's most iconic mixed-use tower, Skyline 88 offers four private sky-suites, a wraparound terrace, and floor-to-ceiling glass affording 270° views of the Gulf, the Burj, and the desert horizon beyond." },
  { _id: "6", thumbnail: p6, title: "Maison Lumière", location: "Saint-Tropez, FR", price: 19800000, priceFormatted: "₹19,800,000", bedrooms: 6, bathrooms: 7, area: 9200, status: "Available", type: "Villa", images: [p6, p3, p5], description: "A short stroll from the Pampelonne beach, Maison Lumière is a sun-drenched Provençal estate reimagined for contemporary luxury. Aged terracotta, handmade linen, and a kitchen garden cultivated by a Michelin-starred chef define the ethos of effortless French living." },
];

const PROPERTY_TYPES = ["Villa", "Penthouse", "Estate", "Mansion", "Apartment", "Townhouse"];

const BUDGET_OPTIONS = [
  { label: "Any Budget", min: "", max: "" },
  { label: "Under ₹2 Crore", min: "", max: "20000000" },
  { label: "₹2Cr – ₹3Cr", min: "20000000", max: "30000000" },
  { label: "₹3Cr – ₹5Cr", min: "30000000", max: "50000000" },
  { label: "₹5Cr – ₹10Cr", min: "50000000", max: "100000000" },
  { label: "Above ₹10 Crore", min: "100000000", max: "" },
];

const SORT_OPTIONS = [
  { label: "Newest First", value: "-createdAt" },
  { label: "Price: Low to High", value: "price" },
  { label: "Price: High to Low", value: "-price" },
];

interface Property {
  _id: string;
  thumbnail: string;
  title: string;
  location: string;
  price: number;
  priceFormatted: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  status: string;
  type?: string;
  description?: string;
  images?: string[];
}

interface PropertiesProps {
  filters: PropertyFilters;
  onFilterChange: (updated: Partial<PropertyFilters>) => void;
  onReset: () => void;
}

function filterStatic(props: PropertyFilters) {
  let list = [...STATIC_PROPERTIES] as Property[];
  if (props.location) list = list.filter(p => p.location.toLowerCase().includes(props.location.toLowerCase()) || p.title.toLowerCase().includes(props.location.toLowerCase()));
  if (props.type) list = list.filter(p => p.type === props.type);
  if (props.minPrice) list = list.filter(p => p.price >= Number(props.minPrice));
  if (props.maxPrice) list = list.filter(p => p.price <= Number(props.maxPrice));
  if (props.sort === "price") list.sort((a, b) => a.price - b.price);
  else if (props.sort === "-price") list.sort((a, b) => b.price - a.price);
  return list;
}

export function Properties({ filters, onFilterChange, onReset }: PropertiesProps) {
  const [properties, setProperties] = useState<Property[]>(STATIC_PROPERTIES as Property[]);
  const [total, setTotal] = useState(STATIC_PROPERTIES.length);
  const [loading, setLoading] = useState(false);
  const [apiAvailable, setApiAvailable] = useState(false);
  const [budgetLabel, setBudgetLabel] = useState("Any Budget");
  const [selectedProperty, setSelectedProperty] = useState<ModalProperty | null>(null);

  const isFiltered = filters.location || filters.type || filters.minPrice || filters.maxPrice;

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "12", sort: filters.sort });
      if (filters.location) params.set("location", filters.location);
      if (filters.type) params.set("type", filters.type);
      if (filters.minPrice) params.set("minPrice", filters.minPrice);
      if (filters.maxPrice) params.set("maxPrice", filters.maxPrice);

      const res = await fetch(`${API_BASE}/api/properties?${params}`);
      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      if (data.success) {
        setApiAvailable(true);
        const hasFilters = !!(filters.location || filters.type || filters.minPrice || filters.maxPrice);
        if (data.data.length > 0) {
          setProperties(data.data);
          setTotal(data.pagination?.total ?? data.data.length);
        } else if (!hasFilters) {
          // DB is empty with no filters — show curated static portfolio
          setProperties(STATIC_PROPERTIES as Property[]);
          setTotal(STATIC_PROPERTIES.length);
        } else {
          setProperties([]);
          setTotal(0);
        }
      }
    } catch {
      setApiAvailable(false);
      const filtered = filterStatic(filters);
      setProperties(filtered);
      setTotal(filtered.length);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchProperties(); }, [fetchProperties]);

  const handleBudgetChange = (label: string) => {
    setBudgetLabel(label);
    const opt = BUDGET_OPTIONS.find((b) => b.label === label);
    onFilterChange({ minPrice: opt?.min ?? "", maxPrice: opt?.max ?? "" });
  };

  return (
    <section id="properties" className="relative py-32">
      <div className="container mx-auto px-6">
        <SectionHeader
          eyebrow="Featured Residences"
          title="A Portfolio of Rarity"
          subtitle="Each property is privately curated — vetted for provenance, design, and quiet exclusivity."
        />

        {/* ── Filter Bar ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-14 glass-strong rounded-2xl p-5"
        >
          <div className="flex flex-wrap items-end gap-4">
            {/* Location / keyword */}
            <div className="flex-1 min-w-[180px]">
              <label className="text-xs uppercase tracking-wider text-primary/80 flex items-center gap-1.5 mb-2">
                <MapPin className="w-3.5 h-3.5" /> Location / Keyword
              </label>
              <input
                value={filters.location}
                onChange={(e) => onFilterChange({ location: e.target.value })}
                placeholder="City, country, name…"
                className="w-full bg-background/60 border border-border focus:border-primary/50 rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-foreground/40 outline-none transition-colors"
              />
            </div>

            {/* Property type */}
            <div className="min-w-[160px]">
              <label className="text-xs uppercase tracking-wider text-primary/80 flex items-center gap-1.5 mb-2">
                <SlidersHorizontal className="w-3.5 h-3.5" /> Type
              </label>
              <select
                value={filters.type}
                onChange={(e) => onFilterChange({ type: e.target.value })}
                className="w-full bg-background/60 border border-border focus:border-primary/50 rounded-xl px-4 py-2.5 text-sm text-foreground outline-none transition-colors cursor-pointer appearance-none"
              >
                <option value="">Any Type</option>
                {PROPERTY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            {/* Budget */}
            <div className="min-w-[200px]">
              <label className="text-xs uppercase tracking-wider text-primary/80 mb-2 block">Budget Range</label>
              <select
                value={budgetLabel}
                onChange={(e) => handleBudgetChange(e.target.value)}
                className="w-full bg-background/60 border border-border focus:border-primary/50 rounded-xl px-4 py-2.5 text-sm text-foreground outline-none transition-colors cursor-pointer appearance-none"
              >
                {BUDGET_OPTIONS.map((b) => <option key={b.label} value={b.label}>{b.label}</option>)}
              </select>
            </div>

            {/* Sort */}
            <div className="min-w-[180px]">
              <label className="text-xs uppercase tracking-wider text-primary/80 flex items-center gap-1.5 mb-2">
                <ArrowUpDown className="w-3.5 h-3.5" /> Sort By
              </label>
              <select
                value={filters.sort}
                onChange={(e) => onFilterChange({ sort: e.target.value })}
                className="w-full bg-background/60 border border-border focus:border-primary/50 rounded-xl px-4 py-2.5 text-sm text-foreground outline-none transition-colors cursor-pointer appearance-none"
              >
                {SORT_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>

            {/* Reset */}
            {isFiltered && (
              <button
                onClick={() => { setBudgetLabel("Any Budget"); onReset(); }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border text-foreground/60 hover:text-foreground hover:border-primary/40 text-sm transition-all"
              >
                <X className="w-3.5 h-3.5" /> Clear
              </button>
            )}
          </div>

          {/* Results count */}
          <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between">
            <p className="text-xs text-foreground/50">
              {loading
                ? "Searching…"
                : `${total} ${total === 1 ? "residence" : "residences"} found${isFiltered ? " matching your criteria" : ""}`}
            </p>
            {!apiAvailable && (
              <p className="text-xs text-foreground/30 italic">Showing curated portfolio</p>
            )}
          </div>
        </motion.div>

        {/* ── Property Grid ── */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {[...Array(6)].map((_, i) => (
                <div key={i} className="rounded-2xl bg-card border border-border overflow-hidden animate-pulse">
                  <div className="aspect-[4/3] bg-white/5" />
                  <div className="p-6 space-y-3">
                    <div className="h-6 w-3/4 bg-white/5 rounded" />
                    <div className="h-4 w-1/2 bg-white/5 rounded" />
                  </div>
                </div>
              ))}
            </motion.div>
          ) : properties.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-20 text-center py-20 glass-strong rounded-2xl"
            >
              <p className="font-display text-3xl font-light text-foreground/60">No residences found</p>
              <p className="mt-3 text-foreground/40 text-sm">Try adjusting your search criteria</p>
              <button
                onClick={() => { setBudgetLabel("Any Budget"); onReset(); }}
                className="mt-8 px-6 py-3 rounded-full border border-primary/30 text-primary text-sm hover:bg-primary/10 transition-all"
              >
                Clear all filters
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {properties.map((p, i) => (
                <motion.article
                  key={p._id}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: (i % 3) * 0.08 }}
                  onClick={() => setSelectedProperty(p as ModalProperty)}
                  className="group relative overflow-hidden rounded-2xl bg-card border border-border hover:border-primary/40 transition-all duration-500 hover-glow cursor-pointer"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={
                        typeof p.thumbnail === "string" && p.thumbnail.startsWith("/uploads")
                          ? `${API_BASE}${p.thumbnail}`
                          : p.thumbnail
                      }
                      alt={p.title}
                      loading="lazy"
                      width={1024}
                      height={768}
                      className="w-full h-full object-cover transition-transform duration-[1.4s] group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-background/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <span className="px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-medium tracking-wide shadow-lg translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                        View Details
                      </span>
                    </div>

                    <div className="absolute top-4 left-4 flex gap-2">
                      <span className="px-3 py-1.5 rounded-full glass text-xs uppercase tracking-wider text-primary">
                        {p.status}
                      </span>
                      {p.type && (
                        <span className="px-3 py-1.5 rounded-full glass text-xs uppercase tracking-wider text-foreground/70">
                          {p.type}
                        </span>
                      )}
                    </div>
                    <div className="absolute bottom-4 right-4 text-right">
                      <div className="text-xs uppercase tracking-wider text-primary/80">Asking</div>
                      <div className="font-display text-2xl text-foreground">
                        {p.priceFormatted || `₹${p.price?.toLocaleString("en-IN")}`}
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="font-display text-2xl group-hover:text-primary/90 transition-colors">{p.title}</h3>
                    <div className="mt-2 flex items-center gap-1.5 text-sm text-foreground/60">
                      <MapPin className="w-3.5 h-3.5 text-primary" />
                      {p.location}
                    </div>
                    <div className="mt-5 pt-5 border-t border-border flex items-center justify-between text-sm text-foreground/70">
                      <Stat icon={<Bed className="w-4 h-4" />} value={`${p.bedrooms} bd`} />
                      <Stat icon={<Bath className="w-4 h-4" />} value={`${p.bathrooms} ba`} />
                      <Stat icon={<Maximize className="w-4 h-4" />} value={`${p.area?.toLocaleString()} ft²`} />
                    </div>
                  </div>
                </motion.article>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Property Detail Modal */}
      <PropertyModal
        property={selectedProperty}
        onClose={() => setSelectedProperty(null)}
      />
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
