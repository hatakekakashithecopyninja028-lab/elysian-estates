import { motion } from "framer-motion";
import { Mail, Phone, MapPin, ArrowRight } from "lucide-react";
import { SectionHeader } from "./Properties";

export function Contact() {
  return (
    <section id="contact" className="relative py-32">
      <div className="container mx-auto px-6">
        {/* CTA banner */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9 }}
          className="relative rounded-3xl overflow-hidden glass-strong p-12 md:p-20 mb-24 text-center"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent" />
          <div className="relative">
            <div className="text-xs uppercase tracking-[0.4em] text-primary mb-4">Private Viewing</div>
            <h2 className="font-display text-4xl md:text-6xl font-light">
              Schedule Your <span className="italic text-gradient-gold">Site Visit</span> Today
            </h2>
            <p className="mt-6 text-foreground/60 max-w-xl mx-auto">
              A private tour, arranged on your schedule. Helicopter transfer available on request.
            </p>
            <a href="#form" className="mt-10 inline-flex items-center gap-3 px-8 py-4 rounded-full bg-primary text-primary-foreground font-medium hover-glow transition-all group">
              Request Appointment
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </motion.div>

        <div id="form" className="grid lg:grid-cols-2 gap-16">
          <div>
            <SectionHeader eyebrow="Get in Touch" title="Begin a Conversation" />
            <div className="mt-12 space-y-6">
              {[
                { icon: Mail, label: "Email", value: "private@aurelia-estates.com" },
                { icon: Phone, label: "Concierge", value: "+1 (310) 555 0188" },
                { icon: MapPin, label: "Headquarters", value: "Rodeo Drive, Beverly Hills, CA" },
              ].map((c) => (
                <div key={c.label} className="flex items-start gap-5 group">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-primary/10 border border-primary/20 text-primary group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-[0_0_30px_-5px_var(--gold)] transition-all">
                    <c.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wider text-foreground/50">{c.label}</div>
                    <div className="mt-1 text-lg">{c.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <motion.form
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            onSubmit={(e) => e.preventDefault()}
            className="glass-strong rounded-2xl p-8 md:p-10 space-y-5"
          >
            <Field label="Full Name" placeholder="Your name" />
            <Field label="Email" placeholder="you@domain.com" type="email" />
            <Field label="Phone" placeholder="+1 ..." />
            <div>
              <label className="text-xs uppercase tracking-wider text-primary/80">Message</label>
              <textarea
                rows={4}
                placeholder="Tell us what you're looking for…"
                className="mt-2 w-full bg-transparent border border-border focus:border-primary/60 rounded-xl px-4 py-3 text-foreground placeholder:text-foreground/40 outline-none transition-colors resize-none"
              />
            </div>
            <button className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-medium hover-glow transition-all">
              Send Inquiry
            </button>
          </motion.form>
        </div>
      </div>
    </section>
  );
}

function Field({ label, placeholder, type = "text" }: { label: string; placeholder: string; type?: string }) {
  return (
    <div>
      <label className="text-xs uppercase tracking-wider text-primary/80">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        className="mt-2 w-full bg-transparent border border-border focus:border-primary/60 rounded-xl px-4 py-3 text-foreground placeholder:text-foreground/40 outline-none transition-colors"
      />
    </div>
  );
}
