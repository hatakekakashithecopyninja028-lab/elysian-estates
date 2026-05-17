import { motion } from "framer-motion";
import { useState } from "react";
import { X } from "lucide-react";
import p1 from "@/assets/property-1.jpg";
import p2 from "@/assets/property-2.jpg";
import p3 from "@/assets/property-3.jpg";
import p4 from "@/assets/property-4.jpg";
import p5 from "@/assets/property-5.jpg";
import p6 from "@/assets/property-6.jpg";
import { SectionHeader } from "./Properties";

const images = [
  { src: p3, tall: true },
  { src: p2, tall: false },
  { src: p4, tall: false },
  { src: p1, tall: true },
  { src: p6, tall: false },
  { src: p5, tall: true },
];

export function Gallery() {
  const [open, setOpen] = useState<string | null>(null);
  return (
    <section id="gallery" className="relative py-32">
      <div className="container mx-auto px-6">
        <SectionHeader eyebrow="Visual Journey" title="Inside the Collection" />

        <div className="mt-20 grid grid-cols-2 md:grid-cols-3 auto-rows-[220px] gap-4">
          {images.map((img, i) => (
            <motion.button
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.7, delay: i * 0.06 }}
              onClick={() => setOpen(img.src)}
              className={`relative group overflow-hidden rounded-2xl ${img.tall ? "row-span-2" : ""}`}
            >
              <img src={img.src} alt="" loading="lazy" className="w-full h-full object-cover transition-transform duration-[1.2s] group-hover:scale-110" />
              <div className="absolute inset-0 bg-background/0 group-hover:bg-background/30 transition-colors" />
              <div className="absolute inset-0 ring-0 group-hover:ring-1 ring-primary/40 rounded-2xl transition-all" />
            </motion.button>
          ))}
        </div>
      </div>

      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setOpen(null)}
          className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-xl flex items-center justify-center p-6 cursor-zoom-out"
        >
          <button className="absolute top-6 right-6 w-12 h-12 rounded-full glass flex items-center justify-center text-primary">
            <X />
          </button>
          <motion.img
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            src={open}
            alt=""
            className="max-w-full max-h-full rounded-xl shadow-2xl"
          />
        </motion.div>
      )}
    </section>
  );
}
