import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";

export function FloatingCTA() {
  return (
    <motion.a
      href="#contact"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1.8, type: "spring", stiffness: 200 }}
      whileHover={{ scale: 1.08 }}
      className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-[0_0_40px_-5px_var(--gold)] hover:shadow-[0_0_60px_-5px_var(--gold)] transition-all"
      aria-label="Open inquiry"
    >
      <MessageCircle className="w-6 h-6" />
      <span className="absolute inset-0 rounded-full bg-primary animate-ping opacity-20" />
    </motion.a>
  );
}
