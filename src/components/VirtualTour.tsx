import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, ChevronLeft, ChevronRight, Play, Pause,
  MapPin, Maximize2,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Ken Burns pan directions — alternate per slide for cinematic feel
const KB_VARIANTS = [
  { initial: { scale: 1.12, x: "3%", y: "2%" },   animate: { scale: 1, x: "0%",  y: "0%" } },
  { initial: { scale: 1.1,  x: "-3%", y: "-2%" },  animate: { scale: 1, x: "0%",  y: "0%" } },
  { initial: { scale: 1.08, x: "0%",  y: "3%" },   animate: { scale: 1, x: "0%",  y: "0%" } },
  { initial: { scale: 1.12, x: "2%",  y: "-3%" },  animate: { scale: 1, x: "0%",  y: "0%" } },
  { initial: { scale: 1,    x: "0%",  y: "0%" },   animate: { scale: 1.08, x: "-2%", y: "1%" } },
];

const SLIDE_DURATION = 5500;

interface Props {
  images: string[];
  title: string;
  location: string;
  type?: string;
  onClose: () => void;
}

export function VirtualTour({ images, title, location, type, onClose }: Props) {
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resolveImg = (src: string) =>
    src.startsWith("/uploads") ? `${API_BASE}${src}` : src;

  const go = useCallback(
    (dir: 1 | -1) => {
      setCurrent((i) => (i + dir + images.length) % images.length);
    },
    [images.length]
  );

  // Auto-advance
  useEffect(() => {
    if (!playing) return;
    timerRef.current = setTimeout(() => go(1), SLIDE_DURATION);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [current, playing, go]);

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === " ") { e.preventDefault(); setPlaying((p) => !p); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, onClose]);

  // Auto-hide controls after 3s of inactivity
  const revealControls = useCallback(() => {
    setShowControls(true);
    if (hideRef.current) clearTimeout(hideRef.current);
    hideRef.current = setTimeout(() => setShowControls(false), 3000);
  }, []);

  useEffect(() => {
    revealControls();
    return () => { if (hideRef.current) clearTimeout(hideRef.current); };
  }, [revealControls]);

  const kbv = KB_VARIANTS[current % KB_VARIANTS.length];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-[60] bg-black flex flex-col"
      onMouseMove={revealControls}
      onTouchStart={revealControls}
    >
      {/* ── Slide image with Ken Burns ── */}
      <div className="relative flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          >
            <motion.img
              src={resolveImg(images[current])}
              alt={`${title} — image ${current + 1}`}
              className="w-full h-full object-cover"
              initial={kbv.initial}
              animate={kbv.animate}
              transition={{ duration: SLIDE_DURATION / 1000, ease: "linear" }}
            />
          </motion.div>
        </AnimatePresence>

        {/* Vignette */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.55) 100%)" }}
        />
        {/* Bottom gradient */}
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
        {/* Top gradient */}
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />

        {/* ── Top bar ── */}
        <motion.div
          animate={{ opacity: showControls ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          className="absolute top-0 inset-x-0 flex items-start justify-between px-6 pt-6"
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              {type && (
                <span className="px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-xs uppercase tracking-wider text-white/80">
                  {type}
                </span>
              )}
              <span className="px-2.5 py-1 rounded-full bg-amber-400/20 backdrop-blur-sm border border-amber-400/30 text-xs uppercase tracking-wider text-amber-300">
                Virtual Tour
              </span>
            </div>
            <h2 className="font-display text-2xl md:text-3xl text-white font-light drop-shadow-lg">{title}</h2>
            <div className="flex items-center gap-1.5 mt-1 text-white/60 text-sm">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              {location}
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>

        {/* ── Side nav arrows ── */}
        {images.length > 1 && (
          <>
            <motion.button
              animate={{ opacity: showControls ? 1 : 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => go(-1)}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 transition-all"
            >
              <ChevronLeft className="w-6 h-6" />
            </motion.button>
            <motion.button
              animate={{ opacity: showControls ? 1 : 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => go(1)}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 transition-all"
            >
              <ChevronRight className="w-6 h-6" />
            </motion.button>
          </>
        )}

        {/* ── Bottom controls ── */}
        <motion.div
          animate={{ opacity: showControls ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          className="absolute bottom-0 inset-x-0 flex flex-col items-center pb-8 gap-5"
        >
          {/* Progress bar */}
          {playing && (
            <div className="w-48 h-0.5 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                key={current}
                className="h-full bg-amber-400 rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: SLIDE_DURATION / 1000, ease: "linear" }}
              />
            </div>
          )}

          {/* Dot indicators + play/pause */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setPlaying((p) => !p)}
              className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 transition-all"
            >
              {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </button>

            <div className="flex items-center gap-2">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`rounded-full transition-all duration-300 ${
                    i === current
                      ? "w-6 h-2 bg-amber-400"
                      : "w-2 h-2 bg-white/30 hover:bg-white/60"
                  }`}
                />
              ))}
            </div>

            <div className="text-white/50 text-xs tabular-nums">
              {current + 1} / {images.length}
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Thumbnail filmstrip ── */}
      {images.length > 1 && (
        <motion.div
          animate={{ opacity: showControls ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          className="flex gap-2 px-4 py-3 bg-black/80 backdrop-blur-sm overflow-x-auto scrollbar-hide border-t border-white/5"
        >
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`flex-shrink-0 w-16 h-11 rounded-lg overflow-hidden border-2 transition-all ${
                i === current ? "border-amber-400 scale-105" : "border-transparent opacity-40 hover:opacity-70"
              }`}
            >
              <img src={resolveImg(img)} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
          <div className="flex-shrink-0 w-16 h-11 rounded-lg bg-white/5 border border-white/10 flex flex-col items-center justify-center gap-0.5 text-white/30">
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="text-[9px] uppercase tracking-wider">Tour</span>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
