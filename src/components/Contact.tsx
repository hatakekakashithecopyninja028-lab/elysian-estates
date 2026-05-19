import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, ArrowRight, CheckCircle } from "lucide-react";
import { SectionHeader } from "./Properties";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

export function Contact() {
  return (
    <section id="contact" className="relative py-32">
      <div className="container mx-auto px-6">
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
                { icon: Mail, label: "Email", value: "sumitdeveloper@gmail.com" },
                { icon: Phone, label: "Concierge", value: "+91  090270 86097" },
                { icon: MapPin, label: "Address", value: "Upper Sinola, 22, Mussoorie Rd, Malsi, Dehradun, Sinaula, Uttarakhand 248003" },
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

          <EnquiryForm />
        </div>
      </div>
    </section>
  );
}

function EnquiryForm() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "", propertyInterested: "General Enquiry" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/enquiries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Submission failed");
      setSuccess(true);
      setForm({ name: "", email: "", phone: "", message: "", propertyInterested: "General Enquiry" });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-strong rounded-2xl p-8 md:p-10 flex flex-col items-center justify-center text-center min-h-[360px]"
      >
        <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mb-6">
          <CheckCircle className="w-8 h-8 text-primary" />
        </div>
        <h3 className="font-display text-3xl font-light mb-3">Enquiry Received</h3>
        <p className="text-foreground/60 max-w-xs">
          Thank you for reaching out. Our concierge team will contact you within 24 hours.
        </p>
        <button
          onClick={() => setSuccess(false)}
          className="mt-8 text-sm text-primary/70 hover:text-primary transition-colors"
        >
          Submit another enquiry
        </button>
      </motion.div>
    );
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      onSubmit={handleSubmit}
      className="glass-strong rounded-2xl p-8 md:p-10 space-y-5"
    >
      <Field label="Full Name" name="name" placeholder="Your name" value={form.name} onChange={handleChange} required />
      <Field label="Email" name="email" placeholder="you@domain.com" type="email" value={form.email} onChange={handleChange} required />
      <Field label="Phone" name="phone" placeholder="+91 ..." value={form.phone} onChange={handleChange} required />
      <div>
        <label className="text-xs uppercase tracking-wider text-primary/80">Property Interested In</label>
        <select
          name="propertyInterested"
          value={form.propertyInterested}
          onChange={handleChange}
          className="mt-2 w-full bg-transparent border border-border focus:border-primary/60 rounded-xl px-4 py-3 text-foreground outline-none transition-colors"
        >
          <option value="General Enquiry">General Enquiry</option>
          <option value="Villa Serenissima">Villa Serenissima</option>
          <option value="The Crown Penthouse">The Crown Penthouse</option>
          <option value="Obsidian Estate">Obsidian Estate</option>
          <option value="Cliffside Mirage">Cliffside Mirage</option>
          <option value="Skyline Tower 88">Skyline Tower 88</option>
          <option value="Maison Lumière">Maison Lumière</option>
        </select>
      </div>
      <div>
        <label className="text-xs uppercase tracking-wider text-primary/80">Message</label>
        <textarea
          name="message"
          rows={4}
          placeholder="Tell us what you're looking for…"
          value={form.message}
          onChange={handleChange}
          required
          className="mt-2 w-full bg-transparent border border-border focus:border-primary/60 rounded-xl px-4 py-3 text-foreground placeholder:text-foreground/40 outline-none transition-colors resize-none"
        />
      </div>
      {error && (
        <div className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">
          {error}
        </div>
      )}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-medium hover-glow transition-all disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? "Sending…" : "Send Inquiry"}
      </button>
    </motion.form>
  );
}

function Field({
  label, name, placeholder, type = "text", value, onChange, required,
}: {
  label: string; name: string; placeholder: string; type?: string;
  value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; required?: boolean;
}) {
  return (
    <div>
      <label className="text-xs uppercase tracking-wider text-primary/80">{label}</label>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        className="mt-2 w-full bg-transparent border border-border focus:border-primary/60 rounded-xl px-4 py-3 text-foreground placeholder:text-foreground/40 outline-none transition-colors"
      />
    </div>
  );
}
