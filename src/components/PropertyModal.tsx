import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, MapPin, Bed, Bath, Maximize, ChevronLeft, ChevronRight,
  ArrowRight, CheckCircle, Tag, Home,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

export interface ModalProperty {
  _id: string;
  title: string;
  location: string;
  price: number;
  priceFormatted?: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  status: string;
  type?: string;
  description?: string;
  thumbnail: string;
  images?: string[];
}

interface Props {
  property: ModalProperty | null;
  onClose: () => void;
}

export function PropertyModal({ property, onClose }: Props) {
  const [activeImg, setActiveImg] = useState(0);
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [formError, setFormError] = useState("");

  // All images: thumbnail + extras
  const allImages: string[] = property
    ? [
        property.thumbnail,
        ...(property.images ?? []).filter((img) => img !== property.thumbnail),
      ]
    : [];

  const resolveImg = (src: string) =>
    src.startsWith("/uploads") ? `${API_BASE}${src}` : src;

  // Reset state when property changes
  useEffect(() => {
    if (property) {
      setActiveImg(0);
      setForm({ name: "", email: "", phone: "", message: "" });
      setSent(false);
      setFormError("");
    }
  }, [property?._id]);

  // Lock body scroll + ESC key
  useEffect(() => {
    if (!property) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [property, onClose]);

  const prevImg = useCallback(() =>
    setActiveImg((i) => (i - 1 + allImages.length) % allImages.length),
    [allImages.length]);

  const nextImg = useCallback(() =>
    setActiveImg((i) => (i + 1) % allImages.length),
    [allImages.length]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!property) return;
    setFormError("");
    setSending(true);
    try {
      const res = await fetch(`${API_BASE}/api/enquiries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, propertyInterested: property.title }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Submission failed");
      setSent(true);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <AnimatePresence>
      {property && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Modal panel */}
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-x-4 top-[4%] bottom-[4%] z-50 md:inset-x-[5%] lg:inset-x-[8%] xl:inset-x-[12%] flex flex-col rounded-3xl bg-card border border-border overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm border border-border flex items-center justify-center text-foreground/60 hover:text-foreground hover:border-primary/40 transition-all"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto">
              {/* ── Image Gallery ── */}
              <div className="relative">
                {/* Main image */}
                <div className="relative aspect-[16/9] md:aspect-[21/9] overflow-hidden bg-background">
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={activeImg}
                      src={resolveImg(allImages[activeImg] ?? "")}
                      alt={property.title}
                      initial={{ opacity: 0, scale: 1.04 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4 }}
                      className="w-full h-full object-cover"
                    />
                  </AnimatePresence>
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />

                  {/* Nav arrows (only if multiple images) */}
                  {allImages.length > 1 && (
                    <>
                      <button
                        onClick={prevImg}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/70 backdrop-blur-sm border border-border flex items-center justify-center text-foreground/70 hover:text-foreground hover:border-primary/40 transition-all"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={nextImg}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/70 backdrop-blur-sm border border-border flex items-center justify-center text-foreground/70 hover:text-foreground hover:border-primary/40 transition-all"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </>
                  )}

                  {/* Image counter */}
                  {allImages.length > 1 && (
                    <div className="absolute bottom-4 left-4 px-3 py-1 rounded-full glass text-xs text-foreground/70">
                      {activeImg + 1} / {allImages.length}
                    </div>
                  )}

                  {/* Status + Type badges */}
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className="px-3 py-1.5 rounded-full glass text-xs uppercase tracking-wider text-primary">
                      {property.status}
                    </span>
                    {property.type && (
                      <span className="px-3 py-1.5 rounded-full glass text-xs uppercase tracking-wider text-foreground/70">
                        {property.type}
                      </span>
                    )}
                  </div>
                </div>

                {/* Thumbnail strip */}
                {allImages.length > 1 && (
                  <div className="flex gap-2 p-4 overflow-x-auto scrollbar-hide">
                    {allImages.map((img, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveImg(i)}
                        className={`flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                          i === activeImg ? "border-primary" : "border-transparent opacity-50 hover:opacity-80"
                        }`}
                      >
                        <img
                          src={resolveImg(img)}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* ── Details + Enquiry ── */}
              <div className="grid lg:grid-cols-[1fr_420px] gap-0">
                {/* LEFT — Property info */}
                <div className="p-8 lg:p-10 border-b lg:border-b-0 lg:border-r border-border">
                  {/* Title + price */}
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h2 className="font-display text-3xl md:text-4xl font-light">{property.title}</h2>
                      <div className="mt-2 flex items-center gap-1.5 text-sm text-foreground/60">
                        <MapPin className="w-3.5 h-3.5 text-primary" />
                        {property.location}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs uppercase tracking-wider text-primary/80">Asking Price</div>
                      <div className="font-display text-3xl text-gradient-gold">
                        {property.priceFormatted || `₹${property.price?.toLocaleString("en-IN")}`}
                      </div>
                    </div>
                  </div>

                  {/* Key stats */}
                  <div className="mt-8 grid grid-cols-3 gap-4">
                    {[
                      { icon: Bed, label: "Bedrooms", value: property.bedrooms },
                      { icon: Bath, label: "Bathrooms", value: property.bathrooms },
                      { icon: Maximize, label: "Area", value: `${property.area?.toLocaleString()} ft²` },
                    ].map(({ icon: Icon, label, value }) => (
                      <div key={label} className="rounded-2xl bg-background/60 border border-border p-5 text-center">
                        <Icon className="w-5 h-5 text-primary mx-auto mb-2" />
                        <div className="font-display text-2xl">{value}</div>
                        <div className="text-xs uppercase tracking-wider text-foreground/50 mt-1">{label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Quick facts */}
                  <div className="mt-8 grid grid-cols-2 gap-3">
                    {[
                      { icon: Home, label: "Property Type", value: property.type || "Luxury Residence" },
                      { icon: Tag, label: "Status", value: property.status },
                    ].map(({ icon: Icon, label, value }) => (
                      <div key={label} className="flex items-center gap-3 p-4 rounded-xl bg-background/40 border border-border/60">
                        <Icon className="w-4 h-4 text-primary flex-shrink-0" />
                        <div>
                          <div className="text-xs text-foreground/50 uppercase tracking-wider">{label}</div>
                          <div className="text-sm font-medium mt-0.5">{value}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Description */}
                  <div className="mt-8">
                    <div className="text-xs uppercase tracking-[0.3em] text-primary mb-4">About This Residence</div>
                    <p className="text-foreground/70 leading-relaxed text-sm">
                      {property.description ||
                        `${property.title} is a masterpiece of architectural design set in the heart of ${property.location}. This exclusive ${property.type?.toLowerCase() || "residence"} offers an unparalleled living experience with ${property.bedrooms} bedrooms, ${property.bathrooms} bathrooms, and ${property.area?.toLocaleString()} sq ft of impeccably curated space. A rare opportunity to acquire one of the world's most distinguished private addresses — available exclusively through Serene Mansion.`}
                    </p>
                  </div>

                  {/* Features */}
                  <div className="mt-8">
                    <div className="text-xs uppercase tracking-[0.3em] text-primary mb-4">Signature Features</div>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        "Private infinity pool", "Helipad access", "Smart home system",
                        "Private cinema", "Wine cellar", "Staff quarters",
                        "Landscaped gardens", "Panoramic views",
                      ].map((f) => (
                        <div key={f} className="flex items-center gap-2 text-sm text-foreground/60">
                          <span className="w-1 h-1 rounded-full bg-primary flex-shrink-0" />
                          {f}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* RIGHT — Enquiry form */}
                <div className="p-8 lg:p-10">
                  <div className="text-xs uppercase tracking-[0.3em] text-primary mb-2">Private Enquiry</div>
                  <h3 className="font-display text-2xl font-light mb-6">
                    Express Interest in<br />
                    <span className="italic text-gradient-gold">{property.title}</span>
                  </h3>

                  {sent ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-col items-center text-center py-12"
                    >
                      <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mb-5">
                        <CheckCircle className="w-8 h-8 text-primary" />
                      </div>
                      <p className="font-display text-2xl font-light">Enquiry Received</p>
                      <p className="mt-3 text-foreground/50 text-sm max-w-xs">
                        Our concierge team will reach out within 24 hours to arrange a private viewing.
                      </p>
                      <button
                        onClick={() => setSent(false)}
                        className="mt-8 text-sm text-primary/60 hover:text-primary transition-colors"
                      >
                        Submit another enquiry
                      </button>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      {[
                        { name: "name", label: "Full Name", placeholder: "Your name", type: "text" },
                        { name: "email", label: "Email Address", placeholder: "you@domain.com", type: "email" },
                        { name: "phone", label: "Phone / WhatsApp", placeholder: "+91 …", type: "tel" },
                      ].map(({ name, label, placeholder, type }) => (
                        <div key={name}>
                          <label className="text-xs uppercase tracking-wider text-primary/80">{label}</label>
                          <input
                            type={type}
                            name={name}
                            value={form[name as keyof typeof form]}
                            onChange={handleChange}
                            placeholder={placeholder}
                            required
                            className="mt-1.5 w-full bg-background/60 border border-border focus:border-primary/60 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-foreground/40 outline-none transition-colors"
                          />
                        </div>
                      ))}

                      {/* Pre-filled property notice */}
                      <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary/5 border border-primary/15 text-xs text-primary/70">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                        Enquiring about: <span className="font-medium ml-1">{property.title}</span>
                      </div>

                      <div>
                        <label className="text-xs uppercase tracking-wider text-primary/80">Message</label>
                        <textarea
                          name="message"
                          value={form.message}
                          onChange={handleChange}
                          rows={4}
                          required
                          placeholder="Tell us about your requirements — preferred move-in date, financing needs, private viewing schedule…"
                          className="mt-1.5 w-full bg-background/60 border border-border focus:border-primary/60 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-foreground/40 outline-none transition-colors resize-none"
                        />
                      </div>

                      {formError && (
                        <div className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">
                          {formError}
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={sending}
                        className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-medium hover-glow transition-all flex items-center justify-center gap-2 group disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {sending ? (
                          "Sending…"
                        ) : (
                          <>
                            Request Private Viewing
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                      </button>

                      <p className="text-center text-xs text-foreground/40">
                        Your enquiry is handled with complete discretion.
                      </p>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
